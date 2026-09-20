import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Přihlášení je vyžadováno.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Havelská", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  if (!process.env.VERCEL || process.env.ENABLE_PRODUCTION_APP !== "true") return NextResponse.next();
  const password = process.env.APP_PASSWORD;
  if (!password) return new NextResponse("Produkční heslo není nastavené.", { status: 503 });
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();
  try {
    const credentials = atob(authorization.slice(6));
    const separator = credentials.indexOf(":");
    if (credentials.slice(0, separator) !== "havelska" || credentials.slice(separator + 1) !== password) return unauthorized();
  } catch { return unauthorized(); }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"] };
