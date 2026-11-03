"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { Logo } from "./Logo";
import { useBrandOpening } from "./BrandOpening";

export function Header() {
  const { holdingHeaderLogo } = useBrandOpening();
  const t = useTranslations("nav");
  const ui = useTranslations("experience");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const otherLocale = locale === "zh" ? "en" : "zh";
  const links = [["/technology", "technology"], ["/solutions", "solutions"], ["/about", "about"], ["/careers", "careers"], ["/contact", "contact"]] as const;

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 24);
    scroll(); window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname, locale]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1200px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  return <>
    <a href="#main-content" className="skip-link">{ui("skipContent")}</a>
    <header className={`site-header${scrolled || open || pathname !== "/" ? " is-solid" : ""}`}>
      <div className="site-header-bar">
        <Link href="/" className={`site-wordmark${holdingHeaderLogo ? " intro-logo-held" : ""}`} aria-label="Xianova Robotics"><Logo priority className="!h-12 md:!h-14" /></Link>
        <nav className="site-desktop-nav" aria-label={ui("navigation")}>
          {links.map(([href, key]) => <Link href={href} key={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>{t(key)}</Link>)}
          <Link href={pathname} locale={otherLocale} className="site-locale" aria-label={ui("switchLanguage")}>{otherLocale.toUpperCase()}</Link>
          <Link href="/contact" className="site-partner">{t("cta")}<span aria-hidden="true">↗</span></Link>
        </nav>
        <button ref={toggle} type="button" className={`site-menu-toggle${open ? " is-open" : ""}`} aria-label={open ? ui("closeMenu") : ui("openMenu")} aria-expanded={open} aria-controls={open ? "site-mobile-menu" : undefined} onClick={() => setOpen(value => !value)}><span /><span /></button>
      </div>
      {open && <nav id="site-mobile-menu" className="site-mobile-nav" aria-label={ui("navigation")}>
        {links.map(([href, key], index) => <Link href={href} key={href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(href) ? "page" : undefined}><span>0{index + 1}</span>{t(key)}<span aria-hidden="true">↗</span></Link>)}
        <div><Link href={pathname} locale={otherLocale} onClick={() => setOpen(false)}>{otherLocale === "zh" ? "中文" : "EN"}</Link><Link href="/contact" onClick={() => setOpen(false)}>{t("cta")} ↗</Link></div>
      </nav>}
    </header>
  </>;
}
