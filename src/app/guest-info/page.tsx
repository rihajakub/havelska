import Image from "next/image";
import Link from "next/link";
import { getGuestGuideContent } from "@/data/repository";
import { defaultGuestGuideContent } from "@/data/guest-guide-template";
import { buildVersion } from "@/lib/build-version";

const toParagraphs = (text: string) => text.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>);

export const dynamic = "force-dynamic";

function PlaceCard({ href, name, detail, logo, logoAlt, mark }: { href: string; name: string; detail: string; logo?: string; logoAlt?: string; mark?: string }) {
  return <a href={href} target="_blank" rel="noreferrer">
    <span className="place-logo" aria-hidden={logo ? undefined : true}>
      {logo ? <Image src={logo} alt={logoAlt ?? `${name} logo`} width={112} height={72} /> : mark}
    </span>
    <span className="place-copy"><strong>{name}</strong><span>{detail}</span><small className="place-map-link">Open in Google Maps ↗</small></span>
  </a>;
}

export default async function GuestInfoPage() {
  const guide = await getGuestGuideContent();
  return <main className="guest-guide guest-guide-vivid" lang="en">
    <header className="guest-guide-hero">
      <Image src="/images/quiet-2br-old-town-apartment.jpg" alt="The apartment kitchen and dining area" fill priority sizes="100vw" />
      <div><Link href="/" className="guest-guide-brand">HAVELSKÁ · PRAGUE OLD TOWN</Link><h1>{guide.title}</h1><p>{guide.subtitle}</p></div>
    </header>
    <div className="guest-guide-content">
      <section className="guide-at-a-glance" aria-label="Stay essentials">
        <a href="#keys"><span>Check-in &amp; keys</span><strong>From 16:00</strong></a>
        <a href="#checkout"><span>Check-out</span><strong>By 11:00</strong></a>
        <div id="wifi"><span>Wi-Fi network</span><strong>{guide.wifiName}</strong><small>Password: {guide.wifiPassword}</small></div>
        <a href="#help"><span>Need help?</span><strong>Contact us in Airbnb</strong></a>
      </section>
      <nav id="contents" className="guide-contents" aria-label="Guide contents">
        <strong>Quick links</strong>
        <div>
          <a href="#keys">Check-in &amp; keys</a>
          <a href="#arrival">Transport</a>
          <a href="#wifi">Wi-Fi</a>
          <a href="#equipment">Apartment essentials</a>
          <a href="#prague">Food &amp; coffee</a>
          <a href="#checkout">Check-out</a>
          <a href="#help">Need help?</a>
        </div>
      </nav>

      <section id="keys" className="guide-feature guide-feature-keys">
        <div className="guide-feature-icon" aria-hidden="true">⌂</div>
        <div>
          <h2>Check-in &amp; keys</h2>
          <ol className="guide-arrival-steps">
            <li><strong>Find the address.</strong> Open the Airbnb conversation for your reservation and look for our arrival message.</li>
            <li><strong>Tell us when you’ll arrive.</strong> Send your estimated arrival time in the Airbnb chat. Check-in starts at 16:00.</li>
            <li><strong>Meet us for the keys.</strong> We’ll hand them over in person at the time we agree in the chat.</li>
          </ol>
          <p className="guide-note">The online check-in form registers your guest details. Please arrange the key handover separately in the Airbnb chat.</p>
          <p className="guide-note"><strong>No lift.</strong> There is no lift in the building.</p>
          <p className="guide-note">Need a different arrival or departure time? Message us in the Airbnb chat and we’ll do our best to help.</p>
          <p className="guide-note"><strong>Lost your keys or locked out?</strong> Message us in the Airbnb chat.</p>
          {guide.keys.trim() !== defaultGuestGuideContent.keys && toParagraphs(guide.keys)}
          <a className="guide-back" href="#contents">↑ Back to contents</a>
        </div>
      </section>

      <section id="welcome" className="guide-intro guide-intro-vivid"><span className="landing-kicker">Your Prague base</span><h2>Make yourself at home</h2>{toParagraphs(guide.welcome.replace("Please read this guide at the beginning of your stay — it covers the practical details, house rules and a few local favourites.", "Here are the essentials for a comfortable stay."))}</section>
      <aside className="guide-shoes-note" aria-label="Shoes-off home"><span aria-hidden="true">👟</span><div><strong>A shoes-off home</strong><p>Please take off your outdoor shoes when you enter the apartment. It helps keep our wooden floors clean and makes the space comfortable for everyone. Thank you!</p></div></aside>

      <section id="arrival" className="guide-feature guide-feature-arrival">
        <div className="guide-feature-icon">✦</div><div><h2>Getting to the apartment</h2>{toParagraphs(guide.arrival)}
          <p className="guide-note"><strong>Tickets:</strong> Make sure your public-transport ticket is valid before boarding.</p>
          <div className="guide-links guide-links-transport">
            <a href="https://idos.cz/en/" target="_blank" rel="noreferrer">Plan a route with IDOS ↗</a>
            <a href="https://www.dpp.cz/en" target="_blank" rel="noreferrer">Prague public transport ↗</a>
            <a href="https://apps.apple.com/cz/app/pid-l%C3%ADta%C4%8Dka/id983071129" target="_blank" rel="noreferrer">PID Lítačka for iPhone ↗</a>
            <a href="https://play.google.com/store/apps/details?id=cz.dpp.praguepublictransport" target="_blank" rel="noreferrer">PID Lítačka for Android ↗</a>
            <a href="https://www.uber.com/" target="_blank" rel="noreferrer">Uber ↗</a><a href="https://bolt.eu/" target="_blank" rel="noreferrer">Bolt ↗</a>
          </div>
        </div>
      </section>

      <section id="home" className="guide-section guide-section-home"><span className="guide-number">03</span><div><h2>Useful things at home</h2>
        <div className="guide-grid guide-grid-vivid">

          <article><span aria-hidden="true">👟</span><h3>Care for the flat</h3>{toParagraphs(guide.apartmentCare.replace("Please take off your shoes inside to protect the wooden floor.", "").replace("Smoking is not allowed in the apartment or the gallery.", "").trim())}<p className="guide-rule"><strong>Smoking:</strong> please smoke outside only, never anywhere inside the building. There have been smoking-related fire incidents in the past, so this is especially important.</p></article>
          <article><span aria-hidden="true">♨</span><h3>Heating, water & power</h3>{toParagraphs(guide.utilities)}<p className="guide-note">If Wi-Fi, water, heating or electricity stops working, please contact us in the Airbnb chat rather than trying to fix it yourself.</p></article>
          <article><span aria-hidden="true">♻</span><h3>Waste & recycling</h3>{toParagraphs(guide.recycling.replace("Waste and recycling bins are on the ground floor, through the wooden door and to the right.", "The bins are on the ground floor, beyond the green door marked in the photo below."))}</article>
          <article className="guide-wide guide-bins"><div><span aria-hidden="true">🗑</span><h3>Finding the bins</h3><p>Use the green door marked in the photo. The bins are just beyond it on the ground floor.</p></div><Image src="/images/guide/waste-bins.jpeg" alt="Green door leading to the waste and recycling bins" width={1576} height={2100}/></article>
          <article id="equipment" className="guide-wide"><span aria-hidden="true">☕</span><h3>Coffee, laundry & appliances</h3>{toParagraphs(guide.appliances.replace(/The oven has an Aqua Clean function\.\s*/gi, ""))}<ul className="guide-equipment" aria-label="Available in the apartment">{[{ icon: "🧺", name: "Washing machine" }, { icon: "👕", name: "Drying rack" }, { icon: "♨️", name: "Iron" }, { icon: "💨", name: "Hairdryer" }, { icon: "🌀", name: "Fan" }].map(item => <li key={item.name}><span aria-hidden="true">{item.icon}</span><strong>{item.name}</strong></li>)}</ul></article>
          <article className="guide-wide guide-oven-manual"><span aria-hidden="true">🔥</span><h3>Oven</h3><p>For cooking modes and operating instructions, please see the Gorenje BO635E11 manual. If you need help, contact us in the Airbnb chat.</p><div className="guide-links"><a href="https://www.manualypdf.cz/gorenje/bo635e11/manu%C3%A1l" target="_blank" rel="noreferrer">Open oven manual ↗</a></div></article>
        </div>
        <details className="technical-gallery"><summary>Utility locations · water, gas & electricity</summary><div><span className="landing-kicker">Emergency reference</span><h3 id="technical-gallery-title">Water, gas & electricity</h3><p>Please contact us first whenever possible. These photos are here to identify the right place quickly in an emergency.</p></div><div className="technical-photo-grid"><figure className="technical-water-access"><Image src="/images/guide/water-access.jpg" alt="Access point to the water shut-off under the kitchen cabinet" width={3024} height={4032}/><figcaption><strong>Water shut-off</strong><span>Behind the framed access area under the kitchen cabinet.</span></figcaption></figure><figure><Image src="/images/guide/water-meter.jpg" alt="Water meter detail" width={4032} height={3024}/><figcaption><strong>Water meter</strong><span>The meter confirms you are at the water shut-off.</span></figcaption></figure><figure><Image src="/images/guide/gas-shutoff.jpg" alt="Yellow gas shut-off valve" width={3024} height={4032}/><figcaption><strong>GAS</strong></figcaption></figure><figure className="technical-electrical"><Image src="/images/guide/electrical-cabinets.jpg" alt="Electrical cabinets in the corridor" width={3024} height={4032}/><Image src="/images/guide/main-breaker.jpg" alt="Main electrical breaker inside the cabinet" width={3024} height={4032}/><figcaption><strong>ELECTRICITY</strong></figcaption></figure></div></details>
      <a className="guide-back" href="#contents">↑ Back to contents</a></div></section>

      <section id="prague" className="guide-feature guide-feature-prague"><div className="guide-feature-icon">♥</div><div><span className="landing-kicker">04 · Out & about</span><h2>A few Prague favourites</h2>{toParagraphs(guide.pragueTips)}
        <div className="prague-photo-pair prague-photo-single"><figure><Image src="/images/guide/prague-day.jpg" alt="View across Prague from a hilltop" width={1920} height={1440}/><figcaption>A bright Prague afternoon</figcaption></figure></div>
        <div className="place-group"><h3>Czech food & beer</h3><div className="place-list">
          <PlaceCard href="https://maps.app.goo.gl/VFqsydwB8UWBYAjE6" name="Havelská Koruna" detail="A self-service restaurant serving Czech classics, soups and dumplings. A straightforward choice for a traditional lunch." mark="HK" />
          <PlaceCard href="https://maps.app.goo.gl/3Puq6eo9sGxnXUjJ6" name="Pivovar Národní" detail="A brewery restaurant serving its own Czech Lion beer and Czech dishes, with a courtyard beer garden." mark="P" />
          <PlaceCard href="https://maps.app.goo.gl/pvWZkhmHzmu3LNYR9" name="Pilsnerka Národní" detail="A Czech pub on Národní for draught Pilsner Urquell and a casual meal." mark="PN" />
          <PlaceCard href="https://www.google.com/maps/search/?api=1&amp;query=U%20Pinkas%C5%AF%20Jungmannovo%20n%C3%A1m%C4%9Bst%C3%AD%2016%20Prague" name="U Pinkasů" detail="Traditional Czech dishes and Pilsner Urquell in a historic pub. A good choice for a first Czech dinner." mark="UP" />
          <PlaceCard href="https://www.google.com/maps/search/?api=1&amp;query=Lok%C3%A1l%20Dlouh%C3%A1%C3%A1%C3%A1%20Dlouh%C3%A1%2033%20Prague" name="Lokál Dlouhááá" detail="A lively Czech pub for classic home-style food and tank beer. Book ahead for an evening visit." mark="LD" />
          <PlaceCard href="https://www.google.com/maps/search/?api=1&amp;query=Kant%C3%BDna%20Politick%C3%BDch%20v%C4%9Bz%C5%88%C5%AF%205%20Prague" name="Kantýna" detail="A butcher-shop restaurant focused on meat, with a counter-service dining experience. A good pick for meat lovers." mark="K" />
        </div></div>
        <div className="place-group"><h3>Coffee & something sweet</h3><div className="place-list">
          <PlaceCard href="https://goo.gl/maps/hm2fr5MRwjGmrfj26" name="Café Louvre" detail="A historic café for breakfast, coffee, cakes and a relaxed sit-down meal." logo="/images/places/cafe-louvre.jpeg" />
          <PlaceCard href="https://goo.gl/maps/NYR3HbTxazzF22Xu5" name="Café Slavia" detail="A historic riverside café with breakfast, Czech and international dishes, desserts and views towards the National Theatre." mark="S" />
          <PlaceCard href="https://goo.gl/maps/LZeB18KphsvNaSKS9" name="Krusta" detail="An artisan bakery and bistro for bread, sweet and savoury pastries, and a quick bite." mark="K" />
          <PlaceCard href="https://goo.gl/maps/LNshEWKgYsoY6Jcj9" name="Au Gourmand" detail="A French-style café and pâtisserie for coffee, cakes and pastries in Dlouhá Street." mark="AG" />
          <PlaceCard href="https://www.google.com/maps/search/?api=1&amp;query=Cukr%C3%A1%C5%99%20Sk%C3%A1la%20Dlouh%C3%A1%2039%20Prague" name="Cukrář Skála" detail="Czech-style cakes and pastries with a modern twist. Visit the Dlouhá branch for its signature kremrole cream rolls." mark="CS" />
        </div></div>
        <div className="place-group"><h3>Groceries nearby</h3><div className="place-list">
          <PlaceCard href="https://goo.gl/maps/RwqKW5QApKjnHzbf8" name="Lidl" detail="Everyday groceries, bread, fruit, vegetables and basic household supplies." logo="/images/places/lidl.webp" />
          <PlaceCard href="https://maps.app.goo.gl/1YAYpHqzaQFsdt358" name="Tesco" detail="A supermarket for a full grocery shop, drinks, snacks and household essentials." logo="/images/places/tesco.png" />
          <PlaceCard href="https://goo.gl/maps/xb7cZLZuZjEQr9oJ6" name="Albert" detail="A supermarket for everyday food, fresh produce, bakery items and drinks." logo="/images/places/albert.png" />
          <PlaceCard href="https://goo.gl/maps/ffV91LZz43ji1duh6" name="BILLA" detail="A supermarket for groceries, fresh produce, bread and snacks for your stay." logo="/images/places/billa.webp" />
          <PlaceCard href="https://goo.gl/maps/YYG6b1mMbKYt5jrf8" name="Delmart" detail="A food shop for groceries, deli products and something convenient to take away." logo="/images/places/delmart.jpg" />
        </div></div>
        <div className="guide-links"><a href="https://www.youtube.com/@HONESTGUIDE/videos" target="_blank" rel="noreferrer">More local tips from Honest Guide ↗</a></div>
      <a className="guide-back" href="#contents">↑ Back to contents</a></div></section>

      <section id="checkout" className="guide-feature guide-feature-checkout">
        <div className="guide-feature-icon" aria-hidden="true">✓</div>
        <div>
          <h2>Before you leave</h2>
          <p><strong>Check-out is by 11:00.</strong></p>
          <ul className="guide-checklist" aria-label="Departure checklist">
            <li><span aria-hidden="true">💡</span><div><strong>Turn off the lights</strong></div></li>
            <li><span aria-hidden="true">🔌</span><div><strong>Unplug chargers and portable appliances</strong><small>Leave the fridge and other fixed appliances plugged in.</small></div></li>
            <li><span aria-hidden="true">🪟</span><div><strong>Close the windows</strong></div></li>
            <li><span aria-hidden="true">🔒</span><div><strong>Lock the apartment door behind you</strong></div></li>
            <li className="guide-checklist-keys"><span aria-hidden="true">🔑</span><div><strong>Then drop the keys in the mailbox</strong><small>Use the mailbox we showed you when we handed over the keys.</small></div></li>
          </ul>
          <a className="guide-back" href="#contents">↑ Back to contents</a>
        </div>
      </section>
      <section id="help" className="guide-help"><div className="guide-help-copy"><span className="landing-kicker">Need assistance?</span><h2>We&apos;re here to help.</h2>{toParagraphs(guide.help.replace(/\s*In an emergency[\s\S]*$/i, ""))}</div><div className="emergency-list" aria-label="Emergency telephone numbers"><a href="tel:112"><span aria-hidden="true">🆘</span><strong>112</strong><small>European emergency number</small></a><a href="tel:158"><span aria-hidden="true">👮</span><strong>158</strong><small>Police</small></a><a href="tel:155"><span aria-hidden="true">🚑</span><strong>155</strong><small>Ambulance</small></a><a href="tel:150"><span aria-hidden="true">🚒</span><strong>150</strong><small>Fire brigade</small></a><a className="guide-back" href="#contents">↑ Back to contents</a></div></section>
      <footer className="guest-guide-footer"><span>Havelská Apartment · Guest guide</span><small aria-label={`Page version ${buildVersion}`}>Version {buildVersion}</small></footer>
    </div>
  </main>;
}
