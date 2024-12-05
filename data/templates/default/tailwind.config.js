const __light_colors = require("./__assets/js/light");
const __dark_colors = require("./__assets/js/dark");
module.exports = {
  darkMode: "class",
  content: ["./**/*.html", "./**/*.ts"],
  theme: {
    extend: { colors: { ...__light_colors, dark: { ...__dark_colors } } },
  },
  plugins: [require("@tailwindcss/typography")],
};
