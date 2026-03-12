const BASE_URL = "/api/v1";
async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json.data;
}
export const getHome = () => apiFetch("/home");
export const searchAnime = (keyword, page = 1) => apiFetch(`/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
export const getAnimeDetail = (id) => apiFetch(`/anime/${id}`);
export const getEpisodes = (numericId) => apiFetch(`/episodes/${numericId}`);
export const getServers = (episodeId) => apiFetch(`/servers?id=${episodeId}`);
export const getStream = (serverId) => apiFetch(`/stream?id=${serverId}`);
