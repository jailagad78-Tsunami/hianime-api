import { fetchAjax } from "../utils/request.js";
import { load, extractText } from "../utils/parser.js";
export async function scrapeEpisodes(numericAnimeId) {
  const data = await fetchAjax(`v2/episode/list/${numericAnimeId}`);
  if (!data?.html) return { episodes: [], total: 0 };
  const $ = load(data.html);
  const episodes = [];
  $(".ss-list a.ep-item").each((_, el) => {
    const $el = $(el);
    const episodeId = $el.attr("data-id") || "";
    const number = parseInt($el.attr("data-number")) || 0;
    const title = extractText($el.find(".ssli-name")) || $el.attr("title") || `Episode ${number}`;
    const isFiller = $el.hasClass("ssl-item-filler");
    const hasSub = !$el.hasClass("ep-item-dub-only");
    const hasDub = $el.hasClass("ep-item-dub") || $el.hasClass("ep-item-both");
    if (episodeId) episodes.push({ episodeId, number, title, isFiller, hasSub, hasDub });
  });
  return { episodes, total: episodes.length };
}
