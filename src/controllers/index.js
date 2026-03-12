import { scrapeHome } from "../scraper/homeScraper.js";
import { scrapeSearch, scrapeAnimeDetail } from "../scraper/animeScraper.js";
import { scrapeEpisodes } from "../scraper/episodeScraper.js";
import { scrapeServers, scrapeSourceLink, extractVideoSources } from "../scraper/streamScraper.js";
export async function homeController(c) {
  try { return c.json({ success: true, data: await scrapeHome() }); }
  catch (err) { return c.json({ success: false, message: err.message }, 500); }
}
export async function searchController(c) {
  const keyword = c.req.query("keyword") || "";
  if (!keyword.trim()) return c.json({ success: false, message: "keyword required" }, 400);
  try { return c.json({ success: true, data: await scrapeSearch(keyword, c.req.query("page") || 1) }); }
  catch (err) { return c.json({ success: false, message: err.message }, 500); }
}
export async function animeController(c) {
  try { return c.json({ success: true, data: await scrapeAnimeDetail(c.req.param("id")) }); }
  catch (err) { return c.json({ success: false, message: err.message }, 500); }
}
export async function episodesController(c) {
  try { return c.json({ success: true, data: await scrapeEpisodes(c.req.param("id")) }); }
  catch (err) { return c.json({ success: false, message: err.message }, 500); }
}
export async function serversController(c) {
  const id = c.req.query("id");
  if (!id) return c.json({ success: false, message: "id required" }, 400);
  try { return c.json({ success: true, data: await scrapeServers(id) }); }
  catch (err) { return c.json({ success: false, message: err.message }, 500); }
}
export async function streamController(c) {
  const id = c.req.query("id");
  if (!id) return c.json({ success: false, message: "id required" }, 400);
  try {
    const sourceInfo = await scrapeSourceLink(id);
    if (!sourceInfo.link) return c.json({ success: false, message: "No embed link found" }, 404);
    const streamData = await extractVideoSources(sourceInfo.link);
    return c.json({ success: true, data: { embedUrl: sourceInfo.link, ...streamData } });
  } catch (err) { return c.json({ success: false, message: err.message }, 500); }
}
