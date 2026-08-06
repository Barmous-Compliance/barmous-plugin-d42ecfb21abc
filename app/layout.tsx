import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barmous Compliance | MCP & CLI Connections",
  description:
    "Connect Barmous Compliance to Codex, Claude, Cursor, Antigravity, Perplexity, Kimi Code, and Hermes through the read-only MCP and CLI.",
  icons: {
    icon: "/barmous-mark.png",
    shortcut: "/barmous-mark.png",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  referrer: "no-referrer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
