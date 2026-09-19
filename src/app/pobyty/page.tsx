import Link from "next/link";
import { getAppData } from "@/data/repository";
import { PlusIcon } from "@/components/icons";

const format = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

export default async function StaysPage() {
  const { stays } = await getAppData();
  return <>
    <section className="page-heading split"><div><span className="eyebrow">Plán provozu</span><h1>Pobyty</h1><p>Ruční pobyty lze později bezpečně spojit s importem z Airbnb.</p></div><Link className="button" href="/pobyty/novy"><PlusIcon/>Přidat</Link></section>
    {stays.length === 0 ? <section className="empty"><CalendarEmpty/><h2>Zatím žádný pobyt</h2><p>Přidej první rezervaci. Import Airbnb iCal doplníme po ověření skutečného exportu.</p><Link className="button" href="/pobyty/novy">Přidat ručně</Link></section> : (
      <div className="stay-list">{stays.map((stay) => <article className="stay-card" key={stay.id}><div className="date-tile"><strong>{new Date(`${stay.checkIn}T12:00`).getDate()}</strong><span>{new Intl.DateTimeFormat("cs-CZ", { month: "short" }).format(new Date(`${stay.checkIn}T12:00`))}</span></div><div><span className="eyebrow">{stay.source === "manual" ? "Ručně" : "Airbnb"}</span><h2>{format.format(new Date(`${stay.checkIn}T12:00`))} – {format.format(new Date(`${stay.checkOut}T12:00`))}</h2><p>{stay.guests} hosté · připravit pro {stay.preparationGuests}{stay.note ? ` · ${stay.note}` : ""}</p></div></article>)}</div>
    )}
  </>;
}

function CalendarEmpty() { return <svg className="empty-icon" viewBox="0 0 80 80" fill="none" aria-hidden="true"><rect x="13" y="19" width="54" height="48" rx="10" stroke="currentColor" strokeWidth="3"/><path d="M26 12v14M54 12v14M13 33h54" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M29 49h22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>; }

