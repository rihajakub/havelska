import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { googleSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const STATE_COOKIE = "havelska_google_state";
const NEXT_COOKIE = "havelska_google_next";
const ALLOWED_GOOGLE_EMAIL = "rihaja@gmail.com";
const safeNext = (value: string | undefined) => value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
const sameValue = (left: string, right: string) => left.length === right.length && timingSafeEqual(Buffer.from(left), Buffer.from(right));
type GoogleProfile = { email?: string; email_verified?: boolean };

function backToLogin(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/login?google=${encodeURIComponent(error)}`, request.url));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const next = safeNext(request.cookies.get(NEXT_COOKIE)?.value);
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!code || !state || !expectedState || !sameValue(state, expectedState) || !clientId || !clientSecret || !redirectUri) return backToLogin(request, "failed");
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }), cache: "no-store" });
    const token = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !token.access_token) return backToLogin(request, "failed");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
    const profile = await profileResponse.json() as GoogleProfile;
    if (!profileResponse.ok || profile.email?.toLowerCase() !== ALLOWED_GOOGLE_EMAIL || profile.email_verified !== true) return backToLogin(request, "not-allowed");
    const response = NextResponse.redirect(new URL(next, request.url));
    response.cookies.set(SESSION_COOKIE, await googleSessionToken(clientSecret), sessionCookieOptions);
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(NEXT_COOKIE);
    return response;
  } catch {
    return backToLogin(request, "failed");
  }
}
