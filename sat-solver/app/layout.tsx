import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sat-solver-moaz.vercel.app";

export const metadata: Metadata = {
  title: "SAT Solver — Boolean Satisfiability",
  description:
    "A high-performance engine for Boolean Satisfiability problems. Enter any propositional logic formula and instantly compute its full truth table, satisfying assignments, and verdict.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "Boolean Satisfiability Solver",
    description:
      "Evaluate propositional logic formulas with ¬ ∧ ∨ → ↔ operators. Instant truth-table enumeration with satisfying assignments.",
    url: APP_URL,
    siteName: "SAT Solver",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Boolean Satisfiability Solver — Next-Gen Logic Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boolean Satisfiability Solver",
    description:
      "Evaluate propositional logic formulas instantly. Full truth-table enumeration with satisfying assignments.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  keywords: [
    "SAT solver",
    "Boolean satisfiability",
    "propositional logic",
    "truth table",
    "logic calculator",
    "discrete mathematics",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
