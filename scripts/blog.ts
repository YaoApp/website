import { Process, Store, QueryWhere as Where } from "@yao/runtime";

/**
 * RSS Feed
 * api: @/apis/blog.http.yao
 * path: /api/blog/feed/<lang>.xml
 * @param lang
 * @returns
 */
function Feed(lang?: string) {
  const domain = "https://yaoapps.com";
  // const domain = "http://localhost:5099";
  lang = (lang || "en-us").replace(".xml", "");

  const cache = new Store("cache");
  const cacheKey = `feed_${lang}`;
  const cacheData = cache.Get(cacheKey);
  if (cacheData) {
    const ts = new Date().getTime();
    if (ts - cacheData.time < 24 * 60 * 60 * 1000) {
      return cacheData.data;
    }
  }

  const articles = Process(`models.article.Get`, {
    select: [
      "title",
      "lang",
      "cover",
      "authors",
      "summary",
      "share_message",
      "slug",
      "published_at",
    ],
    wheres: [
      { column: "status", value: "published" },
      { column: "lang", value: lang.replace(".xml", "") },
    ],
    orders: [{ column: "published_at", option: "desc" }],
    limit: 50,
  });

  const items = articles.map((article) => {
    const authors = [];
    if (article.authors && article.authors.length > 0) {
      article.authors.forEach((author) => {
        authors.push(
          `<dc:creator>${author.name} (${
            author.email || "yao@iqka.com"
          })</dc:creator>`
        );
      });
    }
    if (authors.length === 0) {
      authors.push("<dc:creator> Yao Team (yao@iqka.com)</dc:creator>");
    }

    const cover = article.cover?.[0]
      ? `<img src="${domain}/assets/upload${article.cover[0]}" alt="${article.title}" /> `
      : "";

    return `
        <item>
            <title>
            <![CDATA[${article.title}]]>
            </title>
            <description><![CDATA[
              <p>${
                article.share_message || article.summary || article.title
              }</p>
              ${cover}
            ]]></description>
            ${authors.join("\n")}
            <link>${domain}/blog/${article.slug}</link>
            <guid>${domain}/blog/${article.slug}</guid>
            <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
        </item>
    `;
  });

  const itemRaw = items.join("\n");
  const buildDate = new Date().toUTCString();
  const feed = `
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" >
    <channel>
        <title>Yao Blog</title>
        <link>${domain}/blog</link>
        <description>Yao Blog</description>
        <lastBuildDate>${buildDate}</lastBuildDate>
        <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
        <generator>Yao App Engine - ${domain}</generator>
        <language>${lang}</language>
        <atom:link href="${domain}/api/blog/feed/${lang}.xml" rel="self" type="application/rss+xml" />
        <image>
           <url>${domain}/assets/images/icons/app.png</url>
           <title>Yao Blog</title>
           <link>${domain}/blog</link>
           <width>144</width> 
           <height>144</height>
        </image>
        ${itemRaw}
    </channel>
</rss>
  `;
  cache.Set(cacheKey, { time: new Date().getTime(), data: feed });
  return feed;
}

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

  let categories = Process(`models.article.category.Get`, {
    select: ["name"],
    wheres,
    orders: [{ column: "sort", option: "asc" }],
  });

  return categories.map((category) => {
    return { value: category.name, label: category.name };
  });
}
