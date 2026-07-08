/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cherry Cola — primary dark tones (cards, buttons, header backgrounds)
        cola: {
          950: "#2C0A0F",
          800: "#5C1620", // primary brand color
          700: "#701B27",
          600: "#7E1E2A",
          500: "#9A2A37",
        },
        // Cream Vanilla — light backgrounds, text-on-dark
        vanilla: {
          50: "#FBF6EC",  // lightest, page backgrounds
          100: "#F5EBD6", // cards on light pages
          200: "#EDDFC0", // borders / dividers
        },
        // Gold accent — CTAs, highlights, active states
        gold: {
          DEFAULT: "#C9A24B",
          dark: "#B58A38",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
      keyframes: {
        strandCut: {
          "0%, 40%": { clipPath: "inset(0 0 0 0)" },
          "48%": { clipPath: "inset(0 46% 0 46%)" },
          "50%": { clipPath: "inset(0 100% 0 0)" },
          "52%": { clipPath: "inset(0 0 0 100%)" },
          "60%, 100%": { clipPath: "inset(0 0 0 0)" },
        },
        snipTop: {
          "0%, 38%": { transform: "rotate(-16deg)" },
          "50%": { transform: "rotate(4deg)" },
          "62%, 100%": { transform: "rotate(-16deg)" },
        },
        snipBottom: {
          "0%, 38%": { transform: "rotate(16deg)" },
          "50%": { transform: "rotate(-4deg)" },
          "62%, 100%": { transform: "rotate(16deg)" },
        },
      },
      animation: {
        strandCut: "strandCut 1.8s ease-in-out infinite",
        snipTop: "snipTop 1.8s ease-in-out infinite",
        snipBottom: "snipBottom 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
