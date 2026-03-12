import * as cheerio from "cheerio";
export function load(html) { return cheerio.load(html); }
export function extractAnimeId(href = "") {
  if (!href) return "";
  return href.replace(/^\/(watch\/)?/, "").split("?")[0];
}
export function extractImage($el) { return $el.attr("data-src") || $el.attr("src") || ""; }
export function extractText($el) { return ($el.text() || "").trim(); }
export function buildFlwItem($, el) {
  const $item = $(el);
  const $a = $item.find(".film-poster a");
  const href = $a.attr("href") || "";
  const id = extractAnimeId(href);
  return {
    id,
    title: extractText($item.find(".film-name a")),
    poster: extractImage($item.find(".film-poster img")),
    type: extractText($item.find(".fd-infor .fdi-item").first()),
    episodes: {
      sub: parseInt(extractText($item.find(".tick-sub"))) || 0,
      dub: parseInt(extractText($item.find(".tick-dub"))) || 0,
    },
    quality: extractText($item.find(".tick-quality")),
    url: href,
  };
}
