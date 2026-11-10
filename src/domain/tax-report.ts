import { groupTaxNightsByMonth } from "./tax";
import type { CheckInGuest, Stay } from "./types";

export const LOCAL_TAX_RATE = 50;
export type GuestEvidence = { stayId: string; guests?: Pick<CheckInGuest, "birthDate">[] };

export function ageOn(birthDate: string, date: string) {
  const birth = new Date(`${birthDate}T12:00:00`);
  const on = new Date(`${date}T12:00:00`);
  let age = on.getFullYear() - birth.getFullYear();
  if (on.getMonth() < birth.getMonth() || (on.getMonth() === birth.getMonth() && on.getDate() < birth.getDate())) age--;
  return age;
}

export function buildMonthlyTaxReports(stays: Stay[], evidence: GuestEvidence[]) {
  const guestsByStay = new Map(evidence.map((item) => [item.stayId, item.guests ?? []]));
  return new Map([...groupTaxNightsByMonth(stays).entries()].map(([month, entries]) => {
    const rows = entries.map(({ stay, nights }) => {
      const guests = guestsByStay.get(stay.id) ?? [];
      const complete = guests.length === stay.guests;
      const automaticMinors = guests.filter((guest) => guest.birthDate && ageOn(guest.birthDate, stay.checkIn) < 18).length;
      const baseGuests = complete ? guests.length : stay.guests;
      const manualExemptions = Math.min(stay.taxExemptGuests ?? 0, Math.max(0, baseGuests - automaticMinors));
      const chargeableGuests = Math.max(0, baseGuests - automaticMinors - manualExemptions);
      return { stay, nights, recordedGuests: guests.length, expectedGuests: stay.guests, automaticMinors, manualExemptions, chargeableGuests, amount: chargeableGuests * nights * LOCAL_TAX_RATE, complete };
    });
    return [month, { rows, total: rows.reduce((sum, row) => sum + row.amount, 0), complete: rows.every((row) => row.complete) }] as const;
  }));
}
