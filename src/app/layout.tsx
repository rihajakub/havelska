import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./operational.css";

export const metadata: Metadata = {
  title: "Havelská Apartment",
  description: "Quiet 2BR Old Town Apartment in Prague.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  icons: {
    icon: [{ url: "/images/prague-castle-icon.png", type: "image/png", sizes: "600x600" }],
    apple: [{ url: "/images/prague-castle-icon.png", type: "image/png", sizes: "600x600" }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#152c26" };

const buildVersion = `v2026.11.26.1 · ${(process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7)}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const productionLocked = Boolean(process.env.VERCEL) && (process.env.ENABLE_PRODUCTION_APP !== "true" || !process.env.DATABASE_URL);
  return (
    <html lang="cs">
      <body>
        {productionLocked ? (
          <main className="locked"><div><span className="brand-mark">H</span><h1>Produkční provoz je zatím uzamčený</h1><p>Pro odemčení je nutné nastavit heslo, povolit produkční provoz a připojit trvalou databázi.</p></div></main>
        ) : <AppShell buildVersion={buildVersion}>{children}</AppShell>}
      </body>
    </html>
  );
}
