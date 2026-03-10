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
        saffron: {
          DEFAULT: "#FF6B00",
          deep: "#E55A00",
          light: "#FF8C3A",
        },
        gold: {
          temple: "#D4A017",
        },
        sacred: {
          red: "#C41E3A",
        },
        cream: {
          DEFAULT: "#FFF8F0",
        },
        stone: {
          temple: "#F5E6D3",
        },
        brown: {
          dark: "#3D1C00",
        },
        maroon: {
          deep: "#4A0E0E",
        },
      },
      fontFamily: {
        heading: ["var(--font-yatra-one)", "serif"],
        body: ["var(--font-poppins)", "sans-serif"],
        accent: ["var(--font-tiro-devanagari)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
