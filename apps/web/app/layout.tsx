import type { ReactNode } from "react";

import { isDemoModeEnabled } from "../lib/demoMode.server";

import "./globals.css";

import { DemoToolbar } from "./DemoToolbar";

export const metadata = {
  title: "Orbital PoC",
  description: "Orbital Copilot PoC",
};

export default function RootLayout(props: { children: ReactNode }) {
  const demoEnabled = isDemoModeEnabled();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {demoEnabled ? <DemoToolbar /> : null}
        {props.children}
      </body>
    </html>
  );
}
