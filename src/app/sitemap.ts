import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/seo";

const ROUTES = [
  "/",
  "/technology",
  "/solutions",
  "/news",
  "/about",
  "/careers",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-23T00:00:00+08:00");
  return ROUTES.map((route) => ({
    url: `${SITE_ORIGIN}${route}`,
    lastModified,
    changeFrequency: route === "/" || route === "/news" ? "weekly" : "monthly",
    priority: route === "/" ? 1.0 : route === "/technology" ? 0.9 : 0.8,
  }));
}
