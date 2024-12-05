import { Process, QueryWhere as Where } from "@yao/runtime";

/**
 * Get the list of blog categories
 * @param query
 */
function CategoryOptions(query: Record<string, any>) {
  const { keywords } = query || {};
  const wheres: Where[] = [];
  if (keywords && keywords.length > 0) {
    wheres.push({ column: "name", op: "match", value: keywords });
  }

  let categories = Process(`models.tutorial.category.Get`, {
    select: ["name"],
    wheres,
    orders: [{ column: "sort", option: "asc" }],
  });

  return categories.map((category) => {
    return { value: category.name, label: category.name };
  });
}
