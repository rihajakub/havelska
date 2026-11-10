import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { getAppData, getCheckInRegistrations } from "@/data/repository";
import { buildMonthlyTaxReports } from "@/domain/tax-report";
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
  let registrations: Awaited<ReturnType<typeof getCheckInRegistrations>> = [];
  try { registrations = await getCheckInRegistrations(); } catch { /* Dashboard remains usable if encrypted details cannot be read. */ }
  const waitingForGuest = registrations.filter((item) => !item.registration.submittedAt).length;
  const readyToReport = registrations.filter((item) => item.registration.submittedAt && !item.registration.reportedAt).length;
  const todayIso = iso(today);
  const nextStay = stays.find((stay) => stay.checkOut >= todayIso);
  const nextRegistration = nextStay ? registrations.find((item) => item.stay.id === nextStay.id) : undefined;
  const previous = new Date(today); previous.setMonth(previous.getMonth() - 1);
  const previousMonth = iso(previous).slice(0, 7);
  const previousTax = buildMonthlyTaxReports(stays, registrations.map((item) => ({ stayId: item.stay.id, guests: item.guests }))).get(previousMonth);
  const agendaDays = Array.from({ length: 28 }, (_, index) => addDays(start, index)).filter((day) => { const value = iso(day); return value >= todayIso && (value === todayIso || staysOn(stays, day).length > 0 || departuresOn(stays, day).length > 0); }).slice(0, 12);

  return <>
    <section className="dashboard-heading">
      <div><span className="eyebrow">Provoz apartmánu</span><h1>Co nás čeká</h1><p>Kalendář, údaje hostů a provozní úkoly na jednom místě.</p></div>
    </section>
    {nextStay && <section className="dashboard-focus"><div><span className="eyebrow">{nextStay.checkIn <= todayIso ? "Aktuální pobyt" : "Nejbližší pobyt"}</span><h2>{shortDate.format(fromIso(nextStay.checkIn))} – {shortDate.format(fromIso(nextStay.checkOut))}</h2><p>{nextStay.guestName ? `${nextStay.guestName} · ` : ""}{nextStay.guests} hosté · check-in {nextRegistration ? `${nextRegistration.guests?.length ?? 0}/${nextRegistration.registration.expectedGuestCount ?? nextStay.guests}` : "odkaz nevytvořen"}</p></div><div className="dashboard-focus-actions"><Link className="button" href={`/pobyty/${nextStay.id}#messages`}>Připravit zprávu</Link><Link className="button secondary" href={`/pobyty/${nextStay.id}#check-in`}>Online check-in</Link><Link className="text-link" href={`/pobyty/${nextStay.id}`}>Celý pobyt <ArrowIcon/></Link></div></section>}
    <section className="dashboard-work"><div className="section-heading"><div><span className="eyebrow">Dnešní přehled</span><h2>Co je potřeba vyřídit</h2></div></div><div className="dashboard-work-grid"><Link href="/cizinecka-policie"><strong>{readyToReport}</strong><span>hlášení připravených pro UbyPort</span></Link><Link href="/cizinecka-policie"><strong>{waitingForGuest}</strong><span>check-inů čeká na hosty</span></Link><Link href="/poplatky"><strong>{previousTax?.total.toLocaleString("cs-CZ") ?? 0} Kč</strong><span>poplatek za minulý měsíc{previousTax && !previousTax.complete ? " · odhad" : ""}</span></Link></div></section>
    <section className="dashboard-tools"><Link href="/komunikace"><strong>Šablony zpráv</strong><span>Upravit texty pro hosty</span></Link><Link href="/pruvodce"><strong>Guest info</strong><span>Upravit informace pro hosty</span></Link><Link href="/guest-info" target="_blank"><strong>Náhled pro hosta</strong><span>Otevřít veřejnou stránku</span></Link><Link href="/domovni-kniha"><strong>Domovní kniha</strong><span>Historie evidovaných hostů</span></Link></section>
    <section className="dashboard-calendar" aria-labelledby="dashboard-calendar-title">
      <div className="section-heading"><div><span className="eyebrow">Nejbližší 4 týdny</span><h2 id="dashboard-calendar-title">Kalendář pobytů</h2></div><Link className="text-link" href="/pobyty">Celý kalendář <ArrowIcon/></Link></div>
      <div className="calendar-scroll"><div className="dashboard-bubble-calendar"><div className="bubble-weekdays">{Array.from({ length: 7 }, (_, index) => <span key={index}>{weekday.format(addDays(start, index))}</span>)}</div>{weeks.map((weekStart) => <DashboardWeek key={iso(weekStart)} weekStart={weekStart} stays={stays} today={today}/>)}</div></div>
      <div className="mobile-calendar-agenda">{agendaDays.map((day) => { const matches = staysOn(stays, day); const departures = departuresOn(stays, day); const dayIso = iso(day); return <div className={`agenda-day${matches.length ? " has-stay" : ""}${departures.length ? " has-departure" : ""}${dayIso === todayIso ? " today" : ""}`} key={`agenda-${dayIso}`}><time>{weekday.format(day)} · {shortDate.format(day)}</time>{matches.map((stay) => <Link href={`/pobyty/${stay.id}`} key={stay.id}>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"} · {stay.guests} hosté</Link>)}{departures.map((stay) => <Link className="agenda-departure" href={`/pobyty/${stay.id}`} key={`${stay.id}-departure`}>Odjezd ráno · {stay.guests} hosté</Link>)}</div>; })}</div>
      {!stays.length && <div className="calendar-empty"><strong>Žádné pobyty v kalendáři</strong><span>Přidej pobyt ručně nebo synchronizuj Airbnb v detailu pobytů.</span></div>}
    </section>
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
