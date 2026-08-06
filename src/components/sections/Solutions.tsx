"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { Link } from "@/i18n/routing";

/**
 * Solutions audience section.
 */
export function Solutions() {
  const t = useTranslations("solutions");
  const nav = useTranslations("nav");
  const audiences = t.raw("audiences") as { title: string; desc: string }[];

  return (
    <>
      <section className="relative overflow-hidden bg-deep pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grain opacity-25" />
        <div className="max-prose-site relative px-8 md:px-12">
          <FadeIn>
            <p className="font-mono text-sm font-semibold text-sky">
              {t("label")}
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 text-lg text-sky/90">{t("desc")}</p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-page section-pad">
        <div className="max-prose-site">
          <div className="card-grid md:grid-cols-3">
            {audiences.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06}>
                <div className="card-cell group h-full p-7 md:p-8">
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-ink-faint">
                    0{i + 1}
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-ink transition group-hover:text-brand">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mute">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-12">
            <Link href="/contact" className="btn-primary">
              {nav("cta")}
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
