import { NextRequest, NextResponse } from "next/server";
const ADMIN_COOKIE = "cybershield_admin_session";
const AGENT_COOKIE = "cybershield_agent_session";
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/portal") && path !== "/portal/login" && !request.cookies.has(AGENT_COOKIE)) return NextResponse.redirect(new URL("/portal/login", request.url));
  if ((path.startsWith("/admin") || path.startsWith("/email") || path.startsWith("/agreement")) && path !== "/admin/login" && !request.cookies.has(ADMIN_COOKIE)) return NextResponse.redirect(new URL("/admin/login", request.url));
  const response = NextResponse.next();
  if (path.startsWith("/portal") || path.startsWith("/admin") || path.startsWith("/sign") || path.startsWith("/api/sign")) response.headers.set("Cache-Control", "no-store");
  return response;
}
export const config = { matcher: ["/portal/:path*", "/admin/:path*", "/email/:path*", "/agreement/:path*", "/sign/:path*", "/api/sign/:path*"] };
