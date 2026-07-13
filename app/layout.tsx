import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Machine Intelligence Research Lab",
  description: "The Machine Intelligence Research Lab",
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
