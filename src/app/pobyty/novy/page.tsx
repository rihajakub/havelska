import Link from "next/link";
import { createStay } from "@/app/actions";

export default function NewStayPage() {
  return <>
    <section className="page-heading"><span className="eyebrow">Nová rezervace</span><h1>Přidat pobyt</h1><p>Zadej jen údaje potřebné pro provoz. Údaje hostů a Ubyport do této etapy nepatří.</p></section>
    <form action={createStay} className="form-card">
      <div className="field-row"><label><span>Příjezd</span><input required type="date" name="checkIn"/></label><label><span>Odjezd</span><input required type="date" name="checkOut"/></label></div>
      <label><span>Počet hostů</span><select name="guests" defaultValue="4"><option value="1">1 host</option><option value="2">2 hosté</option><option value="3">3 hosté – připravit pro 4</option><option value="4">4 hosté</option></select></label>
      <label><span>Poznámka</span><textarea name="note" rows={3} placeholder="Např. pozdní příjezd, dětská postýlka…"/></label>
      <div className="form-actions"><Link className="button secondary" href="/pobyty">Zrušit</Link><button className="button" type="submit">Uložit pobyt</button></div>
    </form>
  </>;
}

