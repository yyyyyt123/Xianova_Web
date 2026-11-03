"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { ArrowLink, GeometryStudy, SectionLabel } from "../Editorial";
import { DemoGallery } from "../DemoGallery";

export function HomeStatement() {
  const t = useTranslations("experience");
  const why = useTranslations("why");
  return <section className="home-statement editorial-section" id="perspective">
    <div className="editorial-wrap statement-grid">
      <FadeIn><SectionLabel number="01">{t("perspective")}</SectionLabel><h2 className="statement-title">{why("title")}<span>{t("statementSecond")}</span></h2></FadeIn>
      <FadeIn className="statement-aside" delay={.1}><p>{t("statementBody")}</p><ArrowLink href="/technology">{t("exploreResearch")}</ArrowLink></FadeIn>
    </div>
  </section>;
}

export function HomeDemonstration() {
  const t = useTranslations("experience");
  return <section className="home-demonstration editorial-section" id="demonstrations">
    <div className="editorial-wrap">
      <FadeIn><div className="editorial-section-heading"><div><SectionLabel number="02">{t("inAction")}</SectionLabel><h2 className="editorial-title">{t("demoTitle")}</h2></div><ArrowLink href="/technology">{t("allDemos")}</ArrowLink></div></FadeIn>
      <DemoGallery featured />
    </div>
  </section>;
}

export function HomePathways() {
  const t = useTranslations("experience");
  const solutions = useTranslations("solutions");
  const audiences = solutions.raw("audiences") as { title: string; desc: string }[];
  return <section className="home-pathways editorial-section" id="explore"><div className="editorial-wrap pathways-grid">
    <FadeIn><SectionLabel number="04">{t("possibilities")}</SectionLabel><h2 className="editorial-title">{t("pathwaysTitle")}</h2><p className="editorial-description">{solutions("desc")}</p><div className="pathways-art"><GeometryStudy variant={2} /></div></FadeIn>
    <div className="pathway-list focus-collection">{audiences.map((item, i) => <ArrowLink href="/solutions" key={item.title} className="pathway-row focus-item"><span className="pathway-number">0{i + 1}</span><span className="pathway-content"><strong>{item.title}</strong><span>{item.desc}</span></span></ArrowLink>)}</div>
  </div></section>;
}

export function HomeInvitation() {
  const t = useTranslations("experience");
  return <section className="home-invitation editorial-section"><div className="editorial-wrap invitation-grid">
    <FadeIn><SectionLabel number="05">{t("together")}</SectionLabel><h2>{t("invitationTitle")}</h2><p>{t("invitationBody")}</p></FadeIn>
    <div className="invitation-links"><ArrowLink href="/about">{t("meetTeam")}</ArrowLink><ArrowLink href="/careers">{t("joinTeam")}</ArrowLink><ArrowLink href="/contact">{t("buildTogether")}</ArrowLink></div>
  </div></section>;
}
