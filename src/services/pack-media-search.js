const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36";
const MAX_RESULTS_PER_SOURCE = 40;

function uniqueUrls(urls) {
  return [...new Set(urls.filter((url) => /^https?:\/\//i.test(url)))];
}

function decodeHtml(value) {
  return value
    .replace(/\\u0026/gi, "&")
    .replace(/\\u003d/gi, "=")
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"');
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, ...headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function searchBing(query) {
  const html = await fetchText(
    `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`,
  );
  const urls = [...html.matchAll(/murl&quot;:&quot;(https?:[^"&]+)|murl":"(https?:[^"]+)/gi)]
    .map((match) => decodeHtml(match[1] || match[2]))
    .map((url) => url.replace(/\\u0026/gi, "&"));
  return uniqueUrls(urls).slice(0, MAX_RESULTS_PER_SOURCE);
}

async function searchDuckDuckGo(query) {
  const html = await fetchText(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
  );
  const token = html.match(/vqd=['"]([^'"]+)/i)?.[1];
  if (!token) throw new Error("DuckDuckGo não forneceu token de busca.");

  const response = await fetch(
    `https://duckduckgo.com/i.js?l=br-pt&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(token)}`,
    {
      headers: {
        "user-agent": USER_AGENT,
        referer: "https://duckduckgo.com/",
        accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return uniqueUrls((data.results || []).map((item) => item.image)).slice(
    0,
    MAX_RESULTS_PER_SOURCE,
  );
}

async function searchTenor(query) {
  const html = await fetchText(
    `https://tenor.com/search/${encodeURIComponent(query).replace(/%20/g, "-")}-gifs`,
  );
  const urls = [...decodeHtml(html).matchAll(/https?:\/\/[^"'\s]+?\.(?:gif|webp|mp4)(?:\?[^"'\s]*)?/gi)]
    .map((match) => decodeHtml(match[0]))
    .filter((url) => /media\.tenor\.com|tenor\.com/i.test(url));
  return uniqueUrls(urls).slice(0, MAX_RESULTS_PER_SOURCE);
}

async function searchGiphy(query) {
  const html = await fetchText(
    `https://giphy.com/search/${encodeURIComponent(query).replace(/%20/g, "-")}`,
  );
  const urls = [...decodeHtml(html).matchAll(/https?:\/\/[^"'\s]+?\.(?:gif|webp|mp4)(?:\?[^"'\s]*)?/gi)]
    .map((match) => decodeHtml(match[0]))
    .filter((url) => /giphy\.com|media\d*\.giphy\.com/i.test(url));
  return uniqueUrls(urls).slice(0, MAX_RESULTS_PER_SOURCE);
}

const sources = [
  ["Bing Images", searchBing],
  ["DuckDuckGo Images", searchDuckDuckGo],
  ["Tenor", searchTenor],
  ["Giphy", searchGiphy],
];

export async function searchPackMedia(query, limit = 12) {
  const results = await Promise.allSettled(
    sources.map(async ([source, search]) => ({
      source,
      urls: await search(query),
    })),
  );

  const media = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const url of result.value.urls) {
      if (!media.some((item) => item.url === url)) {
        media.push({ url, source: result.value.source });
      }
    }
  }

  return media.slice(0, limit);
}

export async function downloadPackMedia(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
    throw new Error("O endereço não retornou mídia.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > 20 * 1024 * 1024) {
    throw new Error("Mídia vazia ou maior que 20 MB.");
  }

  return {
    buffer,
    animated:
      contentType.includes("gif") ||
      contentType.includes("video") ||
      /\.(?:gif|mp4)(?:$|\?)/i.test(url),
  };
}
