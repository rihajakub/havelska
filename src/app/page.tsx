import Link from "next/link";
import { getAppData } from "@/data/repository";
import { readiness } from "@/domain/inventory";
import { ArrowIcon, CalendarIcon, PlusIcon, VanIcon } from "@/components/icons";
import { StatusCard } from "@/components/status-card";

const date = new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "short" });

export default async function Dashboard() {
  const data = await getAppData();
  const stock = readiness(data.inventory);
  const nextStay = data.stays.find((stay) => stay.status === "planned" && stay.checkIn >= new Date().toISOString().slice(0, 10));
  return <>
    <section className="hero">
      <span className="eyebrow">Přehled apartmánu</span>
      <h1>Co je potřeba udělat?</h1>
      <p>Stav vychází jen z potvrzených údajů. Nezařazené kusy nikdy nevytvoří falešnou připravenost.</p>
    </section>

    <div className="status-grid">
      {stock.kind === "unknown" ? (
        <StatusCard tone="warn" eyebrow="Inventář" title="Nejdřív rozděl zásoby" text="Výchozí počty známe, ale nevíme, co je čisté v bytě, doma nebo právě používané." href="/inventar" action="Otevřít inventuru" />
      ) : (
        <StatusCard tone={stock.kind === "ready" ? "good" : "warn"} eyebrow="Čistá rezerva v bytě" title={`${stock.turns} ${stock.turns === 1 ? "příprava" : "přípravy"}`} text={stock.limiter ? `Omezuje: ${stock.limiter.name}` : "Chybí povinné položky."} href="/inventar" />
      )}
      <StatusCard tone={nextStay ? "neutral" : "good"} eyebrow="Nejbližší pobyt" title={nextStay ? date.format(new Date(`${nextStay.checkIn}T12:00:00`)) : "Žádný pobyt"} text={nextStay ? `${nextStay.guests} hosté · příprava pro ${nextStay.preparationGuests}` : "Přidej ručně první rezervaci. iCal přijde v další části."} href="/pobyty" />
    </div>

    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">Rychlé akce</span><h2>Začni tady</h2></div></div>
      <div className="quick-grid">
        <Link className="quick-action primary" href="/inventar"><PlusIcon/><span><strong>Provést inventuru</strong><small>Rozdělit skutečné kusy podle místa a stavu</small></span><ArrowIcon/></Link>
        <Link className="quick-action" href="/pobyty/novy"><CalendarIcon/><span><strong>Přidat pobyt</strong><small>Ručně zadat příjezd, odjezd a počet hostů</small></span><ArrowIcon/></Link>
        <Link className="quick-action" href="/cesta"><VanIcon/><span><strong>Připravit cestu</strong><small>Co přivézt z domova a co dokoupit</small></span><ArrowIcon/></Link>
      </div>
    </section>

    <section className="info-strip"><strong>Bezpečné lokální spuštění</strong><span>Produkční Vercel je v kódu uzamčený, dokud nepřidáme Google přihlášení a trvalou databázi.</span></section>
  </>;
}

