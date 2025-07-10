import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
    moveDot: {
      '0%, 100%': { top: '10px', left: '10px' },
      '25%': { top: '10px', left: 'calc(100% - 14px)' },
      '50%': { top: 'calc(100% - 14px)', left: 'calc(100% - 14px)' },
      '75%': { top: 'calc(100% - 14px)', left: '10px' },
    },
  },
  animation: {
    moveDot: 'moveDot 5.5s linear infinite',
  },
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: {
          100: " #EDE9FE",
          400: " #A78BFA",
          600: " #7C3AED",
          700: " #6D28D9",
          900: " #4C1D95",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
