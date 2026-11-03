"use client";
import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { SectionLabel } from "../Editorial";

export function Why() {
  const t = useTranslations("why");
  const items = t.raw("items") as { title: string; desc: string }[];
  return <section className="editorial-section"><div className="editorial-wrap">
    <FadeIn><SectionLabel number="01">{t("label")}</SectionLabel><h2 className="editorial-title">{t("title")}</h2></FadeIn>
    <div className="open-columns focus-collection">{items.map((item, i) => <div className="open-column focus-item" key={item.title} tabIndex={0}><span className="eyebrow">0{i + 1}</span><h3>{item.title}</h3><p>{item.desc}</p></div>)}</div>
  </div></section>;
}
