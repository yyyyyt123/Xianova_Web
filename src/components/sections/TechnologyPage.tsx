"use client";
import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { ArrowLink, PageIntro, SectionLabel } from "../Editorial";
import { DemoGallery } from "../DemoGallery";
import { Why } from "./Why";
import { Orga } from "./Orga";

export function TechnologyDeepDive() {
  const t = useTranslations("technology");
  const ui = useTranslations("experience");
  const principles = t.raw("principles") as { step: string; title: string; desc: string }[];
  return <>
    <PageIntro index="01" label="ORGA" title={t("heroTitle")} description={t("heroDesc")} />
    <Why /><Orga showLink={false} />
    <section className="editorial-section"><div className="editorial-wrap principles-layout"><FadeIn><SectionLabel number="03">{t("principlesLabel")}</SectionLabel><h2 className="editorial-title">{ui("principlesTitle")}</h2></FadeIn><div className="principle-list focus-collection">{principles.map(p => <article className="principle-row focus-item" key={p.step} tabIndex={0}><span>{p.step}</span><div><h3>{p.title}</h3><p>{p.desc}</p></div></article>)}</div></div></section>
    <section className="editorial-section technology-demos"><div className="editorial-wrap"><FadeIn><SectionLabel number="04">{t("demoTitle")}</SectionLabel><h2 className="editorial-title">{ui("demoTitle")}</h2><p className="editorial-description demo-introduction">{t("demoDesc")}</p></FadeIn><DemoGallery /><div className="section-closing"><p>{ui("discussTask")}</p><ArrowLink href="/contact">{ui("buildTogether")}</ArrowLink></div></div></section>
  </>;
}
