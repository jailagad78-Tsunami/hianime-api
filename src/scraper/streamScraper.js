import axios from "axios";
import crypto from "crypto";
import { fetchAjax, fetchPage } from "../utils/request.js";
import { load, extractText } from "../utils/parser.js";
export async function scrapeServers(episodeId) {
  const data = await fetchAjax("v2/episode/servers", { episodeId });
  if (!data?.html) return { sub: [], dub: [], raw: [] };
  const $ = load(data.html);
  const sub = [], dub = [], raw = [];
  $(".server-item").each((_, el) => {
    const $el = $(el);
    const server = { id: $el.attr("data-id") || "", serverId: $el.attr("data-server-id") || "", name: extractText($el.find("a")) || extractText($el), type: $el.attr("data-type") || "sub" };
    if (server.id) { if (server.type === "sub") sub.push(server); else if (server.type === "dub") dub.push(server); else raw.push(server); }
  });
  return { sub, dub, raw };
}
export async function scrapeSourceLink(serverId) {
  const data = await fetchAjax("v2/episode/sources", { id: serverId });
  return { type: data?.type || "iframe", link: data?.link || "", server: data?.server || "" };
}
async function fetchDecryptionKey() {
  const { data } = await axios.get("https://raw.githubusercontent.com/enimax-anime/key/e4/key.txt", { timeout: 8000 });
  return data.trim();
}
function decryptSources(encryptedStr, key) {
  const encryptedBuf = Buffer.from(encryptedStr, "base64");
  const salt = encryptedBuf.subarray(8, 16);
  const ciphertext = encryptedBuf.subarray(16);
  function evpBytesToKey(password, salt, keyLen, ivLen) {
    let d = Buffer.alloc(0), d_i = Buffer.alloc(0);
    while (d.length < keyLen + ivLen) { d_i = crypto.createHash("md5").update(Buffer.concat([d_i, password, salt])).digest(); d = Buffer.concat([d, d_i]); }
    return { key: d.subarray(0, keyLen), iv: d.subarray(keyLen, keyLen + ivLen) };
  }
  const { key: aesKey, iv } = evpBytesToKey(Buffer.from(key), salt, 32, 16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8"));
}
export async function extractVideoSources(embedUrl) {
  const html = await fetchPage(embedUrl);
  const $ = load(html);
  const scriptContent = $("script").map((_, el) => $(el).html()).get().join("\n");
  const sourcesMatch = scriptContent.match(/sources:\s*"([^"]+)"/);
  const tracksMatch = scriptContent.match(/"tracks":\s*(\[.*?\])/s);
  if (!sourcesMatch) {
    const plainMatch = scriptContent.match(/"file":"(https?:[^"]+\.m3u8[^"]*)"/);
    if (plainMatch) return { sources: [{ url: plainMatch[1], type: "hls", quality: "auto" }], tracks: [], intro: null };
    throw new Error("Could not find video sources in embed page");
  }
  const key = await fetchDecryptionKey();
  const decrypted = decryptSources(sourcesMatch[1], key);
  const sources = (Array.isArray(decrypted) ? decrypted : [decrypted]).map(s => ({ url: s.file || s.url || "", type: s.type || "hls", quality: s.label || "auto" }));
  let tracks = [];
  try { if (tracksMatch) tracks = JSON.parse(tracksMatch[1]); } catch {}
  return { sources, tracks, intro: null };
}
