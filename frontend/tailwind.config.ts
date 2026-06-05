import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nav: {
          DEFAULT: "#1A1D2E",
          dark: "#121420",
          light: "#2E334D",
        },
        accent: {
          DEFAULT: "#F84464",
          hover: "#E03251",
          light: "#FFECEF",
        },
        body: "#FAFAFA",
        border: "#EBEBEB",
      },
      boxShadow: {
        soft: "0 1px 6px rgba(0, 0, 0, 0.06)",
        hover: "0 8px 24px -4px rgba(0, 0, 0, 0.1)",
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
