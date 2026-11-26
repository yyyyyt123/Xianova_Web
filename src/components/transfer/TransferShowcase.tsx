"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TRANSFER_DEMOS, TRANSFER_ROBOTS, TRANSFER_MEDIA_VERSION, TRANSFER_MEDIA_ORIGIN, type TransferDemo, type TransferRobot } from "@/lib/transfer-demos";
import { publicAsset } from "@/lib/public-asset";
import { SparkUMRHeading } from "../Editorial";
import { useBufferedVideoSources } from "../useBufferedVideoSources";
import "./transfer-showcase.css";

type Mode = "split" | "matrix" | "wipe";
const media = (id: string, role: string, extension = "mp4") => {
  const path = `/videos/transfer/${id}/${role}.${extension}?v=${TRANSFER_MEDIA_VERSION}`;
  return TRANSFER_MEDIA_ORIGIN ? `${TRANSFER_MEDIA_ORIGIN}${path}` : publicAsset(path);
};
const timestamp = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, "0")}:${Math.floor(Math.max(0, seconds) % 60).toString().padStart(2, "0")}`;

function PlayIcon({ paused }: { paused: boolean }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">{paused ? <path d="m6 3 11 7-11 7V3Z" /> : <><path d="M5 3h3v14H5zM12 3h3v14h-3z" /></>}</svg>;
}

/** Wait for real media readiness; abort old requests when changing tasks, modes or robots. */
function ready(video: HTMLVideoElement, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) { resolve(); return; }
    const timeout = window.setTimeout(() => finish(new Error("Media timeout")), 20000);
    function finish(error?: Error) {
      window.clearTimeout(timeout);
      video.removeEventListener("canplay", success);
      video.removeEventListener("error", failure);
      signal.removeEventListener("abort", cancel);
      if (error) reject(error); else resolve();
    }
    const success = () => finish();
    const failure = () => finish(new Error("Media unavailable"));
    const cancel = () => finish(new DOMException("Cancelled", "AbortError"));
    video.addEventListener("canplay", success, { once: true });
    video.addEventListener("error", failure, { once: true });
    signal.addEventListener("abort", cancel, { once: true });
    // Restart only a stream that still needs data and is no longer fetching.
    if (video.networkState !== HTMLMediaElement.NETWORK_LOADING) video.load();
  });
}

function TransferPlayer({
  demo,
  robot,
  mode,
  swapped,
  onFocusRobot,
}: {
  demo: TransferDemo;
  robot: TransferRobot;
  mode: Mode;
  swapped: boolean;
  onFocusRobot: (robot: TransferRobot) => void;
}) {
  const t = useTranslations("transfer");
  const human = useRef<HTMLVideoElement>(null);
  const robotRefs = useRef<Record<TransferRobot, HTMLVideoElement | null>>({
    fourier_gr3: null,
    unitree_g1: null,
    robotera_l3: null,
  });
  const root = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const wantsPlayback = useRef(false);
  const stalled = useRef(false);
  const starting = useRef(false);
  const playToken = useRef(0);
  const prevKey = useRef(`${mode}:${robot}`);
  const loadedRef = useRef(false);
  const speedRef = useRef(1);
  const positionRef = useRef(0);
  const scrubbingRef = useRef(false);
  const resumeAfterScrubRef = useRef(false);
  const scrubInFlightRef = useRef(false);
  const pendingScrubTimeRef = useRef<number | null>(null);
  const scrubTokenRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(demo.duration);
  const [wipe, setWipe] = useState(50);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const robotMeta = TRANSFER_ROBOTS.find(item => item.id === robot)!;
  const robotName = robotMeta.name;
  const id = useId();
  const videoUrls = useMemo(() => [
    media(demo.id, "human"),
    ...TRANSFER_ROBOTS.map(({ id }) => media(demo.id, id)),
  ], [demo.id]);
  const videoSources = useBufferedVideoSources(videoUrls);

  speedRef.current = speed;
  loadedRef.current = loaded;
  positionRef.current = position;

  const getFollowers = useCallback((): HTMLVideoElement[] => {
    if (mode === "matrix") {
      return TRANSFER_ROBOTS.map(item => robotRefs.current[item.id]).filter((el): el is HTMLVideoElement => Boolean(el));
    }
    const active = robotRefs.current[robot];
    return active ? [active] : [];
  }, [mode, robot]);

  const pause = useCallback(() => {
    wantsPlayback.current = false;
    stalled.current = false;
    starting.current = false;
    scrubbingRef.current = false;
    resumeAfterScrubRef.current = false;
    pendingScrubTimeRef.current = null;
    scrubTokenRef.current++;
    playToken.current++;
    abort.current?.abort();
    human.current?.pause();
    for (const el of Object.values(robotRefs.current)) el?.pause();
    setPlaying(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const sourceVideo = human.current;
    const refsSnapshot = robotRefs.current;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); }, { threshold: .05 });
    const visibility = () => { if (document.hidden) pause(); };
    const full = () => setFullscreen(document.fullscreenElement === element);
    observer.observe(element);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("fullscreenchange", full);
    return () => {
      wantsPlayback.current = false;
      scrubbingRef.current = false;
      resumeAfterScrubRef.current = false;
      scrubInFlightRef.current = false;
      pendingScrubTimeRef.current = null;
      abort.current?.abort();
      sourceVideo?.pause();
      for (const el of Object.values(refsSnapshot)) el?.pause();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("fullscreenchange", full);
    };
  }, [pause]);

  const alignAndMaybePlay = useCallback(async (resumeIfPlaying: boolean) => {
    const source = human.current;
    const followers = getFollowers();
    if (!source || followers.length === 0) return;

    const token = ++playToken.current;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;

    starting.current = true;
    stalled.current = false;
    setFailed(false);
    setLoading(true);
    source.pause();
    for (const el of Object.values(robotRefs.current)) el?.pause();

    try {
      await Promise.all([ready(source, controller.signal), ...followers.map(el => ready(el, controller.signal))]);
      if (token !== playToken.current) return;

      setLoaded(true);
      const all = [source, ...followers];
      const finiteDurations = all.map(v => v.duration).filter(Number.isFinite);
      const length = finiteDurations.length ? Math.min(...finiteDurations) : demo.duration;
      if (Number.isFinite(length)) setDuration(length);

      const base = resumeIfPlaying && (source.ended || source.currentTime >= length - .08)
        ? 0
        : (source.currentTime || positionRef.current || 0);
      const clamped = Math.min(Math.max(0, base), Math.max(0, length - .05));

      for (const v of all) {
        if (v.currentTime !== clamped) v.currentTime = clamped;
        v.playbackRate = speedRef.current;
      }
      setPosition(clamped);

      if (resumeIfPlaying && wantsPlayback.current) {
        await Promise.all(all.map(v => v.play()));
        if (token !== playToken.current || !wantsPlayback.current) {
          for (const v of all) v.pause();
          return;
        }
        setPlaying(true);
      } else {
        setPlaying(false);
      }
      starting.current = false;
      setLoading(false);
    } catch (error) {
      if (token !== playToken.current || controller.signal.aborted) return;
      pause();
      if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
    }
  }, [demo.duration, getFollowers, pause]);

  // Keep buffered human video & exact timestamp intact when switching robots or comparison views.
  useEffect(() => {
    if (!videoSources) return;
    const key = `${mode}:${robot}`;
    const selectionChanged = prevKey.current !== key;
    prevKey.current = key;

    const wantsToPlay = wantsPlayback.current;
    const waitingToStart = wantsToPlay && !loadedRef.current && !starting.current;
    const shouldAlign = selectionChanged && (loadedRef.current || wantsToPlay);
    if (waitingToStart || shouldAlign) void alignAndMaybePlay(wantsToPlay);
  }, [alignAndMaybePlay, mode, robot, videoSources]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = 0;
    const sync = (now: number) => {
      const source = human.current;
      const followers = getFollowers();
      if (source && followers.length > 0 && wantsPlayback.current && !stalled.current && !scrubbingRef.current && !source.seeking) {
        for (const el of followers) {
          if (!el.seeking && el.readyState >= 2 && Math.abs(source.currentTime - el.currentTime) > .14) {
            el.currentTime = source.currentTime;
          }
        }
        if (now - last > 90) { setPosition(source.currentTime); last = now; }
      }
      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [getFollowers, playing]);

  function play() {
    wantsPlayback.current = true;
    if (!videoSources) {
      setLoading(true);
      return;
    }
    void alignAndMaybePlay(true);
  }

  function buffer() {
    if (!wantsPlayback.current || !loaded || starting.current || scrubbingRef.current) return;
    const source = human.current;
    const followers = getFollowers();
    if (source?.seeking || followers.some(el => el.seeking)) return;
    stalled.current = true;
    source?.pause();
    for (const el of followers) el.pause();
    setLoading(true);
  }

  async function resume() {
    if (scrubbingRef.current) return;
    const source = human.current;
    const followers = getFollowers();
    if (!stalled.current || !wantsPlayback.current || !source || followers.length === 0) return;
    if (source.readyState < 3 || followers.some(el => el.readyState < 3)) return;
    stalled.current = false;
    starting.current = true;
    for (const el of followers) el.currentTime = source.currentTime;
    const token = playToken.current;
    try {
      await Promise.all([source, ...followers].map(v => v.play()));
      if (token !== playToken.current || !wantsPlayback.current) {
        for (const v of [source, ...followers]) v.pause();
        return;
      }
      starting.current = false;
      setLoading(false);
      setPlaying(true);
    } catch {
      if (token === playToken.current) { pause(); setFailed(true); }
    }
  }

  const waitSeeked = useCallback((video: HTMLVideoElement, timeoutMs = 260) => {
    if (!video.seeking) return Promise.resolve();
    return new Promise<void>(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        video.removeEventListener("seeked", finish);
        video.removeEventListener("error", finish);
        resolve();
      };
      const timer = window.setTimeout(finish, timeoutMs);
      video.addEventListener("seeked", finish, { once: true });
      video.addEventListener("error", finish, { once: true });
    });
  }, []);

  const seek = useCallback((seconds: number) => {
    const source = human.current;
    const followers = getFollowers();
    if (!source || followers.length === 0 || !loaded) return;
    const time = Math.min(Math.max(0, seconds), Math.max(0, duration - .05));
    source.currentTime = time;
    for (const el of followers) el.currentTime = time;
    setPosition(time);
  }, [duration, getFollowers, loaded]);

  const flushScrubQueue = useCallback(async () => {
    if (scrubInFlightRef.current) return;
    scrubInFlightRef.current = true;
    const token = scrubTokenRef.current;

    try {
      while (pendingScrubTimeRef.current !== null && token === scrubTokenRef.current) {
        const targetTime = pendingScrubTimeRef.current;
        pendingScrubTimeRef.current = null;
        const source = human.current;
        const followers = getFollowers();
        if (!source || followers.length === 0) break;

        const all = [source, ...followers];
        for (const v of all) v.currentTime = targetTime;
        await Promise.all(all.map(v => waitSeeked(v, 240)));
      }
    } finally {
      scrubInFlightRef.current = false;
    }
  }, [getFollowers, waitSeeked]);

  function startScrub() {
    if (!loaded || scrubbingRef.current) return;
    scrubbingRef.current = true;
    resumeAfterScrubRef.current = wantsPlayback.current;
    scrubTokenRef.current++;
    // Pause active streams while scrubbing so playback never advances between drag frames.
    human.current?.pause();
    for (const el of getFollowers()) el.pause();
  }

  function scrubTo(seconds: number) {
    if (!loaded) return;
    const time = Math.min(Math.max(0, seconds), Math.max(0, duration - .05));
    setPosition(time);
    if (!scrubbingRef.current) {
      seek(time);
      return;
    }
    pendingScrubTimeRef.current = time;
    void flushScrubQueue();
  }

  function commitScrub(seconds: number) {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    const shouldResume = resumeAfterScrubRef.current && wantsPlayback.current;
    resumeAfterScrubRef.current = false;

    const time = Math.min(Math.max(0, seconds), Math.max(0, duration - .05));
    setPosition(time);
    pendingScrubTimeRef.current = time;

    const token = ++scrubTokenRef.current;
    void (async () => {
      const source = human.current;
      const followers = getFollowers();
      if (!source || followers.length === 0) return;

      const all = [source, ...followers];
      for (const v of all) v.currentTime = time;
      pendingScrubTimeRef.current = null;
      await Promise.all(all.map(v => waitSeeked(v, 500)));

      if (token !== scrubTokenRef.current) return;
      if (shouldResume && wantsPlayback.current) {
        try {
          await Promise.all(all.map(v => v.play()));
          if (token === scrubTokenRef.current && wantsPlayback.current) {
            setPlaying(true);
            setLoading(false);
          }
        } catch {
          if (token === scrubTokenRef.current) { pause(); setFailed(true); }
        }
      }
    })();
  }

  function ended() { pause(); setPosition(duration); }

  function rate(value: number) {
    setSpeed(value);
    if (human.current) human.current.playbackRate = value;
    for (const el of Object.values(robotRefs.current)) {
      if (el) el.playbackRate = value;
    }
  }

  function mediaError() { pause(); setFailed(true); }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.current?.requestFullscreen?.();
    } catch {
      // Embedded browsers may deny fullscreen; keep the inline player usable.
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const el = event.target as HTMLElement;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (event.code === "Space" && tag !== "BUTTON") {
      event.preventDefault();
      if (playing || loading) pause(); else play();
    } else if (loaded && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      seek((human.current?.currentTime ?? position) + (event.key === "ArrowRight" ? 1 : -1));
    }
  }

  const videoProps = {
    muted: true,
    playsInline: true,
    preload: "auto" as const,
    onWaiting: buffer,
    onCanPlay: () => void resume(),
    onEnded: ended,
    onError: mediaError,
    disablePictureInPicture: true,
  };
  const wipeSourcePct = swapped ? 100 - wipe : wipe;
  const wipeTargetPct = 100 - wipeSourcePct;

  return <div className={`transfer-player ${fullscreen ? "is-fullscreen" : ""}`} ref={root} tabIndex={0} onKeyDown={handleKeyDown}>
    <div className={`transfer-stage is-${mode}${swapped && mode !== "matrix" ? " is-swapped" : ""}`} style={{ "--wipe": `${wipe}%` } as CSSProperties}>
      <div className="transfer-view transfer-human">
        <video ref={human} src={videoSources?.[media(demo.id, "human")]} poster={media(demo.id, "human", "webp")} aria-label={t("sourceMotion")} {...videoProps} />
      </div>

      {mode !== "matrix" && (
        <div className="transfer-view transfer-target">
          <video
            key={robot}
            ref={el => { robotRefs.current[robot] = el; }}
            src={videoSources?.[media(demo.id, robot)]}
            poster={media(demo.id, robot, "webp")}
            aria-label={`${t("robotMotion")} ${robotName}`}
            {...videoProps}
          />
        </div>
      )}

      {mode === "split" && <>
        <span className="transfer-view-label is-source"><i aria-hidden="true" />{t("human")}</span>
        <span className="transfer-view-label is-target"><i aria-hidden="true" />{robotName}</span>
      </>}

      {mode === "matrix" && <>
        <span className="transfer-view-label is-source"><i aria-hidden="true" />{t("human")}</span>
        <div className="transfer-matrix-grid">
          {TRANSFER_ROBOTS.map(item => (
            <div key={item.id} className="transfer-matrix-cell">
              <video
                ref={el => { robotRefs.current[item.id] = el; }}
                src={videoSources?.[media(demo.id, item.id)]}
                poster={media(demo.id, item.id, "webp")}
                aria-label={`${t("robotMotion")} ${item.name}`}
                {...videoProps}
              />
              <span className="transfer-matrix-label"><i aria-hidden="true" />{item.name}</span>
              <span className="transfer-matrix-metric">{item.dof} {t("dofUnit")}</span>
              <button
                type="button"
                className="transfer-matrix-zoom"
                onClick={() => onFocusRobot(item.id)}
                aria-label={`${t("inspectRobot")} ${item.name}`}
                title={`${t("inspectRobot")} ${item.name}`}
              >
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          ))}
          <div className="transfer-matrix-summary">
            <div className="transfer-matrix-sum-head">
              <span className="transfer-matrix-code">{t("matrixCode")}</span>
              <span className="transfer-matrix-sum-label">{t("matrixTitle")}</span>
            </div>
            <div className="transfer-matrix-kpi">
              <strong>130</strong><span>{t("matrixKpiUnit")}</span>
            </div>
            <div className="transfer-matrix-bars">
              {TRANSFER_ROBOTS.map(item => {
                const fill = Math.round((item.dof / 60) * 100);
                return (
                  <button key={item.id} type="button" onClick={() => onFocusRobot(item.id)} title={`${t("inspectRobot")} ${item.name}`}>
                    <span>{item.name}</span>
                    <i><b style={{ width: `${fill}%` }} /></i>
                    <em>{item.dof} {t("dofUnit")}</em>
                  </button>
                );
              })}
            </div>
            <p className="transfer-matrix-foot">{t("matrixHint")}</p>
          </div>
        </div>
      </>}

      {mode === "wipe" && <>
        <span className="transfer-view-label is-source"><i aria-hidden="true" />{t("human")}</span>
        <span className="transfer-view-label is-target"><i aria-hidden="true" />{robotName}</span>
        <div className="transfer-wipe-overlay">
          <div className="transfer-divider" aria-hidden="true"><span /></div>
          <input
            className="transfer-wipe-input"
            type="range"
            min="0"
            max="100"
            step="1"
            value={wipe}
            onChange={event => setWipe(Number(event.target.value))}
            aria-label={t("divider")}
            aria-valuetext={t("dividerValue", { source: wipeSourcePct, target: wipeTargetPct })}
          />
          {!playing && !loading && (
            <button type="button" className="transfer-start" onClick={play} aria-label={failed ? t("retry") : t("play")}>
              <PlayIcon paused /><span>{failed ? t("retry") : t("play")}</span>
            </button>
          )}
        </div>
      </>}

      {mode !== "wipe" && !playing && !loading && (
        <button type="button" className="transfer-start" onClick={play} aria-label={failed ? t("retry") : t("play")}>
          <PlayIcon paused /><span>{failed ? t("retry") : t("play")}</span>
        </button>
      )}

      {loading && <div className="transfer-loading" role="status"><span />{t("loading")}</div>}
    </div>

    <div className="transfer-controls">
      <button type="button" className="transfer-play-toggle" onClick={() => playing || loading ? pause() : play()} aria-label={playing || loading ? t("pause") : t("play")}><PlayIcon paused={!playing && !loading} /></button>
      <span className="transfer-time" aria-hidden="true">{timestamp(position)}</span>
      <label className="transfer-timeline" htmlFor={`${id}-time`}>
        <span className="sr-only">{t("timeline")}</span>
        <input
          id={`${id}-time`}
          type="range"
          min="0"
          max={duration}
          step="0.01"
          value={Math.min(position, duration)}
          disabled={!loaded}
          onPointerDown={startScrub}
          onPointerUp={event => commitScrub(Number(event.currentTarget.value))}
          onPointerCancel={event => commitScrub(Number(event.currentTarget.value))}
          onBlur={event => commitScrub(Number(event.currentTarget.value))}
          onChange={event => scrubTo(Number(event.target.value))}
          aria-valuetext={`${timestamp(position)} / ${timestamp(duration)}`}
          style={{ "--progress": `${duration ? position / duration * 100 : 0}%` } as CSSProperties}
        />
      </label>
      <span className="transfer-time transfer-total" aria-hidden="true">{timestamp(duration)}</span>
      <label className="transfer-speed"><span className="sr-only">{t("speed")}</span><select value={speed} onChange={event => rate(Number(event.target.value))} aria-label={t("speed")}><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option></select></label>
      <button type="button" className="transfer-fullscreen" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4" /></svg></button>
    </div>
    <div className="transfer-telemetry" aria-label={t("visualization")}>
      <span>
        {mode === "matrix"
          ? `960×960 · 24 FPS · H.264 · ${t("matrixSummaryTel")}`
          : `960×960 · 24 FPS · H.264 · ${robotMeta.name} (${robotMeta.dof} ${t("dofUnit")}) · ${t("platformTelemetry")}`}
      </span>
      <span className="transfer-shortcuts">{t("shortcuts")}</span>
    </div>
    {failed && <p className="transfer-error" role="alert">{t("error")} <button type="button" onClick={() => { human.current?.load(); for (const el of getFollowers()) el.load(); play(); }}>{t("retry")}</button></p>}
  </div>;
}

/** SparkUMR's synchronized human-to-humanoid task comparisons. */
export function TransferShowcase() {
  const t = useTranslations("transfer");
  const locale = useLocale() === "zh" ? "zh" : "en";
  const [task, setTask] = useState(TRANSFER_DEMOS[0].id);
  const [robot, setRobot] = useState<TransferRobot>("fourier_gr3");
  const [mode, setMode] = useState<Mode>("split");
  const [swapped, setSwapped] = useState(false);
  const demo = TRANSFER_DEMOS.find(item => item.id === task)!;
  const caption = useId();

  function handleRobotTab(nextRobot: TransferRobot) {
    setRobot(nextRobot);
    if (mode === "matrix") setMode("split");
  }

  function handleFocusRobot(nextRobot: TransferRobot) {
    setRobot(nextRobot);
    setMode("split");
  }

  return <section className="transfer-section editorial-section" id="cross-embodiment" aria-labelledby={`${caption}-title`}>
    <div className="editorial-wrap transfer-layout">
      <div className="transfer-section-heading">
        <SparkUMRHeading as="h1" id={`${caption}-title`} />
      </div>
      <div className="transfer-workspace" role="region" aria-labelledby={`${caption}-comparison`}>
        <h2 className="sr-only" id={`${caption}-comparison`}>{t("comparisonTitle")}</h2>
        <aside className="transfer-task-panel" aria-label={t("chooseTask")}>
          <div className="transfer-task-heading"><span>{t("taskLibrary")}</span><span>01—{String(TRANSFER_DEMOS.length).padStart(2, "0")}</span></div>
          <label className="transfer-mobile-select"><span className="sr-only">{t("chooseTask")}</span><select value={task} onChange={event => setTask(event.target.value)}>{TRANSFER_DEMOS.map((item, index) => <option key={item.id} value={item.id}>{String(index + 1).padStart(2, "0")} · {item.title[locale]}</option>)}</select></label>
          <div className="transfer-task-list">{TRANSFER_DEMOS.map((item, index) => <button type="button" key={item.id} aria-pressed={task === item.id} onClick={() => setTask(item.id)}><span className="transfer-task-number">{String(index + 1).padStart(2, "0")}</span><span>{item.title[locale]}<small>{item.tags[locale][0]}</small></span><span className="transfer-task-arrow" aria-hidden="true">↗</span></button>)}</div>
        </aside>
        <div className="transfer-main">
          <div className="transfer-toolbar" data-mode={mode}>
            <div className="transfer-robots" role="group" aria-label={t("chooseRobot")}>
              {TRANSFER_ROBOTS.map(item => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={mode !== "matrix" && robot === item.id}
                  onClick={() => handleRobotTab(item.id)}
                >
                  <span className="transfer-robot-dot" aria-hidden="true" />{item.name}
                </button>
              ))}
            </div>
            <div className="transfer-mode-actions">
              {mode !== "matrix" && (
                <button type="button" className="transfer-swap" aria-pressed={swapped} onClick={() => setSwapped(value => !value)} title={t("swap")} aria-label={t("swap")}>
                  <svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 6h12m0 0-3-3m3 3-3 3M15 12H3m0 0 3-3m-3 3 3 3" /></svg>
                </button>
              )}
              <div className="transfer-modes" role="group" aria-label={t("chooseMode")}>
                <button type="button" aria-pressed={mode === "matrix"} onClick={() => setMode("matrix")}><svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor"><path d="M2 3h5v12H2zM10 3h3v5h-3zM14 3h2v5h-2zM10 10h3v5h-3zM14 10h2v5h-2z" /></svg><span>{t("matrix")}</span></button>
                <button type="button" aria-pressed={mode === "split"} onClick={() => setMode("split")}><svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor"><path d="M1 4h6v10H1zM11 4h6v10h-6z" /></svg><span>{t("split")}</span></button>
                <button type="button" aria-pressed={mode === "wipe"} onClick={() => setMode("wipe")}><svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor"><path d="M9 2v14M3 4H1v10h2m12-10h2v10h-2M5 7l-2 2 2 2m8-4 2 2-2 2" /></svg><span>{t("wipe")}</span></button>
              </div>
            </div>
          </div>
          <TransferPlayer
            key={demo.id}
            demo={demo}
            robot={robot}
            mode={mode}
            swapped={swapped}
            onFocusRobot={handleFocusRobot}
          />
          <div className="transfer-caption" id={caption}><div><span className="transfer-task-code">TASK / {String(TRANSFER_DEMOS.indexOf(demo) + 1).padStart(2, "0")}</span><h3>{demo.title[locale]}</h3></div><div><p>{demo.description[locale]}</p><div className="transfer-tags">{demo.tags[locale].map(tag => <span key={tag}>{tag}</span>)}</div></div></div>
        </div>
      </div>
      <div className="transfer-section-aside">
        <p>{t("description")}</p>
      </div>
      <div className="transfer-benchmarks" aria-label={t("collection")}><span><b>{TRANSFER_DEMOS.length}</b>{t("tasksCount")}</span><span><b>{TRANSFER_ROBOTS.length}</b>{t("robotsCount")}</span></div>
      <div className="transfer-footnote"><p>{t("sourceNote")}</p><span>{t("interactionHint")}</span></div>
      <div className="transfer-pipeline" aria-label={t("pipelineLabel")}>{["observe", "structure", "retarget", "execute"].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{t(`pipeline.${step}`)}</strong>{index < 3 && <i aria-hidden="true">→</i>}</div>)}</div>
    </div>
  </section>;
}
