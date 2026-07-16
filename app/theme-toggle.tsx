"use client";

import { useSyncExternalStore } from "react";

// A blocking script in the layout applies the stored theme to <html> before
// paint. This toggle reads that attribute as external state and flips it.
function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function getSnapshot(): "dark" | "light" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
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
