import { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrandOpeningProvider } from "@/components/BrandOpening";
import { OPENING_BOOT_SCRIPT, OPENING_BOOT_STYLES } from "@/lib/brand-opening-boot.mjs";
import { buildOrganizationJsonLd } from "@/lib/seo";
import "@/components/editorial.css";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    description: t("description"),
    keywords: t("keywords").split(","),
  };
}

/**
 * Locale layout with fonts, header, footer, and intl provider.
 * @param children, page content
 * @param params, locale route params
 */
export default async function LocaleLayout({ children, params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!routing.locales.includes(locale as "zh" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <style id="brand-opening-boot-style" dangerouslySetInnerHTML={{ __html: OPENING_BOOT_STYLES }} />
        <script id="brand-opening-boot" dangerouslySetInnerHTML={{ __html: OPENING_BOOT_SCRIPT }} />
        <meta name="theme-color" content="#f9fbfc" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationJsonLd(locale as "zh" | "en")),
          }}
        />
        {process.env.NEXT_PUBLIC_RECRUITMENT_API_ORIGIN && <link rel="preconnect" href={process.env.NEXT_PUBLIC_RECRUITMENT_API_ORIGIN} crossOrigin="anonymous" />}
      </head>
      <body
        className="min-h-screen bg-page font-sans text-ink antialiased"
        data-deployment-check="mirror-pipeline-20260807"
      >
        <NextIntlClientProvider messages={messages}>
          <BrandOpeningProvider>
          <Header />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Footer />
          </BrandOpeningProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
