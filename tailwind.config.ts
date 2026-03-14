import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5932E6",
          light: "#7B5CF0",
          dark: "#4525B8",
        },
        prussian: {
          DEFAULT: "#0D2334",
          light: "#1A3A52",
          dark: "#081828",
        },
        bg: {
          DEFAULT: "var(--bg)",
          deep: "var(--bg-deep)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
        },
        accent: {
          DEFAULT: "#FFA51F",
          light: "#FFB84D",
          dark: "#E68F00",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
        },
      },
      fontFamily: {
        sans: ['"TT Neoris Trial"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 4px 24px rgba(89,50,230,0.18)",
        "brand-lg": "0 8px 48px rgba(89,50,230,0.15)",
        card: "0 2px 12px rgba(13,35,52,0.06)",
        "card-hover": "0 8px 32px rgba(13,35,52,0.1)",
        accent: "0 4px 16px rgba(255,165,31,0.25)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fadeUp 0.8s ease forwards",
        "fade-up-delay": "fadeUp 0.8s ease 0.15s forwards",
        "fade-up-delay-2": "fadeUp 0.8s ease 0.3s forwards",
        "scale-in": "scaleIn 0.6s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
