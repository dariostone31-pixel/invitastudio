import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["var(--font-jakarta)", "sans-serif"],
        jost: ["var(--font-jost)", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "serif"],
        fraunces: ["var(--font-fraunces)", "serif"],
        script: ["var(--font-script)", "cursive"],
        pinyon: ["var(--font-pinyon)", "cursive"],
        cinzel: ["var(--font-cinzel)", "serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
        fredoka: ["var(--font-fredoka)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
