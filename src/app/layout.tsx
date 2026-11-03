import { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/brand-icon.png?v=emblem-1", type: "image/png", sizes: "64x64" }],
    shortcut: "/brand-icon.png?v=emblem-1",
    apple: [{ url: "/apple-touch-icon.png?v=emblem-1", sizes: "180x180", type: "image/png" }],
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
