"use client";

import { useEffect, useId, useMemo, useRef, useState, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { publicAsset } from "@/lib/public-asset";
import { useBufferedVideoSources } from "./useBufferedVideoSources";

type Demo = {
  asset: string;
  title: string;
  description: string;
  tab?: string;
  comparisonLabels?: readonly [string, string];
};

type DemoGalleryProps = {
  demos: readonly [Demo, ...Demo[]];
};

/** Technical demonstrations with opt-in playback. */
export function DemoGallery({ demos }: DemoGalleryProps) {
  const ui = useTranslations("experience");
  const hasTabs = demos.length > 1;
  const [selected, setSelected] = useState(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const playRequest = useRef(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const demo = demos[selected];
  const src = publicAsset(`/videos/technology/${demo.asset}.mp4`);
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
    if (event.key === "ArrowRight") next = (index + 1) % demos.length;
    else if (event.key === "ArrowLeft") next = (index + demos.length - 1) % demos.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = demos.length - 1;
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
    {hasTabs && <div className="demo-tabs" role="tablist" aria-label={ui("selectDemo")}>
      {demos.map((item, i) => <button ref={el => { tabs.current[i] = el; }} type="button" role="tab" key={item.asset} id={`${id}-tab-${i}`} aria-controls={`${id}-panel`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => choose(i)} onKeyDown={event => navigate(event, i)}>
        {item.tab ?? item.title}
      </button>)}
    </div>}
    <div role={hasTabs ? "tabpanel" : undefined} id={`${id}-panel`} aria-labelledby={hasTabs ? `${id}-tab-${selected}` : undefined} tabIndex={hasTabs ? 0 : undefined}>
      {demo.comparisonLabels && <div className="demo-comparison-labels">
        {demo.comparisonLabels.map(label => <span key={label}>{label}</span>)}
      </div>}
      <div className="demo-screen" ref={screen}>
        <video ref={video} key={src} src={videoSrc} poster={publicAsset(`/images/technology/${demo.asset}.webp`)} controls={started} playsInline preload="auto" onPlay={() => setStarted(true)} onError={() => setFailed(true)} aria-label={demo.title} />
        {!started && <button type="button" className="demo-play" disabled={!videoSrc} onClick={() => void play()} aria-label={`${playLabel} — ${demo.title}`}>
          <span><svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="m6 3 11 7-11 7V3Z" /></svg>{playLabel}</span>
        </button>}
      </div>
      <div className="demo-caption"><h3>{demo.title}</h3><p>{demo.description}</p></div>
      {failed && <p role="status" className="demo-error">{ui("videoError")}</p>}
    </div>
  </div>;
}
