import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#27272a",
        brand: {
          50: "#f4f4f5",
          500: "#737373",
          600: "#5f5f5f",
          700: "#4a4a4a",
        },
      },
      boxShadow: { soft: "0 18px 50px -24px rgba(15, 23, 42, .28)" },
    },
  },
  plugins: [],
} satisfies Config;
