import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ResearchNotes } from "@/components/sections/ResearchNotes";
import { HomeStatement, HomeDemonstration, HomePathways, HomeInvitation } from "@/components/sections/HomeExperience";
import { routing } from "@/i18n/routing";
import { TransferShowcase } from "@/components/transfer/TransferShowcase";
import {
  SITE_ORIGIN,
  buildSparkumrSoftwareJsonLd,
  buildTransferVideosJsonLd,
  buildWebsiteJsonLd,
  localizedSiteName,
  localizedUrl,
} from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Build home metadata for SEO / OG.
 * @param params, locale params
 * @return metadata object
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const lang = locale === "zh" ? "zh" : "en";
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: localizedUrl(lang),
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      siteName: localizedSiteName(lang),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      canonical: localizedUrl(lang),
      languages: {
        zh: localizedUrl("zh"),
        en: localizedUrl("en"),
      },
    },
  };
}

/**
 * Home page — particle hero, research sketches and entry links.
 * @param params, locale params
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  const lang = locale === "zh" ? "zh" : "en";
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildWebsiteJsonLd(),
            buildSparkumrSoftwareJsonLd(lang),
            buildTransferVideosJsonLd(lang),
          ]),
        }}
      />
      <Hero />
      <TransferShowcase />
      <HomeStatement />
      <HomeDemonstration />
      <ResearchNotes />
      <HomePathways />
      <HomeInvitation />
    </>
  );
}
