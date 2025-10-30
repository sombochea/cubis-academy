import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const locales = ["km", "en"];
const defaultLocale = "km";

function getLocale(request: NextRequest): string {
  // Check if locale is in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) return pathnameLocale;

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(",")[0].split("-")[0];
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // Skip locale handling for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to URL with locale
    const locale = getLocale(req);
    const newUrl = new URL(`/${locale}${pathname}`, req.url);
    return NextResponse.redirect(newUrl);
  }

  // Session validation for authenticated users
  const session = req.auth;
  const localeMatch = pathname.match(/^\/(km|en)/);
  const locale = localeMatch ? localeMatch[1] : defaultLocale;
  const pathWithoutLocale = localeMatch ? pathname.slice(3) : pathname;

  // Skip validation for public routes
  const isPublicRoute =
    pathWithoutLocale === "/" ||
    pathWithoutLocale === "/login" ||
    pathWithoutLocale === "/register" ||
    pathWithoutLocale === "/logout" ||
    pathWithoutLocale === "";

  // Handle callback URL for protected routes
  if (!isPublicRoute && !session?.user) {
    // Save the original URL as callback
    const callbackUrl = new URL(`/${locale}/login`, req.url);
    callbackUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(callbackUrl);
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If user is logged in, validate session token
  if (session?.user?.id) {
    const token = session.user as any;
    const sessionToken = token.sessionToken;

    // If no session token, this is an old JWT - redirect to logout page
    if (!sessionToken) {
      console.log("🔒 No session token, redirecting to logout page");

      // Redirect to logout page which will handle signOut
      const logoutUrl = new URL(`/${locale}/logout`, req.url);
      logoutUrl.searchParams.set("reason", "no_token");
      return NextResponse.redirect(logoutUrl);
    }

    // Validate session is still active on server
    // We'll do this via an API call since Edge runtime has limitations
    // For now, add headers and let server components validate
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-session-token", sessionToken);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-validate-session", "true");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
