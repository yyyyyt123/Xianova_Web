"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";

/**
 * Problem definition — light editorial section.
 */
export function Why() {
  const t = useTranslations("why");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section className="bg-page section-pad">
      <div className="max-prose-site">
        <FadeIn>
          <div className="section-rule">
            <span className="section-num">01</span>
            <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
              {t("label")}
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-ink md:text-[2rem] md:leading-snug">
            {t("title")}
          </h2>
        </FadeIn>

        <div className="card-grid mt-10 md:grid-cols-3">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.06}>
              <div className="card-cell h-full p-6 md:p-7">
                <div className="flex h-9 w-9 items-center justify-center border border-brand/25 text-brand">
                  <Icon index={i} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mute">
                  {item.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Minimal line icons for pain points.
 * @param index, which icon to render
 */
function Icon({ index }: { index: number }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      {index === 0 && (
        <>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 9v3l2 1.2" strokeLinecap="round" />
        </>
      )}
      {index === 1 && <path d="M5 7h14M5 12h10M5 17h7" strokeLinecap="round" />}
      {index === 2 && <path d="M6 19V6l6 3.5L18 6v13" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
