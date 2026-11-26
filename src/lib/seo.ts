import type { Metadata } from "next";
import { TRANSFER_DEMOS, TRANSFER_MEDIA_ORIGIN, TRANSFER_MEDIA_VERSION } from "./transfer-demos";

export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.xianova.ai"
).replace(/\/+$/, "");

const COMPANY_LEGAL_NAME = "夏仙创新（深圳）科技有限公司";
const CHINESE_BRAND_NAME = "夏仙创新";
const ENGLISH_BRAND_NAME = "Xianova Robotics";

export function localizedSiteName(locale: string): string {
  return locale === "zh" ? `${CHINESE_BRAND_NAME} ${ENGLISH_BRAND_NAME}` : ENGLISH_BRAND_NAME;
}

export function localizedUrl(_locale: "zh" | "en", path = ""): string {
  const clean = path ? (path.startsWith("/") ? path : `/${path}`) : "/";
  return `${SITE_ORIGIN}${clean}`;
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: localizedSiteName("zh"),
    alternateName: [ENGLISH_BRAND_NAME, CHINESE_BRAND_NAME],
    url: localizedUrl("zh"),
  };
}

export function buildTechnicalPageMetadata(
  locale: "zh" | "en",
  path: "/cross-embodiment" | "/cross-scene",
  title: string,
  description: string,
): Metadata {
  const url = localizedUrl(locale, path);
  const siteName = localizedSiteName(locale);
  const pageTitle = `${title} | ${siteName}`;

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: pageTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        zh: localizedUrl("zh", path),
        en: localizedUrl("en", path),
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      siteName,
    },
  };
}

export function buildOrganizationJsonLd(locale: "zh" | "en") {
  const isZh = locale === "zh";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: localizedSiteName(locale),
    legalName: COMPANY_LEGAL_NAME,
    alternateName: [CHINESE_BRAND_NAME, "Xianova"],
    url: SITE_ORIGIN,
    email: "support@xianova.ai",
    description: isZh
      ? `${COMPANY_LEGAL_NAME}专注具身智能与机器人操作零样本泛化，自主研发 ORGA 架构与 SparkUMR 人—人形全身移动操作跨本体迁移系统。`
      : "Xianova Robotics specializes in zero-shot generalization for robot manipulation, building the ORGA architecture and SparkUMR human-to-humanoid cross-embodiment loco-manipulation transfer system.",
    knowsAbout: [
      "Cross-embodiment transfer",
      "Human-to-humanoid motion retargeting",
      "Loco-manipulation",
      "Zero-shot robot manipulation generalization",
      "ORGA architecture",
      "SparkUMR",
      "跨本体迁移",
      "人-人形全身移动操作",
      "具身智能零样本泛化",
    ],
  };
}

export function buildSparkumrSoftwareJsonLd(locale: "zh" | "en") {
  const isZh = locale === "zh" ? true : false;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SparkUMR",
    applicationCategory: "RoboticsSimulationApplication",
    operatingSystem: "Windows, Linux, macOS",
    softwareVersion: "1.0.0",
    creator: {
      "@type": "Organization",
      name: localizedSiteName(locale),
      url: SITE_ORIGIN,
    },
    url: localizedUrl(locale, "/cross-embodiment"),
    description: isZh
      ? "面向人—人形全身移动操作的跨本体动作迁移（Cross-Embodiment Motion Retargeting）工具链，支持将人类全身与手物接触示教精确迁移至 Fourier GR3、Unitree G1、Robotera L3 等多种人形机器人本体。"
      : "Unified human-to-humanoid cross-embodiment motion retargeting toolchain for whole-body loco-manipulation, transferring human demonstrations with contact constraints onto Fourier GR3, Unitree G1, and Robotera L3.",
    featureList: isZh
      ? [
          "人—人形全身移动操作跨本体迁移",
          "手部与手指精细接触约束保持",
          "足底贴地与全身平衡姿态协调",
          "支持 Fourier GR3 (53-DOF)、Unitree G1 (37-DOF)、Robotera L3 (55-DOF)",
          "支持 SMPL-H / AMASS / FBX 示教源",
        ]
      : [
          "Human-to-humanoid whole-body loco-manipulation transfer",
          "Contact-constrained hand and finger alignment",
          "Foot flattening and ground contact constraints",
          "Supports Fourier GR3 (53-DOF), Unitree G1 (37-DOF), Robotera L3 (55-DOF)",
          "Compatible with SMPL-H, AMASS, and FBX demonstrations",
        ],
  };
}

export function buildTransferVideosJsonLd(locale: "zh" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      locale === "zh"
        ? "夏仙创新跨本体全身移动操作演示集"
        : "Xianova Cross-Embodiment Loco-Manipulation Benchmark",
    numberOfItems: TRANSFER_DEMOS.length,
    itemListElement: TRANSFER_DEMOS.map((demo, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: demo.title[locale],
        description: demo.description[locale],
        thumbnailUrl: `${TRANSFER_MEDIA_ORIGIN}/videos/transfer/${demo.id}/fourier_gr3.webp?v=${TRANSFER_MEDIA_VERSION}`,
        contentUrl: `${TRANSFER_MEDIA_ORIGIN}/videos/transfer/${demo.id}/fourier_gr3.mp4?v=${TRANSFER_MEDIA_VERSION}`,
        duration: `PT${Math.round(demo.duration)}S`,
        uploadDate: "2026-11-22T00:00:00+08:00",
      },
    })),
  };
}
