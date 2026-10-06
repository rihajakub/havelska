import { headers } from "next/headers";
import Link from "next/link";
import { createCheckInLink, markReported, revokeCheckInLink } from "@/app/actions";
import { CopyCheckInLinkButton } from "@/components/copy-checkin-link-button";
import { getAppData, getCheckInRegistrations } from "@/data/repository";
import type { CheckInGuest, Stay } from "@/domain/types";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
const dateTime = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" });
const czechTodayIso = () => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts();
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
};
type RegistrationItem = Awaited<ReturnType<typeof getCheckInRegistrations>>[number];

function reportingState(item: RegistrationItem | undefined) {
  if (!item) return ["Bez check-in odkazu", "needs-link"] as const;
  if (item.registration.reportedAt) return ["Odesláno do UbyPortu", "reported"] as const;
  if (item.registration.submittedAt) return ["Připraveno k odeslání", "ready"] as const;
  return ["Čeká na hosta", "waiting"] as const;
}

function GuestDetails({ guests }: { guests?: CheckInGuest[] }) {
  if (!guests?.length) return null;
  return <details className="guest-details"><summary>Zobrazit údaje hostů pro přepis</summary>{guests.map((guest, index) => <div className="guest-summary" key={index}><strong>{guest.firstName} {guest.lastName}</strong><span>Narození: {guest.birthDate} · Občanství: {guest.nationality}</span><span>Doklad: {guest.travelDocumentType ? `${guest.travelDocumentType} · ` : ""}{guest.travelDocumentNumber} · {guest.visaOrResidence}</span><span>Adresa: {guest.foreignAddress} · Účel: {guest.purposeOfStay}</span></div>)}</details>;
}

function RegistrationSummary({ stay, item }: { stay: Stay; item?: RegistrationItem }) {
  const expected = item?.registration.expectedGuestCount ?? stay.guests;
  if (!item) return <>Check-in odkaz pro tento pobyt nebyl vytvořen.</>;
  if (item.guests?.length) return <>{item.registration.submittedAt ? "Vyplněno" : "Průběžně vyplněno"} · {item.guests.length} z {expected} hostů.</>;
  return <>Odkaz očekával {expected} {expected === 1 ? "hosta" : expected < 5 ? "hosty" : "hostů"}.</>;
}

function ArchiveEntry({ stay, item }: { stay: Stay; item?: RegistrationItem }) {
  const [state, stateClass] = stay.status === "cancelled" ? ["Zrušeno", "cancelled"] : reportingState(item);
  const submittedCheckIn = item?.registration.submittedCheckIn ?? stay.checkIn;
  const submittedCheckOut = item?.registration.submittedCheckOut ?? stay.checkOut;
  return <li className="reporting-timeline-item"><div className={`reporting-timeline-dot ${stateClass}`} aria-hidden="true"/><div className="reporting-timeline-date"><time dateTime={submittedCheckIn}>{date.format(new Date(`${submittedCheckIn}T12:00:00`))}</time><span>→ {date.format(new Date(`${submittedCheckOut}T12:00:00`))}</span></div><article className="reporting-timeline-card"><div><span className={`reporting-state ${stateClass}`}>{state}</span><h3>{stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt"}</h3><p><RegistrationSummary stay={stay} item={item}/></p>{item?.registration.reportedAt && <p className="reporting-timestamp">Označeno jako odeslané: {dateTime.format(new Date(item.registration.reportedAt))}</p>}</div><div className="reporting-timeline-actions"><Link href={`/pobyty/${stay.id}`}>Detail pobytu →</Link><Link href={`/pobyty?month=${stay.checkIn.slice(0, 7)}&history=1`}>Kalendář měsíce →</Link></div><GuestDetails guests={item?.guests}/></article></li>;
}

export default async function ForeignPolicePage() {
  const { stays } = await getAppData();
  let registrations: RegistrationItem[] = [];
  let setupError = "";
  try { registrations = await getCheckInRegistrations(); } catch (error) { setupError = error instanceof Error ? error.message : "Nepodařilo se načíst šifrované záznamy."; }
  const registrationByStay = new Map(registrations.map((item) => [item.stay.id, item]));
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const origin = host ? `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${host}` : "";
  const todayIso = czechTodayIso();
  const currentStays = stays.filter((stay) => stay.status !== "cancelled" && stay.checkOut >= todayIso).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const archivedStays = stays.filter((stay) => stay.status === "cancelled" || stay.checkOut < todayIso).sort((a, b) => b.checkOut.localeCompare(a.checkOut));
  const completed = registrations.filter((item) => item.registration.submittedAt).length;
  const reported = registrations.filter((item) => item.registration.reportedAt).length;

  return <>
    <section className="reporting-heading"><div><span className="eyebrow">Evidence cizinců</span><h1>Hlášení pobytů</h1><p>Vytvoř odkaz, pošli ho hlavnímu hostovi přes Airbnb a po vyplnění údaje přepiš do UbyPortu.</p></div><Link className="button secondary template-button" href="/cizinecka-policie/template">Upravit šablonu</Link></section>
    {setupError && <section className="notice warn"><strong>Ještě není připraveno pro osobní údaje.</strong><span>V produkci nastav tajnou proměnnou CHECKIN_DATA_ENCRYPTION_KEY: {setupError}</span></section>}
    <section className="reporting-summary" aria-label="Stav hlášení"><div><strong>{currentStays.length}</strong><span>aktuálních pobytů</span></div><div><strong>{archivedStays.length}</strong><span>v archivu</span></div><div><strong>{completed}</strong><span>formulářů vyplněno</span></div><div><strong>{reported}</strong><span>odesláno do UbyPortu</span></div></section>
    <section className="reporting-guide"><strong>Jak postupovat</strong><ol><li>V Pobytech potvrď správný počet hostů.</li><li>Vytvoř check-in odkaz — tento počet se do něj uloží.</li><li>Pošli jej hostovi do Airbnb zprávy; po vyplnění údaje přepiš do UbyPortu.</li></ol></section>
    <section className="reporting-list"><div className="section-heading"><div><span className="eyebrow">Aktuální rezervace</span><h2>Check-in formuláře</h2></div><p>Každý odkaz je jedinečný pro daný pobyt a počet hostů se přebírá při jeho vytvoření.</p></div>{currentStays.length === 0 ? <section className="empty"><h3>Žádné aktuální ani budoucí pobyty</h3><p>Starší záznamy najdeš níže v archivu.</p></section> : currentStays.map((stay) => {
      const item = registrationByStay.get(stay.id); const checkInUrl = item && origin ? `${origin}/check-in/${item.token}` : ""; const submittedCheckIn = item?.registration.submittedCheckIn ?? stay.checkIn; const submittedCheckOut = item?.registration.submittedCheckOut ?? stay.checkOut; const expected = item?.registration.expectedGuestCount ?? stay.guests; const differsFromStay = Boolean(item && expected !== stay.guests); const [state, stateClass] = reportingState(item);
      return <article className="reporting-card" key={stay.id}><div className="reporting-card-main"><div className="reporting-date"><strong>{date.format(new Date(`${submittedCheckIn}T12:00:00`))}</strong><span>→ {date.format(new Date(`${submittedCheckOut}T12:00:00`))}</span></div><div><span className={`reporting-state ${stateClass}`}>{state}</span><h3>{stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt"}</h3><p><RegistrationSummary stay={stay} item={item}/></p>{differsFromStay && <p className="checkin-count-warning">Počet v odkazu ({expected}) neodpovídá Pobytům ({stay.guests}). Zneplatni ho a vytvoř nový.</p>}</div></div>{item ? <div className="reporting-card-actions"><label><span>Check-in odkaz</span><input readOnly value={checkInUrl}/></label><div className="inline-actions"><CopyCheckInLinkButton value={checkInUrl}/>{!item.registration.submittedAt && <form action={revokeCheckInLink}><input type="hidden" name="registrationId" value={item.registration.id}/><button className="button secondary danger-button" type="submit">Zneplatnit odkaz</button></form>}{item.registration.submittedAt && !item.registration.reportedAt && <form action={markReported}><input type="hidden" name="registrationId" value={item.registration.id}/><button className="button report-submit" type="submit">Potvrdit odeslání do UbyPortu</button></form>}</div><GuestDetails guests={item.guests}/></div> : <form action={createCheckInLink} className="create-link-action"><input type="hidden" name="stayId" value={stay.id}/><button className="button" type="submit" disabled={Boolean(setupError)}>Vytvořit check-in odkaz pro {stay.guests} {stay.guests === 1 ? "hosta" : stay.guests < 5 ? "hosty" : "hostů"}</button><small>Počet se převezme z Pobytů a po vytvoření odkazu se už nemění.</small></form>}</article>;
    })}</section>
    {archivedStays.length > 0 && <details className="reporting-archive"><summary><span><span className="eyebrow">Historie</span><strong>Archiv pobytů a hlášení</strong><small>{archivedStays.length} {archivedStays.length === 1 ? "záznam" : archivedStays.length < 5 ? "záznamy" : "záznamů"} · nejnovější nahoře</small></span><span aria-hidden="true">⌄</span></summary><p>Ukončené pobyty zůstávají uložené i poté, co je Airbnb iCal přestane vracet. Rozklikni záznam pro údaje hostů nebo otevři kalendář daného měsíce.</p><ol className="reporting-timeline">{archivedStays.map((stay) => <ArchiveEntry key={stay.id} stay={stay} item={registrationByStay.get(stay.id)}/>)}</ol></details>}
    <section className="notice reporting-legal"><strong>Domovní kniha:</strong><span>Digitální záznam je pracovní kopie. Pro kontrolu uchovej listinnou domovní knihu nebo podepsané přihlašovací listy.</span></section><p className="back-link"><Link href="/pobyty">← Zpět na pobyty</Link></p>
  </>;
}
