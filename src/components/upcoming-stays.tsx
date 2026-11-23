import { headers } from "next/headers";
import Link from "next/link";
import { createCheckInLink, updateGuests } from "@/app/actions";
import { CopyCheckInLinkButton } from "./copy-checkin-link-button";
import { FormSubmitButton } from "./form-submit-button";
import type { getCheckInRegistrations } from "@/data/repository";
import type { Stay } from "@/domain/types";

export async function UpcomingStays({ stays, registrations, error }: { stays: Stay[]; registrations: Awaited<ReturnType<typeof getCheckInRegistrations>>; error: string }) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const origin = host ? `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${host}` : "";
  const date = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "short" });
  return <section className="dashboard-stays" id="upcoming-stays" aria-labelledby="upcoming-title">
    <div className="section-heading"><div><span className="eyebrow">Online check-in</span><h2 id="upcoming-title">Aktuální a budoucí pobyty</h2><p className="section-copy">Potvrď počet hostů a odkaz rovnou zkopíruj do Airbnb.</p></div></div>
    {error && <p role="alert" className="tax-warning">{error}</p>}
    <div className="dashboard-stay-list">{stays.map(stay => {
      const item = registrations.find(item => item.stay.id === stay.id);
      const confirmed = stay.source === "manual" || stay.guestCountManuallySet;
      const completed = item?.guests?.length ?? 0;
      const expected = item?.registration.expectedGuestCount ?? stay.guests;
      return <article className="dashboard-stay-card" id={`stay-${encodeURIComponent(stay.id)}`} key={stay.id}>
        <div className="dashboard-stay-date"><strong>{date.format(new Date(`${stay.checkIn}T12:00:00`))}</strong><span>→ {date.format(new Date(`${stay.checkOut}T12:00:00`))}</span></div>
        <div className="dashboard-stay-summary"><h3>{stay.guestName || (stay.source === "airbnb" ? "Airbnb rezervace" : "Ruční pobyt")}</h3><span className={`status-pill ${confirmed ? "success" : "waiting"}`}>{confirmed ? "✓ Počet hostů potvrzen" : "Ověřit počet hostů"}</span><p>{item ? `Check-in ${completed}/${expected}${item.registration.reportedAt ? " · Ohlášeno ✓" : ""}` : "Check-in odkaz zatím nevytvořen"}</p><Link className="text-link" href={`/pobyty/${encodeURIComponent(stay.id)}`}>Detail pobytu →</Link></div>
        <div className="dashboard-stay-actions"><form action={updateGuests} className="guest-count-form" key={`${stay.id}-${stay.guests}`}><input type="hidden" name="stayId" value={stay.id}/><label><span>Hosté</span><select name="guests" defaultValue={stay.guests}>{[1,2,3,4].map(count => <option key={count} value={count}>{count}</option>)}</select></label><FormSubmitButton className="button secondary" pendingText="Ukládám…">Potvrdit počet</FormSubmitButton></form>
          {item && origin ? <CopyCheckInLinkButton value={`${origin}/check-in/${item.token}`}/> : <form action={createCheckInLink}><input type="hidden" name="stayId" value={stay.id}/><FormSubmitButton disabled={Boolean(error)} pendingText="Vytvářím…">Vytvořit check-in</FormSubmitButton></form>}
        </div>
      </article>;
    })}</div>{!stays.length && <p>Žádný aktuální ani budoucí pobyt.</p>}
  </section>;
}
