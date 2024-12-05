import { $Query, __sui_data, Component } from "@yao/sui";

const self = this as Component;

self.OnPreviewLoaded = function () {
  $Query("#preview")?.removeClass("hidden");
  $Query("#loading")?.addClass("hidden");
};

function init() {
  const { $query } = __sui_data;
  const { url, __token, __theme } = $query || {};
  const theme = __theme?.[0] || "light";

  // Set theme
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", theme);

  // Parse URL
  const pageURL = decodeURIComponent(decodeHtmlEntity(url?.[0] || ""));
  const frameURL = pageURL.includes("&")
    ? `${pageURL}&__token=${__token}&__hidemenu=1`
    : `${pageURL}?__token=${__token}&__hidemenu=1`;

  // Set iframe src
  $Query("#preview")?.elm()?.setAttribute("src", frameURL);
}

function decodeHtmlEntity(encoded: string): string {
  const text = document.createElement("textarea");
  text.innerHTML = encoded;
  return text.value;
}

document.addEventListener("DOMContentLoaded", init);
