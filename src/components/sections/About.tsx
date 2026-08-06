"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";

type MemberLink = {
  href: string;
  label: string;
  kind: "home" | "github" | "scholar";
};

/** Portrait paths by member index (locale-agnostic). */
const MEMBER_PHOTOS: (string | undefined)[] = [
  "/team/junjia-liu.jpg",
];

/** External profile links by member index (locale-agnostic). */
const MEMBER_LINKS: (MemberLink[] | undefined)[] = [
  [
    {
      href: "https://skylark0924.github.io/",
      label: "Personal homepage",
      kind: "home",
    },
    {
      href: "https://github.com/Skylark0924",
      label: "GitHub",
      kind: "github",
    },
    {
      href: "https://scholar.google.com/citations?user=b55s_oMAAAAJ",
      label: "Google Scholar",
      kind: "scholar",
    },
  ],
];

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
            {members.map((m, i) => {
              const photo = MEMBER_PHOTOS[i];
              const links = MEMBER_LINKS[i];
              return (
                <FadeIn key={m.name} delay={i * 0.06}>
                  <article className="group grid gap-5 border border-line bg-surface p-6 transition duration-300 hover:border-brand/30 md:grid-cols-[132px_1fr] md:gap-8 md:p-8">
                    <div className="relative aspect-[3/4] overflow-hidden bg-surface-dim md:aspect-auto md:min-h-[148px]">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={m.name}
                          fill
                          sizes="132px"
                          className="object-cover object-top"
                          unoptimized
                        />
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(15,125,118,0.12), transparent 60%)",
                            }}
                          />
                          <span className="absolute bottom-4 left-4 font-mono text-3xl font-semibold tabular-nums text-line transition group-hover:text-brand/40">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div>
                          <h2 className="text-lg font-semibold text-ink">
                            {m.name}
                          </h2>
                          <p className="mt-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                            {m.role}
                          </p>
                        </div>
                        {links && links.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {links.map((link) => (
                              <a
                                key={link.kind}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                className="inline-flex h-8 w-8 items-center justify-center border border-line text-ink-mute no-underline transition hover:border-brand/40 hover:text-brand"
                              >
                                <MemberLinkIcon kind={link.kind} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-ink-mute">
                        {m.bio}
                      </p>
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Compact SVG icon for a team member external link.
 * :param kind: link type (home / github / scholar)
 */
function MemberLinkIcon({ kind }: { kind: MemberLink["kind"] }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const,
  };

  if (kind === "home") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.8 2.6 4.2 5.7 4.2 9S14.8 18.4 12 21c-2.8-2.6-4.2-5.7-4.2-9S9.2 5.6 12 3z" />
      </svg>
    );
  }

  if (kind === "github") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 7.5c.85 0 1.71.12 2.51.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10.27 10.27 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
      </svg>
    );
  }

  // Google Scholar mark (graduation cap + medallion)
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M5.242 13.769 0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
    </svg>
  );
}
