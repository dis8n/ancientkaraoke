import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/*/.{js,ts,jsx,tsx,mdx}",
    "./components/*/.{js,ts,jsx,tsx,mdx}",
    "./app/*/.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in-from-bottom-10": "slideInFromBottom 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInFromBottom: {
          "0%": { 
            opacity: "0",
            transform: "translateY(40px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;