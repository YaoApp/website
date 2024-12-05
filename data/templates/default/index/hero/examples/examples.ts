import "@assets/js/highlight.min.js";
import { $Query, Component, EventData } from "@yao/sui";

const self = this as Component;
self.once = init;

const activeClass =
  "text-primary-400 dark:text-primary-300  border-primary-400 dark:border-primary-300";
const defaultClass = "border-gray-800 dark:border-gray-700";

function init() {
  document.querySelectorAll(".code").forEach((block) => {
    // @ts-ignore
    hljs.highlightElement(block);
  });
}

self.ShowExample = (event: Event, data: EventData) => {
  // Set active tab
  $Query("[tab]")
    .elms()
    .forEach((elm: HTMLElement) =>
      $Query(elm).removeClass(activeClass).addClass(defaultClass)
    );

  $Query(`#tab-${data.name}`).removeClass(defaultClass).addClass(activeClass);

  // Show code
  $Query("[code]")
    .elms()
    .forEach((elm: HTMLElement) => $Query(elm).addClass("hidden"));
  $Query(`#code-${data.name}`).removeClass("hidden");
};
