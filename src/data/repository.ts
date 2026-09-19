import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createSeedData } from "./seed";
import type { AppData, InventoryItem, Stay, StockState } from "@/domain/types";
import { stockTotal } from "@/domain/inventory";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "local.json");

async function readData(): Promise<AppData> {
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
