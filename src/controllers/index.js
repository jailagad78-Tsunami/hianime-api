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
    // Step 1: get embed URL for this server
    const sourceInfo = await scrapeSourceLink(id);
    if (!sourceInfo.link) {
      return c.json({ success: false, message: "No embed link found" }, 404);
    }

    // Step 2: try to decrypt sources — if it fails, fall back to iframe
    let sources = [];
    let tracks = [];
    let intro = null;
    let usedFallback = false;

    try {
      const streamData = await extractVideoSources(sourceInfo.link);
      sources = streamData.sources || [];
      tracks = streamData.tracks || [];
      intro = streamData.intro || null;
    } catch (decryptErr) {
      // Decryption failed (key rotated, embed changed, etc.)
      // Fall back to iframe — the embed URL itself will play the video
      console.warn("[streamController] Decryption failed, using iframe fallback:", decryptErr.message);
      usedFallback = true;
    }

    return c.json({
      success: true,
      data: {
        embedUrl: sourceInfo.link,
        sources,
        tracks,
        intro,
        usedFallback,
      },
    });
  } catch (err) {
    console.error("[streamController]", err.message);
    return c.json({ success: false, message: err.message }, 500);
  }
}
