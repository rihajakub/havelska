"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxIcon, CalendarIcon, HomeIcon } from "./icons";
import { logout } from "@/app/actions";

const links = [
  { href: "/dashboard", label: "Přehled", Icon: HomeIcon },
  { href: "/pobyty", label: "Pobyty", Icon: CalendarIcon },
  { href: "/cizinecka-policie", label: "Hlášení", Icon: CalendarIcon },
  { href: "/inventar", label: "Zásoby", Icon: BoxIcon },
  { href: "/poplatky", label: "Poplatky", Icon: BoxIcon },
  { href: "/pruvodce", label: "Průvodce", Icon: HomeIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/guest-info") || pathname.startsWith("/check-in/")) return <>{children}</>;
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">H</span>
          <span><strong>Havelská</strong><small>správa apartmánu</small></span>
        </Link>
        <nav className="topbar-nav" aria-label="Hlavní navigace">
          {links.map(({ href, label, Icon }) => <Link className={pathname === href ? "active" : ""} href={href} key={href}><Icon/><span>{label}</span></Link>)}
        </nav>
        <div className="topbar-status"><span className="dev-chip">Provoz</span><form action={logout}><button className="logout-button" type="submit">Odhlásit</button></form></div>
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
