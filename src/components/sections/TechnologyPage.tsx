"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { Link } from "@/i18n/routing";
import { Why } from "./Why";
import { Orga } from "./Orga";

/** Demo clips mapped from videos/ by content (web-optimized under public/videos). */
const DEMO_SOURCES = [
  "/videos/human-centric-multimodal-data.mp4",
  "/videos/cross-scene-generalization.mp4",
  "/videos/cross-embodiment-paxini-t21.mp4",
  "/videos/sparkumr-to-fourier-gr3.mp4",
  "/videos/sparkumr-fourier-gr3-action.mp4",
  "/videos/sparkumr-astribot-q5-l3.mp4",
] as const;

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
  const demos = t.raw("demos") as { title: string; tag: string; desc?: string }[];

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

      <section className="bg-surface-dim section-pad">
        <div className="max-prose-site space-y-12">
          <FadeIn>
            <div className="section-rule">
              <span className="section-num">03</span>
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
              <span className="section-num">04</span>
              <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
                {t("demoTitle")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <p className="text-ink-mute">{t("demoDesc")}</p>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {demos.map((d, i) => {
              const src = DEMO_SOURCES[i];
              return (
                <FadeIn key={d.title} delay={i * 0.05}>
                  <figure className="overflow-hidden border border-line bg-deep">
                    <div className="relative aspect-video bg-black">
                      {src ? (
                        <video
                          className="absolute inset-0 h-full w-full object-cover"
                          src={src}
                          controls
                          playsInline
                          preload="metadata"
                          muted
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(132,195,255,0.15),transparent_60%)]" />
                      )}
                    </div>
                    <figcaption className="border-t border-white/10 px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-sky">
                        {d.tag}
                      </p>
                      <p className="mt-1.5 text-base font-semibold text-white">
                        {d.title}
                      </p>
                      {d.desc && (
                        <p className="mt-2 text-sm leading-relaxed text-white/55">
                          {d.desc}
                        </p>
                      )}
                    </figcaption>
                  </figure>
                </FadeIn>
              );
            })}
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
