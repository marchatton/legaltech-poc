/**
 * Orbital Design System — V3 "Deep Ink"
 * Dark-mode-forward. Default is dark, .dark class flips to light.
 */
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: { DEFAULT: "rgb(var(--card) / <alpha-value>)", foreground: "rgb(var(--card-foreground) / <alpha-value>)" },
        popover: { DEFAULT: "rgb(var(--popover) / <alpha-value>)", foreground: "rgb(var(--popover-foreground) / <alpha-value>)" },
        primary: { DEFAULT: "rgb(var(--primary) / <alpha-value>)", foreground: "rgb(var(--primary-foreground) / <alpha-value>)" },
        secondary: { DEFAULT: "rgb(var(--secondary) / <alpha-value>)", foreground: "rgb(var(--secondary-foreground) / <alpha-value>)" },
        accent: { DEFAULT: "rgb(var(--accent) / <alpha-value>)", foreground: "rgb(var(--accent-foreground) / <alpha-value>)" },
        muted: { DEFAULT: "rgb(var(--muted) / <alpha-value>)", foreground: "rgb(var(--muted-foreground) / <alpha-value>)" },
        destructive: { DEFAULT: "rgb(var(--destructive) / <alpha-value>)", foreground: "rgb(var(--destructive-foreground) / <alpha-value>)" },
        success: { DEFAULT: "rgb(var(--success) / <alpha-value>)", foreground: "rgb(var(--success-foreground) / <alpha-value>)" },
        warning: { DEFAULT: "rgb(var(--warning) / <alpha-value>)", foreground: "rgb(var(--warning-foreground) / <alpha-value>)" },
        info: { DEFAULT: "rgb(var(--info) / <alpha-value>)", foreground: "rgb(var(--info-foreground) / <alpha-value>)" },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        sidebar: {
          DEFAULT: "rgb(var(--sidebar) / <alpha-value>)",
          foreground: "rgb(var(--sidebar-foreground) / <alpha-value>)",
          accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "rgb(var(--sidebar-border) / <alpha-value>)",
          ring: "rgb(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      borderRadius: { "ui-sm": "var(--radius-sm)", "ui-md": "var(--radius-md)", "ui-lg": "var(--radius-lg)", "ui-xl": "var(--radius-xl)", pill: "var(--radius-pill)" },
      boxShadow: { "ui-sm": "0 1px 2px rgba(0,0,0,0.3)", "ui-md": "0 4px 12px rgba(0,0,0,0.4)", "ui-lg": "0 8px 24px rgba(0,0,0,0.5)" },
      transitionDuration: { micro: "150ms", standard: "200ms", large: "400ms" },
      transitionTimingFunction: { "brand-standard": "cubic-bezier(0.4,0,0.2,1)" },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Crimson Pro", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        spin: { to: { transform: "rotate(360deg)" } },
        pulse: { "0%,80%,100%": { transform: "scale(0.7)", opacity: "0.5" }, "40%": { transform: "scale(1)", opacity: "1" } },
        glow: { "0%,100%": { boxShadow: "0 0 8px rgba(255,90,20,0.3)" }, "50%": { boxShadow: "0 0 20px rgba(255,90,20,0.5)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.4,0,0.2,1)",
        shimmer: "shimmer 2s linear infinite",
        spin: "spin 0.8s linear infinite",
        pulse: "pulse 1.2s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".skeleton": {
          background: "linear-gradient(90deg, rgb(var(--muted)) 25%, rgb(var(--muted) / 0.5) 50%, rgb(var(--muted)) 75%)",
          "background-size": "200% 100%", animation: "shimmer 2s linear infinite", "border-radius": "var(--radius-md)",
        },
        ".glow-primary": { "box-shadow": "0 0 12px rgba(255,90,20,0.3)" },
      });
    }),
  ],
} satisfies Config;
