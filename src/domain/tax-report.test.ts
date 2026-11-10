import test from "node:test";
import assert from "node:assert/strict";
import { ageOn, buildMonthlyTaxReports } from "./tax-report";
import type { Stay } from "./types";

const stay: Stay = { id: "s1", checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 2, preparationGuests: 2, status: "completed", note: "", source: "airbnb" };

test("určí věk hosta v den příjezdu", () => {
  assert.equal(ageOn("2008-10-02", "2026-10-01"), 17);
  assert.equal(ageOn("2008-10-01", "2026-10-01"), 18);
});

test("spočítá poplatek ze záznamů hostů a označí chybějící údaje", () => {
  const complete = buildMonthlyTaxReports([stay], [{ stayId: "s1", guests: [{ birthDate: "1990-01-01" }, { birthDate: "2010-01-01" }] }]).get("2026-10")!;
  assert.equal(complete.total, 150);
  assert.equal(complete.complete, true);
  assert.equal(complete.rows[0].automaticMinors, 1);
  const estimate = buildMonthlyTaxReports([stay], []).get("2026-10")!;
  assert.equal(estimate.total, 300);
  assert.equal(estimate.complete, false);
});
