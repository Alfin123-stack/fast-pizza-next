import { NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";

// Routes that need a signed-in user. Menu and cart stay public.
const PROTECTED = ["/order", "/orders"];

export async function proxy(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/menu";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
