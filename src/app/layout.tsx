import { ReactNode } from "react";
import type { Metadata } from "next";
import { publicAsset } from "@/lib/public-asset";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: publicAsset("/brand-icon.png?v=emblem-1"), type: "image/png", sizes: "64x64" }],
    shortcut: publicAsset("/brand-icon.png?v=emblem-1"),
    apple: [{ url: publicAsset("/apple-touch-icon.png?v=emblem-1"), sizes: "180x180", type: "image/png" }],
  },
};

type Props = {
  children: ReactNode;
};

/**
 * Root layout — locale-specific chrome lives under [locale].
 * @param children, nested route tree
 */
export default function RootLayout({ children }: Props) {
  return children;
}
