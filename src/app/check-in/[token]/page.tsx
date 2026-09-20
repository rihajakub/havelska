import { CheckInForm } from "@/components/check-in-form";
import { getCheckInRegistrationByToken, getCheckInTemplate } from "@/data/repository";

export const dynamic = "force-dynamic";

export default async function PublicCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getCheckInRegistrationByToken(token);
  const template = await getCheckInTemplate();
  if (!result || new Date(result.registration.expiresAt) < new Date()) return <section className="empty" lang="en"><h1>This link is no longer valid</h1><p>Please ask your host for a new check-in link.</p></section>;
  if (result.registration.submittedAt) return <section className="empty" lang="en"><h1>Your details have been submitted successfully</h1><p>Thank you. Your host will review the details and report them as required.</p></section>;
  return <main className="public-checkin-shell" lang="en"><section className="page-heading public-checkin"><span className="eyebrow">Havelská · check-in</span><h1>{template.title}</h1><p>{template.introduction}</p><CheckInForm token={token} checkIn={result.stay.checkIn} checkOut={result.stay.checkOut} template={template}/></section></main>;
}
