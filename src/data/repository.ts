import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createSeedData } from "./seed";
import { readPostgresData, writePostgresData } from "./postgres";
import type { AppData, CheckInGuest, CheckInRegistration, InventoryItem, Stay, StockState } from "@/domain/types";
import { stockTotal } from "@/domain/inventory";
import { decryptCheckInData, encryptCheckInData } from "./check-in-crypto";

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

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createCheckInRegistration(stayId: string) {
  const data = await readData();
  const stay = data.stays.find((candidate) => candidate.id === stayId);
  if (!stay) throw new Error("Pobyt nebyl nalezen.");
  const token = randomBytes(32).toString("base64url");
  const registration: CheckInRegistration = {
    id: randomUUID(), stayId, tokenHash: tokenHash(token), encryptedToken: encryptCheckInData(token),
    createdAt: new Date().toISOString(), expiresAt: `${stay.checkOut}T23:59:59.999Z`,
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
  return stay ? { registration, stay } : undefined;
}

export async function submitCheckInRegistration(token: string, guests: CheckInGuest[], submittedCheckIn: string, submittedCheckOut: string) {
  const data = await readData();
  const registration = (data.checkInRegistrations ?? []).find((item) => item.tokenHash === tokenHash(token));
  if (!registration || new Date(registration.expiresAt) < new Date()) throw new Error("This check-in link is no longer valid.");
  if (!submittedCheckIn || !submittedCheckOut || submittedCheckOut <= submittedCheckIn) throw new Error("Departure date must be after arrival date.");
  registration.encryptedGuests = encryptCheckInData(JSON.stringify(guests));
  registration.submittedCheckIn = submittedCheckIn;
  registration.submittedCheckOut = submittedCheckOut;
  registration.submittedAt = new Date().toISOString();
  await writeData(data);
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
