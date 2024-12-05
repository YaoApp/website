import {
  GetCatalog,
  GetLinks,
  GetLocales,
  GetSubjectPath,
  ParseContent,
} from "@scripts/doc";
import { Exception, FS, log, sui } from "@yao/runtime";

function Catalog(r: sui.Request) {
  const route = parseRoute(r);
  const ignoreCache = r.query?.refresh?.[0] === "true" || false;
  return GetCatalog(route.root, route.name, route.locale, ignoreCache);
}

function Content(r: sui.Request) {
  const route = parseRoute(r);

  const fs = new FS("system");
  const links = GetLinks(route.root, route.name, route.locale);
  const link = links[route.link];
  if (!fs.Exists(link.path)) {
    throw new Exception("File not found", 404);
  }

  const content = fs.ReadFile(link.path);
  const data = ParseContent(content);
  return {
    breadcrumb: [
      ...(link.parents || []),
      { name: route.name, link: link.path, title: link.title },
    ],
    title: link.title,
    path: link.path?.replace(/^\/docs/, ""),
    ...data,
  };
}

function parseRoute(r: sui.Request): Route {
  let link = r.params?.name;
  if (!link) {
    throw new Exception("Name is required", 400);
  }

  let parts = link.split("/");
  const root = parts[0];
  const ignoreCache = r.query?.refresh?.[0] === "true" || false;
  const locales = GetLocales(root, ignoreCache);
  const hasLocale = parts[1] && locales.includes(parts[1]);
  parts = hasLocale ? parts : [root, "en-us", ...parts.slice(1)];
  link = parts.join("/");
  const locale = parts[1];
  if (root === "documentation" && locale) {
    return {
      link,
      root,
      locale,
      name: null,
      path: parts.slice(2).join("/"),
      ignoreCache: ignoreCache,
    };
  }

  if (parts.length < 3) {
    throw new Exception("Invalid route", 400);
  }

  const name = GetSubjectPath(root, parts[2], locale, ignoreCache);
  parts = [root, locale, name, ...parts.slice(3)];
  return {
    link,
    root,
    locale,
    name,
    path: parts.slice(3).join("/"),
    ignoreCache: ignoreCache,
  };
}

type Route = {
  link: string;
  root: string;
  name: string | null;
  path: string;
  locale: string;
  ignoreCache: boolean;
};
