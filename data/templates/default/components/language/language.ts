import { Yao, Component } from "@yao/sui";

const self = this as Component;

const alias = { en: "en-us", cn: "zh-cn", jp: "ja-jp", "zh-tw": "zh-hk" };
const supported = ["en-us", "zh-cn", "zh-hk", "ja-jp"];

function getLanguage() {
  const yao = new Yao();
  let language = yao.Cookie("locale");
  if (!language) {
    language = window.navigator.language.split("-")[0].toLowerCase();
    yao.SetCookie("locale", language);
  }
  return language;
}

function setLanguage(language) {
  const yao = new Yao();
  language = (language || "en").toLowerCase();
  language = alias[language] || language;
  if (!supported.includes(language)) {
    language = "en-us";
  }
  document.documentElement.setAttribute("locale", language);
  yao.SetCookie("locale", language);
}

self.SetLocale = function (event) {
  const v = event.detail;
  setLanguage(v);
  window.location.reload();
};
