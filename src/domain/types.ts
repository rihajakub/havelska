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
  arrivalTime?: string;
  keyMethod?: "personal" | "lockbox" | "smart-lock";
  keyStatus?: "not-arranged" | "instructions-sent" | "handed-over";
  checklist?: Partial<Record<StayChecklistItem, boolean>>;
  messageLog?: Partial<Record<MessageTemplateId, string>>;
  taxExemptGuests?: number;
}

export type StayChecklistItem = "cleaned" | "linen" | "supplies" | "arrival-confirmed" | "keys-ready" | "departure-check" | "laundry-started";
export type MessageTemplateId = "booking" | "checkin" | "arrival" | "departure" | "review";

export interface CommunicationTemplate {
  id: MessageTemplateId;
  name: string;
  body: string;
}

export interface TaxSettlement {
  month: string;
  reportedAt?: string;
  paidAt?: string;
  note?: string;
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
  expectedGuestCount?: number;
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

export interface GuestGuideContent {
  title: string;
  subtitle: string;
  welcome: string;
  arrival: string;
  keys: string;
  wifiName: string;
  wifiPassword: string;
  apartmentCare: string;
  utilities: string;
  recycling: string;
  appliances: string;
  pragueTips: string;
  checkout: string;
  help: string;
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
  guestGuideContent?: GuestGuideContent;
  cleaningSupplies?: CleaningSupply[];
  supplyTasks?: SupplyTask[];
  communicationTemplates?: CommunicationTemplate[];
  taxSettlements?: TaxSettlement[];
  updatedAt: string;
}
