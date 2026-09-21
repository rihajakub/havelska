import Link from "next/link";
import { saveGuestGuide } from "@/app/actions";
import { getGuestGuideContent } from "@/data/repository";

export const dynamic = "force-dynamic";

const fields = [
  ["title", "Název"], ["subtitle", "Podtitulek"], ["welcome", "Uvítání"], ["arrival", "Cesta do apartmánu"], ["keys", "Předání klíčů"], ["wifiName", "Název Wi-Fi"], ["wifiPassword", "Heslo k Wi-Fi"], ["apartmentCare", "Pravidla a péče o byt"], ["utilities", "Topení, voda a elektřina"], ["recycling", "Odpad a třídění"], ["appliances", "Spotřebiče, káva a prádlo"], ["pragueTips", "Tipy po Praze"], ["checkout", "Odjezdový checklist"], ["help", "Pomoc a nouzová čísla"],
] as const;

export default async function GuideEditorPage() {
  const guide = await getGuestGuideContent();
  return <><section className="page-heading split"><div><span className="eyebrow">Veřejný obsah</span><h1>Průvodce pro hosty</h1><p>Uprav zde texty veřejné stránky. Dvojitým Enterem oddělíš odstavce.</p></div><Link className="button secondary" href="/guest-info" target="_blank">Otevřít veřejný průvodce ↗</Link></section><form action={saveGuestGuide} className="guide-editor">{fields.map(([name, label]) => <label key={name}><span>{label}</span>{name === "title" || name === "subtitle" || name === "wifiName" || name === "wifiPassword" ? <input name={name} defaultValue={guide[name]} required /> : <textarea name={name} defaultValue={guide[name]} required rows={name === "welcome" || name === "arrival" || name === "utilities" || name === "checkout" ? 5 : 3} />}</label>)}<div className="guide-editor-footer"><p>Veřejný odkaz není zabezpečený — nevkládej sem kódy ke klíčům ani jiné citlivé údaje.</p><button className="button" type="submit">Uložit průvodce</button></div></form></>;
}
