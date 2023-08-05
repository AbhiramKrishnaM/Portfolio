/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      "theme-main": "#011627",
      "accent-color": "#607B96",
      "accent-sub": "#4D5BCE",
      "accent-url": "#E99287",
      "accent-variable": "#43D9AD",
      "accent-underline": "#FEA55F",
    },
  },
  plugins: [],
};
