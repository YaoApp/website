/**
 * Suuport locales
 */
export const Locales = {
  en: "en-us",
  zh: "zh-cn",
  ja: "ja-jp",
  "en-us": "en-us",
  "zh-cn": "zh-cn",
  "zh-hk": "zh-hk",
  "zh-tw": "zh-hk",
  "ja-jp": "ja-jp",
};

/**
 * Get locale
 * @param local string the value of locale
 */
export function GetLocale(local?: string) {
  const lang = local || "en";
  return Locales[lang] || Locales[lang.toLowerCase().split(/-_/)[0]] || "en-us";
}

/**
 * Format date string
 * @param dateInput
 * @param locale
 * @returns
 */
export function FormatDate(locale, dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  switch (locale) {
    case "en-us":
      return `${monthNamesEn[month]} ${day}, ${year}`; // July 10, 2024
    case "zh-cn":
      return `${year}年${month + 1}月${day}日`; // 2024年7月10日
    case "zh-hk":
      return `${year}年${month + 1}月${day}日`; // 2024年7月10日
    case "ja-jp":
      return `${year}年${month + 1}月${day}日`; // 2024年7月10日

    default:
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`; // 默认格式：YYYY-MM-DD
  }
}
