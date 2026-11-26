"use client";

import { useEffect, useId, useMemo, useRef, useState, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { publicAsset } from "@/lib/public-asset";
import { useBufferedVideoSources } from "./useBufferedVideoSources";

export const DEMO_NAMES = ["human-centric-multimodal-data", "cross-scene-generalization", "cross-embodiment-paxini-t21", "sparkumr-to-fourier-gr3", "sparkumr-fourier-gr3-action", "sparkumr-astribot-q5-l3"] as const;

/** Shared showcase for ORGA multimodal capture, cross-scene & real-robot demos; opt-in playback. */
export function DemoGallery() {
  const t = useTranslations("technology");
  const ui = useTranslations("experience");
  const demos = t.raw("demos") as { title: string; tag: string; desc: string }[];
  const indices = [0, 1, 2];
  const [selected, setSelected] = useState(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const playRequest = useRef(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const demoIndex = indices[selected];
  const demo = demos[demoIndex];
  const src = publicAsset(`/videos/${DEMO_NAMES[demoIndex]}.mp4`);
  const videoUrls = useMemo(() => [src], [src]);
  const videoSrc = useBufferedVideoSources(videoUrls)?.[src];
  const playLabel = videoSrc ? ui("playDemo") : ui("bufferingDemo");

  useEffect(() => {
    const element = screen.current;
    if (!element) return;
    const pause = () => { playRequest.current++; video.current?.pause(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio <= .05) pause();
    }, { rootMargin: "-80px 0px 0px 0px", threshold: .05 });
    const visibility = () => { if (document.hidden) pause(); };
    observer.observe(element);
    document.addEventListener("visibilitychange", visibility);
    return () => { pause(); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  function choose(index: number) {
    if (index === selected) return;
    playRequest.current++;
    video.current?.pause();
    setSelected(index); setStarted(false); setFailed(false);
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % indices.length;
    else if (event.key === "ArrowLeft") next = (index + indices.length - 1) % indices.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = indices.length - 1;
    else return;
    event.preventDefault(); choose(next); tabs.current[next]?.focus({preventScroll: true});
    tabs.current[next]?.scrollIntoView({block: "nearest", inline: "nearest"});
  }
  async function play() {
    const element = video.current;
    if (!element || !videoSrc) return;
    const request = ++playRequest.current;
    setFailed(false);
    try {
      await element.play();
      if (request !== playRequest.current || element !== video.current) { element.pause(); return; }
      setStarted(true);
    } catch (error) {
      if (request === playRequest.current && element === video.current && !(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
    }
  }

  return <div className="demo-gallery">
    <div className="demo-tabs" role="tablist" aria-label={ui("selectDemo")}>
      {indices.map((index, i) => <button ref={el => { tabs.current[i] = el; }} type="button" role="tab" key={index} id={`${id}-tab-${i}`} aria-controls={`${id}-panel`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => navigate(event, i)}>
        <span className="demo-tab-index">0{i + 1}</span><span>{demos[index].tag}</span><span className="demo-tab-mark" aria-hidden="true">↗</span>
      </button>)}
    </div>
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${selected}`} tabIndex={0}>
      <div className="demo-screen" ref={screen}>
        <video ref={video} key={src} src={videoSrc} poster={publicAsset(`/images/demos/${DEMO_NAMES[demoIndex]}.jpg`)} controls={started} playsInline preload="auto" onPlay={() => setStarted(true)} onError={() => setFailed(true)} aria-label={demo.title} />
        {!started && <button type="button" className="demo-play" disabled={!videoSrc} onClick={() => void play()} aria-label={`${playLabel} — ${demo.title}`}><span aria-hidden="true">▷</span><span>{playLabel}</span></button>}
        <span className="demo-screen-label" aria-hidden="true">XIANOVA / IN THE REAL WORLD</span>
      </div>
      <div className="demo-caption"><h3>{demo.title}</h3><p>{demo.desc}</p></div>
      {failed && <p role="status" className="demo-error">{ui("videoError")}</p>}
    </div>
  </div>;
}
