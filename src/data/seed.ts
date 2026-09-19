import type { AppData, InventoryItem } from "@/domain/types";

const zeroStock = (owned: number): InventoryItem["stock"] => ({
  apartmentClean: 0,
  apartmentPrepared: 0,
  apartmentInUse: 0,
  apartmentDirty: 0,
  homeClean: 0,
  homeDirty: 0,
  inTransit: 0,
  unusable: 0,
  unassigned: owned,
});

const inventory: InventoryItem[] = [
  { id: "linen-sets", name: "Povlečení – 2 bílo-modré, 2 béžové, 1 tmavé", category: "linen", unit: "sada", owned: 5, perTurn: 2, critical: true, stock: zeroStock(5) },
  { id: "double-sheets", name: "Dvojlůžková prostěradla", category: "linen", unit: "ks", owned: 4, perTurn: 2, critical: true, stock: zeroStock(4) },
  { id: "large-towels", name: "Velké ručníky", category: "towel", unit: "ks", owned: 6, perTurn: 4, critical: true, stock: zeroStock(6) },
  { id: "small-towels", name: "Malé ručníky", category: "towel", unit: "ks", owned: 8, perTurn: 4, critical: true, stock: zeroStock(8) },
  { id: "bath-mats", name: "Předložky do koupelny", category: "textile", unit: "ks", owned: 2, perTurn: 1, critical: true, stock: zeroStock(2) },
  { id: "kitchen-rugs", name: "Koberce do kuchyně", category: "textile", unit: "ks", owned: 2, perTurn: null, critical: false, stock: zeroStock(2) },
  { id: "tea-towels", name: "Utěrky", category: "textile", unit: "ks", owned: 3, perTurn: 1, critical: true, stock: zeroStock(3) },
  { id: "hand-towels", name: "Ručníky na ruce", category: "towel", unit: "ks", owned: 2, perTurn: 1, critical: true, stock: zeroStock(2) },
];

export function createSeedData(): AppData {
  return { schemaVersion: 1, inventory, stays: [], updatedAt: new Date().toISOString() };
}
