/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochromatic Editorial Design System Tokens for Bangladeshi E-Commerce
        brand: {
          white: "#FFFFFF",
          "surface-light": "#F5F5F5",
          "surface-muted": "#E5E5E5",
          "border-subtle": "#E0E0E0",
          "text-primary": "#1A1A1A",
          "text-secondary": "#555555",
          charcoal: "#1A1A1A",
          black: "#111111",
        },
        // Bangladeshi Localized Brand Accents (Sparse, monochromatic & authentic verification)
        bKash: "#E2136E",
        nagad: "#F7941D",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        editorial: ["'Playfair Display'", "serif"],
        bangla: ["'Hind Siliguri'", "'Plus Jakarta Sans'", "sans-serif"],
      },
      boxShadow: {
        "editorial-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        "editorial-md": "0 4px 12px 0 rgba(0, 0, 0, 0.05)",
        "editorial-lg": "0 10px 30px -4px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        card: "12px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
