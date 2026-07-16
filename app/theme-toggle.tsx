"use client";

import { useSyncExternalStore } from "react";

// A blocking script in the layout applies the stored theme to <html> before
// paint. This toggle reads that attribute as external state and flips it.
function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function getSnapshot(): "dark" | "light" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): "dark" | "light" {
  return "light";
}

// A dark circle in light mode, a light circle in dark mode.
function setFavicon(theme: "dark" | "light") {
  const fill = theme === "dark" ? "%23ffffff" : "%23000000";
  const href =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='" +
    fill +
    "'/%3E%3C/svg%3E";
  let link = document.querySelector<HTMLLinkElement>("link#app-favicon");
  if (!link) {
    link = document.createElement("link");
    link.id = "app-favicon";
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setFavicon(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <div className="theme-toggle-bar">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggle}
        aria-label="Toggle light or dark theme"
      >
        {theme === "light" ? "dark" : "light"}
      </button>
    </div>
  );
}
