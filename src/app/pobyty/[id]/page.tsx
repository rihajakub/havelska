import Link from "next/link";
import { headers } from "next/headers";
import { logMessageSent, saveStayOperation, setChecklistItem } from "@/app/actions";
import { CopyTextButton } from "@/components/copy-text-button";
import { getAppData, getCheckInRegistrations, getCommunicationTemplates } from "@/data/repository";
import type { MessageTemplateId, StayChecklistItem } from "@/domain/types";

export const dynamic = "force-dynamic";

const longDate = new Intl.DateTimeFormat("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
const checklist: Array<{ id: StayChecklistItem; label: string; group: string }> = [
  { id: "cleaned", label: "Uklizeno", group: "Před příjezdem" }, { id: "linen", label: "Převlečeno prádlo", group: "Před příjezdem" }, { id: "supplies", label: "Doplněny zásoby", group: "Před příjezdem" }, { id: "arrival-confirmed", label: "Potvrzen čas příjezdu", group: "Příjezd" }, { id: "keys-ready", label: "Klíče připravené", group: "Příjezd" }, { id: "departure-check", label: "Zkontrolován byt po odjezdu", group: "Po odjezdu" }, { id: "laundry-started", label: "Zahájeno praní", group: "Po odjezdu" },
];

export default async function StayDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const data = await getAppData(); const stay = data.stays.find((item) => item.id === id);
  if (!stay) return <section className="empty"><h1>Pobyt nebyl nalezen</h1><Link className="button" href="/pobyty">Zpět na pobyty</Link></section>;
  let registration: Awaited<ReturnType<typeof getCheckInRegistrations>>[number] | undefined;
  let registrationError = "";
  try { registration = (await getCheckInRegistrations()).find((item) => item.stay.id === stay.id); } catch (error) { registrationError = error instanceof Error ? error.message : "Check-in údaje se nepodařilo načíst."; }
  const templates = await getCommunicationTemplates(); const requestHeaders = await headers(); const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"); const origin = host ? `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${host}` : "";
  const checkInLink = registration && origin ? `${origin}/check-in/${registration.token}` : "";
  const replacements: Record<string, string> = { "{guest}": "there", "{checkIn}": longDate.format(new Date(`${stay.checkIn}T12:00:00`)), "{checkOut}": longDate.format(new Date(`${stay.checkOut}T12:00:00`)), "{arrivalTime}": stay.arrivalTime || "to be confirmed", "{checkInLink}": checkInLink || "[create the check-in link first]" };
  const render = (body: string) => Object.entries(replacements).reduce((value, [key, replacement]) => value.replaceAll(key, replacement), body);
  return <>
    <section className="stay-detail-heading"><div><Link className="back-link" href="/pobyty">← Pobyty</Link><span className="eyebrow">{stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt"}</span><h1>{longDate.format(new Date(`${stay.checkIn}T12:00:00`))} – {longDate.format(new Date(`${stay.checkOut}T12:00:00`))}</h1><p>{stay.guests} hosté · odjezd je {longDate.format(new Date(`${stay.checkOut}T12:00:00`))}</p></div><a className="button secondary" href="https://www.airbnb.com/hosting/reservations" target="_blank" rel="noreferrer">Otevřít Airbnb</a></section>
    <div className="stay-detail-grid">
      <section className="detail-card checklist-card"><span className="eyebrow">Provoz pobytu</span><h2>Checklist</h2>{["Před příjezdem", "Příjezd", "Po odjezdu"].map((group) => <div className="checklist-group" key={group}><strong>{group}</strong>{checklist.filter((item) => item.group === group).map((item) => <form action={setChecklistItem} key={item.id}><input type="hidden" name="stayId" value={stay.id}/><input type="hidden" name="item" value={item.id}/><input type="hidden" name="completed" value={String(!stay.checklist?.[item.id])}/><button className={stay.checklist?.[item.id] ? "check-item done" : "check-item"} type="submit"><span>{stay.checklist?.[item.id] ? "✓" : "○"}</span>{item.label}</button></form>)}</div>)}</section>
      <section className="detail-card"><span className="eyebrow">Příjezd a klíče</span><h2>Předání hostům</h2><form action={saveStayOperation} className="detail-form"><input type="hidden" name="stayId" value={stay.id}/><label><span>Čas příjezdu</span><input name="arrivalTime" type="time" defaultValue={stay.arrivalTime}/></label><label><span>Způsob předání</span><select name="keyMethod" defaultValue={stay.keyMethod ?? "personal"}><option value="personal">Osobně</option><option value="lockbox">Schránka na klíče</option><option value="smart-lock">Smart lock</option></select></label><label><span>Stav klíčů</span><select name="keyStatus" defaultValue={stay.keyStatus ?? "not-arranged"}><option value="not-arranged">Ještě nedomluveno</option><option value="instructions-sent">Instrukce odeslány</option><option value="handed-over">Klíče předány</option></select></label><button className="button" type="submit">Uložit předání</button></form></section>
      <section className="detail-card detail-wide"><span className="eyebrow">Komunikace</span><h2>Šablony Airbnb zpráv</h2><div className="message-grid">{templates.map((template) => { const id = template.id as MessageTemplateId; const message = render(template.body); return <article className="message-card" key={template.id}><div><strong>{template.name}</strong>{stay.messageLog?.[id] && <small>Odesláno {new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(stay.messageLog[id]!))}</small>}</div><p>{message}</p><div><CopyTextButton value={message}/><form action={logMessageSent}><input type="hidden" name="stayId" value={stay.id}/><input type="hidden" name="templateId" value={id}/><button className="button secondary" type="submit">Označit odeslání</button></form></div></article>; })}</div><Link className="text-link" href="/komunikace">Upravit šablony →</Link></section>
      <section className="detail-card detail-wide"><span className="eyebrow">Cizinecká policie</span><h2>UbyPort a domovní kniha</h2><p>{registrationError || (registration?.registration.reportedAt ? "Hlášení bylo označeno jako odeslané do UbyPortu." : registration?.registration.submittedAt ? "Host údaje vyplnil — přepiš je do UbyPortu a potvrď odeslání." : registration ? "Čekáme na vyplnění formuláře hostem." : "Pro tento pobyt ještě nebyl vytvořen check-in odkaz.")}</p><Link className="button" href="/cizinecka-policie">Otevřít hlášení</Link></section>
    </div>
  </>;
}
