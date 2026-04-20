import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f6f7f6",
          100: "#e3e7e3",
          200: "#c7d0c7",
          300: "#a3b1a3",
          400: "#7d8f7d",
          500: "#627362",
          600: "#4d5b4d",
          700: "#404a40",
          800: "#363d36",
          900: "#2f342f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
