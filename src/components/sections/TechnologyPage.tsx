"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { Link } from "@/i18n/routing";
import { Why } from "./Why";
import { Orga } from "./Orga";

/**
 * Technology page — dark intro strip + light editorial deep dive.
 */
export function TechnologyDeepDive() {
  const t = useTranslations("technology");
  const nav = useTranslations("nav");
  const principles = t.raw("principles") as {
    step: string;
    title: string;
    desc: string;
  }[];
  const demos = t.raw("demos") as { title: string; tag: string }[];
  const pubs = t.raw("pubs") as { venue: string; title: string }[];

  return (
    <>
      <section className="relative overflow-hidden bg-deep pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grain opacity-25" />
        <div
          className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full border border-sky/15"
          aria-hidden
        />
        <div className="max-prose-site relative px-8 md:px-12">
          <FadeIn>
            <p className="inline-flex items-center gap-2.5 font-mono text-sm font-semibold text-sky">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky" />
              ORGA
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/65 md:text-lg">
              {t("heroDesc")}
            </p>
          </FadeIn>
        </div>
      </section>

      <Why />
      <Orga showLink={false} />

      <section className="bg-page section-pad !pt-8">
        <div className="max-prose-site">
          <FadeIn>
            <div className="section-rule">
              <span className="section-num">03</span>
              <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
                {t("diagramTitle")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-2 flex min-h-[260px] flex-col items-center justify-center border border-line bg-surface p-8 md:min-h-[320px]">
              <ArchitectureDiagram />
              <p className="mt-6 font-mono text-xs text-ink-faint">
                {t("diagramPlaceholder")}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-surface-dim section-pad">
        <div className="max-prose-site space-y-12">
          <FadeIn>
            <div className="section-rule">
              <span className="section-num">04</span>
              <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
                {t("principlesLabel")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </FadeIn>
          {principles.map((p, i) => (
            <FadeIn key={p.step} delay={i * 0.05}>
              <div className="grid gap-4 border-t border-line pt-8 md:grid-cols-[88px_1fr]">
                <p className="font-mono text-2xl font-semibold text-brand">
                  {p.step}
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{p.title}</h3>
                  <p className="mt-3 text-ink-mute">{p.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-page section-pad">
        <div className="max-prose-site">
          <FadeIn>
            <div className="section-rule">
              <span className="section-num">05</span>
              <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
                {t("demoTitle")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <p className="text-ink-mute">{t("demoDesc")}</p>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {demos.map((d, i) => (
              <FadeIn key={d.title} delay={i * 0.05}>
                <div className="relative aspect-video overflow-hidden border border-line bg-deep">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(132,195,255,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <p className="font-mono text-xs font-semibold text-sky">
                      {d.tag}
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {d.title}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-white/40">
                      Demo video placeholder
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-dim section-pad">
        <div className="max-prose-site">
          <FadeIn>
            <div className="section-rule">
              <span className="section-num">06</span>
              <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
                {t("pubsTitle")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <p className="text-ink-mute">{t("pubsDesc")}</p>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 border border-line sm:grid-cols-2">
            {pubs.map((p, i) => (
              <FadeIn key={p.venue} delay={i * 0.04}>
                <div
                  className={`flex items-baseline gap-4 border-line bg-surface px-5 py-5 ${
                    i % 2 === 0 ? "sm:border-r" : ""
                  } ${i < pubs.length - 2 ? "border-b" : i < pubs.length - 1 ? "border-b sm:border-b-0" : ""}`}
                >
                  <span className="font-mono text-lg font-semibold text-brand">
                    {p.venue}
                  </span>
                  <span className="text-sm text-ink-mute">{p.title}</span>
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

/**
 * ORGA architecture schematic placeholder.
 */
function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 640 220"
      className="w-full max-w-2xl"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="20" y="70" width="140" height="80" rx="2" stroke="#0F7D76" strokeOpacity="0.7" />
      <text x="90" y="115" textAnchor="middle" fill="#13213C" fontSize="13" fontFamily="monospace">
        Few demos
      </text>
      <path d="M170 110 H220" stroke="#0F7D76" strokeOpacity="0.5" />
      <rect x="220" y="50" width="160" height="120" rx="2" stroke="#0F7D76" />
      <text x="300" y="95" textAnchor="middle" fill="#0F7D76" fontSize="12" fontFamily="monospace">
        Object-centric
      </text>
      <text x="300" y="115" textAnchor="middle" fill="#13213C" fontSize="12">
        Representation
      </text>
      <text x="300" y="140" textAnchor="middle" fill="#546478" fontSize="11">
        + Geometric priors
      </text>
      <path d="M380 110 H430" stroke="#0F7D76" strokeOpacity="0.5" />
      <rect x="430" y="30" width="90" height="50" rx="2" stroke="#223A66" strokeOpacity="0.8" />
      <text x="475" y="60" textAnchor="middle" fill="#13213C" fontSize="11">
        Objects
      </text>
      <rect x="430" y="95" width="90" height="50" rx="2" stroke="#223A66" strokeOpacity="0.8" />
      <text x="475" y="125" textAnchor="middle" fill="#13213C" fontSize="11">
        Scenes
      </text>
      <rect x="430" y="160" width="90" height="50" rx="2" stroke="#223A66" strokeOpacity="0.8" />
      <text x="475" y="190" textAnchor="middle" fill="#13213C" fontSize="11">
        Embodiments
      </text>
      <path d="M520 55 H560 M520 120 H560 M520 185 H560" stroke="#0F7D76" strokeOpacity="0.35" />
      <rect x="560" y="70" width="60" height="80" rx="2" stroke="#0F7D76" fill="rgba(15,125,118,0.08)" />
      <text x="590" y="115" textAnchor="middle" fill="#0F7D76" fontSize="11" fontFamily="monospace">
        Zero-shot
      </text>
    </svg>
  );
}
