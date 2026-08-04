import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barmous Compliance | AI Workspace Plugins",
  description:
    "Install the read-only Barmous CLI and local MCP plugins for Codex and Claude Code.",
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
