import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-insecure-secret");

const PROTECTED_PREFIXES = ["/onboarding", "/discover", "/matches", "/profile"];
const AUTH_PAGES = ["/login", "/signup"];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await hasValidSession(req);

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/discover";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/discover/:path*", "/matches/:path*", "/profile/:path*", "/login", "/signup"],
};
