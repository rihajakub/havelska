import Link from "next/link";
import { saveMessageTemplates } from "@/app/actions";
import { getCommunicationTemplates } from "@/data/repository";

export default async function CommunicationPage() {
  const templates = await getCommunicationTemplates();
  return <><section className="page-heading split"><div><span className="eyebrow">Airbnb komunikace</span><h1>Šablony zpráv</h1><p>Text se při otevření pobytu doplní o termín, čas příjezdu a check-in odkaz. Do Airbnb jej zatím vkládáš ručně.</p></div><Link className="button secondary" href="/pobyty">Přejít na pobyty</Link></section><form action={saveMessageTemplates} className="template-message-list">{templates.map((template) => <section className="message-template-editor" key={template.id}><label><span>Název</span><input name={`${template.id}-name`} defaultValue={template.name}/></label><label><span>Text zprávy</span><textarea name={`${template.id}-body`} rows={4} defaultValue={template.body}/></label><small>Dostupné proměnné: <code>{"{guest}"}</code>, <code>{"{checkIn}"}</code>, <code>{"{checkOut}"}</code>, <code>{"{arrivalTime}"}</code>, <code>{"{checkInLink}"}</code></small></section>)}<div className="form-actions"><button className="button" type="submit">Uložit šablony</button></div></form></>;
}
