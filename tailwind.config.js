/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Fira Code", "monospace"],
      mono: ["Fira Code", "monospace"],
      serif: ["Fira Code", "monospace"],
    },
    extend: {
      colors: {
        // Sourced from CSS custom properties (see style.css) so every
        // utility class using these tokens re-colors automatically when
        // [data-theme] flips — no per-component overrides needed.
        "theme-main": "var(--color-theme-main)",
        "theme-main-gradient": "var(--color-theme-main-gradient)",
        "accent-color": "var(--color-accent-color)",
        "accent-sub": "var(--color-accent-sub)",
        "accent-url": "var(--color-accent-url)",
        "accent-variable": "var(--color-accent-variable)",
        "accent-underline": "var(--color-accent-underline)",

        // border
        "border-white": "var(--color-border-white)",

        // text color
        "white-gradient-01": "var(--color-white-gradient-01)",
        "gray-gradient-01": "var(--color-gray-gradient-01)",
        "code-keyword": "var(--color-code-keyword)",
        "code-rest": "var(--color-code-rest)",
        "code-id": "var(--color-code-id)",

        // form fields
        "bg-field-default": "var(--color-bg-field-default)",

        // button color
        "bg-button-default": "var(--color-bg-button-default)",
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
      },
    },
  },
  plugins: [
    // Custom scrollbar plugin
    function ({ addUtilities, theme }) {
      // Add scrollbar utilities to utilities layer
      addUtilities({
        ".scrollbar-custom": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme("colors.theme-main"),
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme("colors.accent-color"),
            borderRadius: "4px",
            border: "1px solid " + theme("colors.theme-main"),
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme("colors.accent-sub"),
          },
          "&::-webkit-scrollbar-corner": {
            background: theme("colors.theme-main"),
          },
          // Firefox support
          scrollbarWidth: "thin",
          scrollbarColor:
            theme("colors.accent-color") + " " + theme("colors.theme-main"),
        },
        ".scrollbar-thin": {
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme("colors.accent-color"),
            borderRadius: "2px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme("colors.accent-sub"),
          },
          // Firefox support
          scrollbarWidth: "thin",
          scrollbarColor: theme("colors.accent-color") + " transparent",
        },
        ".scrollbar-none": {
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
      });
    },
  ],
};
