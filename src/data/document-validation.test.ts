import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTravelDocumentNumber, travelDocumentNumberError } from "./document-validation";

test("normalizuje číslo dokladu bez omezení na číslice", () => {
  assert.equal(normalizeTravelDocumentNumber(" ab- 12 cd "), "AB12CD");
  assert.equal(travelDocumentNumberError("AB-12 CD"), undefined);
});

test("odmítne zjevně fiktivní čísla dokladů", () => {
  for (const value of ["123", "111111111", "123456789", "987654321", "N/A", "XXXXXXXX"]) assert.ok(travelDocumentNumberError(value));
});
