"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addStay, createCheckInRegistration, markCheckInReported, replaceAirbnbStays, submitCheckInRegistration, updateInventory, updateStayGuests } from "@/data/repository";
import { parseAirbnbCalendar } from "@/data/airbnb";
import { STOCK_STATES } from "@/domain/inventory";
import type { CheckInGuest, StockState } from "@/domain/types";

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

export async function syncAirbnbCalendar() {
  const url = process.env.AIRBNB_ICAL_URL;
  if (!url) throw new Error("AIRBNB_ICAL_URL není nastavené.");
  let response: Response;
  try { response = await fetch(url, { cache: "no-store" }); } catch { throw new Error("Airbnb iCal se nepodařilo načíst."); }
  if (!response.ok) throw new Error("Airbnb iCal vrátil neplatnou odpověď.");
  await replaceAirbnbStays(parseAirbnbCalendar(await response.text()));
  revalidatePath("/"); revalidatePath("/pobyty");
}

export async function createCheckInLink(formData: FormData) {
  await createCheckInRegistration(String(formData.get("stayId") ?? ""));
  revalidatePath("/cizinecka-policie");
}

export async function updateGuests(formData: FormData) {
  await updateStayGuests(String(formData.get("stayId") ?? ""), asCount(formData.get("guests")));
  revalidatePath("/"); revalidatePath("/pobyty"); revalidatePath("/cizinecka-policie");
}

export async function markReported(formData: FormData) {
  await markCheckInReported(String(formData.get("registrationId") ?? ""));
  revalidatePath("/cizinecka-policie");
}

const guestField = (formData: FormData, index: number, field: keyof CheckInGuest, required = true) => {
  const value = String(formData.get(`guest-${index}-${field}`) ?? "").trim();
  if (required && !value) throw new Error("Please complete all required details for every guest.");
  return value;
};

export async function submitCheckInForm(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const count = Number(formData.get("guestCount") ?? 0);
  if (!token || !Number.isInteger(count) || count < 1 || count > 4) throw new Error("The number of guests is invalid.");
  const guests = Array.from({ length: count }, (_, index): CheckInGuest => ({
    firstName: guestField(formData, index, "firstName"), lastName: guestField(formData, index, "lastName"),
    birthDate: guestField(formData, index, "birthDate"), nationality: guestField(formData, index, "nationality"),
    travelDocumentNumber: guestField(formData, index, "travelDocumentNumber"), visaOrResidence: guestField(formData, index, "visaOrResidence"),
    foreignAddress: guestField(formData, index, "foreignAddress"), purposeOfStay: guestField(formData, index, "purposeOfStay"),
  }));
  await submitCheckInRegistration(token, guests);
}
