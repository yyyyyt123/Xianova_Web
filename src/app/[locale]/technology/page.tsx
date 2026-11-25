import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { TechnologyDeepDive } from "@/components/sections/TechnologyPage";
import { routing } from "@/i18n/routing";
import { SITE_ORIGIN, buildTransferFaqJsonLd, localizedUrl } from "@/lib/seo";

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
  const lang = locale === "zh" ? "zh" : "en";
  const t = await getTranslations({ locale, namespace: "technology" });

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: localizedUrl(lang, "/technology"),
      languages: {
        zh: localizedUrl("zh", "/technology"),
        en: localizedUrl("en", "/technology"),
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      url: localizedUrl(lang, "/technology"),
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
  const transfer = await getTranslations({ locale, namespace: "transfer" });
  const faqs = transfer.raw("faqs") as { question: string; answer: string }[];

  return (
    <div className="bg-page">
      <TechnologyDeepDive faq={
        <section id="transfer-faq" className="transfer-faq" aria-labelledby="transfer-faq-title">
          <p className="editorial-label"><span aria-hidden="true">↳</span>{transfer("faqLabel")}</p>
          <h2 id="transfer-faq-title">{transfer("faqTitle")}</h2>
          <div className="transfer-faq-list">
            {faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildTransferFaqJsonLd(faqs)) }}
          />
        </section>
      } />
    </div>
  );
}
