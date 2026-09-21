import type { Stay } from "./types";

const DAY = 86_400_000;
const fromIso = (value: string) => new Date(`${value}T12:00:00`);
const toIso = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const plus = (value: Date, days: number) => new Date(value.getTime() + days * DAY);

export type MonthlyTaxStay = { stay: Stay; nights: number };

export function splitStayNightsByMonth(stay: Stay): Map<string, number> {
  const result = new Map<string, number>();
  for (let night = fromIso(stay.checkIn); toIso(night) < stay.checkOut; night = plus(night, 1)) {
    const month = toIso(night).slice(0, 7);
    result.set(month, (result.get(month) ?? 0) + 1);
  }
  return result;
}

export function groupTaxNightsByMonth(stays: Stay[]) {
  const groups = new Map<string, MonthlyTaxStay[]>();
  for (const stay of stays) {
    for (const [month, nights] of splitStayNightsByMonth(stay)) {
      groups.set(month, [...(groups.get(month) ?? []), { stay, nights }]);
    }
  }
  return groups;
}
