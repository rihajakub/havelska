import { CheckInForm } from "@/components/check-in-form";
import { getCheckInRegistrationByToken, getCheckInTemplate } from "@/data/repository";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Havelská Apartment" },
  description: "Online check-in",
  openGraph: {
    title: "Havelská Apartment",
    description: "Online check-in",
    images: [{ url: "/images/quiet-2br-old-town-apartment.jpg", width: 1600, height: 1068, alt: "Quiet 2BR Old Town Apartment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Havelská Apartment",
    description: "Online check-in",
    images: ["/images/quiet-2br-old-town-apartment.jpg"],
  },
};

export default async function PublicCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getCheckInRegistrationByToken(token);
  const template = await getCheckInTemplate();
  if (!result || new Date(result.registration.expiresAt) < new Date()) return <section className="empty" lang="en"><h1>This link is no longer valid</h1><p>Please ask your host for a new check-in link.</p></section>;
  if (result.registration.submittedAt) return <section className="empty" lang="en"><h1>Your details have been submitted successfully</h1><p>Thank you. Your host will review the details and report them as required.</p></section>;
  return <main className="public-checkin-shell" lang="en"><section className="page-heading public-checkin"><header className="property-header"><Image className="property-image" src="/images/quiet-2br-old-town-apartment.jpg" width={1600} height={1068} priority alt="Kitchen and living area of Quiet 2BR Old Town Apartment"/><div className="property-title"><span className="eyebrow">Havelská · Prague Old Town</span><strong>Quiet 2BR Old Town Apartment</strong><span className="property-subtitle">Guest registration · secure check-in</span></div></header><div className="checkin-intro"><span className="eyebrow">Before you arrive</span><h1>{template.title}</h1><p>{template.introduction}</p></div><CheckInForm token={token} checkIn={result.stay.checkIn} checkOut={result.stay.checkOut} template={template}/></section></main>;
}
