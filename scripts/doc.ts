import { FS, Process, Store, log } from "@yao/runtime";

/**
 * Clean the cache
 */
export function CleanCache() {
  const cache = new Store("cache");
  const roots = ["documentation", "references", "tutorials"];
  roots.forEach((root) => {
    const keys = [
      `doc-${root}-catalog`,
      `doc-${root}-links`,
      `doc-${root}-locales`,
    ];
    keys.forEach((key) => cache.Del(key));
  });
}

export function GetLocales(root: string, ignoreCache = false): string[] {
  const cache = new Store("cache");
  const key = `doc-${root}-locales`;
  const cached = cache.Get(key);
  if (cached && !ignoreCache) {
    return cached;
  }
  const fs = new FS("system");
  const rootPath = `/docs/${root}`;
  const dirs = fs.ReadDir(rootPath, false);
  const locales = dirs.map((dir) => dir.split("/")[3]);
  cache.Set(key, locales);
  return locales;
}

export function GetCatalog(
  root: string,
  name: string | null,
  locale: string,
  ignoreCache = false
): CatalogItem[] {
  // console.log(`Catalog: ${request.theme} ${request.locale}`);
  const cache = new Store("cache");
  const key = `doc-${root}-${locale}-${name || ""}-catalog`;
  const keyLink = `doc-${root}-${locale}-${name || ""}-links`;

  // Read from cache
  const cached = cache.Get(key);
  if (cached && !ignoreCache) {
    return cached;
  }

  // Stroring the links map
  const rootPath = name
    ? `/docs/${root}/${locale}/${name}`
    : `/docs/${root}/${locale}`;

  let linksMaps: Record<string, LinkMap> = {};
  const fs = new FS("system");
  const dirs = fs.ReadDir(rootPath, true);
  const tree = (dirs: string[]): CatalogItem[] => {
    return dirs.reduce<CatalogItem[]>((items, path) => {
      // ignore the index.mdx
      if (path.endsWith("index.mdx")) {
        return items;
      }

      // ignore the files that are not mdx
      if (!fs.IsDir(path) && !path.endsWith(".mdx")) {
        return items;
      }

      const parts = path.split("/");
      const filename = parts[parts.length - 1];
      const link = getLink(path);

      const title = getTitle(filename);

      const filepath = path.endsWith(".mdx") ? path : `${path}/index.mdx`;
      const linkmap: LinkMap = { path: filepath, parents: [], title: title };
      const from = name ? 5 : 4;
      const parents = parts.slice(from, parts.length - 1);
      if (parents.length === 0) {
        items.push({ name: filename, title, link, parents, children: [] });
        linksMaps[link] = linkmap; // add the linkmap
        return items;
      }

      let parent = items;
      parents.forEach((pname: string, idx: number) => {
        const index = parent.findIndex((item) => item.name === pname);
        if (index === -1) {
          const item = { name: filename, link, title, parents, children: [] };
          parent.push(item);
          parent = item.children;
          linksMaps[link] = linkmap; // add the linkmap
          return;
        }

        // if it's the last parent then add the item
        if (idx === parents.length - 1) {
          const item = { name: filename, link, title, parents, children: [] };
          parent[index].children.push(item);
        }

        // add the parent to the linkmap
        linkmap.parents.push({
          name: parent[index].name,
          link: parent[index].link,
          title: parent[index].title,
        });
        parent = parent[index].children;
        linksMaps[link] = linkmap;
      });

      return items;
    }, []);
  };

  const catalog = tree(dirs);
  cache.Set(key, catalog);
  cache.Set(keyLink, linksMaps);
  return catalog;
}

export function GetSubjects(
  root: string,
  name: string | null,
  locale: string,
  ignoreCache = false
): string[] {
  const cache = new Store("cache");
  const key = `doc-${root}-${locale}-${name || ""}-subjects`;
  const cached = cache.Get(key);
  if (cached && !ignoreCache) {
    return cached;
  }

  const fs = new FS("system");
  const dirs = fs.ReadDir(`/docs/${root}/${locale}`);
  const subjects = dirs.map((dir) => dir.split("/")[4]);
  cache.Set(key, subjects);
  return subjects;
}

export function GetSubjectPath(
  root: string,
  name: string | null,
  locale: string,
  ignoreCache = false
): string | null {
  const subjects = GetSubjects(root, name, locale, ignoreCache);
  for (const s of subjects) {
    if (s.endsWith(name)) {
      return s;
    }
  }

  return null;
}

/**
 * Get the links map of the docs
 * Cached until the server is restarted or the cache is cleared
 *
 * @test yao run scripts.doc.Links
 * @param request
 * @returns
 */
export function GetLinks(
  root: string,
  name: string | null,
  locale: string,
  ignoreCache: boolean = false
): Record<string, LinkMap> {
  const cache = new Store("cache");
  const key = `doc-${root}-${locale}-${name || ""}-links`;
  const cached = cache.Get(key);
  if (cached) {
    return cached;
  }

  GetCatalog(root, name, locale, ignoreCache);
  return cache.Get(key) || {};
}

function getLink(path: string): string {
  return path
    .replace(/^\/docs\//, "")
    .replace(/\.mdx$/, "")
    .replace(/\/(\d+)-/g, "/");
}

function getTitle(filename: string): string {
  return toUpperCase(
    filename
      .replace(/^\/docs\//, "")
      .replace(/\.mdx$/, "")
      .replace(/^(\d+)-/g, "")
      .replace(/-/g, " ")
  );
}

function toUpperCase(str: string): string {
  const fullUpperList = [
    "api",
    "cli",
    "ai",
    "css",
    "html",
    "rest",
    "http",
    "js",
    "dsl",
    "aigc",
    "arm64",
    "json",
    "ui",
  ];

  return str
    .split(" ")
    .map((s) => {
      if (s == "to") {
        return s;
      }
      if (fullUpperList.includes(s)) {
        return s.toUpperCase();
      }
      return s.replace(/^\w/, (c) => c.toUpperCase());
    })
    .join(" ");
}

/**
 * Parse the content of the doc
 * Get the meta data and the content
 * @param content
 * @returns
 */
export function ParseContent(content: string) {
  const meta = content.match(/---([\s\S]*?)---/);
  if (!meta) {
    return { content };
  }
  const metaContent = meta[1];
  content = content.replace(meta[0], "");
  try {
    const data = Process("encoding.yaml.Decode", metaContent, false);
    return { ...data, content };
  } catch (e) {
    log.Error(`Error parsing meta: ${e.message}`);
    return { content };
  }
}

type CatalogItem = {
  name: string;
  title: string;
  link: string;
  path?: string;
  parents?: string[];
  children: CatalogItem[];
};

type LinkMap = {
  path: string;
  title: string;
  parents: { name: string; link: string; title: string }[];
};
