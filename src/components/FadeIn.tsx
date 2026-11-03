"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type FadeInProps = { children: ReactNode; className?: string; delay?: number; y?: number };

/** Content remains visible without JS; only newly entering sections receive an animation. */
export function FadeIn({ children, className = "", delay = 0, y = 28 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    // Do not fade out text that was already visible while the page hydrated.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setEntered(true); observer.disconnect(); }
    }, { rootMargin: "0px 0px -24px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`fade-in${entered ? " has-entered" : ""} ${className}`} style={{ "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` } as CSSProperties}>{children}</div>;
}
