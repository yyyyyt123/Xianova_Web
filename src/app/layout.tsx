import { ReactNode } from "react";
import "./globals.css";

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
