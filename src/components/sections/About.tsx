"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";

/**
 * About company + team.
 */
export function About() {
  const about = useTranslations("about");
  const team = useTranslations("team");
  const members = team.raw("members") as {
    name: string;
    role: string;
    bio: string;
  }[];

  return (
    <>
      <section className="relative overflow-hidden bg-deep pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grain opacity-25" />
        <div className="max-prose-site relative px-8 md:px-12">
          <FadeIn>
            <p className="font-mono text-sm font-semibold text-sky">
              {about("label")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {about("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              {about("company")}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-page section-pad">
        <div className="max-prose-site">
          <FadeIn>
            <div className="section-rule">
              <span className="section-num">01</span>
              <span className="font-mono text-sm font-semibold text-ink-mute whitespace-nowrap">
                {team("title")}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <p className="text-sm text-ink-mute">{team("desc")}</p>
          </FadeIn>

          <div className="mt-10 space-y-4">
            {members.map((m, i) => (
              <FadeIn key={m.name} delay={i * 0.06}>
                <article className="group grid gap-5 border border-line bg-surface p-6 transition duration-300 hover:border-brand/30 md:grid-cols-[132px_1fr] md:gap-8 md:p-8">
                  <div className="relative flex min-h-[110px] items-end overflow-hidden bg-surface-dim p-4">
                    <div
                      className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(15,125,118,0.12), transparent 60%)",
                      }}
                    />
                    <span className="relative font-mono text-3xl font-semibold tabular-nums text-line transition group-hover:text-brand/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{m.name}</h2>
                    <p className="mt-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                      {m.role}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-ink-mute">
                      {m.bio}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
