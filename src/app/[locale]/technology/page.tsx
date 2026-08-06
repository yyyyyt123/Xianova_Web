import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { TechnologyDeepDive } from "@/components/sections/TechnologyPage";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Technology page metadata.
 * @param params, locale params
 * @return metadata object
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "technology" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      siteName: "Xianova Robotics",
    },
  };
}

/**
 * Technology page route.
 * @param params, locale params
 */
export default async function TechnologyRoute({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  return (
    <div className="bg-page">
      <TechnologyDeepDive />
    </div>
  );
}
