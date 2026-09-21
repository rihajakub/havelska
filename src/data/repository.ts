import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createSeedData } from "./seed";
import { readPostgresData, writePostgresData } from "./postgres";
import type { AppData, CheckInGuest, CheckInRegistration, CheckInTemplate, CleaningSupply, CommunicationTemplate, GuestGuideContent, InventoryItem, MessageTemplateId, Stay, StayChecklistItem, StockState, SupplyTask, TaxSettlement } from "@/domain/types";
import { stockTotal } from "@/domain/inventory";
import { decryptCheckInData, encryptCheckInData } from "./check-in-crypto";
import { defaultCheckInTemplate } from "./check-in-template";
import { defaultCommunicationTemplates } from "./communication-templates";
import { defaultGuestGuideContent } from "./guest-guide-template";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "local.json");

async function readData(): Promise<AppData> {
  if (process.env.DATABASE_URL) return readPostgresData(process.env.DATABASE_URL);
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8")) as AppData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const seed = createSeedData();
    await writeData(seed);
    return seed;
  }
}

async function writeData(data: AppData) {
  if (process.env.DATABASE_URL) { await writePostgresData(process.env.DATABASE_URL, data); return; }
  await fs.mkdir(dataDir, { recursive: true });
  const temporary = `${dataFile}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2));
    await fs.rename(temporary, dataFile);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

export async function getAppData() {
  return readData();
}

export async function getCheckInTemplate() {
  const data = await readData();
  return { ...defaultCheckInTemplate, ...data.checkInTemplate, purposes: data.checkInTemplate?.purposes?.length ? data.checkInTemplate.purposes : defaultCheckInTemplate.purposes };
}

export async function updateCheckInTemplate(template: CheckInTemplate) {
  const data = await readData();
  data.checkInTemplate = template;
  await writeData(data);
}

export async function getGuestGuideContent() {
  const data = await readData();
  return { ...defaultGuestGuideContent, ...data.guestGuideContent };
}

export async function updateGuestGuideContent(content: GuestGuideContent) {
  const data = await readData();
  data.guestGuideContent = content;
  await writeData(data);
}

export async function updateInventory(id: string, stock: Record<StockState, number>) {
  const data = await readData();
  const item = data.inventory.find((candidate) => candidate.id === id);
  if (!item) throw new Error("Položka nebyla nalezena.");
  const next: InventoryItem = { ...item, stock };
  if (stockTotal(next) !== item.owned) {
    throw new Error(`Součet stavů musí být ${item.owned} ${item.unit}.`);
  }
  item.stock = stock;
  await writeData(data);
}

export async function updateLinenInventory(id: string, ready: number, inUse: number) {
  const data = await readData();
  const item = data.inventory.find((candidate) => candidate.id === id);
  if (!item) throw new Error("Položka nebyla nalezena.");
  if (!Number.isInteger(ready) || !Number.isInteger(inUse) || ready < 0 || inUse < 0 || ready + inUse > item.owned) {
    throw new Error(`Součet připravených a používaných kusů nesmí překročit ${item.owned} ${item.unit}.`);
  }
  item.stock = {
    apartmentClean: ready, apartmentPrepared: 0, apartmentInUse: inUse, apartmentDirty: 0,
    homeClean: 0, homeDirty: 0, inTransit: 0, unusable: 0, unassigned: item.owned - ready - inUse,
  };
  await writeData(data);
}

export async function addCleaningSupply(name: string, quantity: number) {
  if (!name || !Number.isInteger(quantity) || quantity < 1) throw new Error("Zadej název a kladný počet kusů.");
  const data = await readData();
  const now = new Date().toISOString();
  const existing = (data.cleaningSupplies ?? []).find((item) => item.name.toLocaleLowerCase("cs") === name.toLocaleLowerCase("cs"));
  if (existing) { existing.quantity += quantity; existing.updatedAt = now; }
  else data.cleaningSupplies = [...(data.cleaningSupplies ?? []), { id: randomUUID(), name, quantity, unit: "ks", updatedAt: now } satisfies CleaningSupply];
  await writeData(data);
}

export async function adjustCleaningSupply(id: string, adjustment: number) {
  const data = await readData();
  const supply = (data.cleaningSupplies ?? []).find((item) => item.id === id);
  if (!supply) throw new Error("Prostředek nebyl nalezen.");
  if (!Number.isInteger(adjustment) || supply.quantity + adjustment < 0) throw new Error("Počet kusů nemůže být záporný.");
  supply.quantity += adjustment;
  supply.updatedAt = new Date().toISOString();
  await writeData(data);
}

export async function addSupplyTask(name: string, quantity: number, stayId?: string, note?: string) {
  if (!name || !Number.isInteger(quantity) || quantity < 1) throw new Error("Zadej položku a kladný počet kusů.");
  const data = await readData();
  const task: SupplyTask = { id: randomUUID(), name, quantity, stayId: stayId || undefined, note: note || undefined, createdAt: new Date().toISOString() };
  data.supplyTasks = [...(data.supplyTasks ?? []), task];
  await writeData(data);
}

export async function completeSupplyTask(id: string) {
  const data = await readData();
  const task = (data.supplyTasks ?? []).find((item) => item.id === id);
  if (!task) throw new Error("Položka nebyla nalezena.");
  task.completedAt = new Date().toISOString();
  await writeData(data);
}

export async function addStay(stay: Stay) {
  const data = await readData();
  data.stays.push(stay);
  data.stays.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  await writeData(data);
}

export async function replaceAirbnbStays(stays: Stay[]) {
  const data = await readData();
  const currentById = new Map(data.stays.filter((stay) => stay.source === "airbnb").map((stay) => [stay.id, stay]));
  const merged = stays.map((stay) => {
    const current = currentById.get(stay.id);
    return current?.guestCountManuallySet ? { ...stay, guests: current.guests, preparationGuests: current.preparationGuests, guestCountManuallySet: true, note: current.note } : stay;
  });
  data.stays = [...data.stays.filter((stay) => stay.source !== "airbnb"), ...merged].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  await writeData(data);
}

export async function updateStayGuests(id: string, guests: number) {
  if (!Number.isInteger(guests) || guests < 1 || guests > 4) throw new Error("Počet hostů musí být 1 až 4.");
  const data = await readData();
  const stay = data.stays.find((candidate) => candidate.id === id);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  stay.guests = guests;
  stay.preparationGuests = guests >= 3 ? 4 : 2;
  stay.guestCountManuallySet = true;
  if (stay.note === "Výchozí příprava pro 4 – ověřit v Airbnb") stay.note = "";
  await writeData(data);
}

export async function updateStayOperation(id: string, values: Pick<Stay, "arrivalTime" | "keyMethod" | "keyStatus">) {
  const data = await readData(); const stay = data.stays.find((item) => item.id === id);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  Object.assign(stay, values); await writeData(data);
}

export async function toggleStayChecklist(id: string, item: StayChecklistItem, completed: boolean) {
  const data = await readData(); const stay = data.stays.find((candidate) => candidate.id === id);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  stay.checklist = { ...stay.checklist, [item]: completed }; await writeData(data);
}

export async function markStayMessageSent(id: string, templateId: MessageTemplateId) {
  const data = await readData(); const stay = data.stays.find((candidate) => candidate.id === id);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  stay.messageLog = { ...stay.messageLog, [templateId]: new Date().toISOString() }; await writeData(data);
}

export async function getCommunicationTemplates() {
  const data = await readData();
  const saved = data.communicationTemplates ?? [];
  return defaultCommunicationTemplates.map((template) => saved.find((item) => item.id === template.id) ?? template);
}

export async function saveCommunicationTemplates(templates: CommunicationTemplate[]) {
  const data = await readData(); data.communicationTemplates = templates; await writeData(data);
}

export async function updateTaxSettlement(month: string, action: "reported" | "paid", note?: string) {
  const data = await readData(); const current = data.taxSettlements ?? [];
  const settlement = current.find((item) => item.month === month) ?? { month } satisfies TaxSettlement;
  settlement[action === "reported" ? "reportedAt" : "paidAt"] = new Date().toISOString();
  if (note) settlement.note = note;
  data.taxSettlements = [...current.filter((item) => item.month !== month), settlement].sort((a, b) => b.month.localeCompare(a.month));
  await writeData(data);
}

export async function updateStayTaxExemption(id: string, exemptGuests: number) {
  const data = await readData(); const stay = data.stays.find((item) => item.id === id);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  if (!Number.isInteger(exemptGuests) || exemptGuests < 0 || exemptGuests > stay.guests) throw new Error("Počet osvobozených hostů není platný.");
  stay.taxExemptGuests = exemptGuests; await writeData(data);
}

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createCheckInRegistration(stayId: string) {
  const data = await readData();
  const stay = data.stays.find((candidate) => candidate.id === stayId);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  const token = randomBytes(32).toString("base64url");
  const registration: CheckInRegistration = {
    id: randomUUID(), stayId, tokenHash: tokenHash(token), encryptedToken: encryptCheckInData(token),
    createdAt: new Date().toISOString(), expiresAt: `${stay.checkOut}T23:59:59.999Z`, expectedGuestCount: Math.min(4, Math.max(1, stay.guests)),
  };
  data.checkInRegistrations = [...(data.checkInRegistrations ?? []).filter((item) => item.stayId !== stayId), registration];
  await writeData(data);
  return registration;
}

export async function getCheckInRegistrationByToken(token: string) {
  const data = await readData();
  const registration = (data.checkInRegistrations ?? []).find((item) => item.tokenHash === tokenHash(token));
  if (!registration) return undefined;
  const stay = data.stays.find((candidate) => candidate.id === registration.stayId);
  if (!stay) return undefined;
  const guests = registration.encryptedGuests ? JSON.parse(decryptCheckInData(registration.encryptedGuests)) as CheckInGuest[] : [];
  return { registration, stay, completedGuestCount: guests.length, expectedGuestCount: registration.expectedGuestCount ?? Math.min(4, Math.max(1, stay.guests)) };
}

export async function submitCheckInRegistration(token: string, guests: CheckInGuest[], submittedCheckIn: string, submittedCheckOut: string, mode: "group" | "individual") {
  const data = await readData();
  const registration = (data.checkInRegistrations ?? []).find((item) => item.tokenHash === tokenHash(token));
  if (!registration || new Date(registration.expiresAt) < new Date()) throw new Error("This check-in link is no longer valid.");
  if (!submittedCheckIn || !submittedCheckOut || submittedCheckOut <= submittedCheckIn) throw new Error("Departure date must be after arrival date.");
  const stay = data.stays.find((item) => item.id === registration.stayId);
  if (!stay) throw new Error("This stay no longer exists.");
  const storedExpectedGuestCount = registration.expectedGuestCount ?? Math.min(4, Math.max(1, stay.guests));
  const expectedGuestCount = mode === "group" ? guests.length : storedExpectedGuestCount;
  const currentGuests = registration.encryptedGuests ? JSON.parse(decryptCheckInData(registration.encryptedGuests)) as CheckInGuest[] : [];
  const nextGuests = mode === "individual" ? [...currentGuests, ...guests] : guests;
  if (nextGuests.length > expectedGuestCount) throw new Error("All guest places for this booking have already been completed.");
  registration.encryptedGuests = encryptCheckInData(JSON.stringify(nextGuests));
  registration.submittedCheckIn = submittedCheckIn;
  registration.submittedCheckOut = submittedCheckOut;
  registration.expectedGuestCount = expectedGuestCount;
  registration.submittedAt = mode === "group" || nextGuests.length >= expectedGuestCount ? new Date().toISOString() : undefined;
  await writeData(data);
  return { completedGuestCount: nextGuests.length, expectedGuestCount, complete: Boolean(registration.submittedAt) };
}

export async function getCheckInRegistrations() {
  const data = await readData();
  return (data.checkInRegistrations ?? []).flatMap((registration) => {
    const stay = data.stays.find((candidate) => candidate.id === registration.stayId);
    if (!stay) return [];
    return [{ registration, stay, token: decryptCheckInData(registration.encryptedToken), guests: registration.encryptedGuests ? JSON.parse(decryptCheckInData(registration.encryptedGuests)) as CheckInGuest[] : undefined }];
  }).sort((a, b) => a.stay.checkIn.localeCompare(b.stay.checkIn));
}

export async function markCheckInReported(id: string) {
  const data = await readData();
  const registration = (data.checkInRegistrations ?? []).find((item) => item.id === id);
  if (!registration) throw new Error("Záznam nebyl nalezen.");
  registration.reportedAt = new Date().toISOString();
  await writeData(data);
}
