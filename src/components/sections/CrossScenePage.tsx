import { getTranslations } from "next-intl/server";
import { DemoGallery } from "../DemoGallery";
import { ArrowLink } from "../Editorial";
import { Orga } from "./Orga";
import { ResearchNotes } from "./ResearchNotes";
import { Why } from "./Why";
import "./technical-pages.css";

export async function CrossScenePage() {
  const [page, nav, ui, technology] = await Promise.all([
    getTranslations("technicalPages.scene"),
    getTranslations("nav"),
    getTranslations("experience"),
    getTranslations("technology"),
  ]);
  const principles = technology.raw("principles") as { step: string; title: string; desc: string }[];

  return (
    <div className="technical-page">
      <section className="editorial-section technical-demo technical-scene-intro" id="scene-demonstration" aria-labelledby="scene-page-title">
        <div className="editorial-wrap technical-demo-layout">
          <div className="technical-scene-heading">
            <div>
              <p className="technology-eyebrow">ORGA</p>
              <h1 id="scene-page-title">{nav("crossScene")}</h1>
            </div>
            <p>{page("intro")}</p>
          </div>
          <h2 className="sr-only">{page("demoTitle")}</h2>
          <DemoGallery demos={[
            {
              asset: "pour-layout-comparison",
              tab: page("layoutTab"),
              title: page("layoutTitle"),
              description: page("layoutDescription"),
              comparisonLabels: [page("referenceLayout"), page("adjustedLayout")],
            },
            {
              asset: "kitchen-scene-reconstruction",
              tab: page("reconstructionTab"),
              title: page("reconstructionTitle"),
              description: page("reconstructionDescription"),
            },
          ]} />
        </div>
      </section>
      <Why />
      <Orga showLink={false} />
      <section className="editorial-section" aria-labelledby="scene-principles-title">
        <div className="editorial-wrap principles-layout">
          <div>
            <p className="editorial-label">{technology("principlesLabel")}</p>
            <h2 className="editorial-title" id="scene-principles-title">{ui("principlesTitle")}</h2>
          </div>
          <div>
            {principles.map(({ step, title, desc }) => (
              <article className="principle-row" key={step}>
                <span aria-hidden="true">{step}</span>
                <div><h3>{title}</h3><p>{desc}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ResearchNotes showLink={false} />
      <div className="editorial-section technical-related">
        <div className="editorial-wrap technical-related-links">
          <ArrowLink href="/cross-embodiment">{nav("crossEmbodiment")}</ArrowLink>
          <ArrowLink href="/contact">{ui("buildTogether")}</ArrowLink>
        </div>
      </div>
    </div>
  );
}
