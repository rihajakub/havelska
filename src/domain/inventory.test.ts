import assert from "node:assert/strict";
import test from "node:test";
import { cleanTurns, readiness } from "./inventory";
import type { InventoryItem } from "./types";

const item = (clean: number, unassigned = 0): InventoryItem => ({
  id: "sheet",
  name: "Prostěradla",
  category: "linen",
  unit: "ks",
  owned: clean + unassigned,
  perTurn: 2,
  critical: true,
  stock: {
    apartmentClean: clean,
    apartmentPrepared: 0,
    apartmentInUse: 0,
    apartmentDirty: 0,
    homeClean: 0,
    homeDirty: 0,
    inTransit: 0,
    unusable: 0,
    unassigned,
  },
});

test("počítá jen celé přípravy", () => {
  assert.equal(cleanTurns(item(5)), 2);
});

test("nezařazená inventura nedává falešnou připravenost", () => {
  assert.equal(readiness([item(2, 2)]).kind, "unknown");
});

test("nejnižší položka omezuje počet příprav", () => {
  const sheets = item(4);
  const towels = { ...item(8), id: "towels", name: "Ručníky", perTurn: 4 };
  assert.equal(readiness([sheets, towels]).turns, 2);
});

