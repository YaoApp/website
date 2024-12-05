import { Yao, Component } from "@yao/sui";

const self = this as Component;
const themeToggle = self.$root.find("#theme-toggle");
const lightIcon = self.$root.find("#theme-toggle-light-icon");
const darkIcon = self.$root.find("#theme-toggle-dark-icon");
const toggleTooltips = self.$root.find("[theme-toggle-tooltip]");
self.once = Init;

function getMode() {
  const yao = new Yao();
  return yao.Cookie("color-theme") === "dark" ||
    (!yao.Cookie("color-theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark"
    : "light";
}

function setMode(mode) {
  const yao = new Yao();
  setThemeToggleBtn(mode);

  if (mode === "light") {
    document.documentElement.classList.remove("dark");
    yao.SetCookie("color-theme", "light");
    return;
  }

  document.documentElement.classList.add(mode);
  yao.SetCookie("color-theme", "dark");
}

function setThemeToggleBtn(mode) {
  if (mode === "light") {
    lightIcon.element.setAttribute("style", "display: none;");
    darkIcon.element.setAttribute("style", "display: block;");
    // @ts-ignore
    toggleTooltips.find(".tips").element.innerHTML = __m("Switch to Dark Mode");
    return;
  }

  lightIcon.element.setAttribute("style", "display: block;");
  darkIcon.element.setAttribute("style", "display: none;");

  // @ts-ignore
  toggleTooltips.find(".tips").element.innerHTML = __m("Switch to Light Mode");
}

function Init() {
  themeToggle.on("click", function () {
    const mode = getMode();
    setMode(mode === "dark" ? "light" : "dark");
  });
  const mode = getMode();
  setThemeToggleBtn(mode);
}
