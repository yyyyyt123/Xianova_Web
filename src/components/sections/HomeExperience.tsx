"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { TRANSFER_MEDIA_ORIGIN } from "@/lib/transfer-demos";
import { FadeIn } from "../FadeIn";
import { ArrowLink, GeometryStudy, SectionLabel, SparkUMRHeading } from "../Editorial";
import "./home-technology-preview.css";

function HomeTechnologyVideo({ description, labels, src, poster }: {
  description: string;
  labels: readonly [string, string];
  src: string;
  poster: string;
}) {
  const t = useTranslations("homeTechnology");
  const ui = useTranslations("experience");
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.pause();
    }, { rootMargin: "-80px 0px 0px 0px" });
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.pause();
    };
  }, []);

  async function play() {
    const element = video.current;
    if (!element) return;
    if (element.error) element.load();
    setLoading(true);
    setFailed(false);
    try {
      await element.play();
      setStarted(true);
      element.focus({ preventScroll: true });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const playLabel = loading ? ui("bufferingDemo") : t("playPreview");

  return (
    <figure className="home-technology-visual" aria-label={description}>
      <figcaption className="home-technology-labels">{labels.map(label => <span key={label}>{label}</span>)}</figcaption>
      <div className="home-technology-player">
        <video
          ref={video}
          src={`${TRANSFER_MEDIA_ORIGIN}${src}`}
          poster={`${TRANSFER_MEDIA_ORIGIN}${poster}`}
          preload="none"
          muted
          playsInline
          controls={started}
          tabIndex={started ? 0 : -1}
          aria-label={description}
          onError={() => { setStarted(false); setFailed(true); }}
        />
        {!started && (
          <button type="button" className="demo-play" disabled={loading} onClick={() => void play()} aria-label={`${playLabel} — ${description}`}>
            <span><svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="m6 3 11 7-11 7V3Z" /></svg>{playLabel}</span>
          </button>
        )}
      </div>
      {failed && <p className="home-technology-playback-error" role="status">{t("previewError")}</p>}
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
          <HomeTechnologyVideo
            description={t("sparkumrPreview")}
            labels={[t("humanSource"), "Fourier GR3"]}
            src="/videos/technology/sparkumr-desk-preview.mp4"
            poster="/images/home-technology/sparkumr-desk-preview.webp"
          />
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
          <HomeTechnologyVideo
            description={t("renderedPreview")}
            labels={[t("referenceLayout"), t("adjustedLayout")]}
            src="/videos/technology/pour-layout-comparison.mp4"
            poster="/images/technology/pour-layout-comparison.webp"
          />
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
  return (
    <section id="invitation" className="home-invitation editorial-section" aria-labelledby="home-invitation-title">
      <div className="editorial-wrap invitation-grid">
        <FadeIn>
          <SectionLabel number="03">{t("together")}</SectionLabel>
          <h2 id="home-invitation-title">{t("invitationTitle")}</h2>
          <p className="invitation-copy">{t("invitationBody")}</p>
        </FadeIn>
        <div className="invitation-links">
          <ArrowLink href="/about">{t("meetTeam")}</ArrowLink>
          <ArrowLink href="/careers">{t("joinTeam")}</ArrowLink>
          <ArrowLink href="/contact">{t("buildTogether")}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
