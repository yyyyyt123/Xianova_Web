"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const ui = useTranslations("experience");
  return <footer className="site-footer">
    <div className="editorial-wrap">
      <div className="footer-main">
        <div><Link href="/" aria-label="Xianova Robotics" className="inline-flex"><Logo className="!h-14" /></Link><p className="footer-belief">{ui("footerBelief")}</p><a href={`mailto:${t("email")}`} className="footer-email">{t("email")} <span aria-hidden="true">↗</span></a></div>
        <nav aria-label={ui("footerNavigation")} className="footer-nav">{([["/technology", "technology"], ["/solutions", "solutions"], ["/about", "about"], ["/careers", "careers"], ["/contact", "contact"]] as const).map(([href, key]) => <Link href={href} key={href}>{nav(key)}<span aria-hidden="true">↗</span></Link>)}</nav>
        <div className="footer-location"><span className="eyebrow">XIANOVA ROBOTICS</span><p>{t("company")}</p><p>{t("address")}</p><a href="#main-content" className="footer-top">{ui("backTop")} ↑</a></div>
      </div>
      <p className="footer-large-type" aria-hidden="true">XIANOVA<span>ROBOTICS</span></p>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {t("companyEn")}. {t("rights")}</span><span>{t("icp")}</span><span>UNDERSTAND · ACT · GENERALIZE</span></div>
    </div>
  </footer>;
}
