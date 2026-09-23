import { NextResponse, type NextRequest } from "next/server";
import { googleSessionToken, passwordSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  if (!process.env.VERCEL || process.env.ENABLE_PRODUCTION_APP !== "true") return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "/login" || pathname === "/robots.txt" || pathname.startsWith("/guest-info") || pathname.startsWith("/check-in/") || pathname.startsWith("/api/auth/google")) return NextResponse.next();
  const password = process.env.APP_PASSWORD;
  const googleSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!password && !googleSecret) return new NextResponse("Přihlášení není nastavené.", { status: 503 });
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const acceptedTokens = await Promise.all([password ? passwordSessionToken(password) : undefined, googleSecret ? googleSessionToken(googleSecret) : undefined]);
  if (acceptedTokens.includes(token)) return NextResponse.next();
  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"] };
