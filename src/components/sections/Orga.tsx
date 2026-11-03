"use client";
import { useTranslations } from "next-intl";
import { ArrowLink, GeometryStudy, SectionLabel } from "../Editorial";
import { FadeIn } from "../FadeIn";

export function Orga({ showLink = true }: { showLink?: boolean }) {
  const t = useTranslations("orga");
  const hero = useTranslations("hero");
  const caps = t.raw("capabilities") as { title: string; desc: string }[];
  return <section className="editorial-section orga-section"><div className="editorial-wrap">
    <div className="orga-overview"><FadeIn><SectionLabel number="02">ORGA</SectionLabel><h2 className="editorial-title">{t("title")}</h2><p className="editorial-description">{t("desc")}</p>{showLink && <ArrowLink href="/technology">{hero("learnMore")}</ArrowLink>}</FadeIn><GeometryStudy /></div>
    <div className="open-columns focus-collection">{caps.map((cap, i) => <div key={cap.title} className="open-column focus-item" tabIndex={0}><span className="eyebrow">0{i + 1}</span><h3>{cap.title}</h3><p>{cap.desc}</p></div>)}</div>
  </div></section>;
}
