import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "cybershield_admin_session";

export function middleware(request: NextRequest) {
  const internal = request.nextUrl.pathname === "/email" || request.nextUrl.pathname.startsWith("/email/") || request.nextUrl.pathname === "/agreement" || request.nextUrl.pathname.startsWith("/agreement/");
  if (internal && !request.cookies.has(ADMIN_COOKIE)) return NextResponse.redirect(new URL("/admin/login", request.url));
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); response.headers.set("X-Content-Type-Options", "nosniff"); response.headers.set("X-Frame-Options", "DENY"); response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  if (request.nextUrl.pathname.startsWith("/sign") || internal || request.nextUrl.pathname.startsWith("/admin")) response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|cybershield-logo.png).*)"] };

