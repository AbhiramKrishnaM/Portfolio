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

        // #E99287

        // border
        "border-white": "#1E2D3D",

        // text color
        "white-gradient-01": "#E5E9F0",
        "gray-gradient-01": "#607B96",
      },

      borderRadius: {
        sm: "8px",
      },

      fontSize: {
        "3xl": "2rem",
        "6xl": "3.875rem",
      },

      margin: {
        82: "5.125rem",
      },

      gap: {
        92: "5.75rem",
      },

      inset: {
        7: "7rem",
        9: "9rem",
        11: "11rem",
        13: "13rem",
      },
    },
  },
  plugins: [],
};
