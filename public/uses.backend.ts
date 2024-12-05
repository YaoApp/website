import { Process, sui } from "@yao/runtime";

/**
 * Get all tutorials by locale
 * @param r the request object
 * @returns
 */
function Tutorials(r: sui.Request) {
  const locale = Process("scripts.utils.GetLocale", r.locale);
  const tutorials = getTutorials(locale);
  return tutorials;
}

/**
 * Get all tutorials by locale
 * @param locale the locale
 * @returns
 */
function getTutorials(locale?: string) {
  // Get language from locale
  const lang = Process("scripts.utils.GetLocale", locale);

  // Get all categories
  let categories = Process(`models.tutorial.category.Get`, {
    select: ["name", "sort", "lang"],
    orders: [{ column: "sort", option: "asc" }],
  });
  categories = filterByLocale(categories, lang);

  // Get all tutorials by categories
  const tutorials = Process(`models.tutorial.Get`, {
    select: ["title", "description", "icon", "url", "lang", "category"],
    wheres: [
      { column: "category", value: categories.map((c) => c.name), op: "in" },
    ],
    orders: [{ column: "sort", option: "asc" }],
  });

  // Group tutorials by categories
  const groups = categories.map((category) => {
    return {
      name: category.name,
      tutorials: tutorials.filter((t) => t.category === category.name),
    };
  });
  return groups;
}

/**
 * Filter data by locale
 * @param rows
 * @param locale
 * @returns
 */
function filterByLocale(rows: any[], locale: string) {
  const data = rows.filter((t) => t.lang === locale);
  // If no data found, return English tutorials
  if (data.length === 0) {
    return rows.filter((t) => t.lang === "en-us");
  }
  return data;
}


this.__sui_page = '/uses';
this.__sui_constants = {};
this.__sui_helpers = [];

if (typeof Helpers === 'object') {
	this.__sui_helpers = Object.keys(Helpers);
}

if (typeof Constants === 'object') {
	this.__sui_constants = Constants;
}
