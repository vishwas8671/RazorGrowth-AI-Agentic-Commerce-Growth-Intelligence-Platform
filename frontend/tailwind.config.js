/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          blue: "#2563eb",
          "blue-dark": "#1d4ed8",
          "blue-light": "#eff6ff",
          navy: "#0f172a",
          slate: "#334155",
          muted: "#64748b",
          border: "#e2e8f0",
          bg: "#f8fafc",
          card: "#ffffff",
          emerald: "#059669",
          "emerald-light": "#ecfdf5",
          amber: "#d97706",
          "amber-light": "#fffbeb",
          rose: "#e11d48",
          "rose-light": "#fff1f2",
          purple: "#7c3aed",
          "purple-light": "#f5f3ff"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
