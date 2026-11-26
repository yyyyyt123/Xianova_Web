import { TRANSFER_DEMOS, TRANSFER_MEDIA_ORIGIN, TRANSFER_MEDIA_VERSION } from "./transfer-demos";

export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://www.xianova.ai"
).replace(/\/+$/, "");

export function localizedUrl(_locale: "zh" | "en", path = ""): string {
  const clean = path ? (path.startsWith("/") ? path : `/${path}`) : "/";
  return `${SITE_ORIGIN}${clean}`;
}

export function buildOrganizationJsonLd(locale: "zh" | "en") {
  const isZh = locale === "zh";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: isZh ? "夏仙创新 Xianova Robotics" : "Xianova Robotics",
    legalName: "Shenzhen Xianova Innovation Technology Co., Ltd.",
    alternateName: ["夏仙创新", "深圳夏仙创新科技有限公司", "Xianova"],
    url: SITE_ORIGIN,
    email: "support@xianova.ai",
    description: isZh
      ? "夏仙创新专注具身智能与机器人操作零样本泛化，自主研发 ORGA 架构与 SparkUMR 人—人形全身移动操作跨本体迁移系统。"
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
      name: "Xianova Robotics",
      url: SITE_ORIGIN,
    },
    url: `${localizedUrl(locale)}#cross-embodiment`,
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
