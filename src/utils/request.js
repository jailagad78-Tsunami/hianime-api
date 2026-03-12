import axios from "axios";
export const BASE_URL = "https://hianime.to";
export const AJAX_BASE = "https://hianime.to/ajax";
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Referer": "https://hianime.to/",
  "Upgrade-Insecure-Requests": "1",
};
const AJAX_HEADERS = {
  ...BROWSER_HEADERS,
  "X-Requested-With": "XMLHttpRequest",
  "Accept": "application/json, text/javascript, */*; q=0.01",
};
export async function fetchPage(path) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const { data } = await axios.get(url, { headers: BROWSER_HEADERS, timeout: 15000 });
  return data;
}
export async function fetchAjax(endpoint, params = {}) {
  const url = `${AJAX_BASE}/${endpoint}`;
  const { data } = await axios.get(url, { headers: AJAX_HEADERS, params, timeout: 15000 });
  return data;
}
