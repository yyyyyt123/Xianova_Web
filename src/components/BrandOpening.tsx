"use client";

import { createContext, useCallback, useContext, useId, useLayoutEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { OPENING_STORAGE_KEY } from "@/lib/brand-opening-boot.mjs";
import "./brand-opening.css";

let seenInDocument = false;
function rememberOpening() {
  seenInDocument = true;
  try { sessionStorage.setItem(OPENING_STORAGE_KEY, "1"); } catch { /* The document flag still prevents repeat playback. */ }
}
type OpeningPhase = "pending" | "idle" | "assembling" | "revealing" | "docked";
const OpeningContext = createContext({ playing: false, holdingHero: false, holdingHeaderLogo: false, canReplay: false, replay: () => {} });
export const useBrandOpening = () => useContext(OpeningContext);

/** SSR opening shell hands off to client playback without exposing the homepage first. */
export function BrandOpeningProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("opening");
  const [phase, setPhase] = useState<OpeningPhase>("pending");
  const playing = phase !== "idle" && phase !== "pending";
  const [canReplay, setCanReplay] = useState(false);
  const logo = useRef<HTMLDivElement>(null);
  const opening = useRef<HTMLDivElement>(null);
  const startedHere = useRef(false);
  const hydrated = useRef(false);
  const id = useId().replace(/:/g, "");
  const finish = useCallback(() => {
    document.documentElement.removeAttribute("data-brand-opening");
    setPhase("idle");
  }, []);
  useLayoutEffect(() => {
    const initialEntry = !hydrated.current;
    hydrated.current = true;
    const boot = document.documentElement.getAttribute("data-brand-opening");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setCanReplay(!preference.matches); if (preference.matches) finish(); };
    update();
    preference.addEventListener("change", update);
    let seen = seenInDocument;
    try { seen ||= sessionStorage.getItem(OPENING_STORAGE_KEY) === "1"; } catch { /* Storage is optional. */ }
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const restored = navigation?.type === "back_forward";
    if (pathname === "/" && (!seen || startedHere.current)) {
      rememberOpening();
      if ((!initialEntry || boot === "pending") && boot !== "expired" && !preference.matches && !restored && !location.hash && window.scrollY < 8 && !document.hidden) {
        // Preserve the initial decision through React's development effect replay.
        startedHere.current = true;
        setPhase("assembling");
      } else finish();
    } else {
      startedHere.current = false;
      finish();
    }
    return () => preference.removeEventListener("change", update);
  }, [pathname, finish]);

  useLayoutEffect(() => {
    if (!playing) return;
    const mark = logo.current;
    const target = document.querySelector<HTMLImageElement>(".site-wordmark img");
    if (!mark || !target || typeof mark.animate !== "function") { finish(); return; }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const page = document.documentElement;
    const oldOverflow = page.style.overflow;
    const oldScroll = page.style.scrollBehavior;
    const background = Array.from(document.querySelectorAll<HTMLElement>(".site-header, #main-content, .site-footer, .skip-link"));
    const oldInert = background.map(element => element.hasAttribute("inert"));
    background.forEach(element => element.setAttribute("inert", ""));
    page.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    page.style.overflow = "hidden";

    const destination = target.getBoundingClientRect();
    const initial = mark.getBoundingClientRect();
    const x = (page.clientWidth - initial.width) / 2;
    const y = (window.innerHeight - initial.height) / 2 - 22;
    const start = `translate3d(${x}px,${y}px,0) scale(1)`;
    mark.style.transform = start;
    const movement = mark.animate([
      { transform: start },
      { transform: `translate3d(${destination.left}px,${destination.top}px,0) scale(${destination.width / initial.width})` },
    ], { delay: 1250, duration: 950, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    movement.onfinish = () => setPhase("docked");

    opening.current?.focus({ preventScroll: true });
    // The animated overlay is now mounted and opaque: release the pre-paint shell gate.
    page.setAttribute("data-brand-opening", "active");
    // Reveal beneath the travelling logo so the homepage is already moving when it lands.
    const reveal = window.setTimeout(() => setPhase("revealing"), 1650);
    // The timeout also releases the page if animation completion events are unavailable.
    const timeout = window.setTimeout(finish, 2400);
    const visibility = () => { if (document.hidden) finish(); };
    window.addEventListener("resize", finish);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(reveal);
      movement.onfinish = null;
      movement.cancel();
      window.removeEventListener("resize", finish);
      document.removeEventListener("visibilitychange", visibility);
      page.style.overflow = oldOverflow;
      page.style.scrollBehavior = oldScroll;
      if (page.getAttribute("data-brand-opening") === "active") page.removeAttribute("data-brand-opening");
      background.forEach((element, index) => { if (!oldInert[index]) element.removeAttribute("inert"); });
      if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
    };
  }, [playing, finish]);

  const replay = () => {
    if (pathname === "/" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rememberOpening(); setPhase("assembling");
    }
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") { event.preventDefault(); opening.current?.focus({ preventScroll: true }); }
  };

  return <OpeningContext.Provider value={{ playing, holdingHero: phase === "assembling", holdingHeaderLogo: phase === "assembling" || phase === "revealing", canReplay, replay }}>
    {children}
    {phase !== "idle" && <div ref={opening} tabIndex={-1} className={`brand-opening${phase === "revealing" || phase === "docked" ? " is-revealing" : ""}${phase === "docked" ? " is-docked" : ""}`} data-phase={phase} role="dialog" aria-modal="true" aria-label={t("label")} onKeyDown={keyboard}>
      <div className="brand-opening-backdrop" aria-hidden="true"><div className="brand-opening-grid" /></div>
      <div className="brand-opening-lockup" ref={logo} aria-hidden="true">
        <svg viewBox="0 0 1600 622" fill="none">
          <defs>
            <clipPath id={`${id}-upper`}><path d="M110 140h340v174H110z" /></clipPath>
            <clipPath id={`${id}-lower`}><path d="M110 314h340v172H110z" /></clipPath>
            <clipPath id={`${id}-type`}><path d="M450 140h1060v346H450z" /></clipPath>
          </defs>
          <circle className="brand-opening-orbit" cx="280" cy="313" r="173" pathLength="1" />
          <image href="/logo.png" width="1600" height="622" clipPath={`url(#${id}-upper)`} className="brand-opening-upper" />
          <image href="/logo.png" width="1600" height="622" clipPath={`url(#${id}-lower)`} className="brand-opening-lower" />
          <image href="/logo.png" width="1600" height="622" clipPath={`url(#${id}-type)`} className="brand-opening-type" />
        </svg>
      </div>
      <p className="brand-opening-caption">{t("tagline")}</p>
      <div className="brand-opening-bottom" aria-hidden="true"><span>XIANOVA / ROBOTICS</span></div>
    </div>}
  </OpeningContext.Provider>;
}
