"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import "./research-notes.css";

/** Original concept sketches, rather than a reproduction of the ORGA algorithm. */
function ObjectSketch() {
  return (
    <svg viewBox="0 0 440 340" aria-hidden="true" className="research-sketch">
      <g className="research-pencil">
        <path className="research-stroke" d="M45 67C109 32 247 28 331 53C392 72 356 110 259 119C161 130 56 120 48 88C37 61 148 39 275 43" />
        <path className="research-echo" d="M53 73C116 36 252 32 329 57C379 75 345 113 250 122C161 133 62 118 51 92" />
        <text x="86" y="89" className="research-hand" transform="rotate(-5 86 89)">Object-centric</text>
        <path className="research-stroke" d="M111 132Q79 158 121 181M110 170L121 181L104 183" />
        <g transform="translate(129 144) rotate(-5)">
          <ellipse cx="70" cy="37" rx="43" ry="14" />
          <path className="research-stroke" d="M27 37L33 120Q69 139 107 120L113 37M113 55C150 47 152 103 110 105" />
          <path className="research-echo" d="M30 40L35 120Q72 135 104 120M115 61C141 56 142 92 112 97" />
          <path className="research-accent research-stroke" d="M75 83L145 82M137 77L145 82L137 88M75 83L76 18M70 26L76 18L81 27M75 83L40 111M44 102L40 111L50 110" />
          <circle cx="75" cy="83" r="3" className="research-dot" />
          <text x="148" y="88" className="research-small-hand">x</text>
          <text x="72" y="10" className="research-small-hand">z</text>
        </g>
        <text x="66" y="318" className="research-equation">p<tspan baselineShift="sub" fontSize="15">object</tspan> = T<tspan baselineShift="super" fontSize="17">−1</tspan> p<tspan baselineShift="sub" fontSize="15">world</tspan></text>
        <path className="research-stroke" d="M296 180Q328 161 353 174M342 167L353 174L340 179" />
        <text x="300" y="205" className="research-small-hand" transform="rotate(7 300 205)">a new</text>
        <text x="305" y="229" className="research-small-hand" transform="rotate(7 305 229)">perspective</text>
        <path className="research-fine" d="M60 333Q161 328 279 330" />
      </g>
    </svg>
  );
}

function RelationSketch() {
  return (
    <svg viewBox="0 0 440 340" aria-hidden="true" className="research-sketch">
      <g className="research-pencil">
        <text x="54" y="63" className="research-hand" transform="rotate(3 54 63)">Geometric relations</text>
        <path className="research-stroke" d="M38 77Q213 94 395 82M56 83L365 89" />
        <g transform="translate(26 104)">
          <path className="research-fine" d="M13 145L285 145M36 173L36 16M30 25L36 16L42 26" />
          <path className="research-stroke" d="M48 115L109 52L213 74L241 139L125 162Z M109 52L125 162M48 115L162 127L213 74M162 127L241 139" />
          <path className="research-echo" d="M50 117L110 55L211 76L239 138L125 159Z" />
          <path className="research-accent research-stroke" d="M109 52Q175 4 241 56M109 52Q165 52 213 74M162 127L208 114M198 110L208 114L200 121" />
          <circle cx="109" cy="52" r="4" className="research-dot" />
          <circle cx="213" cy="74" r="4" className="research-dot" />
          <circle cx="162" cy="127" r="4" className="research-dot" />
          <path className="research-fine" strokeDasharray="4 7" d="M109 52L213 74L162 127Z" />
          <text x="266" y="57" className="research-small-hand" transform="rotate(-8 266 57)">contact</text>
          <path className="research-stroke" d="M265 66Q252 81 222 77M232 73L222 77L231 82" />
          <text x="272" y="125" className="research-small-hand">structure</text>
          <path className="research-stroke" d="M281 135Q264 164 234 164M244 158L234 164L246 166" />
        </g>
        <text x="71" y="315" className="research-equation">geometry + interaction</text>
        <path className="research-stroke" d="M92 328Q221 322 348 326" />
      </g>
    </svg>
  );
}

function TransferSketch() {
  return (
    <svg viewBox="0 0 440 340" aria-hidden="true" className="research-sketch">
      <g className="research-pencil">
        <text x="78" y="74" className="research-hand" transform="rotate(-4 78 74)">Same relation.</text>
        <text x="137" y="113" className="research-hand" transform="rotate(-4 137 113)">New possibilities.</text>
        <path className="research-stroke" d="M133 122Q245 108 388 106" />
        <g transform="translate(30 156) rotate(-7 60 50)">
          <ellipse cx="47" cy="12" rx="31" ry="10" />
          <path className="research-stroke" d="M16 12L21 85Q48 97 74 85L78 12M78 28C109 23 111 69 76 69" />
          <path className="research-echo" d="M19 14L23 84Q49 93 72 84M79 34C101 30 101 60 77 61" />
          <path className="research-accent research-stroke" d="M6 32L31 40M24 33L31 40L21 42M86 41L64 45M73 38L64 45L74 49" />
        </g>
        <path className="research-stroke" d="M140 198C173 165 193 166 222 189M211 177L222 189L206 190" />
        <text x="153" y="228" className="research-small-hand" transform="rotate(4 153 228)">transfer</text>
        <g transform="translate(248 152) rotate(6 55 55)">
          <path className="research-stroke" d="M35 8Q26 36 16 52L11 99Q49 115 88 99L84 52Q73 36 64 8M35 8Q49 0 64 8M16 52Q50 64 84 52" />
          <path className="research-echo" d="M38 9Q28 38 19 53L14 98Q50 111 85 98L81 53Q72 35 62 10" />
          <path className="research-accent research-stroke" d="M1 70L27 73M19 66L27 73L17 78M102 73L77 75M87 69L77 75L87 80" />
          <path className="research-fine" strokeDasharray="3 6" d="M26 73L78 75" />
        </g>
        <text x="81" y="318" className="research-equation">understand → generalize</text>
        <path className="research-stroke" d="M366 159L375 145M380 172L397 165M359 151L362 132" />
      </g>
    </svg>
  );
}

export function ResearchNotes() {
  const t = useTranslations("researchNotes");
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const sketches = [ObjectSketch, RelationSketch, TransferSketch];
  const notes = t.raw("notes") as { title: string; description: string }[];

  return (
    <section ref={ref} id="research-notes" className={`research-notes${visible ? " is-visible" : ""}`} aria-labelledby="research-notes-title">
      <div className="research-paper-lines" aria-hidden="true" />
      <div className="research-heading">
        <p className="research-label">XIANOVA / RESEARCH NOTES</p>
        <h2 id="research-notes-title">{t("title")}</h2>
        <p className="research-intro">{t("intro")}</p>
      </div>
      <div className="research-spread">
        {sketches.map((Sketch, index) => (
          <figure key={notes[index].title} className="research-note" tabIndex={0}>
            <span className="research-register" aria-hidden="true" />
            <Sketch />
            <figcaption>
              <span className="research-number">0{index + 1}</span>
              <div><h3>{notes[index].title}</h3><p>{notes[index].description}</p></div>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="research-footnote">
        <span>{t("caption")}</span>
        <Link href="/technology">{t("link")}<span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
