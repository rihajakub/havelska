import { headers } from "next/headers";
import Link from "next/link";
import { createCheckInLink, markReported } from "@/app/actions";
import { CopyCheckInLinkButton } from "@/components/copy-checkin-link-button";
import { getAppData, getCheckInRegistrations } from "@/data/repository";

export const dynamic = "force-dynamic";
const date = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });

export default async function ForeignPolicePage() {
  const { stays } = await getAppData();
  let registrations: Awaited<ReturnType<typeof getCheckInRegistrations>> = [];
  let setupError = "";
  try { registrations = await getCheckInRegistrations(); } catch (error) { setupError = error instanceof Error ? error.message : "Nepodařilo se načíst šifrované záznamy."; }
  const registrationByStay = new Map(registrations.map((item) => [item.stay.id, item]));
  const requestHeaders = await headers(); const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"); const origin = host ? `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${host}` : "";
  const sortedStays = [...stays].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const created = registrations.length; const completed = registrations.filter((item) => item.registration.submittedAt).length; const reported = registrations.filter((item) => item.registration.reportedAt).length;
  return <>
    <section className="reporting-heading"><div><span className="eyebrow">Evidence cizinců</span><h1>Hlášení pobytů</h1><p>Vytvoř odkaz, pošli ho hlavnímu hostovi přes Airbnb a po vyplnění údaje přepiš do UbyPortu.</p></div><Link className="button secondary template-button" href="/cizinecka-policie/template">Upravit šablonu</Link></section>
    {setupError && <section className="notice warn"><strong>Ještě není připraveno pro osobní údaje.</strong><span>V produkci nastav tajnou proměnnou CHECKIN_DATA_ENCRYPTION_KEY: {setupError}</span></section>}
    <section className="reporting-summary" aria-label="Stav hlášení"><div><strong>{sortedStays.length}</strong><span>pobytů</span></div><div><strong>{created}</strong><span>odkazů vytvořeno</span></div><div><strong>{completed}</strong><span>formulářů vyplněno</span></div><div><strong>{reported}</strong><span>odesláno do UbyPortu</span></div></section>
    <section className="reporting-guide"><strong>Jak postupovat</strong><ol><li>Vytvoř check-in odkaz.</li><li>Pošli jej hostovi do Airbnb zprávy.</li><li>Po vyplnění přepiš údaje do UbyPortu a označ odeslání.</li></ol></section>
    <section className="reporting-list"><div className="section-heading"><div><span className="eyebrow">Rezervace</span><h2>Check-in formuláře</h2></div><p>Každý odkaz je jedinečný pro daný pobyt.</p></div>{sortedStays.map((stay) => {
      const item = registrationByStay.get(stay.id); const checkInUrl = item && origin ? `${origin}/check-in/${item.token}` : ""; const submittedCheckIn = item?.registration.submittedCheckIn ?? stay.checkIn; const submittedCheckOut = item?.registration.submittedCheckOut ?? stay.checkOut;
      const state = !item ? ["Čeká na odkaz", "needs-link"] : item.registration.reportedAt ? ["Odesláno", "reported"] : item.registration.submittedAt ? ["Připraveno k odeslání", "ready"] : ["Čeká na hosta", "waiting"];
      return <article className="reporting-card" key={stay.id}><div className="reporting-card-main"><div className="reporting-date"><strong>{date.format(new Date(`${submittedCheckIn}T12:00:00`))}</strong><span>→ {date.format(new Date(`${submittedCheckOut}T12:00:00`))}</span></div><div><span className={`reporting-state ${state[1]}`}>{state[0]}</span><h3>{stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt"}</h3><p>{item?.guests?.length ? `${item.registration.submittedAt ? "Vyplněno" : "Průběžně vyplněno"} · ${item.guests.length} z ${item.registration.expectedGuestCount ?? stay.guests} hostů` : "Formulář zatím nebyl vyplněn."}</p></div></div>{item ? <div className="reporting-card-actions"><label><span>Check-in odkaz</span><input readOnly value={checkInUrl}/></label><div className="inline-actions"><CopyCheckInLinkButton value={checkInUrl}/>{item.registration.submittedAt && !item.registration.reportedAt && <form action={markReported}><input type="hidden" name="registrationId" value={item.registration.id}/><button className="button report-submit" type="submit">Potvrdit odeslání do UbyPortu</button></form>}</div>{item.guests && <details className="guest-details"><summary>Zobrazit údaje hostů pro přepis</summary>{item.guests.map((guest, index) => <div className="guest-summary" key={index}><strong>{guest.firstName} {guest.lastName}</strong><span>Narození: {guest.birthDate} · Občanství: {guest.nationality}</span><span>Doklad: {guest.travelDocumentNumber} · {guest.visaOrResidence}</span><span>Adresa: {guest.foreignAddress} · Účel: {guest.purposeOfStay}</span></div>)}</details>}</div> : <form action={createCheckInLink} className="create-link-action"><input type="hidden" name="stayId" value={stay.id}/><button className="button" type="submit" disabled={Boolean(setupError)}>Vytvořit check-in odkaz</button><small>Host vyplní údaje až po otevření odkazu.</small></form>}</article>;
    })}</section><section className="notice reporting-legal"><strong>Domovní kniha:</strong><span>Digitální záznam je pracovní kopie. Pro kontrolu uchovej listinnou domovní knihu nebo podepsané přihlašovací listy.</span></section><p className="back-link"><Link href="/pobyty">← Zpět na pobyty</Link></p>
  </>;
}
