import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Space_Grotesk, Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const noto = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
  const t = await getTranslations({ locale, namespace: "meta" });

  return (
    <html
      lang={locale}
      className={`${space.variable} ${noto.variable} ${mono.variable}`}
    >
      <head>
        <meta name="description" content={t("description")} />
        <meta name="keywords" content={t("keywords")} />
        <meta name="theme-color" content="#F7F8FA" />
        {process.env.NEXT_PUBLIC_RECRUITMENT_API_ORIGIN && <link rel="preconnect" href={process.env.NEXT_PUBLIC_RECRUITMENT_API_ORIGIN} crossOrigin="anonymous" />}
      </head>
      <body
        className="min-h-screen bg-page font-sans text-ink antialiased"
        data-deployment-check="mirror-pipeline-20260807"
      >
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
