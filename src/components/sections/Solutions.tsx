"use client";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLink, GeometryStudy, PageIntro, SectionLabel } from "../Editorial";

export function Solutions() {
  const t = useTranslations("solutions");
  const ui = useTranslations("experience");
  const audiences = t.raw("audiences") as { title: string; desc: string }[];
  const details = ui.raw("solutionDetails") as string[];
  const steps = ui.raw("collaborationSteps") as { title: string; description: string }[];
  const [active, setActive] = useState<number | null>(0);
  const id = useId();
  return <>
    <PageIntro index="02" label={t("label")} title={t("title")} description={t("desc")} variant={1} />
    <section className="editorial-section"><div className="editorial-wrap solutions-layout"><div className="solutions-heading"><SectionLabel number="01">{ui("possibilities")}</SectionLabel><h2 className="editorial-title">{ui("solutionsTitle")}</h2><GeometryStudy variant={active ?? 0} /></div>
      <div className="solution-accordion">{audiences.map((item, i) => <article key={item.title} className={active === i ? "is-active" : ""}><h3><button type="button" aria-expanded={active === i} aria-controls={`${id}-${i}`} onClick={() => setActive(active === i ? null : i)}><span>0{i + 1}</span>{item.title}<span aria-hidden="true">{active === i ? "−" : "+"}</span></button></h3><div id={`${id}-${i}`} hidden={active !== i}><p className="solution-lead">{item.desc}</p><p>{details[i]}</p><ArrowLink href="/contact">{ui("discussTask")}</ArrowLink></div></article>)}</div>
    </div></section>
    <section className="editorial-section collaboration-section"><div className="editorial-wrap"><SectionLabel number="02">{ui("collaboration")}</SectionLabel><h2 className="editorial-title">{ui("collaborationTitle")}</h2><div className="open-columns">{steps.map((step, i) => <article className="open-column" key={step.title}><span className="eyebrow">0{i + 1}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div><div className="section-closing"><p>{ui("discussTask")}</p><ArrowLink href="/contact">{ui("buildTogether")}</ArrowLink></div></div></section>
  </>;
}
