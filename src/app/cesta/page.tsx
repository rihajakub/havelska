import Link from "next/link";
import { getAppData } from "@/data/repository";
import { deliveryForTurns } from "@/domain/inventory";

export const dynamic = "force-dynamic";

export default async function TripPage({ searchParams }: { searchParams: Promise<{ turns?: string }> }) {
  const query = await searchParams;
  const target = query.turns === "3" ? 3 : 2;
  const data = await getAppData();
  const list = deliveryForTurns(data.inventory, target);
  const incomplete = data.inventory.some((item) => item.critical && item.stock.unassigned > 0);
  return <>
    <section className="page-heading"><span className="eyebrow">Příští návštěva</span><h1>Co vzít do bytu</h1><p>Výpočet pokrývá čistou rezervu pro zvolený počet dalších příprav.</p></section>
    <div className="segmented"><Link className={target === 2 ? "active" : ""} href="/cesta?turns=2">2 přípravy</Link><Link className={target === 3 ? "active" : ""} href="/cesta?turns=3">3 přípravy</Link></div>
    {incomplete && <div className="notice warn"><strong>Výsledek je orientační</strong><span>Nejdřív dokonči inventuru. Nezařazené kusy mohou být doma, v bytě nebo používané.</span></div>}
    {list.length === 0 ? <section className="empty compact"><h2>Nic nechybí</h2><p>Podle potvrzených stavů je čistá rezerva v bytě dostatečná.</p></section> : <div className="trip-list">{list.map(({ item, bring, buy }) => <article key={item.id} className="trip-item"><div><strong>{item.name}</strong><small>Cíl: {(item.perTurn ?? 0) * target} {item.unit} v čisté rezervě</small></div><div className="trip-counts">{bring > 0 && <span className="bring">Přivézt {bring}</span>}{buy > 0 && <span className="buy">Dokoupit {buy}</span>}</div></article>)}</div>}
  </>;
}
