import { fetchPage } from "../utils/request.js";
import { load, extractAnimeId, extractImage, extractText, buildFlwItem } from "../utils/parser.js";
export async function scrapeHome() {
  const html = await fetchPage("/home");
  const $ = load(html);
  const spotlight = [];
  $("#slider .swiper-slide").each((i, el) => {
    const $el = $(el);
    const href = $el.find("a.btn-play").attr("href") || "";
    spotlight.push({
      rank: i + 1,
      id: extractAnimeId(href),
      title: extractText($el.find(".desi-head-title")),
      japaneseName: $el.find(".desi-head-title").attr("data-jname") || "",
      description: extractText($el.find(".desi-description")),
      poster: extractImage($el.find(".film-poster img")),
      quality: extractText($el.find(".tick .tick-quality")),
      episodes: {
        sub: parseInt(extractText($el.find(".tick .tick-sub"))) || 0,
        dub: parseInt(extractText($el.find(".tick .tick-dub"))) || 0,
      },
      type: extractText($el.find(".tick .tick-pg")),
    });
  });
  const trending = [];
  $("#trending-home .swiper-slide").each((i, el) => {
    const $el = $(el);
    const href = $el.find("a").attr("href") || "";
    trending.push({
      rank: parseInt(extractText($el.find(".number span"))) || i + 1,
      id: extractAnimeId(href),
      title: extractText($el.find(".film-title")),
      poster: extractImage($el.find(".film-poster img")),
    });
  });
  const latestEpisodes = [];
  $("#main-content .block_area-episodes-day .tab-content .flw-item").each((_, el) => {
    latestEpisodes.push(buildFlwItem($, el));
  });
  const topAiring = [];
  $("#main-sidebar .block_area_sidebar:first-of-type .flw-item").each((_, el) => {
    topAiring.push(buildFlwItem($, el));
  });
  return { spotlight, trending, latestEpisodes, topAiring };
}
