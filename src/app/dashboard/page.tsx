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
      <div className="calendar-scroll"><div className="dashboard-bubble-calendar"><div className="bubble-weekdays">{Array.from({ length: 7 }, (_, index) => <span key={index}>{weekday.format(addDays(start, index))}</span>)}</div>{weeks.map((weekStart) => <DashboardWeek key={iso(weekStart)} weekStart={weekStart} stays={stays} today={today}/>)}</div></div>
      <div className="mobile-calendar-agenda">{Array.from({ length: 28 }, (_, index) => { const day = addDays(start, index); const matches = staysOn(stays, day); const departures = departuresOn(stays, day); const dayIso = iso(day); return <div className={`agenda-day${matches.length ? " has-stay" : ""}${departures.length ? " has-departure" : ""}${dayIso < iso(today) ? " past" : ""}${dayIso === iso(today) ? " today" : ""}`} key={`agenda-${dayIso}`}><time>{weekday.format(day)} · {shortDate.format(day)}</time>{matches.map((stay) => <Link href={`/pobyty/${stay.id}`} key={stay.id}>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"} · {stay.guests} hosté</Link>)}{departures.map((stay) => <Link className="agenda-departure" href={`/pobyty/${stay.id}`} key={`${stay.id}-departure`}>Odjezd ráno · {stay.guests} hosté</Link>)}{!matches.length && !departures.length && <span>Volno</span>}</div>; })}</div>
      {!stays.length && <div className="calendar-empty"><strong>Žádné pobyty v kalendáři</strong><span>Přidej pobyt ručně nebo synchronizuj Airbnb v detailu pobytů.</span></div>}
    </section>
    <section className="dashboard-checkin"><div><span className="eyebrow">Cizinecká policie</span><h2>Check-in formuláře</h2><p>{readyToReport ? `${readyToReport} ${readyToReport === 1 ? "hlášení je" : "hlášení jsou"} připravená k odeslání.` : waitingForGuest ? `${waitingForGuest} ${waitingForGuest === 1 ? "host ještě nevyplnil formulář." : "hosté ještě nevyplnili formulář."}` : "Zatím není nic k odeslání."}</p></div><div className="checkin-stat"><strong>{readyToReport}</strong><span>k odeslání</span></div><Link className="button" href="/cizinecka-policie">Otevřít check-iny <ArrowIcon/></Link></section>
    {openTasks.length > 0 && <section className="dashboard-tasks"><div className="section-heading"><div><span className="eyebrow">Připravit nebo dokoupit</span><h2>{openTasks.length} {openTasks.length === 1 ? "otevřená položka" : "otevřené položky"}</h2></div><Link className="text-link" href="/inventar">Otevřít zásoby <ArrowIcon/></Link></div><div className="task-preview">{openTasks.slice(0, 3).map((task) => <span key={task.id}>{task.name} · {task.quantity} ks{task.stayId ? " · přiřazeno k pobytu" : ""}</span>)}</div></section>}
  </>;
}

function DashboardWeek({ weekStart, stays, today }: { weekStart: Date; stays: Stay[]; today: Date }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekEndExclusive = addDays(weekStart, 7);
  const todayIso = iso(today);
  const bars = stays.filter((stay) => stay.checkIn < iso(weekEndExclusive) && stay.checkOut > iso(weekStart)).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const laneEnds: string[] = [];
  const laidOut = bars.map((stay) => {
    const start = stay.checkIn > iso(weekStart) ? stay.checkIn : iso(weekStart);
    const end = stay.checkOut < iso(weekEndExclusive) ? stay.checkOut : iso(weekEndExclusive);
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = end;
    return { stay, lane, startColumn: Math.round((fromIso(start).getTime() - weekStart.getTime()) / DAY_MS) + 1, endColumn: Math.round((fromIso(end).getTime() - weekStart.getTime()) / DAY_MS) + 1, startsHere: start === stay.checkIn, endsHere: end === stay.checkOut };
  });
  const lanes = Math.max(1, laneEnds.length);
  return <div className="dashboard-bubble-week" style={{ gridTemplateRows: `94px repeat(${lanes}, 34px)` }}>
    {days.map((day) => { const dayIso = iso(day); const departures = departuresOn(stays, day); return <div className={`dashboard-bubble-day${dayIso < todayIso ? " past" : ""}${dayIso === todayIso ? " today" : ""}`} key={dayIso}><time dateTime={dayIso}>{shortDate.format(day)}</time>{departures.map((stay) => <Link className="dashboard-departure" href={`/pobyty/${stay.id}`} key={stay.id}>Odjezd ráno</Link>)}</div>; })}
    {laidOut.map(({ stay, lane, startColumn, endColumn, startsHere, endsHere }) => <Link className={`dashboard-stay-bubble ${stay.source}${stay.checkOut < todayIso ? " completed" : ""}${startsHere ? " starts-here" : " continues-before"}${endsHere ? " ends-here" : " continues-after"}`} style={{ gridColumn: `${startColumn} / ${endColumn}`, gridRow: lane + 2 }} href={`/pobyty/${stay.id}`} key={`${stay.id}-${iso(weekStart)}`}><strong>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"}</strong><span>{stay.guests} {stay.guests === 1 ? "host" : "hosté"}</span></Link>)}
  </div>;
}
