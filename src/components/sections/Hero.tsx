"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { PointCloud } from "../PointCloud";
import { useBrandOpening } from "../BrandOpening";
import type { ParticleShape } from "@/lib/particle-field";
import "./particle-hero.css";

// Lead with the spatial sculpture; retain the official mark as an optional form.
const SHAPE_ORDER: readonly ParticleShape[] = [2, 1, 0];

/** A restrained editorial stage for the live particle sculpture. */
export function Hero() {
  const t = useTranslations("hero");
  const p = useTranslations("particleHero");
  const intro = useTranslations("opening");
  const { playing, holdingHero, canReplay, replay } = useBrandOpening();
  const [shape, setShape] = useState<ParticleShape>(2);
  const [animated, setAnimated] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [keywordsVisible, setKeywordsVisible] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const settings = useRef<HTMLDetailsElement>(null);
  const shapeLabels = p.raw("shapes") as string[];
  const keywords = p.raw("rotatingWords") as string[];

  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    let inView = true;
    const update = () => setKeywordsVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 1023px)");
    const update = () => setAnimated(!preference.matches && !narrow.matches);
    update();
    preference.addEventListener("change", update);
    narrow.addEventListener("change", update);
    return () => { preference.removeEventListener("change", update); narrow.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (settings.current?.open && event.target instanceof Node && !settings.current.contains(event.target)) settings.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && settings.current?.open) {
        settings.current.open = false;
        settings.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  useEffect(() => { if (playing && settings.current) settings.current.open = false; }, [playing]);

  const closeSettings = () => {
    if (!settings.current) return;
    settings.current.open = false;
    settings.current.querySelector("summary")?.focus({ preventScroll: true });
  };

  return (
    <section ref={hero} id="particle-hero" className={`particle-hero${playing ? " intro-active" : ""}${holdingHero ? " intro-held" : ""}`} aria-labelledby="particle-hero-title" data-keywords-playing={keywordsVisible && !playing && !holdingHero}>
      <div className="particle-stage">
        <PointCloud shape={shape} animated={animated && !holdingHero} onAvailabilityChange={setAvailable} />
      </div>
      <div className="particle-hero-shade" aria-hidden="true" />
      <div className="particle-hero-grid" aria-hidden="true" />
      <div className="particle-hero-copy">
        <h1 id="particle-hero-title" className="particle-title particle-arrive" aria-label={`${p("titleLineOne")} ${p("titleLineTwo")}`}>
          <span aria-hidden="true">{p("titleLineOne")}</span>
          <span className="particle-keywords" aria-hidden="true" style={{ "--keyword-count": keywords.length } as CSSProperties}>
            {keywords.map((word, index) => <span key={word} className="particle-keyword" style={{ "--keyword-index": index } as CSSProperties}>
              {Array.from(word).map((character, i, characters) => <span key={i} className="particle-keyword-character" style={{ "--character-delay": `${i / Math.max(1, characters.length - 1) * .16}s` } as CSSProperties}>{character}</span>)}
            </span>)}
          </span>
        </h1>
      </div>

      <div className="particle-hero-bottom">
        <a href="#perspective" className="particle-read-on">{t("scrollHint")}<span aria-hidden="true">↓</span></a>
        <details ref={settings} className="particle-settings">
          <summary aria-label={p("visualSettings")}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M2 5h12M2 11h12" /><circle cx="6" cy="5" r="2" fill="var(--background)" /><circle cx="10" cy="11" r="2" fill="var(--background)" /></svg>
            {p("visualSettingsShort")}
          </summary>
          <div className="particle-settings-panel">
            <div className="particle-shapes" role="group" aria-label={p("chooseShape")}>
              {SHAPE_ORDER.map(form => <button key={form} type="button" aria-pressed={shape === form} className={shape === form ? "is-active" : ""} onClick={() => { setShape(form); closeSettings(); }}>
                <span>{shapeLabels[form]}</span><span aria-hidden="true">{shape === form ? "✓" : ""}</span>
              </button>)}
            </div>
            <div className="particle-settings-actions">
              {available !== false ? <button type="button" className="particle-motion-control" onClick={() => { setAnimated(value => !value); closeSettings(); }} aria-pressed={animated} aria-label={animated ? p("pause") : p("play")}>
                <span>{animated ? p("pause") : p("play")}</span><span aria-hidden="true">{animated ? "Ⅱ" : "▷"}</span>
              </button> : <p className="particle-fallback-note">{p("fallback")}</p>}
              {canReplay && <button type="button" className="particle-replay" onClick={() => { closeSettings(); replay(); }}><span>{intro("replay")}</span><span aria-hidden="true">↻</span></button>}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
