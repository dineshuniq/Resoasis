import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // <--- THIS LINE IS CRITICAL FOR NEXT.JS APP ROUTER
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;