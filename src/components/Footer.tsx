"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "./Logo";

/**
 * Editorial footer with logo and site map.
 */
export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface-dim">
      <div className="max-site section-pad !py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex no-underline"
              aria-label="Xianova Robotics"
            >
              <Logo className="!h-10 md:!h-11" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-mute">
              {t("company")}
            </p>
          </div>

          <div>
            <p className="label-mono mb-4 text-ink-faint">{nav("technology")}</p>
            <div className="flex flex-col gap-2.5">
              {(
                [
                  ["/technology", "technology"],
                  ["/solutions", "solutions"],
                  ["/about", "about"],
                  ["/contact", "contact"],
                ] as const
              ).map(([href, key]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-ink-mute no-underline transition hover:text-ink"
                >
                  {nav(key)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="label-mono mb-4 text-ink-faint">{nav("contact")}</p>
            <a
              href={`mailto:${t("email")}`}
              className="font-mono text-sm text-brand no-underline transition hover:opacity-80"
            >
              {t("email")}
            </a>
            <p className="mt-3 text-sm text-ink-mute">{t("address")}</p>
            <p className="mt-8 font-mono text-[11px] text-ink-faint">{t("icp")}</p>
          </div>
        </div>

        <p className="mt-14 border-t border-line pt-8 font-mono text-[11px] tracking-wide text-ink-faint">
          © {year} {t("companyEn")}. {t("rights")}.
        </p>
      </div>
    </footer>
  );
}
