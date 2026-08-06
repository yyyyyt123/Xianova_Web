"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { Link } from "@/i18n/routing";

type OrgaProps = {
  showLink?: boolean;
};

/**
 * ORGA capability overview.
 * @param showLink, whether to show link to technology page
 */
export function Orga({ showLink = true }: OrgaProps) {
  const t = useTranslations("orga");
  const hero = useTranslations("hero");
  const caps = t.raw("capabilities") as { title: string; desc: string }[];

  return (
    <section className="relative overflow-hidden bg-surface-dim section-pad">
      <div
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(15,125,118,0.18), transparent 70%)" }}
        aria-hidden
      />

      <div className="max-prose-site relative">
        <FadeIn>
          <div className="section-rule">
            <span className="section-num">02</span>
            <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
              ORGA
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-ink md:text-[2rem] md:leading-snug">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-mute md:text-lg">
            {t("desc")}
          </p>
        </FadeIn>

        <div className="card-grid mt-10 md:grid-cols-3">
          {caps.map((cap, i) => (
            <FadeIn key={cap.title} delay={0.06 + i * 0.06}>
              <div className="card-cell group h-full p-6 md:p-7">
                <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-brand">
                  0{i + 1}
                </p>
                <h3 className="mt-4 text-lg font-semibold text-ink transition group-hover:text-brand">
                  {cap.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mute">
                  {cap.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {showLink && (
          <FadeIn delay={0.15} className="mt-10">
            <Link
              href="/technology"
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand no-underline"
            >
              {hero("learnMore")}
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
