import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { decryptCheckInData, encryptCheckInData } from "./check-in-crypto";

test("zašifruje a obnoví check-in údaje", () => {
  const previous = process.env.CHECKIN_DATA_ENCRYPTION_KEY;
  process.env.CHECKIN_DATA_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  const encrypted = encryptCheckInData("passport-data");
  assert.notEqual(encrypted, "passport-data");
  assert.equal(decryptCheckInData(encrypted), "passport-data");
  process.env.CHECKIN_DATA_ENCRYPTION_KEY = previous;
});

test("odmítne upravený zašifrovaný check-in záznam", () => {
  const previous = process.env.CHECKIN_DATA_ENCRYPTION_KEY;
  process.env.CHECKIN_DATA_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  const encrypted = encryptCheckInData("passport-data");
  assert.throws(() => decryptCheckInData(`${encrypted}x`));
  process.env.CHECKIN_DATA_ENCRYPTION_KEY = previous;
});
