"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { addCleaningSupply, addStay, addSupplyTask, adjustCleaningSupply, completeSupplyTask, createCheckInRegistration, markCheckInReported, markStayMessageSent, replaceAirbnbStays, saveCommunicationTemplates, submitCheckInRegistration, toggleStayChecklist, updateCheckInTemplate, updateGuestGuideContent, updateLinenInventory, updateStayGuests, updateStayOperation, updateStayTaxExemption, updateTaxSettlement } from "@/data/repository";
import { parseAirbnbCalendar } from "@/data/airbnb";
import { STOCK_STATES } from "@/domain/inventory";
import type { CheckInGuest, CheckInTemplate, CommunicationTemplate, GuestGuideContent, MessageTemplateId, StayChecklistItem } from "@/domain/types";

function assertDashboardWriteAllowed() {
  if (process.env.VERCEL && process.env.ENABLE_PRODUCTION_APP !== "true") {
    throw new Error("Produkční provoz není povolen.");
  }
}

const SESSION_COOKIE = "havelska_session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const requestedPath = String(formData.get("next") ?? "/dashboard");
  const next = requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/dashboard";
  const expected = process.env.APP_PASSWORD;

  if (!expected || password !== expected) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = createHash("sha256").update(`havelska-session:${expected}`).digest("base64url");
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: Boolean(process.env.VERCEL),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}

const asCount = (value: FormDataEntryValue | null) => {
  const count = Number(value ?? 0);
  if (!Number.isInteger(count) || count < 0) throw new Error("Množství musí být nezáporné celé číslo.");
  return count;
};

export async function saveLinenInventory(formData: FormData) {
  assertDashboardWriteAllowed();
  const id = String(formData.get("id") ?? "");
  await updateLinenInventory(id, asCount(formData.get("ready")), asCount(formData.get("inUse")));
  revalidatePath("/dashboard");
  revalidatePath("/inventar");
}

export async function createStay(formData: FormData) {
  assertDashboardWriteAllowed();
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
  revalidatePath("/dashboard");
  revalidatePath("/pobyty");
  redirect("/pobyty");
}

export async function addSupply(formData: FormData) {
  assertDashboardWriteAllowed();
  await addCleaningSupply(String(formData.get("name") ?? "").trim(), asCount(formData.get("quantity")));
  revalidatePath("/dashboard"); revalidatePath("/inventar");
}

export async function changeSupplyQuantity(formData: FormData) {
  assertDashboardWriteAllowed();
  const adjustment = Number(formData.get("adjustment") ?? 0);
  if (!Number.isInteger(adjustment) || adjustment === 0) throw new Error("Neplatná změna množství.");
  await adjustCleaningSupply(String(formData.get("id") ?? ""), adjustment);
  revalidatePath("/dashboard"); revalidatePath("/inventar");
}

export async function createSupplyTask(formData: FormData) {
  assertDashboardWriteAllowed();
  await addSupplyTask(String(formData.get("name") ?? "").trim(), asCount(formData.get("quantity")), String(formData.get("stayId") ?? ""), String(formData.get("note") ?? "").trim());
  revalidatePath("/dashboard"); revalidatePath("/inventar");
}

export async function resolveSupplyTask(formData: FormData) {
  assertDashboardWriteAllowed();
  await completeSupplyTask(String(formData.get("id") ?? ""));
  revalidatePath("/dashboard"); revalidatePath("/inventar");
}

export async function syncAirbnbCalendar() {
  const url = process.env.AIRBNB_ICAL_URL;
  if (!url) throw new Error("AIRBNB_ICAL_URL není nastavené.");
  let response: Response;
  try { response = await fetch(url, { cache: "no-store" }); } catch { throw new Error("Airbnb iCal se nepodařilo načíst."); }
  if (!response.ok) throw new Error("Airbnb iCal vrátil neplatnou odpověď.");
  await replaceAirbnbStays(parseAirbnbCalendar(await response.text()));
  revalidatePath("/dashboard"); revalidatePath("/pobyty");
}

export async function createCheckInLink(formData: FormData) {
  await createCheckInRegistration(String(formData.get("stayId") ?? ""));
  revalidatePath("/cizinecka-policie");
}

export async function updateGuests(formData: FormData) {
  await updateStayGuests(String(formData.get("stayId") ?? ""), asCount(formData.get("guests")));
  revalidatePath("/dashboard"); revalidatePath("/pobyty"); revalidatePath("/cizinecka-policie");
}

export async function saveStayOperation(formData: FormData) {
  assertDashboardWriteAllowed();
  const keyMethod = String(formData.get("keyMethod") ?? ""); const keyStatus = String(formData.get("keyStatus") ?? "");
  if (!["personal", "lockbox", "smart-lock"].includes(keyMethod) || !["not-arranged", "instructions-sent", "handed-over"].includes(keyStatus)) throw new Error("Neplatný stav předání klíčů.");
  await updateStayOperation(String(formData.get("stayId") ?? ""), { arrivalTime: String(formData.get("arrivalTime") ?? ""), keyMethod: keyMethod as "personal" | "lockbox" | "smart-lock", keyStatus: keyStatus as "not-arranged" | "instructions-sent" | "handed-over" });
  revalidatePath("/dashboard"); revalidatePath("/pobyty"); revalidatePath("/pobyty/[id]", "page");
}

export async function setChecklistItem(formData: FormData) {
  assertDashboardWriteAllowed();
  await toggleStayChecklist(String(formData.get("stayId") ?? ""), String(formData.get("item") ?? "") as StayChecklistItem, String(formData.get("completed") ?? "") === "true");
  revalidatePath("/dashboard"); revalidatePath("/pobyty/[id]", "page");
}

export async function logMessageSent(formData: FormData) {
  assertDashboardWriteAllowed();
  await markStayMessageSent(String(formData.get("stayId") ?? ""), String(formData.get("templateId") ?? "") as MessageTemplateId);
  revalidatePath("/pobyty/[id]", "page");
}

export async function saveMessageTemplates(formData: FormData) {
  assertDashboardWriteAllowed();
  const ids: MessageTemplateId[] = ["booking", "checkin", "arrival", "departure", "review"];
  const templates = ids.map((id) => ({ id, name: String(formData.get(`${id}-name`) ?? "").trim(), body: String(formData.get(`${id}-body`) ?? "").trim() })) as CommunicationTemplate[];
  if (templates.some((item) => !item.name || !item.body)) throw new Error("Každá šablona potřebuje název i text.");
  await saveCommunicationTemplates(templates); revalidatePath("/komunikace"); revalidatePath("/pobyty/[id]", "page");
}

export async function saveTaxExemption(formData: FormData) {
  assertDashboardWriteAllowed(); await updateStayTaxExemption(String(formData.get("stayId") ?? ""), asCount(formData.get("exemptGuests"))); revalidatePath("/poplatky");
}

export async function markTaxSettlement(formData: FormData) {
  assertDashboardWriteAllowed(); const action = String(formData.get("action") ?? "");
  if (action !== "reported" && action !== "paid") throw new Error("Neplatná akce.");
  await updateTaxSettlement(String(formData.get("month") ?? ""), action, String(formData.get("note") ?? "").trim()); revalidatePath("/poplatky");
}

export async function saveCheckInTemplate(formData: FormData) {
  const fields = ["title", "introduction", "stayLabel", "documentNotice", "arrivalLabel", "departureLabel", "guestLabel", "firstNameLabel", "lastNameLabel", "birthDateLabel", "nationalityLabel", "travelDocumentLabel", "visaLabel", "addressCountryLabel", "addressLabel", "addressHelp", "purposeLabel", "purposeOtherLabel", "addGuestLabel", "removeGuestLabel", "submitLabel"] as const;
  const template = Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "").trim()])) as Omit<CheckInTemplate, "purposes">;
  const purposes = String(formData.get("purposes") ?? "").split("\n").map((value) => value.trim()).filter(Boolean);
  if (Object.values(template).some((value) => !value) || !purposes.length) throw new Error("Šablona musí obsahovat všechny texty a alespoň jeden účel cesty.");
  await updateCheckInTemplate({ ...template, purposes });
  revalidatePath("/cizinecka-policie/template"); revalidatePath("/check-in/[token]", "page");
}

export async function saveGuestGuide(formData: FormData) {
  assertDashboardWriteAllowed();
  const fields = ["title", "subtitle", "welcome", "arrival", "keys", "wifiName", "wifiPassword", "apartmentCare", "utilities", "recycling", "appliances", "pragueTips", "checkout", "help"] as const;
  const content = Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "").trim()])) as unknown as GuestGuideContent;
  if (Object.values(content).some((value) => !value)) throw new Error("Vyplň všechny části průvodce.");
  await updateGuestGuideContent(content);
  revalidatePath("/guest-info");
  revalidatePath("/pruvodce");
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
  const submittedCheckIn = String(formData.get("submittedCheckIn") ?? "");
  const submittedCheckOut = String(formData.get("submittedCheckOut") ?? "");
  const count = Number(formData.get("guestCount") ?? 0);
  const mode = String(formData.get("completionMode") ?? "group");
  if (!token || !Number.isInteger(count) || count < 1 || count > 4) throw new Error("The number of guests is invalid.");
  if (mode !== "group" && mode !== "individual") throw new Error("The submission mode is invalid.");
  const guests = Array.from({ length: count }, (_, index): CheckInGuest => ({
    firstName: guestField(formData, index, "firstName"), lastName: guestField(formData, index, "lastName"),
    birthDate: guestField(formData, index, "birthDate"), nationality: guestField(formData, index, "nationality"),
    travelDocumentNumber: guestField(formData, index, "travelDocumentNumber"), visaOrResidence: guestField(formData, index, "visaOrResidence"),
    foreignAddress: guestField(formData, index, "foreignAddress"), purposeOfStay: guestField(formData, index, "purposeOfStay"),
  }));
  return submitCheckInRegistration(token, guests, submittedCheckIn, submittedCheckOut, mode);
}
