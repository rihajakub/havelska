export const SESSION_COOKIE = "havelska_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function tokenFor(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const encoded = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const passwordSessionToken = (password: string) => tokenFor(`havelska-session:password:${password}`);
export const googleSessionToken = (clientSecret: string) => tokenFor(`havelska-session:google:${clientSecret}`);

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: Boolean(process.env.VERCEL),
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
