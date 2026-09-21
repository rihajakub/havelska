import { markTaxSettlement, saveTaxExemption } from "@/app/actions";
import { getAppData } from "@/data/repository";
import { groupTaxNightsByMonth } from "@/domain/tax";

export const dynamic = "force-dynamic";
const MONTHLY_RATE = 50;
const date = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric" });
const monthName = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" });
const fromIso = (value: string) => new Date(`${value}T12:00:00`);

export default async function LocalTaxPage() {
  const data = await getAppData();
  const settlements = new Map((data.taxSettlements ?? []).map((item) => [item.month, item]));
  const groups = groupTaxNightsByMonth(data.stays.filter((stay) => stay.status !== "cancelled"));
  const months = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  return <><section className="page-heading"><span className="eyebrow">Městská administrativa</span><h1>Poplatek z pobytu</h1><p>Praha 1: 50 Kč za osobu a noc, bez dne příjezdu. Noci dlouhého pobytu jsou rozdělené do správných kalendářních měsíců.</p></section><div className="tax-list">{months.map(([month, entries]) => {
    const settlement = settlements.get(month);
    const total = entries.reduce((sum, { stay, nights }) => sum + Math.max(0, stay.guests - (stay.taxExemptGuests ?? 0)) * nights * MONTHLY_RATE, 0);
    const due = new Date(`${month}-01T12:00:00`); due.setMonth(due.getMonth() + 1); due.setDate(15);
    return <section className="tax-card" key={month}><div className="tax-card-heading"><div><span className="eyebrow">{monthName.format(fromIso(`${month}-01`))}</span><h2>{total.toLocaleString("cs-CZ")} Kč</h2><p>{entries.length} {entries.length === 1 ? "pobyt" : "pobytů"} · splatnost {new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" }).format(due)}.</p></div><div className="tax-status"><span className={settlement?.reportedAt ? "done" : ""}>Hlášení {settlement?.reportedAt ? "✓" : "—"}</span><span className={settlement?.paidAt ? "done" : ""}>Platba {settlement?.paidAt ? "✓" : "—"}</span></div></div><div className="tax-stays">{entries.map(({ stay, nights }) => <form action={saveTaxExemption} key={`${stay.id}-${month}`}><input type="hidden" name="stayId" value={stay.id}/><span>{date.format(fromIso(stay.checkIn))} – {date.format(fromIso(stay.checkOut))} · {nights} {nights === 1 ? "noc" : nights < 5 ? "noci" : "nocí"} · {stay.guests} hosté</span><label>Osvobozeno<input name="exemptGuests" type="number" min="0" max={stay.guests} defaultValue={stay.taxExemptGuests ?? 0}/></label><button className="button secondary" type="submit">Uložit</button></form>)}</div><div className="inline-actions"><form action={markTaxSettlement}><input type="hidden" name="month" value={month}/><input type="hidden" name="action" value="reported"/><button className="button secondary" type="submit">Označit ohlášení</button></form><form action={markTaxSettlement}><input type="hidden" name="month" value={month}/><input type="hidden" name="action" value="paid"/><button className="button" type="submit">Označit platbu</button></form></div></section>;
  })}</div></>;
}
