import { Process, Store, QueryWhere as Where, FS, log } from "@yao/runtime";

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

/**
 * Sync blog posts from filesystem to database
 * @test yao run scripts.blog.Sync
 */
function Sync() {
  const appfs = new FS("app");
  const fs = new FS("data");
  const blogPath = "/docs/blog";

  if (!fs.Exists(blogPath)) {
    throw new Error("Blog directory not found");
  }

  const langs = fs.ReadDir(blogPath, false);

  for (const langPath of langs) {
    const lang = langPath.split("/").pop();
    if (!lang || !fs.IsDir(`${blogPath}/${lang}`)) continue;

    const categories = fs.ReadDir(`${blogPath}/${lang}`, false);

    for (const categoryPath of categories) {
      const category = categoryPath.split("/").pop();

      if (!category || !fs.IsDir(`${blogPath}/${lang}/${category}`)) continue;

      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

      // Read articles in the category directory
      const articles = fs.ReadDir(`${blogPath}/${lang}/${category}`, false);

      for (const articlePath of articles) {
        if (!articlePath.endsWith(".mdx")) continue;

        try {
          // Build complete file path
          const fullPath = `${articlePath}`;

          // Check if it's a file
          if (!fs.Exists(fullPath) || fs.IsDir(fullPath)) continue;

          // Read article content
          const content = fs.ReadFile(fullPath);

          // Parse article content and metadata
          const parsed = Process("scripts.doc.ParseContent", content);
          if (!parsed) continue;

          // Generate article slug
          const filename = articlePath.replace(".mdx", "");
          const slug =
            category + "-" + fs.BaseName(filename.replace(/^\d+-/, ""));

          // Copy parsed.cover
          if (parsed.cover && parsed.cover.length > 0) {
            const name = `/images/blog/${fs.BaseName(parsed.cover[0])}`;
            appfs.Copy(
              `/data/docs/${parsed.cover[0]}`,
              `/public/assets/upload/${name}`
            );
            parsed.cover[0] = name;
          }

          // Copy Avstart
          if (parsed.authors && parsed.authors.length > 0) {
            parsed.authors.forEach((author) => {
              if (author.avatar && author.avatar.length > 0) {
                const name = `/images/blog/authors/${fs.BaseName(
                  author.avatar[0]
                )}`;

                appfs.Copy(
                  `/data/docs/${author.avatar[0]}`,
                  `/public/assets/upload/${name}`
                );
                author.avatar[0] = name;
              }
            });
          }

          // Prepare article data
          const articleData = {
            title: parsed.title || slug,
            slug: slug,
            lang: lang,
            content: parsed.content || "",
            summary: parsed.description || "",
            authors: parsed.authors || [],
            categories: [categoryName],
            status: parsed.status || "published",
            published_at: parsed.published_at || new Date().toISOString(),
            seo_title: parsed.seo_title || parsed.title,
            seo_keywords: parsed.seo_keywords || [],
            seo_description: parsed.description || parsed.summary,
            share_message: parsed.share_message || "",
            cover: parsed.cover || null,
            background: parsed.background || null,
            sort: parsed.sort || 9999,
            recommend: parsed.recommend !== false,
            sticky: parsed.sticky || false,
            list_recommend: parsed.list_recommend !== false,
          };

          // Check if article already exists
          const exists = Process("models.article.Get", {
            wheres: [
              { column: "lang", value: lang },
              { column: "slug", value: slug },
            ],
            limit: 1,
          });

          if (exists && exists.length > 0) {
            // Update existing article
            Process("models.article.Update", exists[0].id, articleData);
            log.Info(`Updated article: ${lang}/${slug}`);
          } else {
            // Create new article
            Process("models.article.Create", articleData);
            log.Info(`Created article: ${lang}/${slug}`);
          }
        } catch (error) {
          log.Error(
            `Error processing article ${articlePath}: ${error.message}`
          );
          continue;
        }
      }
    }
  }
}
