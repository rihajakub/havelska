import test from "node:test";
import assert from "node:assert/strict";
import { splitStayNightsByMonth } from "./tax";
import type { Stay } from "./types";

test("rozdělí noclehy pobytu mezi kalendářní měsíce a nepočítá den odjezdu", () => {
  const stay: Stay = { id: "stay", checkIn: "2026-08-30", checkOut: "2026-09-03", guests: 2, preparationGuests: 2, status: "planned", source: "manual", note: "" };
  assert.deepEqual([...splitStayNightsByMonth(stay)], [["2026-08", 2], ["2026-09", 2]]);
});
