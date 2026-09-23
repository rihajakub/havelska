import Link from "next/link";
import { getAppData } from "@/data/repository";
import { PlusIcon } from "@/components/icons";
import { syncAirbnbCalendar, updateGuests } from "@/app/actions";
import type { Stay } from "@/domain/types";

export const dynamic = "force-dynamic";
const DAY = 86_400_000;
const detail = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
const short = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric" });
const weekday = new Intl.DateTimeFormat("cs-CZ", { weekday: "short" });
const monthLabel = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" });
const fromIso = (value: string) => new Date(`${value}T12:00:00`);
const iso = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const plus = (value: Date, days: number) => new Date(value.getTime() + days * DAY);
const monday = (value: Date) => plus(value, 1 - (value.getDay() || 7));
const onDay = (stays: Stay[], value: Date) => stays.filter((stay) => stay.checkIn <= iso(value) && stay.checkOut > iso(value));
const departuresOn = (stays: Stay[], value: Date) => stays.filter((stay) => stay.checkOut === iso(value));
const monthKey = (value: Date) => iso(value).slice(0, 7);
const parseMonth = (value: string | undefined, fallback: Date) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "") ? fromIso(`${value}-01`) : new Date(fallback.getFullYear(), fallback.getMonth(), 1, 12);

type StaysPageProps = { searchParams: Promise<{ month?: string; history?: string; synced?: string; ignored?: string; syncedAt?: string }> };
const positiveInteger = (value: string | undefined) => /^\d+$/.test(value ?? "") ? Number(value) : undefined;

export default async function StaysPage({ searchParams }: StaysPageProps) {
  const params = await searchParams;
  const data = await getAppData();
  const today = fromIso(iso(new Date()));
  const todayIso = iso(today);
  const stays = [...data.stays].filter((stay) => stay.status !== "cancelled").sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const currentStays = stays.filter((stay) => stay.checkOut >= todayIso);
  const archivedStays = stays.filter((stay) => stay.checkOut < todayIso).sort((a, b) => b.checkOut.localeCompare(a.checkOut));
  const displayMonth = parseMonth(params.month, today);
  const calendarStart = monday(displayMonth);
  const lastDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0, 12);
  const calendarEnd = plus(monday(lastDay), 6);
  const weeks = Array.from({ length: Math.round((calendarEnd.getTime() - calendarStart.getTime()) / (7 * DAY)) + 1 }, (_, index) => plus(calendarStart, index * 7));
  const isCurrentMonth = monthKey(displayMonth) === monthKey(today);
  const previousWeeks = isCurrentMonth ? weeks.filter((weekStart) => weekStart < monday(today)) : [];
  const visibleWeeks = isCurrentMonth && params.history !== "1" ? weeks.filter((weekStart) => weekStart >= monday(today)) : weeks;
  const previousMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1, 12);
  const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1, 12);

  const synced = positiveInteger(params.synced);
  const ignored = positiveInteger(params.ignored) ?? 0;
  const syncedAt = positiveInteger(params.syncedAt);
  const syncTime = syncedAt ? new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(syncedAt)) : undefined;

  return <>
    <section className="page-heading split"><div><span className="eyebrow">Plán provozu</span><h1>Pobyty</h1><p>Každý pobyt má vlastní detail s úkoly, klíči, zprávami a hlášením hostů.</p></div><div className="header-actions"><form action={syncAirbnbCalendar}><button className="button secondary" type="submit">Synchronizovat Airbnb</button></form><Link className="button secondary" href="/export">Export CSV</Link><Link className="button" href="/pobyty/novy"><PlusIcon/>Přidat</Link></div></section>
    {synced !== undefined && <section className="notice success sync-notice" role="status"><strong>Airbnb je synchronizované.</strong><span>Načteno {synced} {synced === 1 ? "potvrzená rezervace" : synced < 5 ? "potvrzené rezervace" : "potvrzených rezervací"}; {ignored} {ignored === 1 ? "blokace nebo nejasná událost byla vynechána" : ignored < 5 ? "blokace nebo nejasné události byly vynechány" : "blokací nebo nejasných událostí bylo vynecháno"}.{syncTime ? ` Aktualizováno ${syncTime}.` : ""}</span></section>}
    <section className="calendar-section month-calendar-section"><div className="month-calendar-title"><div><span className="eyebrow">Přehled rezervací</span><h2>{monthLabel.format(displayMonth)}</h2></div><div className="month-navigation"><Link href={`/pobyty?month=${monthKey(previousMonth)}`}>← Předchozí</Link><Link href={`/pobyty?month=${monthKey(today)}`}>Dnes</Link><Link href={`/pobyty?month=${monthKey(nextMonth)}`}>Další →</Link></div></div><p className="calendar-explainer">Pruh označuje noclehy. Den odjezdu je vždy samostatně jako „odjezd ráno“. Uplynulé dny jsou šedé, dnešek je orámovaný.</p>
      {previousWeeks.length > 0 && <div className="calendar-history-toggle">{params.history === "1" ? <Link href={`/pobyty?month=${monthKey(displayMonth)}`}>↑ Skrýt předchozí týdny</Link> : <Link href={`/pobyty?month=${monthKey(displayMonth)}&history=1`}>↑ Zobrazit předchozí týdny ({previousWeeks.length})</Link>}</div>}
      <div className="month-calendar" role="grid" aria-label={`Kalendář pobytů pro ${monthLabel.format(displayMonth)}`}><div className="month-weekdays">{Array.from({ length: 7 }, (_, index) => <span key={index}>{weekday.format(plus(calendarStart, index))}</span>)}</div>{visibleWeeks.map((weekStart) => <MonthWeek key={iso(weekStart)} weekStart={weekStart} displayMonth={displayMonth} stays={stays} today={today} />)}</div>
      <div className="mobile-calendar-agenda">{Array.from({ length: 56 }, (_, index) => { const day = plus(calendarStart, index); const matches = onDay(stays, day); const departures = departuresOn(stays, day); const past = iso(day) < todayIso; return <div className={`agenda-day${matches.length ? " has-stay" : ""}${departures.length ? " has-departure" : ""}${past ? " past" : ""}${iso(day) === todayIso ? " today" : ""}`} key={`agenda-${iso(day)}`}><time>{weekday.format(day)} · {short.format(day)}</time>{matches.map((stay) => <Link href={`/pobyty/${stay.id}`} key={stay.id}>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"} · {stay.guests} hosté</Link>)}{departures.map((stay) => <Link className="agenda-departure" href={`/pobyty/${stay.id}`} key={`${stay.id}-departure`}>Odjezd ráno · {stay.guests} hosté</Link>)}{!matches.length && !departures.length && <span>Volno</span>}</div>; })}</div>
    </section>
    <section className="section-heading stays-title"><div><span className="eyebrow">Detailní přehled</span><h2>Aktuální a budoucí pobyty</h2></div></section>
    {currentStays.length === 0 ? <section className="empty"><h2>Žádný aktuální ani budoucí pobyt</h2><p>Přidej první rezervaci nebo synchronizuj Airbnb.</p><Link className="button" href="/pobyty/novy">Přidat pobyt</Link></section> : <StayList stays={currentStays} editable />}
    {archivedStays.length > 0 && <details className="stay-archive"><summary><span><strong>Archiv realizovaných pobytů</strong><small>{archivedStays.length} {archivedStays.length === 1 ? "pobyt" : archivedStays.length < 5 ? "pobyty" : "pobytů"}</small></span><span aria-hidden="true">⌄</span></summary><p>Dokončené pobyty zůstávají dostupné včetně jejich detailu, ale nepřekážejí v běžném přehledu.</p><StayList stays={archivedStays} /></details>}
  </>;
}

function StayList({ stays, editable = false }: { stays: Stay[]; editable?: boolean }) {
  return <div className={`stay-list${editable ? "" : " archived-stay-list"}`}>{stays.map((stay) => <article className="stay-card" key={stay.id}><div className="date-tile"><strong>{fromIso(stay.checkIn).getDate()}</strong><span>{new Intl.DateTimeFormat("cs-CZ", { month: "short" }).format(fromIso(stay.checkIn))}</span></div><div><span className="eyebrow">{stay.source === "manual" ? "Ručně" : "Airbnb"}</span><h2><Link href={`/pobyty/${stay.id}`}>{detail.format(fromIso(stay.checkIn))} – {detail.format(fromIso(stay.checkOut))}</Link></h2><p>{stay.guests} hosté · připravit pro {stay.preparationGuests}{stay.note ? ` · ${stay.note}` : ""}</p><div className="stay-card-actions"><Link className="text-link" href={`/pobyty/${stay.id}`}>{editable ? "Otevřít provoz pobytu →" : "Otevřít detail pobytu →"}</Link>{editable && <form action={updateGuests} className="guest-count-form" key={`${stay.id}-${stay.guests}`}><input type="hidden" name="stayId" value={stay.id}/><label><span>Hosté</span><select name="guests" defaultValue={stay.guests}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}</select></label><button className="button secondary" type="submit">Uložit</button></form>}</div></div></article>)}</div>;
}

function MonthWeek({ weekStart, displayMonth, stays, today }: { weekStart: Date; displayMonth: Date; stays: Stay[]; today: Date }) {
  const days = Array.from({ length: 7 }, (_, index) => plus(weekStart, index));
  const todayIso = iso(today);
  const weekEndExclusive = plus(weekStart, 7);
  const bars = stays.filter((stay) => stay.checkIn < iso(weekEndExclusive) && stay.checkOut > iso(weekStart)).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const laneEnds: string[] = [];
  const laidOut = bars.map((stay) => { const start = stay.checkIn > iso(weekStart) ? stay.checkIn : iso(weekStart); const end = stay.checkOut < iso(weekEndExclusive) ? stay.checkOut : iso(weekEndExclusive); let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start); if (lane === -1) lane = laneEnds.length; laneEnds[lane] = end; const startColumn = Math.round((fromIso(start).getTime() - weekStart.getTime()) / DAY) + 1; const endColumn = Math.round((fromIso(end).getTime() - weekStart.getTime()) / DAY) + 1; return { stay, lane, startColumn, endColumn }; });
  const lanes = Math.max(1, laneEnds.length);
  return <div className="month-week" style={{ gridTemplateRows: `108px repeat(${lanes}, 32px)` }}>{days.map((day) => { const departures = departuresOn(stays, day); const outside = day.getMonth() !== displayMonth.getMonth(); const dayIso = iso(day); return <div className={`month-day${outside ? " outside" : ""}${dayIso < todayIso ? " past" : ""}${dayIso === todayIso ? " today" : ""}`} key={dayIso}><time>{day.getDate()}</time>{departures.map((stay) => <Link className="month-departure" href={`/pobyty/${stay.id}`} key={stay.id}>Odjezd ráno</Link>)}</div>; })}{laidOut.map(({ stay, lane, startColumn, endColumn }) => <Link className={`month-stay-bar ${stay.source}${stay.checkOut < todayIso ? " completed" : ""}`} style={{ gridColumn: `${startColumn} / ${endColumn}`, gridRow: lane + 2 }} href={`/pobyty/${stay.id}`} key={`${stay.id}-${weekStart}`}><strong>{stay.source === "airbnb" ? "Airbnb" : "Pobyt"}</strong><span>{stay.guests} hosté</span></Link>)}</div>;
}
