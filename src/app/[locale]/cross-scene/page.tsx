import { getTranslations, setRequestLocale } from "next-intl/server";
import { CrossScenePage } from "@/components/sections/CrossScenePage";
import { routing } from "@/i18n/routing";
import { buildTechnicalPageMetadata } from "@/lib/seo";

type Props = {
  params: { locale: "zh" | "en" };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: Props) {
  const [nav, content] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "technicalPages.scene" }),
  ]);

  return buildTechnicalPageMetadata(
    locale,
    "/cross-scene",
    nav("crossScene"),
    content("intro"),
  );
}

export default function CrossSceneRoute({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <CrossScenePage />;
}
