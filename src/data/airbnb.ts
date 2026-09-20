import type { Stay } from "@/domain/types";

type CalendarEvent = { uid?: string; start?: string; end?: string; status?: string };
function eventDate(value: string | undefined) { const match = value?.match(/^(\d{4})(\d{2})(\d{2})/); return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined; }

/** Extracts only operational dates and a stable event id; guest details are ignored. */
export function parseAirbnbCalendar(calendar: string): Stay[] {
  const events: CalendarEvent[] = []; let current: CalendarEvent | undefined;
  for (const line of calendar.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    if (line === "BEGIN:VEVENT") current = {};
    else if (line === "END:VEVENT") { if (current) events.push(current); current = undefined; }
    else if (current) { const [field, value] = line.split(":", 2); if (field?.startsWith("UID")) current.uid = value; if (field?.startsWith("DTSTART")) current.start = value; if (field?.startsWith("DTEND")) current.end = value; if (field?.startsWith("STATUS")) current.status = value; }
  }
  return events.flatMap((event) => { const checkIn = eventDate(event.start); const checkOut = eventDate(event.end); if (!event.uid || !checkIn || !checkOut || checkOut <= checkIn || event.status === "CANCELLED") return []; return [{ id: `airbnb:${event.uid}`, checkIn, checkOut, guests: 2, preparationGuests: 2, status: "planned", note: "", source: "airbnb" }]; });
}
