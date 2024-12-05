import { Process, Store, FS } from "@yao/runtime";

/**
 * Generate Sitemap XML
 * api: @/apis/sitemap.http.yao
 * path: /api/sitemap/<lang>.xml
 * @test yao run scripts.sitemap.Generate
 * @param lang
 * @returns
 */
function Generate(lang?: string) {
  const domain = "https://yaoapps.com";
  lang = (lang || "en-us").replace(".xml", "");

  // Use cache to avoid frequent regeneration
  const cache = new Store("cache");
  const cacheKey = `sitemap_${lang}`;
  const cacheData = cache.Get(cacheKey);
  if (cacheData) {
    const ts = new Date().getTime();
    if (ts - cacheData.time < 24 * 60 * 60 * 1000) {
      return cacheData.data;
    }
  }

  // Get all published articles
  const articles = Process(`models.article.Get`, {
    select: ["slug", "published_at"],
    wheres: [
      { column: "status", value: "published" },
      { column: "lang", value: lang },
    ],
  });

  // Add documentation roots
  const docRoots = ["documentation", "references", "tutorials"];
  const docPages = [];

  docRoots.forEach((root) => {
    // Get doc catalog for each root
    const catalog = Process("scripts.doc.GetCatalog", root, null, lang, false);
    // Get links map which contains file paths
    const links = Process("scripts.doc.GetLinks", root, null, lang, false);

    const collectLinks = (items: any[]) => {
      items.forEach((item) => {
        const fs = new FS("system");
        const linkInfo = links[item.link];
        const filePath = linkInfo ? linkInfo.path : null;

        // If file not exists, skip
        if (!filePath || !fs.Exists(filePath)) {
          return;
        }
        const lastmodTs = fs.ModTime(filePath);
        const lastmod = new Date(lastmodTs * 1000).toISOString();
        docPages.push({
          loc: `${domain}/docs/${item.link}`,
          lastmod: lastmod,
          changefreq: "weekly",
          priority: "0.7",
        });
        if (item.children && item.children.length > 0) {
          collectLinks(item.children);
        }
      });
    };
    collectLinks(catalog);
  });

  // Static pages
  const staticPages = ["/", "/uses", "/blog", "/docs", "/download"];

  const urls = [
    // Add static pages
    ...staticPages.map((page) => ({
      loc: `${domain}${page}`,
      lastmod: null,
      changefreq: "weekly",
      priority: page === "/" ? "1.0" : "0.8",
    })),
    // Add blog articles
    ...articles.map((article) => ({
      loc: `${domain}/blog/${article.slug}`,
      lastmod: new Date(article.published_at).toISOString(),
      changefreq: "weekly",
      priority: "0.6",
    })),
    // Add doc pages from filesystem
    ...docPages,
  ];

  const urlset = urls
    .map(
      (url) => `
    <url>
        <loc>${url.loc}</loc>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlset}
</urlset>`;

  // Save to cache
  cache.Set(cacheKey, { time: new Date().getTime(), data: sitemap });
  return sitemap;
}

/**
 * Generate and save sitemap file to /public directory
 * @test yao run scripts.sitemap.GenerateFile
 */
function GenerateFile() {
  const fs = new FS("app");

  // Generate sitemap content
  const content = Generate("en-us");

  // Save to file
  const filename = "/public/sitemap.xml";
  fs.WriteFile(filename, content);
  console.log(`Generated sitemap: ${filename}`);
}
