import type { Config } from "tailwindcss";

import preset from "./tailwind.preset";

export default {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
