/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: { sans: ["Fira Code", "monospace"] },
    extend: {
      colors: {
        "theme-main": "#011627",
        "accent-color": "#607B96",
        "accent-sub": "#4D5BCE",
        "accent-url": "#E99287",
        "accent-variable": "#43D9AD",
        "accent-underline": "#FEA55F",

        // border
        "border-white": "#1E2D3D",

        // text color
        "white-text-01": "#E5E9F0",
      },

      borderRadius: {
        sm: "8px",
      },

      fontSize: {
        "3xl": "2rem",
        "6xl": "3.875rem",
      },
    },
  },
  plugins: [],
};
