import { $Backend, $Query, $Store, Component, Yao } from "@yao/sui";

const self = this as Component;

self.watch = {
  opened: (value: boolean) => {
    if (value) return open();
    return close();
  },

  filter: (value: Record<string, any>) => filterItems(value.keywords),

  unselect: (value: string) => {
    const items = self.store.GetJSON("items") || [];
    if (items.length == 0) {
      const selected = getSelectedValues();
      const index = selected.indexOf(value);
      selected.splice(index, 1);
      self.store.Set("selected", selected.join(","));
      return;
    }

    items.forEach((item) => {
      if (item.value == value) {
        const item = self.query(`[item][data-value="${value}"]`);
        unselectItem(item);
      }
    });
  },

  unselectAll: () => unselectAllItems(),

  // Update the items
  items: (value: any) => {
    self.store.Set("selected", "");
    renderItems(value);
  },
};

// when the outside is clicked, dispatch the outside-click event
// Global click event listener initialization marked
if (!document["flowbite-dropdown-click-listener"]) {
  document["flowbite-dropdown-click-listener"] = true;
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const found = target.closest(`[type="flowbite-dropdown"]`);
    if (found === null) {
      const event = new CustomEvent("outside-click", {});
      const dropdowns = document.querySelectorAll(`[type="flowbite-dropdown"]`);
      dropdowns.forEach((dropdown) => {
        dropdown.dispatchEvent(event);
      });
    }
  });
}

/**
 *  When the item is clicked, raise the item-click event and toggle the selected state
 * @param event
 * @param data
 * @param detail
 * @returns
 */
self.onItemClick = (
  event: Event,
  data: Record<string, any>,
  detail: Record<string, any>
) => {
  event.stopPropagation();
  const item = data.item || {};
  const props = self.store.GetData();
  const mode = props.mode || "single";

  // Single mode select the item
  if (mode == "single") {
    unselectAllItems();
    selectItem(detail.targetElement);
    self.root.dispatchEvent(new CustomEvent("item-click", { detail: item }));
    return;
  }

  // Multiple mode item has been selected
  if (item.selected) {
    unselectItem(detail.targetElement);
    self.root.dispatchEvent(
      new CustomEvent("item-click", { detail: { ...item, selected: false } })
    );
    return;
  }

  // Multiple mode item unselected
  selectItem(detail.targetElement);
  self.root.dispatchEvent(
    new CustomEvent("item-click", { detail: { ...item, select: true } })
  );
  return;
};

function open() {
  self.store.Set("opened", "true");
  const api = self.props.Get("api");
  const items = self.store.GetJSON("items") || [];
  items.length == 0 && api && fetchItems();
  self.$root.removeClass("hidden");
}

function fetchItems(keywords: string = "") {
  // Selected the dropdown element
  const selected = getSelectedItems();
  const api = self.props.Get("api");
  if (api.startsWith("@")) {
    fetchItemsBackend(api, keywords, selected);
    return;
  }

  fetchItemsFromApi(api, keywords, selected);
}

/**
 * Filter the items by the keywords
 * @param keywords
 */
async function filterItems(keywords: string) {
  // Remote search
  const api = self.props.Get("api");
  if (api) {
    fetchItems(keywords);
    return;
  }

  const selected = getSelectedValues();

  // Local search
  const items = self.store.GetJSON("items") || [];
  const newItems = [];
  items.forEach((item) => {
    const source = `${item.label || ""} | ${item.value || ""}`;
    if (source.includes(keywords, -1)) {
      item.selected = selected.includes(item.value);
      newItems.push(item);
    }
  });
  self.render("items", { items: newItems });
}

function close() {
  self.store.Set("opened", "false");
  self.$root.addClass("hidden");
}

function toggle() {
  if (self.store.Get("opened") == "true") {
    close();
    return;
  }
  open();
}

async function fetchItemsBackend(
  api: string,
  keywords: string,
  selected: any[]
) {
  api = api.replace("@", "");
  if (!api.startsWith("/")) {
    const route = window.location.pathname;
    api = `${route}/${api}`;
  }

  // Method is the last part of the api
  const parts = api.split("/");
  const method = parts.pop();
  const url = parts.join("/");
  const token = new Yao().Token();
  const headers = { Authorization: `Bearer ${token}` };
  showLoading();
  $Backend<Item[]>(url, headers)
    .Call(method, { keywords, selected })
    .then((items: Item[]) => renderItems(items))
    .catch((err) => showError(err));
}

async function fetchItemsFromApi(
  api: string,
  keywords: string,
  selected: any[]
) {
  // Fetch the items from the http api
  const yao = new Yao();
  const token = yao.Token();
  const headers = { Authorization: `Bearer ${token}` };
  const url = api.startsWith("/api") ? api.replace(/^\/api/, "") : api;
  console.log(url);
  showLoading();
  yao
    .Get(url, { keywords, selected }, headers)
    .then((items: Item[]) => renderItems(items))
    .catch((err) => showError(err));
}

async function renderItems(items: Item[]) {
  mergeItems(items);
  const selected = getSelectedValues();
  items.forEach((item) => {
    if (item.selected) {
      selected.push(item.value.trim());
      return;
    }
    if (selected.includes(item.value)) {
      item.selected = true;
    }
  });
  self.store.Set("selected", selected.join(","));
  self
    .render("items", { items: items })
    .then((html) => hideLoading())
    .catch((err) => showError(err));
}

function mergeItems(newItems: Item[]) {
  const items = self.store.GetJSON("items") || [];
  newItems.forEach((item) => {
    typeof item.value != "string" && (item.value = `${item.value}`);
    const index = items.findIndex((i) => i.value == item.value);
    if (index == -1) {
      items.push(item);
      return;
    }
    items[index] = item;
  });
  self.store.SetJSON("items", items);
}

function showError(err: any) {
  const message = err.message || err || "An error occurred";
  console.error(message);
  self.store.Set("error", "true");
  const el = self.find("[error]");
  el.html(message);
  el.removeClass("hidden");
  hideLoading();
}

function showLoading() {
  self.store.Set("loading", "true");
  self.find("[loading]")?.removeClass("hidden");
  self.find("[empty]")?.addClass("hidden");
  self.find("[items]")?.addClass("hidden");
  self.find("[error]")?.addClass("hidden");
}

function hideLoading() {
  self.store.Set("loading", "false");
  self.find("[loading]")?.addClass("hidden");
  self.find("[items]")?.removeClass("hidden");
  self.find("[empty]")?.addClass("hidden");

  const items = self.store.GetJSON("items") || [];
  if (items.length == 0 && self.store.Get("error") != "true") {
    self.find("[empty]")?.removeClass("hidden");
    return;
  }

  if (self.store.Get("error") == "true") {
    self.find("[error]")?.removeClass("hidden");
    return;
  }
}

function getSelectedItems(): Item[] {
  const str = self.store.Get("selected") || "";
  if (str == "") {
    return [];
  }

  const selected = str.split(",");
  const items = self.store.GetJSON("items") || [];
  const selectedItems = items.filter((item) => selected.includes(item.value));
  return selectedItems;
}

function getSelectedValues(): string[] {
  return getSelectedItems().map((item) => item.value);
}

function selectItem(el: HTMLElement) {
  const store = $Store(el);
  const item = store.GetJSON("item");
  store.SetJSON("item", { ...item, selected: true });

  // add to the selected property
  const selected = getSelectedValues();
  selected.push(item.value?.trim());
  self.store.Set("selected", selected.join(","));
  $Query(el).find("[checked]").removeClass("hidden");
}

function unselectItem(el: HTMLElement) {
  const store = $Store(el);
  const item = store.GetJSON("item");
  store.SetJSON("item", { ...item, selected: false });

  // remove from the selected property
  const selected = getSelectedValues();
  const index = selected.indexOf(item.value.trim());
  selected.splice(index, 1);
  self.store.Set("selected", selected.join(","));
  $Query(el).find("[checked]").addClass("hidden");
}

function unselectAllItems() {
  self.queryAll("[item]")?.forEach((el: HTMLElement) => {
    $Query(el).find("[checked]")?.addClass("hidden");
    const store = $Store(el as HTMLElement);
    const item = store.GetJSON("item");
    store.SetJSON("item", { ...item, selected: false });
  });

  // Set the selected property to empty
  self.store.Set("selected", "");
}

type Item = {
  icon?: string;
  label: string;
  value: string;
  selected?: boolean;
  divider?: boolean;
  disabled?: boolean;
};
