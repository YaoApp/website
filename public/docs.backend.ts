import { GetCatalog, GetLocales } from "@scripts/doc";
import { sui } from "@yao/runtime";

function Catalog(r: sui.Request) {
  const root = `documentation`;
  const ignoreCache = r.query?.refresh?.[0] === "true" || false;
  let locale = r.locale || "en-us";
  const locales = GetLocales(root, ignoreCache);
  if (!locales.includes(locale)) {
    locale = "en-us";
  }
  return GetCatalog(root, null, locale, ignoreCache);
}


this.__sui_page = '/docs';
this.__sui_constants = {};
this.__sui_helpers = [];

if (typeof Helpers === 'object') {
	this.__sui_helpers = Object.keys(Helpers);
}

if (typeof Constants === 'object') {
	this.__sui_constants = Constants;
}
