import Link from "next/link";
import { getAppData } from "@/data/repository";
import { PlusIcon } from "@/components/icons";
import { syncAirbnbCalendar } from "@/app/actions";
import type { Stay } from "@/domain/types";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const detailFormat = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric" });
const weekdayFormat = new Intl.DateTimeFormat("cs-CZ", { weekday: "short" });
function fromIso(value: string) { return new Date(`${value}T12:00:00`); }
function iso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function addDays(date: Date, count: number) { return new Date(date.getTime() + count * DAY_MS); }
function monday(date: Date) { return addDays(date, 1 - (date.getDay() || 7)); }
function staysOnDay(stays: Stay[], date: Date) { const value = iso(date); return stays.filter((stay) => stay.checkIn <= value && stay.checkOut > value); }
function stayRange(stay: Stay) { return `${dayFormat.format(fromIso(stay.checkIn))} – ${dayFormat.format(fromIso(stay.checkOut))}`; }

function CalendarEmpty() { return <svg className="empty-icon" viewBox="0 0 80 80" fill="none" aria-hidden="true"><rect x="13" y="19" width="54" height="48" rx="10" stroke="currentColor" strokeWidth="3"/><path d="M26 12v14M54 12v14M13 33h54" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M29 49h22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>; }

export default async function StaysPage() {
  const { stays: unsortedStays } = await getAppData();
  const stays = [...unsortedStays].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const today = fromIso(iso(new Date()));
  const firstUpcoming = stays.find((stay) => stay.checkOut >= iso(today));
  const start = monday(firstUpcoming ? fromIso(firstUpcoming.checkIn) : today);
  const weeks = Array.from({ length: 8 }, (_, index) => addDays(start, index * 7));

  return <>
    <section className="page-heading split"><div><span className="eyebrow">Plán provozu</span><h1>Pobyty</h1><p>Ruční pobyty lze bezpečně spojit s importem z Airbnb.</p></div><div className="header-actions"><form action={syncAirbnbCalendar}><button className="button secondary" type="submit">Synchronizovat Airbnb</button></form><a className="button secondary" href="https://www.airbnb.com/hosting/reservations" target="_blank" rel="noreferrer">Otevřít Airbnb</a><Link className="button" href="/pobyty/novy"><PlusIcon/>Přidat</Link></div></section>
    <section className="calendar-section" aria-labelledby="calendar-title"><div className="calendar-title"><div><span className="eyebrow">Přehled rezervací</span><h2 id="calendar-title">Týdenní kalendář</h2></div><p>Den odjezdu je opět volný.</p></div><div className="calendar-scroll"><div className="week-calendar"><div className="calendar-corner">Týden</div>{Array.from({ length: 7 }, (_, index) => <div className="calendar-weekday" key={index}>{weekdayFormat.format(addDays(start, index))}</div>)}{weeks.flatMap((weekStart) => [<div className="calendar-week-label" key={`${iso(weekStart)}-label`}>{dayFormat.format(weekStart)} – {dayFormat.format(addDays(weekStart, 6))}</div>, ...Array.from({ length: 7 }, (_, index) => { const day = addDays(weekStart, index); const dayStays = staysOnDay(stays, day); return <div className={`calendar-day${iso(day) === iso(today) ? " today" : ""}`} key={iso(day)}><time dateTime={iso(day)}>{dayFormat.format(day)}</time>{dayStays.map((stay) => <Link className={`calendar-stay ${stay.source}`} href={`/pobyty/${stay.id}/upravit`} key={stay.id} title={`${stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt"}: ${stayRange(stay)}, ${stay.guests} hosté, připravit pro ${stay.preparationGuests}`}><strong>{stay.source === "airbnb" ? "Airbnb" : "Ruční pobyt"}</strong><span>{stayRange(stay)}</span><small>odjezd {dayFormat.format(fromIso(stay.checkOut))}</small></Link>)}</div>; })])}</div></div></section>
    <div className="calendar-title stays-title"><div><span className="eyebrow">Detailní přehled</span><h2>Seznam pobytů</h2></div></div>
    {stays.length === 0 ? <section className="empty"><CalendarEmpty/><h2>Zatím žádný pobyt</h2><p>Přidej první rezervaci. Import Airbnb iCal doplníme po ověření skutečného exportu.</p><Link className="button" href="/pobyty/novy">Přidat ručně</Link></section> : <div className="stay-list">{stays.map((stay) => <article className="stay-card" key={stay.id}><div className="date-tile"><strong>{fromIso(stay.checkIn).getDate()}</strong><span>{new Intl.DateTimeFormat("cs-CZ", { month: "short" }).format(fromIso(stay.checkIn))}</span></div><div><span className="eyebrow">{stay.source === "manual" ? "Ručně" : "Airbnb"}</span><h2>{detailFormat.format(fromIso(stay.checkIn))} – {detailFormat.format(fromIso(stay.checkOut))}</h2><p>{stay.guests} hosté · připravit pro {stay.preparationGuests}{stay.note ? ` · ${stay.note}` : ""}</p></div></article>)}</div>}
  </>;
}
