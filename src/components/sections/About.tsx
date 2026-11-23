"use client";

import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";
import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { ArrowLink, PageIntro, SectionLabel } from "../Editorial";

const profiles = [
  ["https://skylark0924.github.io/", "Homepage"],
  ["https://github.com/Skylark0924", "GitHub"],
  ["https://scholar.google.com/citations?user=b55s_oMAAAAJ", "Google Scholar"],
];

export function About() {
  const about = useTranslations("about");
  const team = useTranslations("team");
  const ui = useTranslations("experience");
  const members = team.raw("members") as { name: string; role: string; bio: string }[];
  const disciplines = team.raw("disciplines") as { code: string; title: string; desc: string }[];
  const founder = members[0];
  return <>
    <PageIntro index="03" label={about("label")} title={about("title")} description={ui("aboutIntro")} variant={2} />
    <section className="editorial-section"><div className="editorial-wrap company-statement"><SectionLabel number="01">{ui("ourFocus")}</SectionLabel><FadeIn><p>{about("company")}</p></FadeIn></div></section>
    <section className="editorial-section team-section"><div className="editorial-wrap">
      <FadeIn><div className="editorial-section-heading"><div><SectionLabel number="02">{team("title")}</SectionLabel><h2 className="editorial-title">{ui("teamTitle")}</h2></div><p className="editorial-description">{team("desc")}</p></div></FadeIn>
      {founder && <FadeIn><article className="founder-feature">
        <div className="founder-portrait"><Image src={publicAsset("/team/junjia-liu.jpg")} alt={founder.name} width={300} height={400} unoptimized /></div>
        <div className="founder-detail">
          <div className="founder-meta"><span>01</span><span>{founder.role}</span></div>
          <h3>{founder.name}</h3>
          <p className="founder-bio">{founder.bio}</p>
          <div className="team-profiles">{profiles.map(([href, label]) => <a href={href} key={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
        </div>
      </article></FadeIn>}
      {disciplines.length > 0 && <FadeIn><div className="team-disciplines">
        <p className="eyebrow team-disciplines-label">{team("disciplinesLabel")}</p>
        <div className="team-discipline-grid">{disciplines.map((item) => <article key={item.code} className="team-discipline-card">
          <span className="team-index">{item.code}</span>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </article>)}</div>
      </div></FadeIn>}
      <div className="section-closing"><p>{ui("teamInvitation")}</p><ArrowLink href="/careers">{ui("joinTeam")}</ArrowLink></div>
    </div></section>
  </>;
}
