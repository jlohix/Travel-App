import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f6",
          100: "#d5ebe8",
          500: "#0e9384",
          600: "#0b7d70",
          700: "#09635a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
