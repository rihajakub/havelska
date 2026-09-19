"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addStay, updateInventory } from "@/data/repository";
import { STOCK_STATES } from "@/domain/inventory";
import type { StockState } from "@/domain/types";

function assertLocalDevelopment() {
  if (process.env.VERCEL || process.env.LOCAL_DEV_BYPASS_AUTH !== "true") {
    throw new Error("Zápis je povolen pouze v lokálním vývojovém režimu.");
  }
}

const asCount = (value: FormDataEntryValue | null) => {
  const count = Number(value ?? 0);
  if (!Number.isInteger(count) || count < 0) throw new Error("Množství musí být nezáporné celé číslo.");
  return count;
};

export async function saveInventory(formData: FormData) {
  assertLocalDevelopment();
  const id = String(formData.get("id") ?? "");
  const stock = Object.fromEntries(
    STOCK_STATES.map((state) => [state, asCount(formData.get(state))]),
  ) as Record<StockState, number>;
  await updateInventory(id, stock);
  revalidatePath("/");
  revalidatePath("/inventar");
}

export async function createStay(formData: FormData) {
  assertLocalDevelopment();
  const checkIn = String(formData.get("checkIn") ?? "");
  const checkOut = String(formData.get("checkOut") ?? "");
  const guests = asCount(formData.get("guests"));
  if (!checkIn || !checkOut || checkOut <= checkIn) throw new Error("Odjezd musí být po příjezdu.");
  if (guests < 1 || guests > 4) throw new Error("Počet hostů musí být 1 až 4.");
  await addStay({
    id: crypto.randomUUID(),
    checkIn,
    checkOut,
    guests,
    preparationGuests: guests >= 3 ? 4 : 2,
    status: "planned",
    note: String(formData.get("note") ?? "").trim(),
    source: "manual",
  });
  revalidatePath("/");
  revalidatePath("/pobyty");
  redirect("/pobyty");
}
