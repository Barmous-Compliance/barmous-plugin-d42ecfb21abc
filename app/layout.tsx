import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barmous Compliance | Codex Plugin Preview",
  description:
    "Download the public-by-link evaluation preview of the Barmous Compliance Codex plugin.",
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
