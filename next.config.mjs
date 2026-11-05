import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  ...(process.env.XIANOVA_STANDALONE === "1" ? {
    output: "standalone",
    images: { unoptimized: true },
  } : {}),
};

export default withNextIntl(nextConfig);
