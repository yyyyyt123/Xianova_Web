import { getTranslations } from "next-intl/server";
import { DemoGallery } from "../DemoGallery";
import { ArrowLink } from "../Editorial";
import { TransferShowcase } from "../transfer/TransferShowcase";
import "./technical-pages.css";

export async function CrossEmbodimentPage() {
  const [page, nav, ui] = await Promise.all([
    getTranslations("technicalPages.embodiment"),
    getTranslations("nav"),
    getTranslations("experience"),
  ]);

  return (
    <div className="technical-page">
      <TransferShowcase />
      <section className="editorial-section technical-demo" id="embodiment-rendering" aria-labelledby="embodiment-render-title">
        <div className="editorial-wrap technical-demo-layout">
          <h2 className="editorial-title" id="embodiment-render-title">{page("demoTitle")}</h2>
          <DemoGallery demos={[{
            asset: "pour-embodiment-comparison",
            title: page("pourTitle"),
            description: page("pourDescription"),
            comparisonLabels: ["L7", "Bot2"],
          }]} />
        </div>
      </section>
      <div className="editorial-section technical-related">
        <div className="editorial-wrap technical-related-links">
          <ArrowLink href="/cross-scene">{nav("crossScene")}</ArrowLink>
          <ArrowLink href="/contact">{ui("buildTogether")}</ArrowLink>
        </div>
      </div>
    </div>
  );
}
