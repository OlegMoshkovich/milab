import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

// Runs before paint so the stored theme is applied without a flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
