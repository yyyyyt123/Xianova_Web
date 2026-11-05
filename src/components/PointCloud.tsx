"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createParticleField, type ParticleField, type ParticleShape } from "@/lib/particle-field";
import { getXianovaMarkPoints } from "@/lib/xianova-mark";

type Props = {
  shape?: ParticleShape;
  animated?: boolean;
  onAvailabilityChange?: (available: boolean) => void;
};

function fallbackPoints(shape: ParticleShape) {
  const mark = getXianovaMarkPoints();
  return Array.from({ length: 1050 }, (_, i) => {
    const u = i * 2.3999632297;
    const v = i * .963373;
    const radius = 1 + .1 * Math.cos(u * 3);
    let x = (radius + .26 * Math.cos(v)) * Math.cos(u);
    let y = (radius + .26 * Math.cos(v)) * Math.sin(u);
    let z = .26 * Math.sin(v);
    if (shape === 0) {
      const position = ((i * 337) % (mark.length / 2)) * 2;
      x = mark[position];
      y = mark[position + 1];
    } else if (shape === 2) {
      const radial = 1 + .075 * Math.cos(3 * u + .2) + .045 * Math.sin(2 * u - .6);
      const twist = .5 * u + 1.22 + .17 * Math.sin(2 * u);
      const across = Math.sin(v) * (.40 + .055 * Math.cos(u - .4) + .025 * Math.sin(3 * u)) * .96;
      x = 1.13 * radial * Math.cos(u) + .07 * Math.cos(2 * u + .3) + across * Math.cos(twist) * Math.cos(u);
      y = .92 * radial * Math.sin(u) + .045 * Math.sin(3 * u) + across * Math.cos(twist) * Math.sin(u);
      z = .18 * Math.sin(2 * u - .4) + .06 * Math.cos(3 * u) + across * Math.sin(twist);
      const azimuth = .72;
      const x1 = x * Math.cos(azimuth) - y * Math.sin(azimuth);
      const y1 = x * Math.sin(azimuth) + y * Math.cos(azimuth);
      const x2 = x1 * Math.cos(.28) + z * Math.sin(.28);
      const z2 = z * Math.cos(.28) - x1 * Math.sin(.28);
      x = x2;
      y = y1 * Math.cos(-.86) - z2 * Math.sin(-.86);
      z = y1 * Math.sin(-.86) + z2 * Math.cos(-.86);
    }
    const perspective = shape === 2 ? 4.8 / (4.8 - z) : 3.8 / (3.8 + z);
    // Keep SSR and browser SVG attributes identical across JS math engines.
    return { x: +(980 + x * 282 * perspective).toFixed(3), y: +(385 - y * 220 * perspective).toFixed(3), opacity: +(.20 + (Math.sin(v) + 1) * .2).toFixed(3) };
  });
}

/** WebGL sculpture with an SSR-visible fallback, context recovery, and complete teardown. */
export function PointCloud({ shape = 0, animated = false, onAvailabilityChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);
  const configRef = useRef({ shape, animated, onAvailabilityChange });
  const [available, setAvailable] = useState(false);
  const fallback = useMemo(() => fallbackPoints(shape), [shape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const initialize = () => {
      fieldRef.current?.dispose();
      fieldRef.current = null;
      try { fieldRef.current = createParticleField(canvas); }
      catch (error) { console.error("Particle renderer initialization failed", error); }
      const ready = !!fieldRef.current;
      setAvailable(ready);
      configRef.current.onAvailabilityChange?.(ready);
      if (fieldRef.current) {
        fieldRef.current.setShape(configRef.current.shape);
        fieldRef.current.setAnimated(configRef.current.animated);
      } else canvas.dataset.renderer = "fallback";
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      fieldRef.current?.dispose();
      fieldRef.current = null;
      canvas.dataset.renderer = "fallback";
      setAvailable(false);
      configRef.current.onAvailabilityChange?.(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", initialize);
    initialize();
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", initialize);
      fieldRef.current?.dispose();
      fieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    configRef.current = { shape, animated, onAvailabilityChange };
    fieldRef.current?.setShape(shape);
    fieldRef.current?.setAnimated(animated);
  }, [shape, animated, onAvailabilityChange]);

  return (
    <div className="particle-art" data-available={available} aria-hidden="true">
      <svg className="particle-art-fallback" viewBox="0 0 1440 900" fill="#586e7b">
        {fallback.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={i % 4 === 0 ? 1.2 : .8} opacity={point.opacity} />)}
      </svg>
      <canvas ref={canvasRef} className="particle-art-canvas" data-renderer="pending" />
    </div>
  );
}
