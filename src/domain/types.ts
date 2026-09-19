export type StockState =
  | "apartmentClean"
  | "apartmentPrepared"
  | "apartmentInUse"
  | "apartmentDirty"
  | "homeClean"
  | "homeDirty"
  | "inTransit"
  | "unusable"
  | "unassigned";

export type InventoryCategory = "linen" | "towel" | "textile" | "consumable";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: "ks" | "sada";
  owned: number;
  perTurn: number | null;
  critical: boolean;
  stock: Record<StockState, number>;
}

export interface Stay {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  preparationGuests: 2 | 4;
  status: "planned" | "active" | "completed" | "cancelled";
  note: string;
  source: "manual" | "airbnb";
}

export interface AppData {
  schemaVersion: 1;
  inventory: InventoryItem[];
  stays: Stay[];
  updatedAt: string;
}

