import Link from "next/link";
import { PrintPageButton } from "@/components/print-page-button";
import { getCheckInRegistrations } from "@/data/repository";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
const dateTime = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Prague" });
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

function displayDate(value: string) {
  return date.format(new Date(`${value}T12:00:00Z`));
}

function overlapsMonth(checkIn: string, checkOut: string, month: string) {
  const start = `${month}-01`;
  const next = new Date(`${start}T12:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return checkIn < next.toISOString().slice(0, 10) && checkOut > start;
}

export default async function HouseBookPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const query = await searchParams;
  const month = query.month && monthPattern.test(query.month) ? query.month : "";
  const registrations = (await getCheckInRegistrations())
    .filter((item) => item.guests?.length)
    .map((item) => ({ ...item, checkIn: item.registration.submittedCheckIn ?? item.stay.checkIn, checkOut: item.registration.submittedCheckOut ?? item.stay.checkOut }))
    .filter((item) => !month || overlapsMonth(item.checkIn, item.checkOut, month))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  const guestCount = registrations.reduce((sum, item) => sum + (item.guests?.length ?? 0), 0);

  return <>
    <section className="page-heading house-book-heading">
      <div><span className="eyebrow">Trvalá evidence hostů</span><h1>Domovní kniha</h1><p>Archiv údajů uložených přes online check-in. Historické záznamy zůstávají dostupné i po skončení pobytu.</p></div>
      <div className="house-book-actions print-hide"><Link className="button secondary" href="/cizinecka-policie">Zpět na hlášení</Link><Link className="button secondary" href={`/domovni-kniha/export${month ? `?month=${month}` : ""}`}>Stáhnout CSV</Link><PrintPageButton/></div>
    </section>
    <section className="house-book-summary"><div><strong>{registrations.length}</strong><span>evidovaných pobytů</span></div><div><strong>{guestCount}</strong><span>uložených hostů</span></div><div><strong>{registrations.filter((item) => item.registration.reportedAt).length}</strong><span>pobytů odesláno do UbyPortu</span></div></section>
    <form className="house-book-filter print-hide" method="get"><label><span>Kalendářní měsíc</span><input defaultValue={month} name="month" type="month"/></label><button className="button secondary" type="submit">Filtrovat</button>{month && <Link href="/domovni-kniha">Zrušit filtr</Link>}</form>
    {registrations.length === 0 ? <section className="empty"><h2>{month ? "V tomto měsíci nejsou uložené záznamy" : "Domovní kniha je zatím prázdná"}</h2><p>Jakmile host odešle online check-in, jeho údaje se automaticky objeví zde.</p></section> : <div className="house-book-list">{registrations.map((item) => <article className="house-book-stay" key={item.registration.id}>
      <header><div><span className="eyebrow">Pobyt</span><h2>{displayDate(item.checkIn)}–{displayDate(item.checkOut)}</h2><p>{item.guests?.length ?? 0} z {item.registration.expectedGuestCount ?? item.stay.guests} hostů · {item.registration.submittedAt ? "check-in dokončen" : "průběžně uloženo"}</p></div><span className={`reporting-state ${item.registration.reportedAt ? "reported" : item.registration.submittedAt ? "ready" : "waiting"}`}>{item.registration.reportedAt ? "UbyPort odeslán" : item.registration.submittedAt ? "Čeká na UbyPort" : "Neúplný check-in"}</span></header>
      <div className="house-book-table-wrap"><table className="house-book-table"><thead><tr><th>Host</th><th>Narození / občanství</th><th>Doklad / vízum</th><th>Bydliště</th><th>Účel pobytu</th></tr></thead><tbody>{item.guests?.map((guest, index) => <tr key={`${item.registration.id}-${index}`}><td><strong>{guest.firstName} {guest.lastName}</strong></td><td>{displayDate(guest.birthDate)}<small>{guest.nationality}</small></td><td>{guest.travelDocumentType}<small>{guest.travelDocumentNumber}{guest.visaOrResidence ? ` · ${guest.visaOrResidence}` : ""}</small></td><td>{guest.foreignAddress}</td><td>{guest.purposeOfStay}</td></tr>)}</tbody></table></div>
      <footer><span>Uloženo: {item.registration.submittedAt ? dateTime.format(new Date(item.registration.submittedAt)) : "průběžný záznam"}</span><Link className="print-hide" href={`/pobyty/${item.stay.id}`}>Detail pobytu →</Link></footer>
    </article>)}</div>}
    <section className="notice house-book-note print-hide"><strong>Ochrana údajů</strong><span>Údaje hostů zůstávají v databázi zašifrované. CSV nebo PDF ukládej pouze na bezpečné místo a jen po nezbytnou dobu.</span></section>
  </>;
}
