"use client";

import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";
import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";
import { ArrowLink, PageIntro, SectionLabel } from "../Editorial";
import { BrandPortrait } from "../BrandPortrait";

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
  return <>
    <PageIntro index="03" label={about("label")} title={about("title")} description={ui("aboutIntro")} variant={2} />
    <section className="editorial-section"><div className="editorial-wrap company-statement"><SectionLabel number="01">{ui("ourFocus")}</SectionLabel><FadeIn><p>{about("company")}</p></FadeIn></div></section>
    <section className="editorial-section team-section"><div className="editorial-wrap">
      <FadeIn><div className="editorial-section-heading"><div><SectionLabel number="02">{team("title")}</SectionLabel><h2 className="editorial-title">{ui("teamTitle")}</h2></div><p className="editorial-description">{team("desc")}</p></div></FadeIn>
      <div className="team-list">{members.map((member, index) => <FadeIn key={member.name}><article className="team-member">
        <span className="team-index">0{index + 1}</span>
        <div className="team-portrait">{index === 0 ? <Image src={publicAsset("/team/junjia-liu.jpg")} alt={member.name} width={300} height={400} unoptimized /> : <BrandPortrait variant={index === 1 ? "orbit" : "structure"} />}</div>
        <div className="team-name"><h3>{member.name}</h3><p>{member.role}</p>{index === 0 && <div className="team-profiles">{profiles.map(([href, label]) => <a href={href} key={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>}</div>
        <p className="team-bio">{member.bio}</p>
      </article></FadeIn>)}</div>
      <div className="section-closing"><p>{ui("teamInvitation")}</p><ArrowLink href="/careers">{ui("joinTeam")}</ArrowLink></div>
    </div></section>
  </>;
}
