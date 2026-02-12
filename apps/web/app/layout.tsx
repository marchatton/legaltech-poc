import type { ReactNode } from "react";

import Script from "next/script";

import { isDemoModeEnabled } from "../lib/demoMode.server";

import "./globals.css";

import { DemoToolbar } from "./DemoToolbar";
import { ThemeProvider } from "./ui/ThemeProvider";
import { ThemeToggle } from "./ui/ThemeToggle";

export const metadata = {
  title: "Orbital PoC",
  description: "Orbital Copilot PoC",
};

export default function RootLayout(props: { children: ReactNode }) {
  const demoEnabled = isDemoModeEnabled();
  const themeInitScript = `(() => {
  try {
    const t = localStorage.getItem("orbital-theme");
    if (t === "dark") document.documentElement.classList.add("dark");
    else if (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {
    // best-effort: avoid blocking first paint due to storage access issues
  }
})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <ThemeProvider>
          {demoEnabled ? (
            <DemoToolbar />
          ) : (
            <div className="sticky top-0 z-50 h-12 border-b border-border bg-card/95 backdrop-blur">
              <div className="mx-auto flex h-full w-full items-center justify-end px-4 lg:px-6">
                <ThemeToggle />
              </div>
            </div>
          )}
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  );
}
