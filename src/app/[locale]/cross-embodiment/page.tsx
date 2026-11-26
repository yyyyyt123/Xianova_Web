import { getTranslations, setRequestLocale } from "next-intl/server";
import { CrossEmbodimentPage } from "@/components/sections/CrossEmbodimentPage";
import { routing } from "@/i18n/routing";
import {
  buildSparkumrSoftwareJsonLd,
  buildTechnicalPageMetadata,
  buildTransferVideosJsonLd,
} from "@/lib/seo";

type Props = {
  params: { locale: "zh" | "en" };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: Props) {
  const [nav, content] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "technicalPages.embodiment" }),
  ]);

  return buildTechnicalPageMetadata(
    locale,
    "/cross-embodiment",
    nav("crossEmbodiment"),
    content("intro"),
  );
}

export default function CrossEmbodimentRoute({ params: { locale } }: Props) {
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildSparkumrSoftwareJsonLd(locale),
            buildTransferVideosJsonLd(locale),
          ]),
        }}
      />
      <CrossEmbodimentPage />
    </>
  );
}
