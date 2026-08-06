import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Contact page metadata.
 * @param params, locale params
 * @return metadata object
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "contact" });

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
 * Contact page with form and channels.
 * @param params, locale params
 */
export default async function ContactRoute({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  return (
    <div className="bg-page">
      <Contact />
    </div>
  );
}
