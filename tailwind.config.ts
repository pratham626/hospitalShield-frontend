import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F8FAFC",
        foreground: "#0F172A",
        navy: {
          DEFAULT: "#111827",
          50: "#F8FAFC",
          100: "#F1F5F9",
          800: "#1E293B",
          900: "#111827",
          950: "#0B1220",
        },
        sidebar: {
          DEFAULT: "#0B1220",
          hover: "#152033",
          active: "#1E2D4A",
          border: "#1F2E47",
          text: "#94A3B8",
          textHover: "#F8FAFC",
        },
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
          50: "#F0FDF4",
          100: "#DCFCE7",
          600: "#16A34A",
          700: "#15803D",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
          50: "#FFFBEB",
          100: "#FEF3C7",
          600: "#D97706",
          700: "#B45309",
        },
        critical: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
          50: "#FEF2F2",
          100: "#FEE2E2",
          600: "#DC2626",
          700: "#B91C1C",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
