import { CheckInForm } from "@/components/check-in-form";
import { getCheckInRegistrationByToken } from "@/data/repository";

export const dynamic = "force-dynamic";

export default async function PublicCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getCheckInRegistrationByToken(token);
  if (!result || new Date(result.registration.expiresAt) < new Date()) return <section className="empty" lang="en"><h1>This link is no longer valid</h1><p>Please ask your host for a new check-in link.</p></section>;
  if (result.registration.submittedAt) return <section className="empty" lang="en"><h1>Your details have been submitted</h1><p>Thank you. Your host will review the details and report them as required.</p></section>;
  return <section className="page-heading public-checkin" lang="en"><span className="eyebrow">Havelská · check-in</span><h1>Accommodation details</h1><p>The main guest should complete this form for every foreign guest in the reservation, up to four people.</p><CheckInForm token={token} checkIn={result.stay.checkIn} checkOut={result.stay.checkOut}/></section>;
}
