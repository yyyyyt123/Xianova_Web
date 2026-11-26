import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const handleDefaultLocale = createMiddleware({ ...routing, localeDetection: false, localeCookie: false });

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
  const locale = request.cookies.get("NEXT_LOCALE")?.value;
  return locale === "zh" || locale === "en" ? handleI18nRouting(request) : handleDefaultLocale(request);
}

export const config = {
  matcher: ["/", "/(zh|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
