import "@assets/js/highlight.min.js";
import { $Query, Component, EventData, EventDetail } from "@yao/sui";

const self = this as Component;

const activeClass = "text-primary-200 bg-slate-900";

self.CopyCode = async (event: Event, data: EventData, detail: EventDetail) => {
  const { command } = data || {};
  const icon = $Query(detail.targetElement).find("i");

  // Copt to clipboard
  await navigator.clipboard.writeText(command);

  icon.elm().innerHTML = "check";
  icon.addClass("text-gray-50");
  setTimeout(() => {
    icon.elm().innerHTML = "content_copy";
    icon.removeClass("text-gray-50");
  }, 1000);
};

self.ShowPlatform = (event: Event, data: EventData) => {
  // Set active tab
  $Query("[tab]")
    .elms()
    .forEach((elm: HTMLElement) => $Query(elm).removeClass(activeClass));

  $Query(`#tab-${data.id}`).addClass(activeClass);

  // Show code
  $Query("[code]")
    .elms()
    .forEach((elm: HTMLElement) => $Query(elm).addClass("hidden"));
  $Query(`#code-${data.id}`).removeClass("hidden");
};
