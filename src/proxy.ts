import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "havelska_session";

async function sessionToken(password: string) {
  const data = new TextEncoder().encode(`havelska-session:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const encoded = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function proxy(request: NextRequest) {
  if (!process.env.VERCEL || process.env.ENABLE_PRODUCTION_APP !== "true") return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "/login" || pathname === "/robots.txt" || pathname.startsWith("/guest-info") || pathname.startsWith("/check-in/")) return NextResponse.next();
  const password = process.env.APP_PASSWORD;
  if (!password) return new NextResponse("Produkční heslo není nastavené.", { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token === await sessionToken(password)) return NextResponse.next();
  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"] };
