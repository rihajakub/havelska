import { CheckInForm } from "@/components/check-in-form";
import { getCheckInRegistrationByToken } from "@/data/repository";

export const dynamic = "force-dynamic";

export default async function PublicCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getCheckInRegistrationByToken(token);
  if (!result || new Date(result.registration.expiresAt) < new Date()) return <section className="empty"><h1>Odkaz není platný</h1><p>Požádejte hostitele o nový check-in odkaz.</p></section>;
  if (result.registration.submittedAt) return <section className="empty"><h1>Údaje jsou vyplněné</h1><p>Děkujeme. Hostitel je zkontroluje a předá podle zákonných povinností.</p></section>;
  return <section className="page-heading"><span className="eyebrow">Havelská · check-in</span><h1>Údaje pro ubytování</h1><p>Formulář vyplní hlavní host za všechny zahraniční hosty v rezervaci, maximálně za čtyři osoby.</p><CheckInForm token={token} checkIn={result.stay.checkIn} checkOut={result.stay.checkOut}/></section>;
}
