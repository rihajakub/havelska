import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { getAppData } from "@/data/repository";
import type { Stay } from "@/domain/types";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const shortDate = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "short" });
const weekday = new Intl.DateTimeFormat("cs-CZ", { weekday: "short" });
function fromIso(value: string) { return new Date(`${value}T12:00:00`); }
function iso(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; }
function addDays(value: Date, count: number) { return new Date(value.getTime() + count * DAY_MS); }
function monday(value: Date) { return addDays(value, 1 - (value.getDay() || 7)); }
function staysOn(stays: Stay[], day: Date) { const value = iso(day); return stays.filter((stay) => stay.checkIn <= value && stay.checkOut > value); }
function departuresOn(stays: Stay[], day: Date) { const value = iso(day); return stays.filter((stay) => stay.checkOut === value); }

export default async function Dashboard() {
  const data = await getAppData();
  const stays = [...data.stays].filter((stay) => stay.status !== "cancelled").sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const today = fromIso(iso(new Date()));
  const start = monday(today);
  const weeks = Array.from({ length: 4 }, (_, index) => addDays(start, index * 7));
  const registrations = data.checkInRegistrations ?? [];
  const waitingForGuest = registrations.filter((item) => !item.submittedAt).length;
  const readyToReport = registrations.filter((item) => item.submittedAt && !item.reportedAt).length;
  const openTasks = (data.supplyTasks ?? []).filter((item) => !item.completedAt);

  return <>
    <section className="dashboard-heading">
      <div><span className="eyebrow">Provoz apartmánu</span><h1>Co nás čeká</h1><p>Kalendář, údaje hostů a provozní úkoly na jednom místě.</p></div>
    </section>
    <section className="dashboard-calendar" aria-labelledby="dashboard-calendar-title">
      <div className="section-heading"><div><span className="eyebrow">Nejbližší 4 týdny</span><h2 id="dashboard-calendar-title">Kalendář pobytů</h2></div><Link className="text-link" href="/pobyty">Celý kalendář <ArrowIcon/></Link></div>
      <div className="calendar-scroll"><div className="week-calendar dashboard-week-calendar"><div className="calendar-corner">Týden</div>{Array.from({ length: 7 }, (_, index) => <div className="calendar-weekday" key={index}>{weekday.format(addDays(start, index))}</div>)}{weeks.flatMap((weekStart) => [<div className="calendar-week-label" key={`${iso(weekStart)}-label`}>{shortDate.format(weekStart)} – {shortDate.format(addDays(weekStart, 6))}</div>, ...Array.from({ length: 7 }, (_, index) => { const day = addDays(weekStart, index); const matches = staysOn(stays, day); const departures = departuresOn(stays, day); const dayIso = iso(day); return <div className={`calendar-day${dayIso < iso(today) ? " past" : ""}${dayIso === iso(today) ? " today" : ""}`} key={dayIso}><time dateTime={dayIso}>{shortDate.format(day)}</time>{matches.map((stay) => <Link className={`calendar-stay ${stay.source}${stay.checkOut < iso(today) ? " completed" : ""}`} href={`/pobyty/${stay.id}`} key={stay.id}><strong>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"}</strong><span>{stay.guests} {stay.guests === 1 ? "host" : "hosté"}</span></Link>)}{departures.map((stay) => <Link className="calendar-departure" href={`/pobyty/${stay.id}`} key={`${stay.id}-departure`}>Odjezd ráno · {stay.guests} hosté</Link>)}</div>; })])}</div></div>
      <div className="mobile-calendar-agenda">{Array.from({ length: 28 }, (_, index) => { const day = addDays(start, index); const matches = staysOn(stays, day); const departures = departuresOn(stays, day); const dayIso = iso(day); return <div className={`agenda-day${matches.length ? " has-stay" : ""}${departures.length ? " has-departure" : ""}${dayIso < iso(today) ? " past" : ""}${dayIso === iso(today) ? " today" : ""}`} key={`agenda-${dayIso}`}><time>{weekday.format(day)} · {shortDate.format(day)}</time>{matches.map((stay) => <Link href={`/pobyty/${stay.id}`} key={stay.id}>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"} · {stay.guests} hosté</Link>)}{departures.map((stay) => <Link className="agenda-departure" href={`/pobyty/${stay.id}`} key={`${stay.id}-departure`}>Odjezd ráno · {stay.guests} hosté</Link>)}{!matches.length && !departures.length && <span>Volno</span>}</div>; })}</div>
      {!stays.length && <div className="calendar-empty"><strong>Žádné pobyty v kalendáři</strong><span>Přidej pobyt ručně nebo synchronizuj Airbnb v detailu pobytů.</span></div>}
    </section>
    <section className="dashboard-checkin"><div><span className="eyebrow">Cizinecká policie</span><h2>Check-in formuláře</h2><p>{readyToReport ? `${readyToReport} ${readyToReport === 1 ? "hlášení je" : "hlášení jsou"} připravená k odeslání.` : waitingForGuest ? `${waitingForGuest} ${waitingForGuest === 1 ? "host ještě nevyplnil formulář." : "hosté ještě nevyplnili formulář."}` : "Zatím není nic k odeslání."}</p></div><div className="checkin-stat"><strong>{readyToReport}</strong><span>k odeslání</span></div><Link className="button" href="/cizinecka-policie">Otevřít check-iny <ArrowIcon/></Link></section>
    {openTasks.length > 0 && <section className="dashboard-tasks"><div className="section-heading"><div><span className="eyebrow">Připravit nebo dokoupit</span><h2>{openTasks.length} {openTasks.length === 1 ? "otevřená položka" : "otevřené položky"}</h2></div><Link className="text-link" href="/inventar">Otevřít zásoby <ArrowIcon/></Link></div><div className="task-preview">{openTasks.slice(0, 3).map((task) => <span key={task.id}>{task.name} · {task.quantity} ks{task.stayId ? " · přiřazeno k pobytu" : ""}</span>)}</div></section>}
  </>;
}
