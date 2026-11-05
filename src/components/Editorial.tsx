import { ReactNode } from "react";
import { FadeIn } from "./FadeIn";
import { Link } from "@/i18n/routing";

export function GeometryStudy({ variant = 0 }: { variant?: number }) {
  const curves = Array.from({ length: 13 }, (_, i) => {
    const points = Array.from({ length: 101 }, (_, j) => {
      const u = j / 100 * Math.PI * 2;
      const v = i / 12 * Math.PI * 2;
      const radius = 102 + 35 * Math.cos(v);
      const x = radius * Math.cos(u);
      const y = radius * Math.sin(u);
      const z = 35 * Math.sin(v);
      return `${(240 + x).toFixed(3)},${(180 + y * .43 + z * .9 + (variant === 1 ? Math.sin(u * 3) * 19 : 0)).toFixed(3)}`;
    });
    return points.join(" ");
  });
  return <svg viewBox="0 0 480 360" fill="none" aria-hidden="true" className={`geometry-study geometry-study-${variant}`}>
    <path d="M25 180H455M240 18V342" stroke="currentColor" opacity=".14" strokeDasharray="2 6" />
    <g transform={`rotate(${variant === 2 ? -32 : -18} 240 180)`}>
      {curves.map((points, i) => <polyline key={i} points={points} stroke="currentColor" strokeWidth=".65" opacity={.22 + i % 3 * .1} />)}
      <ellipse cx="240" cy="180" rx="138" ry="60" stroke="currentColor" strokeWidth=".9" />
      <circle cx="378" cy="180" r="3" fill="currentColor" />
      <circle cx="102" cy="180" r="2" fill="currentColor" />
    </g>
    <path d="M37 35H57M47 25V45M423 315H443M433 305V325" stroke="currentColor" opacity=".35" />
  </svg>;
}

export function PageIntro({ index, label, title, description, variant = 0 }: { index: string; label: string; title: string; description?: string; variant?: number }) {
  return <section className="page-intro">
    <div className="editorial-wrap page-intro-grid">
      <FadeIn className="page-intro-copy">
        <p className="eyebrow"><span>{index}</span> XIANOVA / {label}</p>
        <h1>{title}</h1>
        {description && <p className="page-intro-description">{description}</p>}
      </FadeIn>
      <div className="page-intro-art"><GeometryStudy variant={variant} /></div>
    </div>
  </section>;
}

export function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return <p className="editorial-label"><span>{number}</span>{children}</p>;
}

export function ArrowLink({ href, children, className = "" }: { href: "/technology" | "/solutions" | "/about" | "/contact" | "/careers"; children: ReactNode; className?: string }) {
  return <Link href={href} className={`arrow-link ${className}`}>{children}<span aria-hidden="true">↗</span></Link>;
}
