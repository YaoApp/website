import { $$, EventData, EventDetail, Component, $Query } from "@yao/sui";
const self = this as Component;

self.watch = {
  value: (value: string | number | boolean) => {
    const self = this as Component;
    const input = self.root.querySelector("input") as HTMLInputElement;
    self.store.Set("value", value ? `${value}` : "");
    input.value = value ? `${value}` : "";
  },

  disabled: (value: boolean) => {
    const self = this as Component;
    self.store.Set("disabled", `${value}`);
    const input = self.root.querySelector("input") as HTMLInputElement;
    if (value) {
      updateColor("disabled");
      input.setAttribute("disabled", "true");
      return;
    }
    updateColor(self.store.Get("color"));
    input.removeAttribute("disabled");
  },

  error: (value: boolean | string) => {
    const self = this as Component;
    self.store.Set("danger", `${value}`);
    if (value) {
      updateColor("danger");
      return;
    }
    updateColor(self.store.Get("color"));
  },

  success: (value: boolean | string) => {
    const self = this as Component;
    self.store.Set("success", `${value}`);
    if (value) {
      updateColor("success");
      return;
    }
    updateColor(self.store.Get("color"));
  },

  focus: (value: boolean) => {},
};

self.updateValue = (
  event: Event,
  data: EventData,
  detail: EventDetail<HTMLInputElement>
) => {
  const comp = $$(detail.rootElement);
  comp.store.Set("value", detail.targetElement.value);
};

self.focus = (event: Event, data: EventData, detail: EventDetail) => {
  updateFocus(true);
  if (detail.rootElement) {
    const comp = $$(detail.rootElement);
    comp.state.Set("focus", true);
  }
};

self.blur = (event: Event, data: EventData, detail: EventDetail) => {
  updateFocus(false);
  if (detail.rootElement) {
    const comp = $$(detail.rootElement);
    comp.state.Set("focus", false);
  }
};

self.buttonClick = (event: Event, data: EventData) => {
  const evt = new CustomEvent("button-click", {
    detail: { value: self.store.Get("value") },
  });
  self.root.dispatchEvent(evt);
};

function updateFocus(value: boolean) {
  self.store.Set("focus", `${value}`);
  if (value) {
    self.store.Set(
      "color-focus",
      self.store.Get("current-color") || self.store.Get("color")
    );
    updateColor("primary");
    return;
  }
  updateColor(self.store.Get("color-focus") || self.store.Get("color"));
}

// Update the color of the input and icon
function updateColor(color: string) {
  const currentColor =
    self.store.Get("current-color") || self.store.Get("color");

  if (currentColor === color) return;

  const icon = self.root.querySelector("[icon]") as HTMLElement;
  const input = self.root.querySelector("[input]") as HTMLElement;

  // Remove the current color

  $Query(icon)
    .removeClass(self.Constants.iconColors[currentColor])
    .addClass(self.Constants.iconColors[color]);

  $Query(input)
    .removeClass(self.Constants.inputColors[currentColor])
    .addClass(self.Constants.inputColors[color]);

  // Update the current color
  self.store.Set("current-color", color);
}
