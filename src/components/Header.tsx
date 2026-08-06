"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { Logo } from "./Logo";

/**
 * Sticky nav with active route and light/dark adaptive chrome.
 */
export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > (isHome ? window.innerHeight * 0.55 : 12));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/technology" as const, label: t("technology") },
    { href: "/solutions" as const, label: t("solutions") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  const otherLocale = locale === "zh" ? "en" : "zh";
  const onDark = isHome && !scrolled && !open;
  const solid = !isHome || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-line/80 bg-page/85 shadow-[0_1px_0_rgba(19,33,60,0.03)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-12">
        <Link
          href="/"
          className="inline-flex items-center no-underline"
          aria-label="Xianova Robotics"
        >
          <Logo inverted={onDark} priority className="!h-9 md:!h-10" />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`label-mono relative inline-flex h-9 items-center px-3.5 no-underline transition-colors ${
                  onDark
                    ? active
                      ? "text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                    : active
                      ? "text-ink"
                      : "text-ink-mute hover:bg-surface-dim hover:text-ink"
                }`}
              >
                {link.label}
                {active && (
                  <span
                    className={`absolute inset-x-3.5 -bottom-0.5 h-px ${
                      onDark ? "bg-sky" : "bg-brand"
                    }`}
                  />
                )}
              </Link>
            );
          })}
          <Link
            href={pathname}
            locale={otherLocale}
            className={`label-mono ml-1 inline-flex h-9 items-center px-3 no-underline transition-colors ${
              onDark
                ? "text-sky hover:bg-white/10"
                : "text-brand hover:bg-surface-dim"
            }`}
          >
            {otherLocale}
          </Link>
          <Link
            href="/contact"
            className={`label-mono ml-2 inline-flex h-9 items-center px-4 no-underline transition ${
              onDark
                ? "bg-sky text-deep hover:bg-white"
                : "bg-ink text-white hover:bg-brand"
            }`}
          >
            {t("cta")}
          </Link>
        </nav>

        <button
          type="button"
          className={`flex h-10 w-10 items-center justify-center md:hidden ${
            onDark ? "text-white" : "text-ink"
          }`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="flex w-5 flex-col gap-1.5">
            <span
              className={`h-px w-full bg-current transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-full bg-current transition ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-full bg-current transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-page md:hidden">
          <div className="flex flex-col px-5 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`label-mono py-3.5 no-underline ${
                  pathname === link.href ? "text-brand" : "text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={pathname}
              locale={otherLocale}
              onClick={() => setOpen(false)}
              className="label-mono py-3.5 text-brand no-underline"
            >
              {otherLocale === "zh" ? "中文" : "EN"}
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 justify-center"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
