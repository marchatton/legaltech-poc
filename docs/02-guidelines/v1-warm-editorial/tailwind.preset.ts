/**
 * Orbital Design System — V1 "Warm Editorial"
 * Tailwind CSS Preset
 *
 * Usage in tailwind.config.ts:
 *   import orbitalPreset from '@/docs/02-guidelines/v1-warm-editorial/tailwind.preset';
 *   export default { presets: [orbitalPreset], ... } satisfies Config;
 *
 * Requires tokens.css to be imported in your globals.css.
 */

import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  theme: {
    extend: {
      /* ── Colour system ─────────────────────────────────────── */
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--info) / <alpha-value>)",
          foreground: "rgb(var(--info-foreground) / <alpha-value>)",
        },

        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",

        sidebar: {
          DEFAULT: "rgb(var(--sidebar) / <alpha-value>)",
          foreground: "rgb(var(--sidebar-foreground) / <alpha-value>)",
          accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground":
            "rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "rgb(var(--sidebar-border) / <alpha-value>)",
          ring: "rgb(var(--sidebar-ring) / <alpha-value>)",
        },
      },

      /* ── Border radius ─────────────────────────────────────── */
      borderRadius: {
        "ui-sm": "var(--radius-sm)",
        "ui-md": "var(--radius-md)",
        "ui-lg": "var(--radius-lg)",
        "ui-xl": "var(--radius-xl)",
        "ui-2xl": "var(--radius-2xl)",
        pill: "var(--radius-pill)",
      },

      /* ── Shadows ───────────────────────────────────────────── */
      boxShadow: {
        "ui-sm": "var(--shadow-sm)",
        "ui-md": "var(--shadow-md)",
        "ui-lg": "var(--shadow-lg)",
        "ui-xl": "var(--shadow-xl)",
      },

      /* ── Motion ────────────────────────────────────────────── */
      transitionDuration: {
        micro: "var(--duration-micro)",
        standard: "var(--duration-standard)",
        large: "var(--duration-large)",
      },
      transitionTimingFunction: {
        "brand-standard": "var(--ease-standard)",
        "brand-spring": "var(--ease-spring)",
      },

      /* ── Typography ────────────────────────────────────────── */
      fontFamily: {
        sans: [
          "Inter",
          "Switzer",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        serif: ["Crimson Pro", "Signifier", "Georgia", "ui-serif", "serif"],
        mono: [
          "JetBrains Mono",
          "GeistMono",
          "Berkeley Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },

      /* ── Font sizes (extended scale) ───────────────────────── */
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px
        display: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-xl": [
          "2.25rem",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
        "heading-lg": ["1.75rem", { lineHeight: "1.25" }],
        "heading-md": ["1.375rem", { lineHeight: "1.35" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.4" }],
      },

      /* ── Spacing (4px base, extended) ──────────────────────── */
      spacing: {
        "4.5": "1.125rem", // 18px
        "13": "3.25rem", // 52px
        "15": "3.75rem", // 60px
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
      },

      /* ── Keyframes ─────────────────────────────────────────── */
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(4px)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 80%, 100%": { transform: "scale(0.7)", opacity: "0.5" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        orbit: {
          to: { transform: "rotate(360deg)" },
        },
        "progress-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(200%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "toast-enter": {
          from: { opacity: "0", transform: "translateY(100%) scale(0.95)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "dialog-enter": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "overlay-enter": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-standard) var(--ease-standard)",
        "fade-out": "fade-out var(--duration-standard) var(--ease-standard)",
        "slide-in-right":
          "slide-in-right var(--duration-standard) var(--ease-standard)",
        "slide-in-bottom":
          "slide-in-bottom var(--duration-standard) var(--ease-standard)",
        "scale-in": "scale-in var(--duration-standard) var(--ease-standard)",
        shimmer: "shimmer 2s linear infinite",
        spin: "spin 0.8s linear infinite",
        pulse: "pulse 1.2s ease-in-out infinite",
        orbit: "orbit 1.5s linear infinite",
        "orbit-reverse": "orbit 2s linear infinite reverse",
        "orbit-slow": "orbit 2.5s linear infinite",
        "progress-indeterminate":
          "progress-indeterminate 1.5s ease-in-out infinite",
        "toast-enter":
          "toast-enter var(--duration-large) var(--ease-spring) forwards",
        "dialog-enter":
          "dialog-enter var(--duration-standard) var(--ease-standard) forwards",
        "overlay-enter":
          "overlay-enter var(--duration-standard) var(--ease-standard) forwards",
      },
    },
  },
  plugins: [
    /* Utility: .skeleton for loading placeholders */
    plugin(({ addUtilities }) => {
      addUtilities({
        ".skeleton": {
          background:
            "linear-gradient(90deg, rgb(var(--muted)) 25%, rgb(var(--muted) / 0.5) 50%, rgb(var(--muted)) 75%)",
          "background-size": "200% 100%",
          animation: "shimmer 2s linear infinite",
          "border-radius": "var(--radius-md)",
        },
      });
    }),
  ],
} satisfies Config;
