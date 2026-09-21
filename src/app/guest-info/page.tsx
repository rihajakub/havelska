import Image from "next/image";
import Link from "next/link";
import { getGuestGuideContent } from "@/data/repository";

const toParagraphs = (text: string) => text.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>);

export const dynamic = "force-dynamic";

function PlaceCard({ href, name, detail, logo, logoAlt, mark }: { href: string; name: string; detail: string; logo?: string; logoAlt?: string; mark?: string }) {
  return <a href={href} target="_blank" rel="noreferrer">
    <span className="place-logo" aria-hidden={logo ? undefined : true}>
      {logo ? <Image src={logo} alt={logoAlt ?? `${name} logo`} width={112} height={72} /> : mark}
    </span>
    <span className="place-copy"><strong>{name}</strong><span>{detail} ↗</span></span>
  </a>;
}

export default async function GuestInfoPage() {
  const guide = await getGuestGuideContent();
  return <main className="guest-guide guest-guide-vivid">
    <header className="guest-guide-hero">
      <Image src="/images/quiet-2br-old-town-apartment.jpg" alt="The apartment kitchen and dining area" fill priority sizes="100vw" />
      <div><Link href="/" className="guest-guide-brand">HAVELSKÁ · PRAGUE OLD TOWN</Link><h1>{guide.title}</h1><p>{guide.subtitle}</p></div>
    </header>
    <div className="guest-guide-content">
      <section id="welcome" className="guide-intro guide-intro-vivid"><span className="landing-kicker">Your Prague base</span><h2>Make yourself at home</h2>{toParagraphs(guide.welcome)}</section>

      <section id="arrival" className="guide-feature guide-feature-arrival">
        <div className="guide-feature-icon">✦</div><div><span className="landing-kicker">01 · Arrival</span><h2>Getting to the apartment</h2>{toParagraphs(guide.arrival)}
          <div className="guide-links guide-links-transport">
            <a href="https://idos.cz/en/" target="_blank" rel="noreferrer">Plan a route with IDOS ↗</a>
            <a href="https://www.dpp.cz/en" target="_blank" rel="noreferrer">Prague public transport ↗</a>
            <a href="https://apps.apple.com/cz/app/pid-l%C3%ADta%C4%8Dka/id983071129" target="_blank" rel="noreferrer">PID Lítačka for iPhone ↗</a>
            <a href="https://play.google.com/store/apps/details?id=cz.dpp.praguepublictransport" target="_blank" rel="noreferrer">PID Lítačka for Android ↗</a>
            <a href="https://www.uber.com/" target="_blank" rel="noreferrer">Uber ↗</a><a href="https://bolt.eu/" target="_blank" rel="noreferrer">Bolt ↗</a>
          </div>
        </div>
      </section>

      <section className="guide-feature guide-feature-keys"><div className="guide-feature-icon">⌂</div><div><span className="landing-kicker">02 · Check-in</span><h2>Keys & arrival time</h2>{toParagraphs(guide.keys)}</div></section>

      <section id="home" className="guide-section guide-section-home"><span className="guide-number">03</span><div><h2>Useful things at home</h2>
        <div className="guide-grid guide-grid-vivid">
          <article className="guide-wifi"><span aria-hidden="true">📶</span><h3>Wi-Fi</h3><p><strong>{guide.wifiName}</strong><br />Password: <strong>{guide.wifiPassword}</strong></p></article>
          <article><span aria-hidden="true">👟</span><h3>Care for the flat</h3>{toParagraphs(guide.apartmentCare)}</article>
          <article><span aria-hidden="true">♨</span><h3>Heating, water & power</h3>{toParagraphs(guide.utilities)}</article>
          <article><span aria-hidden="true">♻</span><h3>Waste & recycling</h3>{toParagraphs(guide.recycling)}</article>
          <article className="guide-wide"><span aria-hidden="true">☕</span><h3>Coffee, laundry & appliances</h3>{toParagraphs(guide.appliances)}</article>
          <article className="guide-wide guide-oven"><span aria-hidden="true">🔥</span><h3>Oven · AquaClean in 4 steps</h3><ol><li>Let the oven cool down completely and remove larger food residues.</li><li>Pour <strong>0.6 L of water</strong> into the glass tray and place it on the lower guide.</li><li>Turn the cooking selector to <strong>AquaClean</strong>, set <strong>70 °C</strong> and let it run for <strong>30 minutes</strong>.</li><li>Carefully remove the tray with oven gloves, then wipe the softened residue with a damp cloth.</li></ol></article>
        </div>
        <section className="technical-gallery" aria-labelledby="technical-gallery-title"><div><span className="landing-kicker">Emergency reference</span><h3 id="technical-gallery-title">Water, gas & electricity</h3><p>Please contact us first whenever possible. These photos are here to identify the right place quickly in an emergency.</p></div><div className="technical-photo-grid"><figure className="technical-water-access"><Image src="/images/guide/water-access.jpg" alt="Access point to the water shut-off under the kitchen cabinet" width={3024} height={4032}/><figcaption><strong>Water shut-off</strong><span>Behind the framed access area under the kitchen cabinet.</span></figcaption></figure><figure><Image src="/images/guide/water-meter.jpg" alt="Water meter detail" width={4032} height={3024}/><figcaption><strong>Water meter</strong><span>The meter confirms you are at the water shut-off.</span></figcaption></figure><figure><Image src="/images/guide/gas-shutoff.jpg" alt="Yellow gas shut-off valve" width={3024} height={4032}/><figcaption><strong>Gas shut-off</strong><span>The yellow valve in the kitchen cabinet.</span></figcaption></figure><figure className="technical-electrical"><Image src="/images/guide/electrical-cabinets.jpg" alt="Electrical cabinets in the corridor" width={3024} height={4032}/><Image src="/images/guide/main-breaker.jpg" alt="Main electrical breaker inside the cabinet" width={3024} height={4032}/><figcaption><strong>Main breaker</strong><span>Open the middle electrical cabinet, then use the marked breaker inside.</span></figcaption></figure></div></section>
      </div></section>

      <section id="prague" className="guide-feature guide-feature-prague"><div className="guide-feature-icon">♥</div><div><span className="landing-kicker">04 · Out & about</span><h2>A few Prague favourites</h2>{toParagraphs(guide.pragueTips)}
        <div className="prague-photo-pair"><figure><Image src="/images/guide/prague-day.jpg" alt="View across Prague from a hilltop" width={1920} height={1440}/><figcaption>A bright Prague afternoon</figcaption></figure><figure><Image src="/images/guide/prague-sunset.jpg" alt="Sunset over Prague and Prague Castle" width={1920} height={1440}/><figcaption>Sunset near Prague Castle</figcaption></figure></div>
        <div className="place-group"><h3>Food, coffee & Czech classics</h3><div className="place-list">
          <PlaceCard href="https://maps.app.goo.gl/VFqsydwB8UWBYAjE6" name="Havelská Koruna" detail="Czech classics nearby" mark="HK" />
          <PlaceCard href="https://goo.gl/maps/hm2fr5MRwjGmrfj26" name="Café Louvre" detail="Breakfast & coffee" logo="/images/places/cafe-louvre.jpeg" />
          <PlaceCard href="https://goo.gl/maps/NYR3HbTxazzF22Xu5" name="Café Slavia" detail="Historic riverside café" mark="S" />
          <PlaceCard href="https://goo.gl/maps/LZeB18KphsvNaSKS9" name="Krusta" detail="Artisan bakery" mark="K" />
          <PlaceCard href="https://goo.gl/maps/LNshEWKgYsoY6Jcj9" name="Au Gourmand" detail="Bakery & pâtisserie" mark="AG" />
          <PlaceCard href="https://maps.app.goo.gl/3Puq6eo9sGxnXUjJ6" name="Pivovar Národní" detail="Czech beer & food" mark="P" />
          <PlaceCard href="https://maps.app.goo.gl/pvWZkhmHzmu3LNYR9" name="Pilsnerka Národní" detail="Czech pub" mark="PN" />
        </div></div>
        <div className="place-group"><h3>Groceries nearby</h3><div className="place-list">
          <PlaceCard href="https://goo.gl/maps/RwqKW5QApKjnHzbf8" name="Lidl" detail="Everyday groceries" logo="/images/places/lidl.webp" />
          <PlaceCard href="https://maps.app.goo.gl/1YAYpHqzaQFsdt358" name="Tesco" detail="Late grocery option" logo="/images/places/tesco.png" />
          <PlaceCard href="https://goo.gl/maps/xb7cZLZuZjEQr9oJ6" name="Albert" detail="Supermarket" logo="/images/places/albert.png" />
          <PlaceCard href="https://goo.gl/maps/ffV91LZz43ji1duh6" name="BILLA" detail="Supermarket" logo="/images/places/billa.webp" />
          <PlaceCard href="https://goo.gl/maps/YYG6b1mMbKYt5jrf8" name="Delmart" detail="Fine groceries" logo="/images/places/delmart.jpg" />
        </div></div>
        <div className="guide-links"><a href="https://www.youtube.com/@HONESTGUIDE/videos" target="_blank" rel="noreferrer">More local tips from Honest Guide ↗</a></div>
      </div></section>

      <section id="checkout" className="guide-feature guide-feature-checkout"><div className="guide-feature-icon">✓</div><div><span className="landing-kicker">05 · Departure</span><h2>Before you leave</h2>{toParagraphs(guide.checkout)}</div></section>
      <section id="help" className="guide-help"><span className="landing-kicker">Need assistance?</span><h2>We&apos;re here to help.</h2>{toParagraphs(guide.help.replace(/\s*In an emergency[\s\S]*$/i, ""))}<div className="emergency-list" aria-label="Emergency telephone numbers"><a href="tel:112"><span aria-hidden="true">🆘</span><strong>112</strong><small>European emergency number</small></a><a href="tel:158"><span aria-hidden="true">👮</span><strong>158</strong><small>Police</small></a><a href="tel:155"><span aria-hidden="true">🚑</span><strong>155</strong><small>Ambulance</small></a><a href="tel:150"><span aria-hidden="true">🚒</span><strong>150</strong><small>Fire brigade</small></a></div></section>
    </div>
  </main>;
}
