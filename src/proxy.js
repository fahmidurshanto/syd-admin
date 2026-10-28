import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Check for presence of auth cookies issued by backend
  const hasAuthToken =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  const isLoginPage = pathname === "/login";

  // If unauthenticated and visiting a protected route, redirect to /login
  if (!hasAuthToken && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and trying to access /login, redirect to overview
  if (hasAuthToken && isLoginPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // /admins route is strictly restricted to superadmins
  if (pathname.startsWith("/admins")) {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (accessToken) {
      try {
        const payloadBase64 = accessToken.split(".")[1];
        if (payloadBase64) {
          const payload = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString("utf-8"),
          );
          if (payload.role && payload.role !== "superadmin") {
            return NextResponse.redirect(new URL("/", request.url));
          }
        }
      } catch {
        // If parsing fails, allow client page guard to handle
      }
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static public assets (svg, png, jpg, webp, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
