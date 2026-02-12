/**
 * Orbital Design System — V5 "Final"
 * Warm cream canvas, pure-black dark mode, Crimson Pro serif.
 * Full colour scales (50-900), orange reserved for high-signal.
 */
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        /* ── Semantic tokens (switch with mode) ── */
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
        "user-bubble": { DEFAULT: "rgb(var(--user-bubble) / <alpha-value>)", foreground: "rgb(var(--user-bubble-foreground) / <alpha-value>)" },
        sidebar: {
          DEFAULT: "rgb(var(--sidebar) / <alpha-value>)",
          foreground: "rgb(var(--sidebar-foreground) / <alpha-value>)",
          accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "rgb(var(--sidebar-border) / <alpha-value>)",
          ring: "rgb(var(--sidebar-ring) / <alpha-value>)",
        },

        /* ── Fixed colour scales (mode-independent) ── */
        orange: {
          50: "rgb(var(--primary-50) / <alpha-value>)",
          100: "rgb(var(--primary-100) / <alpha-value>)",
          200: "rgb(var(--primary-200) / <alpha-value>)",
          300: "rgb(var(--primary-300) / <alpha-value>)",
          400: "rgb(var(--primary-400) / <alpha-value>)",
          500: "rgb(var(--primary-500) / <alpha-value>)",
          600: "rgb(var(--primary-600) / <alpha-value>)",
          700: "rgb(var(--primary-700) / <alpha-value>)",
          800: "rgb(var(--primary-800) / <alpha-value>)",
          900: "rgb(var(--primary-900) / <alpha-value>)",
        },
        cyan: {
          50: "rgb(var(--secondary-50) / <alpha-value>)",
          100: "rgb(var(--secondary-100) / <alpha-value>)",
          200: "rgb(var(--secondary-200) / <alpha-value>)",
          300: "rgb(var(--secondary-300) / <alpha-value>)",
          400: "rgb(var(--secondary-400) / <alpha-value>)",
          500: "rgb(var(--secondary-500) / <alpha-value>)",
          600: "rgb(var(--secondary-600) / <alpha-value>)",
          700: "rgb(var(--secondary-700) / <alpha-value>)",
          800: "rgb(var(--secondary-800) / <alpha-value>)",
          900: "rgb(var(--secondary-900) / <alpha-value>)",
        },
        purple: {
          50: "rgb(var(--accent-50) / <alpha-value>)",
          100: "rgb(var(--accent-100) / <alpha-value>)",
          200: "rgb(var(--accent-200) / <alpha-value>)",
          300: "rgb(var(--accent-300) / <alpha-value>)",
          400: "rgb(var(--accent-400) / <alpha-value>)",
          500: "rgb(var(--accent-500) / <alpha-value>)",
          600: "rgb(var(--accent-600) / <alpha-value>)",
          700: "rgb(var(--accent-700) / <alpha-value>)",
          800: "rgb(var(--accent-800) / <alpha-value>)",
          900: "rgb(var(--accent-900) / <alpha-value>)",
        },
      },
      borderRadius: {
        "ui-sm": "var(--radius-sm)",
        "ui-md": "var(--radius-md)",
        "ui-lg": "var(--radius-lg)",
        "ui-xl": "var(--radius-xl)",
        "ui-2xl": "var(--radius-2xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        "ui-sm": "var(--shadow-sm)",
        "ui-md": "var(--shadow-md)",
        "ui-lg": "var(--shadow-lg)",
      },
      transitionDuration: { micro: "150ms", standard: "200ms", large: "400ms" },
      transitionTimingFunction: { "brand-standard": "cubic-bezier(0.4,0,0.2,1)" },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Crimson Pro", "Georgia", "ui-serif", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        display: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-xl": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "heading-lg": ["1.75rem", { lineHeight: "1.25" }],
        "heading-md": ["1.375rem", { lineHeight: "1.35" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.4" }],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        spin: { to: { transform: "rotate(360deg)" } },
        pulse: { "0%,80%,100%": { transform: "scale(0.7)", opacity: "0.5" }, "40%": { transform: "scale(1)", opacity: "1" } },
        orbit: { to: { transform: "rotate(360deg)" } },
        "progress-slide": { "0%": { transform: "translateX(-100%)" }, "50%": { transform: "translateX(250%)" }, "100%": { transform: "translateX(-100%)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.4,0,0.2,1)",
        "fade-in-up": "fade-in-up 300ms cubic-bezier(0.4,0,0.2,1) both",
        shimmer: "shimmer 2s linear infinite",
        spin: "spin 0.8s linear infinite",
        pulse: "pulse 1.2s ease-in-out infinite",
        orbit: "orbit 1.5s linear infinite",
        "progress-slide": "progress-slide 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".skeleton": {
          background: "linear-gradient(90deg, rgb(var(--muted)) 25%, rgb(var(--muted) / 0.5) 50%, rgb(var(--muted)) 75%)",
          "background-size": "200% 100%",
          animation: "shimmer 2s linear infinite",
          "border-radius": "var(--radius-md)",
        },
      });
    }),
  ],
// Tailwind presets intentionally omit `content`; Tailwind merges `content` from the app config.
} satisfies Partial<Config>;
