import { Process, sui } from "@yao/runtime";

function Article(r: sui.Request) {
  const locale = Process("scripts.utils.GetLocale", r.locale);
  return getData(r.params.slug, locale);
}

function getData(slug: string, locale: string) {
  const articles = Process("models.article.Get", {
    select: [
      "title",
      "slug",
      "authors",
      "categories",
      "content",
      "summary",
      "published_at",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "cover",
      "background",
      "recommend",
      "sticky",
      "list_recommend",
      "status",
    ],
    wheres: [
      { column: "slug", value: slug },
      { column: "lang", value: locale },
    ],
  });
  if (articles.length === 0) {
    return { code: 404, message: "Article not found" };
  }

  const article = articles[0];

  // Format content
  article.date = Process(
    "scripts.utils.FormatDate",
    locale,
    article.published_at
  );

  article.authors =
    article.authors && article.authors.length > 0
      ? article.authors
      : [
          {
            name: "Yao Team",
            avatar: ["/assets/images/icons/app.png"],
            link: "https://yaoapps.com",
          },
        ];

  article.authors.forEach((author) => {
    author.avatar =
      author?.avatar?.[0]?.startsWith("/assets") ||
      author?.avatar?.[0]?.startsWith("http")
        ? author.avatar?.[0] || ""
        : author.avatar?.[0]
        ? `/assets/upload${author.avatar[0]}`
        : "";

    article.content = article.content ? `\n${article.content}` : "";
  });

  return article;
}
