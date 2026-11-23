import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(zh|en)(\/.*)?$/);
  if (match) {
    const locale = match[1];
    const cleanPath = match[2] || "/";
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
    return response;
  }

  // First-time visitors always start in Chinese (zh) unless they explicitly switched via NEXT_LOCALE cookie.
  if (!request.cookies.has("NEXT_LOCALE")) {
    const headers = new Headers(request.headers);
    headers.set("accept-language", routing.defaultLocale);
    const wrapped = new NextRequest(request, { headers });
    return handleI18nRouting(wrapped);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/(zh|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
