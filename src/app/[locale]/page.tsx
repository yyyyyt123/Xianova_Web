import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ResearchNotes } from "@/components/sections/ResearchNotes";
import { HomeStatement, HomeDemonstration, HomePathways, HomeInvitation } from "@/components/sections/HomeExperience";
import { routing } from "@/i18n/routing";

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
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(","),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      siteName: "Xianova Robotics",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      languages: {
        zh: "/zh",
        en: "/en",
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
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <HomeStatement />
      <HomeDemonstration />
      <ResearchNotes />
      <HomePathways />
      <HomeInvitation />
    </>
  );
}
