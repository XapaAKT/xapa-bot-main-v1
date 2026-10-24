const GOOGLE_IMAGES_URL = "https://www.google.com/search";
const MAX_RESULTS = 10;

function decodeGoogleHtml(value) {
  return value
    .replace(/\\u003d/gi, "=")
    .replace(/\\u0026/gi, "&")
    .replace(/\\x3d/gi, "=")
    .replace(/\\x26/gi, "&")
    .replace(/\\\//g, "/")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function extractGoogleImageUrls(html) {
  const decodedHtml = decodeGoogleHtml(html);
  const matches = decodedHtml.match(
    /https?:\/\/encrypted-tbn\d*\.gstatic\.com\/images\?[^"'<>\\\s]+/gi,
  ) || [];
  const uniqueUrls = [...new Set(matches.map((url) => url.replace(/[),;]+$/, "")))];

  return uniqueUrls.slice(0, MAX_RESULTS);
}

export async function searchGoogleImages(query) {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    throw new Error("Informe o que deseja pesquisar no Google.");
  }

  const url = new URL(GOOGLE_IMAGES_URL);
  url.searchParams.set("tbm", "isch");
  url.searchParams.set("q", cleanQuery);
  url.searchParams.set("hl", "pt-BR");

  const response = await fetch(url, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`O Google respondeu com HTTP ${response.status}.`);
  }

  const html = await response.text();
  const images = extractGoogleImageUrls(html);
  if (!images.length) {
    throw new Error(
      "O Google não retornou imagens. A busca pode estar temporariamente bloqueada ou o formato da página pode ter mudado.",
    );
  }

  return images;
}
