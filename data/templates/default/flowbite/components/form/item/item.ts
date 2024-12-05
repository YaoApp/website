import { $Query, Component, State } from "@yao/sui";

const self = this as Component;
self.watch = {
  disabled: (value: boolean) => {
    const self = this as Component;
    self.store.Set("disabled", `${value}`);

    if (value) {
      updateColor("disabled");
      return;
    }
    updateColor(self.store.Get("color"));
  },

  error: (value: boolean | string) => {
    const self = this as Component;
    self.store.Set("danger", `${value}`);
    if (value) {
      updateColor("danger");
      typeof value === "string" && showError(value);
      return;
    }
    updateColor(self.store.Get("color"));
    showHelper();
  },

  success: (value: boolean | string) => {
    const self = this as Component;
    self.store.Set("success", `${value}`);
    if (value) {
      updateColor("success");
      typeof value === "string" && showSuccess(value);
      return;
    }
    updateColor(self.store.Get("color"));
    showHelper();
  },

  focus: (value: boolean) => {
    self.store.Set("focus", `${value}`);
    if (value) {
      self.store.Set(
        "color-focus",
        self.store.Get("current-color") || self.store.Get("color")
      );
      updateColor("focus");
      return;
    }

    const color = self.store.Get("color-focus");
    if (color == "focus") {
      updateColor(self.store.Get("color"));
      return;
    }
    updateColor(self.store.Get("color-focus") || self.store.Get("color"));
  },
};

function updateColor(color: string) {
  const currentColor =
    self.store.Get("current-color") || self.store.Get("color");

  if (currentColor === color) return;
  const label = self.root.querySelector("[label]") as HTMLInputElement;
  const helper = self.root.querySelector("[helper]") as HTMLInputElement;

  // Remove the current color
  $Query(label)
    .removeClass(self.Constants.labelColors[currentColor])
    .addClass(self.Constants.labelColors[color]);

  $Query(helper)
    .removeClass(self.Constants.helperColors[currentColor])
    .addClass(self.Constants.helperColors[color]);

  self.store.Set("current-color", color);
}

function showError(message: string) {
  const slots = self.root.querySelectorAll("[slots]");
  const error = self.root.querySelector("[error-slot]") as HTMLElement;
  slots.forEach((slot: HTMLElement) => $Query(slot).addClass("hidden"));

  error.innerHTML = message;
  $Query(error).removeClass("hidden");
}

function showSuccess(message: string) {
  const slots = self.root.querySelectorAll("[slots]");
  const success = self.root.querySelector("[success-slot]") as HTMLElement;
  slots.forEach((slot: HTMLElement) => $Query(slot).addClass("hidden"));

  success.innerHTML = message;
  $Query(success).removeClass("hidden");
}

function showHelper() {
  const slots = self.root.querySelectorAll("[slots]");
  const helper = self.root.querySelector("[helper-slot]") as HTMLElement;
  slots.forEach((slot: HTMLElement) => $Query(slot).addClass("hidden"));
  $Query(helper).removeClass("hidden");
}
