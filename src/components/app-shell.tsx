"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxIcon, CalendarIcon, HomeIcon, VanIcon } from "./icons";

const links = [
  { href: "/", label: "Přehled", Icon: HomeIcon },
  { href: "/inventar", label: "Inventář", Icon: BoxIcon },
  { href: "/pobyty", label: "Pobyty", Icon: CalendarIcon },
  { href: "/cizinecka-policie", label: "Hlášení", Icon: CalendarIcon },
  { href: "/cesta", label: "Cesta", Icon: VanIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/check-in/")) return <>{children}</>;
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">H</span>
          <span><strong>Havelská</strong><small>správa apartmánu</small></span>
        </Link>
        <span className="dev-chip">Lokální režim</span>
      </header>
      <main className="page">{children}</main>
      <nav className="bottom-nav" aria-label="Hlavní navigace">
        {links.map(({ href, label, Icon }) => (
          <Link href={href} key={href}><Icon/><span>{label}</span></Link>
        ))}
      </nav>
    </div>
  );
}
