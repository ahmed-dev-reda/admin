import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PAGE_PREFIXES = ["/auth"];
const PUBLIC_API_PREFIXES = ["/api/auth"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|map)$/) !== null
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value ??
    getSessionCookie(request) ??
    undefined;
  const isApiRoute = pathname.startsWith("/api");
  const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicPage = PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p));

  // API routes (except /api/auth) must be protected server-side.
  // Public auth endpoints pass through.
  if (isApiRoute) {
    if (isPublicApi) {
      return NextResponse.next();
    }
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // Auth pages are public; signed-in users are bounced to the dashboard
  if (isPublicPage) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Everything else (pages) requires a session cookie
  if (!sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
