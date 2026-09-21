import assert from "node:assert/strict";
import test from "node:test";
import { parseAirbnbCalendar, parseAirbnbCalendarResult } from "./airbnb";

test("načte provozní termíny z Airbnb iCal bez údajů hosta", () => {
  const stays = parseAirbnbCalendar("BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:stay-1\nDTSTART;VALUE=DATE:20261001\nDTEND;VALUE=DATE:20261004\nSUMMARY:Reserved\nEND:VEVENT\nEND:VCALENDAR");
  assert.deepEqual(stays, [{ id: "airbnb:stay-1", checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 4, preparationGuests: 4, guestCountManuallySet: false, status: "planned", note: "Výchozí příprava pro 4 – ověřit v Airbnb", source: "airbnb" }]);
});

test("vynechá zrušenou událost", () => {
  assert.equal(parseAirbnbCalendar("BEGIN:VEVENT\nUID:stay-2\nDTSTART:20261001\nDTEND:20261004\nSTATUS:CANCELLED\nEND:VEVENT").length, 0);
});

test("vynechá blokovaný termín a uvede jej ve výsledku synchronizace", () => {
  const result = parseAirbnbCalendarResult("BEGIN:VEVENT\nUID:block-1\nDTSTART:20261001\nDTEND:20261004\nSUMMARY:Not available\nEND:VEVENT\nBEGIN:VEVENT\nUID:stay-1\nDTSTART:20261004\nDTEND:20261006\nSUMMARY:Reserved\nEND:VEVENT");
  assert.equal(result.ignoredEvents, 1);
  assert.equal(result.stays.length, 1);
  assert.equal(result.stays[0]?.id, "airbnb:stay-1");
});
