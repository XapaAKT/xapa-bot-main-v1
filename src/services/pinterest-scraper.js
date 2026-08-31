const PINTEREST_RESOURCE_URL =
  "https://www.pinterest.com/resource/BaseSearchResource/get/";
const MAX_RESULTS = 10;

function collectPinImages(value, images = []) {
  if (!value || typeof value !== "object") return images;

  if (typeof value.url === "string" && value.url.includes("i.pinimg.com")) {
    images.push(value.url);
  }

  for (const child of Object.values(value)) {
    collectPinImages(child, images);
  }

  return images;
}

function toOriginalImageUrl(url) {
  return url.replace(/\/(?:\d+x|originals)\//, "/originals/");
}

function deduplicateImages(urls) {
  const seen = new Set();
  const unique = [];

  for (const url of urls) {
    const key = url.replace(/\.[a-z]+(?:\?.*)?$/i, "");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(url);
  }

  return unique;
}

export async function searchPinterest(query) {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    throw new Error("Informe o que deseja pesquisar no Pinterest.");
  }

  const sourceUrl = `/search/pins/?q=${encodeURIComponent(cleanQuery)}`;
  const url = new URL(PINTEREST_RESOURCE_URL);
  url.searchParams.set("source_url", sourceUrl);
  url.searchParams.set(
    "data",
    JSON.stringify({
      options: { query: cleanQuery, scope: "pins" },
      context: {},
    }),
  );

  const response = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
      "x-pinterest-pws-handler": "www/search/[term].js",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Pinterest respondeu com HTTP ${response.status}.`);
  }

  const payload = await response.json();
  const results = payload?.resource_response?.data?.results || [];
  const pinImages = results
    .filter((item) => item?.type === "pin")
    .flatMap((item) => collectPinImages(item.images || {}));
  const images = deduplicateImages(
    pinImages.map(toOriginalImageUrl),
  ).slice(0, MAX_RESULTS);
  if (!images.length) {
    throw new Error("Nenhuma imagem encontrada no Pinterest.");
  }

  return images;
}
