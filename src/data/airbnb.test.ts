import assert from "node:assert/strict";
import test from "node:test";
import { parseAirbnbCalendar } from "./airbnb";

test("načte provozní termíny z Airbnb iCal bez údajů hosta", () => {
  const stays = parseAirbnbCalendar("BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:stay-1\nDTSTART;VALUE=DATE:20261001\nDTEND;VALUE=DATE:20261004\nSUMMARY:Reserved\nEND:VEVENT\nEND:VCALENDAR");
  assert.deepEqual(stays, [{ id: "airbnb:stay-1", checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 4, preparationGuests: 4, guestCountManuallySet: false, status: "planned", note: "Výchozí příprava pro 4 – ověřit v Airbnb", source: "airbnb" }]);
});

test("vynechá zrušenou událost", () => {
  assert.equal(parseAirbnbCalendar("BEGIN:VEVENT\nUID:stay-2\nDTSTART:20261001\nDTEND:20261004\nSTATUS:CANCELLED\nEND:VEVENT").length, 0);
});
