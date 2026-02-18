import type { ReactNode } from "react";

import Script from "next/script";

import { isDemoModeEnabled } from "../lib/demoMode.server";
import { orbitalMode } from "../lib/runtimeMode";
import { resolveShellEnvironment } from "./(app)/matters/shellEnvironment";

import "./globals.css";

import { DemoToolbar } from "./DemoToolbar";
import { ThemeProvider } from "./ui/ThemeProvider";
import { ThemeToggle } from "./ui/ThemeToggle";

export const metadata = {
  title: "LegalTech PoC",
  description: "LegalTech Copilot PoC",
};

export default function RootLayout(props: { children: ReactNode }) {
  const demoEnabled = isDemoModeEnabled();
  const shellEnv = resolveShellEnvironment(orbitalMode(), demoEnabled);
  const themeInitScript = `(() => {
  try {
    const t = localStorage.getItem("orbital-theme");
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.dataset.theme = "dark";
    } else if (t === "light") {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.dataset.theme = "light";
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.dataset.theme = "system";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.dataset.theme = "system";
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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-ui-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring">
          Skip to content
        </a>
        <ThemeProvider>
          {demoEnabled ? (
            <DemoToolbar environmentLabel={shellEnv.label} />
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
