import { getAppData } from "@/data/repository";
import { cleanTurns, readiness, STOCK_LABELS, STOCK_STATES, stockTotal } from "@/domain/inventory";
import { saveInventory } from "../actions";

export default async function InventoryPage() {
  const data = await getAppData();
  const state = readiness(data.inventory);
  return <>
    <section className="page-heading"><span className="eyebrow">Skutečný stav</span><h1>Inventář prádla</h1><p>U každé položky rozděl všechny vlastněné kusy. Součet musí odpovídat hodnotě „celkem“.</p></section>
    <section className={`summary ${state.kind}`}>
      <span>{state.kind === "unknown" ? "Nelze určit" : `${state.turns} kompletní přípravy`}</span>
      <small>{state.kind === "unknown" ? "Některé kusy jsou stále nezařazené." : `Omezující položka: ${state.limiter?.name ?? "—"}`}</small>
    </section>
    <div className="inventory-list">
      {data.inventory.map((item) => (
        <details className="inventory-card" key={item.id} open={item.stock.unassigned > 0 && item.critical}>
          <summary>
            <div><strong>{item.name}</strong><small>{item.owned} {item.unit} celkem{item.perTurn ? ` · ${item.perTurn} na přípravu` : ""}</small></div>
            <div className="stock-number"><strong>{item.stock.apartmentClean}</strong><small>čisté v bytě</small></div>
            <span className={item.stock.unassigned > 0 ? "dot warn" : "dot good"}/>
          </summary>
          <form action={saveInventory} className="inventory-form">
            <input type="hidden" name="id" value={item.id}/>
            <div className="count-grid">
              {STOCK_STATES.map((stockState) => (
                <label key={stockState} className={stockState === "unassigned" ? "unassigned" : ""}>
                  <span>{STOCK_LABELS[stockState]}</span>
                  <input name={stockState} type="number" min="0" step="1" defaultValue={item.stock[stockState]} inputMode="numeric"/>
                </label>
              ))}
            </div>
            <div className="form-footer"><span>Zařazeno: {stockTotal(item)} / {item.owned} {item.unit}{cleanTurns(item) !== null ? ` · rezerva ${cleanTurns(item)} příprav` : ""}</span><button type="submit">Uložit stav</button></div>
          </form>
        </details>
      ))}
    </div>
  </>;
}

