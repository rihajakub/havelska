import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <div className="landing-image"><Image src="/images/quiet-2br-old-town-apartment.jpg" alt="Quiet 2BR Old Town Apartment" fill priority sizes="(max-width: 720px) 100vw, 900px" /></div>
        <div className="landing-content">
          <span className="landing-kicker">Prague Old Town</span>
          <h1>Quiet 2BR Old Town Apartment</h1>
          <p>A comfortable base in the centre of Prague, moments from the city&apos;s historic streets.</p>
          <div className="landing-actions">
            <a className="button" href="tel:+420737347810">Direct booking enquiry</a>
            <Link className="button secondary" href="/guest-info">Guest information</Link>
          </div>
          <Link className="landing-login" href="/login">Host login <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}
