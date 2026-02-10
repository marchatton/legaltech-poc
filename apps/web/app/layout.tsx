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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <ThemeProvider>
          {demoEnabled ? (
            <DemoToolbar />
          ) : (
            <div className="flex justify-end p-3">
              <ThemeToggle />
            </div>
          )}
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  );
}
