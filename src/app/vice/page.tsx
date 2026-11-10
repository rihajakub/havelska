import Link from "next/link";

const tools = [
  { href: "/poplatky", title: "Poplatek z pobytu", text: "Měsíční výpočet, stav úhrady a Excel podklad." },
  { href: "/komunikace", title: "Šablony zpráv", text: "Upravit texty kopírované hostům." },
  { href: "/pruvodce", title: "Guest info", text: "Upravit veřejné informace o apartmánu." },
  { href: "/domovni-kniha", title: "Domovní kniha", text: "Archiv skutečně zadaných údajů hostů." },
  { href: "/inventar", title: "Zásoby", text: "Skrytá provozní část, ke které se můžeš vrátit." },
  { href: "/guest-info", title: "Náhled pro hosta", text: "Otevřít veřejnou stránku tak, jak ji vidí host." },
];

export default function MorePage() {
  return <><section className="page-heading"><span className="eyebrow">Nástroje</span><h1>Více</h1><p>Méně časté části aplikace na jednom místě.</p></section><section className="more-grid">{tools.map((tool) => <Link href={tool.href} key={tool.href} target={tool.href === "/guest-info" ? "_blank" : undefined}><strong>{tool.title}</strong><span>{tool.text}</span></Link>)}</section></>;
}
