import { $$, EventData, Component, EventDetail, $Query } from "@yao/sui";

const self = this as Component;

self.watch = {
  disabled: (value: boolean) => {
    self.store.Set("disabled", `${value}`);

    // Disable the input
    const input = self.$root.find("input");
    if (value || self.store.Get("readonly") == "true") {
      input.addClass("cursor-not-allowed");
      input.element.setAttribute("disabled", "true");
      return;
    }
    input.removeClass("cursor-not-allowed");
    input.element.removeAttribute("disabled");
  },

  focus: (value: boolean) => {},
  dropdown: (value: boolean) => {
    if (!value) {
      self.store.Get("opened") == "true" && toggleDropdown();
      return;
    }
    self.store.Get("opened") == "false" && toggleDropdown();
  },
};

// Init the multi select
self.once = () => initMultiSelect();

// Right icon click event
self.onActionClick = (event: Event, data: EventData, detail: EventDetail) => {
  const comp = $$(detail.rootElement);
  const disabled = comp.store.Get("disabled") == "true";
  if (disabled) return;

  event.stopPropagation();
  const type = self.store.Get("action");
  switch (type) {
    case "clear":
      clearValue();
      break;
    case "open":
      toggleDropdown();
      break;
    case "search":
      const input = self.root.querySelector(
        ".flowbite-edit-input"
      ) as HTMLElement;
      const value = $$(input).store.Get("value");
      search(value);
      break;
  }
};

self.onActionMouseEnter = (event: Event) => {
  event.stopPropagation();
  if (self.store.Get("action") != "search" && getSelectedValues().length > 0) {
    updateAction("clear");
  }
};

self.onActionMouseLeave = (event: Event) => {
  event.stopPropagation();
  if (self.store.Get("opened") == "true") return;
  if (self.store.Get("action") == "search") return;
  updateAction("open");
};

self.onInputMouseEnter = (event: Event) => {
  event.stopPropagation();
  if (getSelectedValues().length > 0) {
    updateAction("clear");
  }
};

self.onInputMouseLeave = (event: Event) => {
  event.stopPropagation();
  const opened = self.store.Get("opened") == "true" ? true : false;
  if (opened) return;
  updateAction("open");
};

/**
 * Input key down event, handle the search
 * @param event
 */
self.onInputKeyDown = (event: KeyboardEvent) => {
  updateAction("search");
  const opened = self.store.Get("opened") == "true" ? true : false;
  if (!opened) {
    toggleDropdown();
  }

  // Hide the multiple values
  self.find("[multiple-values]")?.addClass("hidden");

  // If enter key is pressed, do the search
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    search(input.value);
  }
};

/**
 * Input click event, open the dropdown
 * @param event
 * @param data
 * @param detail
 */
self.onInputClick = (event: Event, data: EventData, detail: EventDetail) => {
  const comp = $$(detail.rootElement);
  const disabled = comp.store.Get("disabled") == "true";
  if (disabled) return;

  event.stopPropagation();
  if (self.store.Get("opened") !== "true") {
    toggleDropdown();
    closeDropdowns(detail.rootElement);
  }
};

self.onMultipleInputClick = (
  event: Event,
  data: EventData,
  detail: EventDetail
) => {
  const comp = $$(detail.rootElement);
  const disabled = comp.store.Get("disabled") == "true";
  if (disabled) return;

  event.stopPropagation();
  const input = self.query("[input-element]");
  input.focus();
  if (self.store.Get("opened") !== "true") {
    toggleDropdown();
    closeDropdowns(detail.rootElement);
  }
};

/**
 * Click outside the dropdown, close the dropdown
 * @param event
 * @param data
 * @param detail
 * @returns
 */
self.onOutsideClick = (event: Event, data: EventData, detail: EventDetail) => {
  const opened = self.store.Get("opened") == "true" ? true : false;
  if (!opened) return;
  toggleDropdown();
};

/**
 * Dropdown item click eventt, select the item
 * @param event
 * @param data
 * @param detail
 * @returns
 */
self.onSelect = (event: CustomEvent, data: EventData, detail: EventDetail) => {
  event.stopPropagation();
  const props = self.store.GetData();
  const mode = props.mode || "single";
  const item = event.detail;

  // Set value and raise the change event
  if (mode === "single") {
    setValue(item.value);
    toggleDropdown(); // Close the dropdown

    // Trigger the change event
    self.emit("change", item.value || null);
    return;
  }

  // values in multiple mode
  setValues(item.value);
  const selected = getSelectedValues();
  self.emit("change", selected);
};

self.onMultipleRemove = (event: Event, data: EventData) => {
  if (self.store.Get("disabled") == "true") return;
  event.stopPropagation();
  unselect(data.value);
};

/**
 * Clear the value of the select
 * @returns
 */
function clearValue() {
  const mode = self.props.Get("mode") || "single";
  updateAction("open");
  if (mode === "single") {
    setValue("");
    self.emit("change", null);
    return;
  }

  unselectAll();
  self.emit("change", []);
}

/**
 * Search the items by the keywords
 * @param keywords
 */
function search(keywords: string) {
  const dropdown = self.query(`[name="options"]`);
  $$(dropdown).state.Set("filter", { keywords });
}

/**
 * Set the values of the select (for multiple mode)
 * @param value
 * @returns
 */
async function setValues(value: string | string[]) {
  const dropdown = self.query(`[name="options"]`) as HTMLElement;
  const items = $$(dropdown).store.GetJSON("items") || [];
  const selected = getSelectedValues();
  updatePlaceholder(selected);

  self.store.Set("selected", selected.join(","));
  const selectedItems = items.filter((item) => selected.includes(item.value));

  await self.render("multiple-values", { values: selectedItems });
}

/**
 * Remove all the selected values from the multiple select
 */
async function unselectAll() {
  const dropdown = self.query(`[name="options"]`) as HTMLElement;
  const items = $$(dropdown).store.GetJSON("items") || [];
  items.forEach((item) => (item.selected = false));
  await $$(dropdown).state.Set("unselectAll");
  self.store.Set("selected", "");
  await self.render("multiple-values", { values: [] });
  updatePlaceholder([]);
}

/**
 * Remove the value from the multiple select
 * @param value
 */
async function unselect(value: string) {
  const dropdown = self.query(`[name="options"]`) as HTMLElement;
  const items = $$(dropdown).store.GetJSON("items") || [];
  let selected = getSelectedValues();

  // Remove the value
  selected = selected.filter((v) => v !== value);
  updatePlaceholder(selected);

  self.store.Set("selected", selected.join(","));
  $$(dropdown).state.Set("unselect", value);
  const selectedItems = items.filter((item) => selected.includes(item.value));
  if (items.length == 0) {
    selected.forEach((value) => {
      const item = { value, label: value, selected: true };
      selectedItems.push(item);
    });
  }
  await self.render("multiple-values", { values: selectedItems });
  self.emit("change", selected);
}

function updatePlaceholder(selected: string[]) {
  const input = self.query(".flowbite-edit-input") as HTMLElement;
  let placeholder = self.store.Get("placeholder") || "Select";
  if (selected.length > 0) {
    self.find("[multiple-values]").removeClass("hidden");
    $$(input).state.Set("value", "");
    placeholder = "";
  }
  $$(input).query("[input-element]").setAttribute("placeholder", placeholder);
}

function getSelectedValues(): string[] {
  const dropdown = self.query(`[name="options"]`) as HTMLElement;
  return $$(dropdown)
    .store.Get("selected")
    .split(",")
    .filter((v) => v !== "");
}

/**
 * Set the value of the select (for single mode)
 * @param value
 * @returns
 */
async function setValue(value: string | string[]) {
  const dropdown = self.root.querySelector(`[name="options"]`) as HTMLElement;
  const input = self.root.querySelector(".flowbite-edit-input") as HTMLElement;
  const items = $$(dropdown).store.GetJSON("items") || [];

  // Single mode
  if (!value || value === "") {
    self.store.Set("value", "");
    self.store.Set("label", "");
    $$(input).state.Set("value", "");

    // Clear the items
    items.forEach((item) => (item.selected = false));
    await $$(dropdown).state.Set("items", items);
    return;
  }

  const item = items.find((item) => item.value === value);
  if (!item) return;
  self.store.Set("value", item.value);
  self.store.Set("label", item.label);
  self.store.Set("selected", item.value);
}

/**
 * Toggle the dropdown
 * @returns
 */
function toggleDropdown() {
  const opened = self.store.Get("opened") == "true" ? true : false;
  self.store.Set("opened", `${!opened}`);
  const dropdown = self.root.querySelector(`[name="options"]`) as HTMLElement;
  const input = self.root.querySelector(".flowbite-edit-input") as HTMLElement;
  $$(dropdown).state.Set("opened", !opened);
  $$(input).state.Set("focus", !opened);
  if (opened) {
    updateAction("open");

    // Restore the multiple values
    self.find("[multiple-values]")?.removeClass("hidden");

    // Fix the value && clear the search
    const label = self.store.Get("label");
    $$(input).state.Set("value", label);
    return;
  }
}

function closeDropdowns(elm: HTMLElement) {
  const selects = document.querySelectorAll(`[type="flowbite-edit-select"]`);
  selects.forEach((select) => {
    if (select !== elm) {
      $$(select as HTMLElement).state.Set("focus", false);
      $$(select as HTMLElement).state.Set("dropdown", false);
    }
  });
}

/**
 * Update the action type of the select
 * @param type
 */
function updateAction(type: string) {
  self.store.Set("action", type);
  const action = self.Constants.actionTypes[type];
  const icon = self.root.querySelector("[action-icon]") as HTMLElement;
  $Query(icon).addClass(action.class);
  icon.innerHTML = action.icon;
}

function initMultiSelect() {
  if (self.props.Get("mode") !== "multiple") return;
  const multipleValues = self.query("[multiple-values]");
  resizeObserver.observe(multipleValues);
}

const resizeObserver = new ResizeObserver((entries) => {
  const size = self.props.Get("size") || "base";
  const offsets = { sm: 6, base: 8, lg: 14 };
  const input = self.query("[input-element]");
  const defaultHeights = { sm: 34, base: 42, lg: 58 };
  const offset = offsets[size] || 8;
  const defaultHeight = defaultHeights[size] || 40;
  if (self.find("[multiple-values]")?.hasClass("hidden")) return;

  const selected = self.store.Get("selected");
  if (selected == "") {
    input.style.height = `${defaultHeight}px`;
    return;
  }

  entries.forEach(
    (entry) => (input.style.height = `${entry.contentRect.height + offset}px`)
  );
});
