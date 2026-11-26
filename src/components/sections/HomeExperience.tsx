"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";
import { FadeIn } from "../FadeIn";
import { ArrowLink, GeometryStudy, SectionLabel, SparkUMRHeading } from "../Editorial";
import "./home-technology-preview.css";

function HomeTechnologyFrames({ description, frames }: { description: string; frames: { image: string; label: string }[] }) {
  return (
    <figure className="home-technology-visual" aria-label={description}>
      <figcaption className="home-technology-labels">{frames.map(({ label }) => <span key={label}>{label}</span>)}</figcaption>
      <div className="home-technology-frames">
        {frames.map(({ image }) => <Image key={image} src={publicAsset(`/images/home-technology/${image}`)} alt="" width={640} height={480} unoptimized />)}
      </div>
    </figure>
  );
}

export function HomeTechnologyPreview() {
  const t = useTranslations("homeTechnology");
  const nav = useTranslations("nav");

  return (
    <>
      <section className="home-technology-feature editorial-section" id="cross-embodiment" aria-labelledby="home-sparkumr-title">
        <div className="editorial-wrap home-technology-layout" id="demonstrations">
          <div className="home-technology-heading">
            <SparkUMRHeading as="h2" id="home-sparkumr-title" />
            <div className="home-technology-notes">
              <p className="home-technology-description">{t("crossEmbodimentDescription")}</p>
              <ArrowLink href="/cross-embodiment">{t("viewCrossEmbodiment")}</ArrowLink>
            </div>
          </div>
          <HomeTechnologyFrames description={t("sparkumrImageAlt")} frames={[
            { image: "sparkumr-human-desk.webp", label: t("humanSource") },
            { image: "sparkumr-fourier-gr3-desk.webp", label: "Fourier GR3" },
          ]} />
        </div>
      </section>
      <section className="home-technology-feature home-technology-scene editorial-section" id="cross-scene" aria-labelledby="home-cross-scene-title">
        <div className="editorial-wrap home-technology-layout">
          <div className="home-technology-heading">
            <div>
              <p className="technology-eyebrow">ORGA</p>
              <h2 className="home-scene-title" id="home-cross-scene-title">{nav("crossScene")}</h2>
            </div>
            <div className="home-technology-notes">
              <p className="home-technology-description">{t("crossSceneDescription")}</p>
              <ArrowLink href="/cross-scene">{t("viewCrossScene")}</ArrowLink>
            </div>
          </div>
          <HomeTechnologyFrames description={t("renderedPreview")} frames={[
            { image: "pour-reference-layout.webp", label: t("referenceLayout") },
            { image: "pour-adjusted-layout.webp", label: t("adjustedLayout") },
          ]} />
        </div>
      </section>
    </>
  );
}

export function HomeStatement() {
  const t = useTranslations("experience");
  const why = useTranslations("why");
  return <section className="home-statement editorial-section" id="perspective">
    <div className="editorial-wrap statement-grid">
      <FadeIn><SectionLabel number="01">{t("perspective")}</SectionLabel><h2 className="statement-title">{why("title")}<span>{t("statementSecond")}</span></h2></FadeIn>
      <FadeIn className="statement-aside" delay={.1}><p>{t("statementBody")}</p><ArrowLink href="/cross-scene">{t("exploreResearch")}</ArrowLink></FadeIn>
    </div>
  </section>;
}

export function HomePathways() {
  const t = useTranslations("experience");
  const solutions = useTranslations("solutions");
  const audiences = solutions.raw("audiences") as { title: string; desc: string }[];
  return <section className="home-pathways editorial-section" id="explore"><div className="editorial-wrap pathways-grid">
    <FadeIn><SectionLabel number="02">{t("possibilities")}</SectionLabel><h2 className="editorial-title">{t("pathwaysTitle")}</h2><p className="editorial-description">{solutions("desc")}</p><div className="pathways-art"><GeometryStudy variant={2} /></div></FadeIn>
    <div className="pathway-list focus-collection">{audiences.map((item, i) => <ArrowLink href="/solutions" key={item.title} className="pathway-row focus-item"><span className="pathway-number">0{i + 1}</span><span className="pathway-content"><strong>{item.title}</strong><span>{item.desc}</span></span></ArrowLink>)}</div>
  </div></section>;
}

export function HomeInvitation() {
  const t = useTranslations("experience");
  return <section className="home-invitation editorial-section"><div className="editorial-wrap invitation-grid">
    <FadeIn><SectionLabel number="03">{t("together")}</SectionLabel><h2>{t("invitationTitle")}</h2><p>{t("invitationBody")}</p></FadeIn>
    <div className="invitation-links"><ArrowLink href="/about">{t("meetTeam")}</ArrowLink><ArrowLink href="/careers">{t("joinTeam")}</ArrowLink><ArrowLink href="/contact">{t("buildTogether")}</ArrowLink></div>
  </div></section>;
}
