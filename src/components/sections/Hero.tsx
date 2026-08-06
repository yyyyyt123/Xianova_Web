"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { PointCloud } from "../PointCloud";

/**
 * Full-bleed cinematic hero with point cloud and brand claim.
 */
export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-deep">
      <div className="absolute inset-0 opacity-[0.75]">
        <PointCloud />
      </div>

      {/* Soft geometric accent referencing the mark */}
      <div
        className="pointer-events-none absolute -right-[12%] top-[8%] hidden h-[70vmin] w-[70vmin] rounded-full border border-sky/15 md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[6%] top-[16%] hidden h-[50vmin] w-[50vmin] rounded-full border border-sky/10 md:block"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to top, #080D16 0%, color-mix(in srgb, #080D16 55%, transparent) 24%, transparent 52%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, #080D16 55%, transparent) 0%, transparent 38%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, #080D16 40%, transparent) 0%, transparent 14%)",
        }}
      />
      <div className="grain z-[3]" />

      <div className="relative z-10 flex w-full flex-col gap-10 px-8 pb-12 md:flex-row md:items-end md:justify-between md:pb-14 lg:px-16 lg:pb-16">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex items-center gap-3 font-mono text-sm font-semibold text-sky"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky shadow-[0_0_12px_rgba(132,195,255,0.8)]" />
            {t("brand")} · {t("brandZh")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance font-display text-[2rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.5rem]"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link href="/technology" className="btn-sky">
              {t("ctaPrimary")}
            </Link>
            <Link href="/contact" className="btn-ghost">
              {t("ctaSecondary")}
            </Link>
          </motion.div>
        </div>

        <motion.a
          href="#explore"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="group mb-1 flex shrink-0 items-center gap-2.5 self-start text-white/35 no-underline transition hover:text-white/80 md:self-end"
        >
          <span className="label-mono">{t("scrollHint")}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className="transition group-hover:translate-y-0.5"
          >
            <path
              d="M7 1V11M7 11L2 6M7 11L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
