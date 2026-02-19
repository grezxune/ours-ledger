import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
    "A couples-first budgeting app for households that share all money, decisions, and visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${fraunces.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
