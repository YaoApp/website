import { Process, sui, QueryWhere as Where } from "@yao/runtime";

const everythingMapping = {
  "en-us": "Everything",
  "zh-cn": "全部",
  "zh-tw": "全部",
  "ja-jp": "すべて",
  Everything: true,
  全部: true,
  すべて: true,
};

/**
 * Get all articles by locale
 * @param r
 */
function Articles(r: sui.Request) {
  const locale = Process("scripts.utils.GetLocale", r.locale);
  const category = r.query?.category?.[0] || null;
  const articles = getArticles(1, locale, category);
  articles.category = category || "Everything";
  return articles;
}

/**
 * Get all categories by locale
 * @param r
 * @returns
 */
function Categories(r: sui.Request) {
  const locale = Process("scripts.utils.GetLocale", r.locale);
  const categories = getCategories(locale);
  return categories;
}

function ApiGetArticles(category: string, page: number = 1) {
  const articles = getArticles(page, null, category);
  return articles;
}

function getArticles(
  currentPage: number | string = 1,
  locale?: string,
  category?: string,
  pageSize: number | string = 6
) {
  const wheres: Where[] = [
    { column: "status", value: "published" },
    {
      wheres: [
        { column: "recommend", value: 1 },
        { method: "orwhere", column: "recommend", value: 1 },
      ],
    },
  ];

  if (locale) {
    wheres.push({ column: "lang", value: locale });
  }

  if (category && !everythingMapping[category]) {
    wheres.push({ column: "categories", value: category, op: "match" });
  }

  const articles = Process(
    `models.article.Paginate`,
    {
      select: [
        "title",
        "slug",
        "authors",
        "categories",
        "summary",
        "published_at",
        "cover",
        "background",
        "recommend",
        "sticky",
        "list_recommend",
      ],
      wheres,
      orders: [
        { column: "sort", option: "asc" },
        { column: "published_at", option: "desc" },
      ],
    },
    currentPage,
    pageSize
  );

  // Format articles
  articles.data =
    articles?.data.map((article) => {
      const date = article.published_at;
      const cover = article.cover?.[0]
        ? `/assets/upload${article.cover?.[0]}`
        : "/assets/upload/images/placeholder/240X135.svg";

      const firstAuthor = article.authors?.[0] || {
        name: "Yao Team",
        avatar: ["/assets/images/icons/app.png"],
      };

      firstAuthor.avatar =
        firstAuthor?.avatar?.[0]?.startsWith("/assets") ||
        firstAuthor?.avatar[0]?.startsWith("http")
          ? firstAuthor.avatar[0]
          : `/assets/upload${firstAuthor.avatar[0]}`;

      article.cover = cover;
      article.firstAuthor = firstAuthor;
      article.date = Process("scripts.utils.FormatDate", locale, date);
      return article;
    }) || [];

  articles.pages = [];
  for (let i = 1; i <= articles.pagecnt; i++) {
    articles.pages.push(i);
  }

  return articles;
}

function getCategories(locale: string) {
  // Get all categories
  let categories = Process(`models.article.category.Get`, {
    select: ["name"],
    orders: [{ column: "sort", option: "asc" }],
  });

  return [
    { name: everythingMapping[locale], slug: null },
    ...categories?.map((c) => ({
      name: c.name,
      slug: c.name.replace(/\s/g, "-"),
    })),
  ];
}
