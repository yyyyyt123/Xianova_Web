/** Decorative brand artwork for team members whose portraits are not provided. */
export function BrandPortrait({ variant }: { variant: "orbit" | "structure" }) {
  return <svg viewBox="0 0 300 400" className="team-brand-portrait" aria-hidden="true" fill="none">
    <path fill={variant === "orbit" ? "#e4edf1" : "#e7eef2"} d="M0 0h300v400H0z" />
    <g stroke="#8da4b1" strokeWidth=".65" opacity=".2">
      {[50, 100, 150, 200, 250].map(x => <path key={x} d={`M${x} 0v400`} />)}
      {[50, 100, 150, 200, 250, 300, 350].map(y => <path key={y} d={`M0 ${y}h300`} />)}
    </g>
    <g stroke="#4b748b" strokeWidth=".85">
      {variant === "orbit" ? <g transform="rotate(-28 150 200)">
        {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx="150" cy="200" rx="113" ry={22 + i * 10} opacity={.17 + i * .025} />)}
        <path d="M17 200h266M150 67v266" opacity=".28" strokeDasharray="2 5" />
        <circle cx="263" cy="200" r="4" fill="#4b748b" stroke="none" />
        <circle cx="150" cy="98" r="2.5" fill="#4b748b" stroke="none" />
      </g> : <g transform="rotate(32 150 200)">
        {[182, 152, 122, 92].map((size, i) => <rect key={size} x={150 - size / 2} y={200 - size / 2} width={size} height={size} opacity={.22 + i * .05} />)}
        <circle cx="150" cy="200" r="119" opacity=".25" />
        <path d="M15 200h270M150 65v270" opacity=".28" strokeDasharray="2 5" />
        <circle cx="59" cy="109" r="4" fill="#4b748b" stroke="none" />
        <circle cx="241" cy="291" r="2.5" fill="#4b748b" stroke="none" />
      </g>}
    </g>
    <image href="/apple-touch-icon.png?v=emblem-1" x="101" y="151" width="98" height="98" opacity=".9" />
    <g stroke="#6a899b" opacity=".6" strokeWidth=".8"><path d="M22 34h14M29 27v14M264 366h14M271 359v14" /></g>
    <text x="24" y="365" fill="#617e91" fontFamily="monospace" fontSize="9" letterSpacing="2">XIANOVA</text>
    <text x="24" y="48" fill="#617e91" fontFamily="monospace" fontSize="8" letterSpacing="1.5">{variant === "orbit" ? "02 / ORBIT" : "03 / STRUCTURE"}</text>
  </svg>;
}
