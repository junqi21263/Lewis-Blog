import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "surface-container": "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-low": "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container-high": "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--color-on-surface-variant) / <alpha-value>)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      spacing: {
        "margin-desktop": "80px",
        "section-gap": "160px",
        gutter: "32px",
        "margin-mobile": "24px",
      },
      fontFamily: {
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        serif: ["var(--font-eb-garamond)", "EB Garamond", "serif"],
      },
      fontSize: {
        "body-lg": ["18px", { lineHeight: "32px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "28px", fontWeight: "400" }],
        "label-mono": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "headline-lg": ["48px", { lineHeight: "56px", fontWeight: "400" }],
        "headline-md": ["32px", { lineHeight: "40px", fontWeight: "400" }],
        "headline-mobile": ["36px", { lineHeight: "44px", fontWeight: "400" }],
        "display-xl": ["84px", { lineHeight: "92px", fontWeight: "400" }],
        "display-lg": ["64px", { lineHeight: "72px", fontWeight: "400" }],
      },
      maxWidth: {
        editorial: "1280px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [typography],
};

export default config;
