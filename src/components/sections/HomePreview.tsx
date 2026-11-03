"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { Link } from "@/i18n/routing";

/**
 * Home entry grid with hover affordances.
 */
export function HomePreview() {
  const t = useTranslations("home");
  const items = (t.raw("entries") as { title: string; desc: string; href: string }[]) || [];
  const pillarsRaw = t.raw("pillars");
  const pillars = Array.isArray(pillarsRaw) ? (pillarsRaw as string[]) : [];

  return (
    <>
      <section className="border-y border-line bg-surface">
        <div className="max-site flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-8 py-5 md:px-12">
          {pillars.map((p, i) => (
            <FadeIn key={p} delay={i * 0.05} y={12}>
              <p className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                {i > 0 && (
                  <span className="hidden h-1 w-1 rounded-full bg-brand/50 sm:inline-block" />
                )}
                {p}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="explore" className="scroll-mt-8 bg-page section-pad">
        <div className="max-site">
          <FadeIn>
            <div className="section-rule max-w-prose">
              <span className="section-num">01</span>
              <span className="min-w-0 font-mono text-sm font-semibold text-ink-mute">
                {t("previewTitle")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </FadeIn>

          <div className="card-grid mt-2 md:grid-cols-3">
            {items.map((item, i) => (
              <FadeIn key={item.href} delay={i * 0.07}>
                <Link
                  href={item.href as "/technology" | "/solutions" | "/about"}
                  className="card-cell group relative block h-full p-7 no-underline md:p-9"
                >
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-ink-faint">
                    0{i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink transition group-hover:text-brand">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-mute">
                    {item.desc}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                    <span className="transition group-hover:translate-x-1">→</span>
                  </span>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition duration-300 group-hover:scale-x-100" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
