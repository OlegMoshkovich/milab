import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.miresearchlab.com"),
  title: "Machine Intelligence Research Lab",
  description: "personal machine intelligence for all",
  openGraph: {
    title: "Machine Intelligence Research Lab",
    description: "personal machine intelligence for all",
    url: "https://www.miresearchlab.com",
    siteName: "Machine Intelligence Research Lab",
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
