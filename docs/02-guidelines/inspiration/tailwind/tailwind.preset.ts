import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
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

        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
      },
      borderRadius: {
        "ui-sm": "var(--radius-sm)",
        "ui-md": "var(--radius-md)",
        "ui-lg": "var(--radius-lg)",
        "ui-xl": "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        "ui-sm": "0px 1px 2px rgba(0,0,0,0.05)",
        "ui-lg": "0px 8px 24px rgba(0,0,0,0.10)",
      },
      transitionDuration: {
        micro: "150ms",
        standard: "200ms",
        large: "400ms",
      },
      transitionTimingFunction: {
        "brand-standard": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      fontFamily: {
        sans: ["Switzer", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Signifier", "ui-serif", "Georgia", "serif"],
        mono: ["GeistMono", "FT System Mono", "Berkeley Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
} satisfies Config;
