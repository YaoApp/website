import { $Backend, $Query, $Store, Component, EventData } from "@yao/sui";

const self = this as Component;

/**
 * When page number is changed, load articles
 * @param event
 * @param data
 */
self.LoadPage = async function (event: MouseEvent, data: EventData) {
  const category = self.store.Get("category") || null;
  const page = data.page || 1;

  // Load articles
  const articles = await $Backend("/blog").Call("GetArticles", category, page);

  // Render articles
  self.render("articles", { articles });
};

self.ImageLoadError = function (event: Event) {
  console.log("Image load error", event);
  const img = event.target as HTMLImageElement;
  console.log("Image load error", img);
};

/**
 * When category is changed, load articles
 * @param event
 * @param data
 */
self.LoadCategory = async function (event: MouseEvent, data: EventData) {
  // Active and inactive class
  const active =
    "text-primary-500 dark:text-primary-400 border-primary-500 dark:border-primary-400";
  const inactive = "border-transparent";

  // Prevent default behavior ( href redirect )
  event.preventDefault();

  // Get category and store it
  const category = data.category || null;
  self.store.Set("category", category);

  // Change item style
  $Query("[category]").each((el) => {
    el.removeClass(active).addClass(inactive);
    // Current category
    if ($Store(el.element as HTMLElement).Get("category") === category) {
      el.removeClass(inactive).addClass(active);
    }
  });

  // Load articles
  const articles = await $Backend("/blog").Call("GetArticles", category, 1);

  // Render articles
  await self.render("articles", { articles });
};
