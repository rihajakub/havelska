import type { Stay } from "@/domain/types";

type CalendarEvent = { uid?: string; start?: string; end?: string; status?: string; summary?: string };
export type AirbnbCalendarResult = { stays: Stay[]; ignoredEvents: number };
function eventDate(value: string | undefined) { const match = value?.match(/^(\d{4})(\d{2})(\d{2})/); return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined; }
const isReservation = (summary: string | undefined) => /\b(reserved|reservation|booked|booking|confirmed)\b/i.test(summary ?? "");

/** Extracts confirmed Airbnb reservations only. Availability blocks are intentionally ignored. */
export function parseAirbnbCalendarResult(calendar: string): AirbnbCalendarResult {
  const events: CalendarEvent[] = []; let current: CalendarEvent | undefined;
  for (const line of calendar.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    if (line === "BEGIN:VEVENT") current = {};
    else if (line === "END:VEVENT") { if (current) events.push(current); current = undefined; }
    else if (current) { const [field, value] = line.split(":", 2); if (field?.startsWith("UID")) current.uid = value; if (field?.startsWith("DTSTART")) current.start = value; if (field?.startsWith("DTEND")) current.end = value; if (field?.startsWith("STATUS")) current.status = value; if (field?.startsWith("SUMMARY")) current.summary = value; }
  }
  let ignoredEvents = 0;
  const stays: Stay[] = events.flatMap((event): Stay[] => {
    const checkIn = eventDate(event.start); const checkOut = eventDate(event.end);
    if (!event.uid || !checkIn || !checkOut || checkOut <= checkIn || event.status === "CANCELLED") return [];
    if (!isReservation(event.summary)) { ignoredEvents += 1; return []; }
    return [{ id: `airbnb:${event.uid}`, checkIn, checkOut, guests: 4, preparationGuests: 4, guestCountManuallySet: false, status: "planned", note: "Výchozí příprava pro 4 – ověřit v Airbnb", source: "airbnb" }];
  });
  return { stays, ignoredEvents };
}

/** Backwards-compatible convenience function for callers that only need stays. */
export function parseAirbnbCalendar(calendar: string): Stay[] { return parseAirbnbCalendarResult(calendar).stays; }
