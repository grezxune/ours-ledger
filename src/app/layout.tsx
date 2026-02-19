import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { GlobalParallaxBackground } from "@/components/layout/global-parallax-background";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Ours Ledger",
    template: "%s | Ours Ledger",
  },
  description:
    "A shared-entity finance app for households and businesses with collaborative roles and full visibility.",
  icons: {
    icon: [
      { url: "/branding/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/branding/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/branding/favicon-32x32.png",
    apple: "/branding/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${fraunces.variable} relative isolate bg-background text-foreground antialiased`}
      >
        <GlobalParallaxBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
