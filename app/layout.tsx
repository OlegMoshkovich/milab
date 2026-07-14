import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.miresearchlab.com"),
  title: "machine intelligence research",
  description: "crafting expert owned RL environments",
  openGraph: {
    title: "machine intelligence research",
    description: "crafting expert owned RL environments",
    url: "https://www.miresearchlab.com",
    siteName: "machine intelligence research",
    type: "website",
  },
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
