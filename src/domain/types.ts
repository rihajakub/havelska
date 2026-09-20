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
  guestCountManuallySet?: boolean;
  status: "planned" | "active" | "completed" | "cancelled";
  note: string;
  source: "manual" | "airbnb";
}

export interface CheckInGuest {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  travelDocumentNumber: string;
  visaOrResidence: string;
  foreignAddress: string;
  purposeOfStay: string;
}

export interface CheckInRegistration {
  id: string;
  stayId: string;
  tokenHash: string;
  encryptedToken: string;
  encryptedGuests?: string;
  createdAt: string;
  expiresAt: string;
  submittedAt?: string;
  submittedCheckIn?: string;
  submittedCheckOut?: string;
  reportedAt?: string;
}

export interface CheckInTemplate {
  title: string;
  introduction: string;
  stayLabel: string;
  documentNotice: string;
  arrivalLabel: string;
  departureLabel: string;
  guestLabel: string;
  firstNameLabel: string;
  lastNameLabel: string;
  birthDateLabel: string;
  nationalityLabel: string;
  travelDocumentLabel: string;
  visaLabel: string;
  addressCountryLabel: string;
  addressLabel: string;
  addressHelp: string;
  purposeLabel: string;
  purposeOtherLabel: string;
  addGuestLabel: string;
  removeGuestLabel: string;
  submitLabel: string;
  purposes: string[];
}

export interface CleaningSupply {
  id: string;
  name: string;
  quantity: number;
  unit: "ks";
  updatedAt: string;
}

export interface SupplyTask {
  id: string;
  name: string;
  quantity: number;
  stayId?: string;
  note?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AppData {
  schemaVersion: 1;
  inventory: InventoryItem[];
  stays: Stay[];
  checkInRegistrations?: CheckInRegistration[];
  checkInTemplate?: CheckInTemplate;
  cleaningSupplies?: CleaningSupply[];
  supplyTasks?: SupplyTask[];
  updatedAt: string;
}
