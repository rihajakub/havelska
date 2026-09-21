import Image from "next/image";
import Link from "next/link";

const places = [
  ["Havelská Koruna", "Czech classics nearby", "https://maps.app.goo.gl/m4YtsmRPWmEbyEZY6"],
  ["Café Louvre", "A Prague institution for breakfast or coffee", "https://maps.app.goo.gl/cZ7xjVCi4a5e5Xea8"],
  ["Lidl", "Everyday groceries", "https://maps.app.goo.gl/4XWuSbYDQmD6xfZK6"],
  ["Tesco", "Late grocery option", "https://maps.app.goo.gl/ZzjYGHc14cSZh2mB8"],
];

export default function GuestInfoPage() {
  return <main className="guest-guide">
    <header className="guest-guide-hero"><Image src="/images/quiet-2br-old-town-apartment.jpg" alt="The apartment kitchen and dining area" fill priority sizes="100vw" /><div><Link href="/" className="guest-guide-brand">HAVELSKÁ · PRAGUE OLD TOWN</Link><h1>Guest information</h1><p>Everything useful for a comfortable stay.</p></div></header>
    <nav className="guide-nav" aria-label="Guest guide navigation"><a href="#arrival">Arrival</a><a href="#apartment">Apartment</a><a href="#prague">Prague</a><a href="#checkout">Checkout</a><a href="#help">Help</a></nav>
    <div className="guest-guide-content">
      <section className="guide-intro"><span className="landing-kicker">Welcome</span><h2>We&apos;re glad you&apos;re here.</h2><p>This guide covers the essentials. Your arrival time and key handover are arranged separately in your Airbnb conversation.</p></section>
      <section id="arrival" className="guide-section"><span className="guide-number">01</span><div><h2>Getting here</h2><p>From the airport, public transport takes around 30–40 minutes. For a door-to-door ride, Uber or Bolt are usually the simplest options.</p><div className="guide-links"><a href="https://pidlitacka.cz/en" target="_blank" rel="noreferrer">Public transport · PID Lítačka ↗</a><a href="https://www.uber.com/" target="_blank" rel="noreferrer">Uber ↗</a><a href="https://bolt.eu/" target="_blank" rel="noreferrer">Bolt ↗</a></div></div></section>
      <section id="apartment" className="guide-section"><span className="guide-number">02</span><div><h2>At the apartment</h2><div className="guide-grid"><article><h3>Wi-Fi</h3><p><strong>Network:</strong> TP-Link_6FEE<br /><strong>Password:</strong> 79020206</p></article><article><h3>Please note</h3><p>Please take off your shoes inside. Smoking is not permitted in the apartment or gallery.</p></article><article><h3>Heating & hot water</h3><p>The heating and hot-water controls are in the corridor. If anything is unclear, please message us before changing a setting.</p></article><article><h3>Waste & recycling</h3><p>Use the bins on the ground floor. Yellow is for plastic, blue for paper and green for glass.</p></article><article><h3>Coffee & laundry</h3><p>A Nespresso machine is available. There is a drying rack in the bedroom and one in the hallway.</p></article><article><h3>Need help?</h3><p>For a technical problem, message us first so we can guide you safely.</p></article></div></div></section>
      <section id="prague" className="guide-section"><span className="guide-number">03</span><div><h2>Nearby favourites</h2><p>For currency exchange, avoid street offers; use a reputable exchange office instead.</p><div className="place-list">{places.map(([name, description, url]) => <a href={url} target="_blank" rel="noreferrer" key={name}><strong>{name}</strong><span>{description} ↗</span></a>)}</div></div></section>
      <section id="checkout" className="guide-section"><span className="guide-number">04</span><div><h2>Before you leave</h2><ul className="guide-checklist"><li>Wash any used dishes or start the dishwasher.</li><li>Turn off the lights and close windows.</li><li>Check cupboards, under the bed and bathroom for belongings.</li><li>Return the keys as agreed in your Airbnb conversation.</li></ul></div></section>
      <section id="help" className="guide-help"><span className="landing-kicker">Need assistance?</span><h2>We&apos;re here to help.</h2><p>For apartment questions, contact Anna or Jakub using the details shared in your Airbnb conversation.</p><p className="emergency"><strong>Emergency services in the Czech Republic:</strong> Police 158 · Ambulance 155 · Fire 150 · EU emergency 112</p></section>
    </div>
  </main>;
}
