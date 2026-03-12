import { fetchPage } from "../utils/request.js";
import { load, extractAnimeId, extractImage, extractText, buildFlwItem } from "../utils/parser.js";
export async function scrapeSearch(keyword, page = 1) {
  const html = await fetchPage(`/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  const $ = load(html);
  const results = [];
  $("#main-content .film_list-wrap .flw-item").each((_, el) => { results.push(buildFlwItem($, el)); });
  const totalText = extractText($(".pre-pagination .sr-title"));
  const totalMatch = totalText.match(/(\d+)/);
  const hasNextPage = !!$(".pagination .page-item.active").next(".page-item").length;
  return { results, currentPage: parseInt(page), totalResults: totalMatch ? parseInt(totalMatch[1]) : results.length, hasNextPage };
}
export async function scrapeAnimeDetail(animeId) {
  const html = await fetchPage(`/${animeId}`);
  const $ = load(html);
  const info = {};
  $(".anisc-info .item").each((_, el) => {
    const key = extractText($(el).find(".item-head")).toLowerCase().replace(":", "").trim().replace(/\s+/g, "_");
    const values = [];
    $(el).find("a").each((_, a) => values.push(extractText($(a))));
    if (values.length === 0) { const v = extractText($(el).find(".name")); if (v) values.push(v); }
    if (key && values.length) info[key] = values.length === 1 ? values[0] : values;
  });
  let numericId = $("#syncData").attr("data-id") || $("[data-anime-id]").first().attr("data-anime-id") || $("#detail-page").attr("data-id") || $(".film-buttons a[href*='watch']").first().attr("href")?.match(/-(\d+)\?/)?.[1] || $("a.btn-play").first().attr("href")?.match(/-(\d+)\?/)?.[1] || "";
  if (!numericId) { const urlMatch = animeId.match(/-(\d+)$/); if (urlMatch) numericId = urlMatch[1]; }
  const seasons = [];
  $("#main-content .os-list .os-item").each((_, el) => {
    const $el = $(el);
    const href = $el.find("a").attr("href") || "";
    seasons.push({ id: extractAnimeId(href), title: extractText($el.find(".title")), isCurrent: $el.hasClass("active") });
  });
  const related = [];
  $("#main-sidebar .block_area_sidebar .flw-item").each((_, el) => { related.push(buildFlwItem($, el)); });
  return {
    id: animeId, numericId,
    title: extractText($(".anisc-detail .film-name.dynamic-name")),
    japaneseName: $(".anisc-detail .film-name.dynamic-name").attr("data-jname") || "",
    description: extractText($(".film-description .text")),
    poster: extractImage($(".anisc-poster .film-poster img")),
    quality: extractText($(".anisc-detail .tick .tick-quality")),
    episodes: { sub: parseInt(extractText($(".anisc-detail .tick .tick-sub"))) || 0, dub: parseInt(extractText($(".anisc-detail .tick .tick-dub"))) || 0 },
    info, seasons, related,
  };
}