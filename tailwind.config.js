/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          blue:        "#3D6BC0",
          "blue-dark": "#2f56a0",
          "blue-light":"#eef2fb",
          orange:      "#FF6829",
          "orange-light": "#fff4ef",
        },
      },
      boxShadow: {
        card:       "0 1px 4px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md":  "0 4px 16px rgba(0,0,0,0.08)",
        sidebar:    "2px 0 16px rgba(0,0,0,0.10)",
      },
      borderRadius: {
        xl2: "14px",
      }
    },
  },
  plugins: [],
}
