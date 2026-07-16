import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

// Runs before paint so the stored theme (defaulting to light) is applied
// without a flash, and sets a matching favicon: a dark circle in light mode,
// a light circle in dark mode.
const themeScript = `try{var t=localStorage.getItem('theme');t=(t==='dark'||t==='light')?t:'light';document.documentElement.dataset.theme=t;var f=t==='dark'?'%23ffffff':'%23000000';var l=document.createElement('link');l.id='app-favicon';l.rel='icon';l.href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='"+f+"'/%3E%3C/svg%3E";document.head.appendChild(l);}catch(e){}`;

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
        <div className="edge-mask edge-mask-top" aria-hidden="true" />
        {children}
        <ThemeToggle />
        <div className="edge-mask edge-mask-bottom" aria-hidden="true" />
      </body>
    </html>
  );
}
