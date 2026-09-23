import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const STATE_COOKIE = "havelska_google_state";
const NEXT_COOKIE = "havelska_google_next";
const googleAuthorizeUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: Boolean(process.env.VERCEL), path: "/", maxAge: 10 * 60 };
const safeNext = (value: string | null) => value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) return NextResponse.redirect(new URL("/login?google=not-configured", request.url));
  const state = randomUUID();
  const url = new URL(googleAuthorizeUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(NEXT_COOKIE, safeNext(request.nextUrl.searchParams.get("next")), cookieOptions);
  return response;
}
