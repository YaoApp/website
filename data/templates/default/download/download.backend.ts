import { Process, sui } from "@yao/runtime";

function Releases(r: sui.Request) {
  const lang = Process("scripts.utils.GetLocale", r.locale);
  const releases = Process("models.release.Get", {
    select: [
      "version",
      "summary",
      "summary_zh-cn",
      "summary_zh-hk",
      "summary_ja-jp",
      "release_notes_link",
      "md5_checksum",
      "published_at",
      "download_links",
      "status",
    ],
    wheres: [{ column: "status", value: "published" }],
    orders: [
      { column: "sort", option: "asc" },
      { column: "published_at", option: "desc" },
    ],
  });

  // Keep only the summary in the current language
  // Format the date in the current language
  releases.forEach((release) => {
    release.summary = release[`summary_${lang}`] || release.summary;
    const date = release.published_at;
    release.date = Process("scripts.utils.FormatDate", lang, date);
    ["zh-cn", "zh-tw", "ja-jp"].forEach((locale) => {
      delete release[`summary_${locale}`];
    });
  });

  return releases;
}
