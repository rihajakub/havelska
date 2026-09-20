"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxIcon, CalendarIcon, HomeIcon } from "./icons";

const links = [
  { href: "/", label: "Přehled", Icon: HomeIcon },
  { href: "/pobyty", label: "Pobyty", Icon: CalendarIcon },
  { href: "/cizinecka-policie", label: "Hlášení", Icon: CalendarIcon },
  { href: "/inventar", label: "Zásoby", Icon: BoxIcon },
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
        <nav className="topbar-nav" aria-label="Hlavní navigace">
          {links.map(({ href, label, Icon }) => <Link className={pathname === href ? "active" : ""} href={href} key={href}><Icon/><span>{label}</span></Link>)}
        </nav>
        <span className="dev-chip">Lokální režim</span>
      </header>
      <main className="page">{children}</main>
      <nav className="bottom-nav" aria-label="Hlavní navigace">
        {links.map(({ href, label, Icon }) => (
          <Link className={pathname === href ? "active" : ""} href={href} key={href}><Icon/><span>{label}</span></Link>
        ))}
      </nav>
    </div>
  );
}
