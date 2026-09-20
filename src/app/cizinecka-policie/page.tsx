import { headers } from "next/headers";
import Link from "next/link";
import { createCheckInLink, markReported } from "@/app/actions";
import { getAppData, getCheckInRegistrations } from "@/data/repository";

export const dynamic = "force-dynamic";
const date = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });

export default async function ForeignPolicePage() {
  const { stays } = await getAppData();
  let registrations: Awaited<ReturnType<typeof getCheckInRegistrations>> = [];
  let setupError = "";
  try { registrations = await getCheckInRegistrations(); } catch (error) { setupError = error instanceof Error ? error.message : "Nepodařilo se načíst šifrované záznamy."; }
  const registrationByStay = new Map(registrations.map((item) => [item.stay.id, item]));
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const origin = host ? `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${host}` : "";
  return <>
    <section className="page-heading"><span className="eyebrow">Evidence cizinců</span><h1>Check-in a domovní kniha</h1><p>Odkaz pošli hlavnímu hostovi přes Airbnb. Údaje vyplní za všechny zahraniční hosty, nejvýše za čtyři osoby.</p></section>
    {setupError && <section className="notice"><strong>Ještě není připraveno pro osobní údaje.</strong><span>V produkci nastav tajnou proměnnou CHECKIN_DATA_ENCRYPTION_KEY: {setupError}</span></section>}
    <section className="notice"><strong>Právní provoz:</strong><span>Digitální záznam je pracovní kopie. Pro kontrolu je nutné uchovat listinnou domovní knihu / podepsané přihlašovací listy.</span></section>
    <section className="registration-list">{[...stays].sort((a, b) => a.checkIn.localeCompare(b.checkIn)).map((stay) => {
      const item = registrationByStay.get(stay.id); const checkInUrl = item && origin ? `${origin}/check-in/${item.token}` : "";
      const submittedCheckIn = item?.registration.submittedCheckIn ?? stay.checkIn; const submittedCheckOut = item?.registration.submittedCheckOut ?? stay.checkOut;
      return <article className="registration-card" key={stay.id}><div><span className="eyebrow">{date.format(new Date(`${submittedCheckIn}T12:00:00`))} – {date.format(new Date(`${submittedCheckOut}T12:00:00`))}</span><h2>{stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt"}</h2>{item?.registration.submittedAt ? <p>Vyplněno {date.format(new Date(item.registration.submittedAt))} · {item.guests?.length} hosté</p> : <p>Formulář zatím nebyl vyplněn.</p>}</div>{item ? <div className="registration-actions"><label><span>Check-in odkaz</span><input readOnly value={checkInUrl}/></label>{item.registration.submittedAt && !item.registration.reportedAt && <form action={markReported}><input type="hidden" name="registrationId" value={item.registration.id}/><button className="button" type="submit">Označit jako odeslané do UbyPortu</button></form>}{item.registration.reportedAt && <strong>Odesláno do UbyPortu</strong>}{item.guests && <details><summary>Údaje hostů pro přepis</summary>{item.guests.map((guest, index) => <div className="guest-summary" key={index}><strong>{guest.firstName} {guest.lastName}</strong><span>Narození: {guest.birthDate} · Občanství: {guest.nationality}</span><span>Doklad: {guest.travelDocumentNumber}{guest.visaOrResidence ? ` · ${guest.visaOrResidence}` : ""}</span><span>Adresa: {guest.foreignAddress} · Účel: {guest.purposeOfStay}</span></div>)}</details>}</div> : <form action={createCheckInLink}><input type="hidden" name="stayId" value={stay.id}/><button className="button" type="submit" disabled={Boolean(setupError)}>Vytvořit check-in odkaz</button></form>}</article>;
    })}</section><p className="back-link"><Link href="/pobyty">← Zpět na pobyty</Link></p>
  </>;
}
