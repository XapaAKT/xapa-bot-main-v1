import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const YANDEX_IMAGES_URL = "https://yandex.com/images/search";
const BING_IMAGES_URL = "https://www.bing.com/images/search";
const RULE34_API_URL = "https://api.rule34.xxx/index.php";
const GELBOORU_API_URL = "https://gelbooru.com/index.php";
const YANDE_API_URL = "https://yande.re/post.json";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36";
const REQUEST_TIMEOUT = 15000;
const IMAGE_TIMEOUT = 12000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_RESULTS = 45;
const MIN_SOURCE_RESULTS = 15;
const MAX_REDIRECTS = 3;
const PREFERRED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const BLOCKED_ADULT_TAGS = [
  "-loli",
  "-shota",
  "-child",
  "-underage",
  "-teen",
  "-young",
];
const REDUNDANT_ADULT_TAGS = new Set([
  "adult",
  "adults",
  "hentai",
  "nsfw",
  "porn",
  "porno",
  "pornografia",
  "xxx",
]);
const ADULT_TAG_ALIASES = new Map([
  ["girl", "1girl"],
  ["girls", "2girls"],
  ["boy", "1boy"],
  ["boys", "2boys"],
  ["demon_slayer", "kimetsu_no_yaiba"],
]);
const ADULT_SEARCH_TERMS =
  /\b(?:adult[oa]s?|nsfw|porn(?:o|ografia)?|hentai|xxx|nudes?)\b/i;
const UNDERAGE_TERMS =
  /\b(?:child(?:ren)?|kid|minor|underage|teen(?:age|ager)?|loli|shota|menor(?:es)?|crian[cç]a|adolescente)\b/i;

export function parseImageSearchQuery(input) {
  const query = String(input || "").trim();
  const explicitAdultMode = /(?:^|\s)(?:--adult|\+18)(?=\s|$)/i.test(query);
  const adult = explicitAdultMode || ADULT_SEARCH_TERMS.test(query);
  const cleanQuery = query
    .replace(/(?:^|\s)(?:--adult|\+18)(?=\s|$)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (adult && UNDERAGE_TERMS.test(cleanQuery)) {
    throw new Error("A busca adulta não aceita termos relacionados a menores.");
  }

  return { query: cleanQuery, adult };
}

function getExtension(value, fallback = "") {
  const extension = String(fallback || "")
    .replace(/^\./, "")
    .toLowerCase();
  if (extension) {
    return extension;
  }

  try {
    return new URL(value).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() || "";
  } catch {
    return "";
  }
}

function normalizeImageResult(imageUrl, referer, extension) {
  try {
    const url = new URL(imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl);
    if (url.protocol === "http:") {
      url.protocol = "https:";
    }
    if (url.protocol !== "https:" || url.username || url.password) {
      return null;
    }

    const fileExtension = getExtension(url.href, extension);
    if (fileExtension && !PREFERRED_EXTENSIONS.has(fileExtension)) {
      return null;
    }

    let safeReferer = "https://www.google.com/";
    try {
      const sourceUrl = new URL(referer);
      if (sourceUrl.protocol === "https:") {
        safeReferer = `${sourceUrl.origin}/`;
      }
    } catch {}

    return {
      url: url.href,
      referer: safeReferer,
      extension: fileExtension,
    };
  } catch {
    return null;
  }
}

function prioritizeExtensions(images) {
  return images.sort((left, right) => {
    const leftPreferred = Number(PREFERRED_EXTENSIONS.has(left.extension));
    const rightPreferred = Number(PREFERRED_EXTENSIONS.has(right.extension));
    return rightPreferred - leftPreferred;
  });
}

function uniqueImages(images) {
  const seen = new Set();
  return images.filter((image) => {
    if (!image || seen.has(image.url)) {
      return false;
    }
    seen.add(image.url);
    return true;
  });
}

function extractJsonStringFields(text, field) {
  const decoded = text.replace(/&quot;/gi, '"').replace(/&amp;/gi, "&");
  const pattern = new RegExp(
    `"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`,
    "g",
  );
  const values = [];

  for (const match of decoded.matchAll(pattern)) {
    try {
      values.push(JSON.parse(`"${match[1]}"`));
    } catch {
      continue;
    }
  }

  return values;
}

async function searchYandexImages(query) {
  const url = new URL(YANDEX_IMAGES_URL);
  url.searchParams.set("text", query);
  url.searchParams.set("family", "on");

  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
  if (!response.ok) {
    throw new Error(`Yandex respondeu com HTTP ${response.status}.`);
  }

  const html = await response.text();
  const imageUrls = extractJsonStringFields(html, "img_href");
  const pageUrls = extractJsonStringFields(html, "purl");

  return prioritizeExtensions(
    uniqueImages(
      imageUrls.map((imageUrl, index) =>
        normalizeImageResult(
          imageUrl,
          pageUrls[index] || YANDEX_IMAGES_URL,
        ),
      ),
    ),
  ).slice(0, MAX_RESULTS);
}

async function searchBingImages(query) {
  const url = new URL(BING_IMAGES_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("form", "HDRSC3");
  url.searchParams.set("adlt", "strict");
  url.searchParams.set("setmkt", "pt-BR");

  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
  if (!response.ok || response.status === 202) {
    throw new Error(`Bing respondeu com HTTP ${response.status}.`);
  }

  const imageUrls = extractJsonStringFields(await response.text(), "murl");
  return prioritizeExtensions(
    uniqueImages(
      imageUrls.map((imageUrl) =>
        normalizeImageResult(imageUrl, BING_IMAGES_URL),
      ),
    ),
  ).slice(0, MAX_RESULTS);
}

function buildAdultTagQueries(query, ratingTag) {
  const queryTags = query
    .split(/\s+/)
    .map((tag) => tag.replace(/[^\p{L}\p{N}_-]/gu, ""))
    .filter(Boolean);

  const candidates = [queryTags];
  const relevantTags = queryTags.filter(
    (tag) =>
      !REDUNDANT_ADULT_TAGS.has(tag.toLowerCase()) &&
      !["anime", "manga"].includes(tag.toLowerCase()),
  );
  if (
    relevantTags.length &&
    relevantTags.length !== queryTags.length
  ) {
    candidates.push(relevantTags);
  }
  const aliasedTags = relevantTags.map(
    (tag) => ADULT_TAG_ALIASES.get(tag.toLowerCase()) || tag,
  );
  if (
    aliasedTags.length &&
    aliasedTags.some((tag, index) => tag !== relevantTags[index])
  ) {
    candidates.push(aliasedTags);
  }
  if (relevantTags.length > 1) {
    const phrase = relevantTags.join("_").toLowerCase();
    candidates.push([phrase]);
    const canonicalPhrase = ADULT_TAG_ALIASES.get(phrase);
    if (canonicalPhrase) {
      candidates.push([canonicalPhrase]);
    }
  }

  const seen = new Set();
  return candidates
    .map((tags) => tags.filter(Boolean))
    .map((tags) => [...tags, ratingTag, ...BLOCKED_ADULT_TAGS].join(" "))
    .filter((tags) => {
      if (seen.has(tags)) {
        return false;
      }
      seen.add(tags);
      return true;
    });
}

function addBooruCredentials(url, source) {
  const userId = process.env[`${source}_USER_ID`]?.trim();
  const apiKey = process.env[`${source}_API_KEY`]?.trim();
  if (userId && apiKey) {
    url.searchParams.set("user_id", userId);
    url.searchParams.set("api_key", apiKey);
  }
}

async function requestJson(url, source) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
  if (!response.ok) {
    throw new Error(`${source} respondeu com HTTP ${response.status}.`);
  }

  let payload;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    throw new Error(`${source} retornou uma resposta inválida.`);
  }
  if (
    typeof payload === "string" ||
    payload?.error ||
    payload?.success === false
  ) {
    throw new Error(`${source} não autorizou ou não concluiu a busca.`);
  }

  return payload;
}

function extractPosts(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload?.post) ? payload.post : [];
}

function hasBlockedAdultTag(post) {
  const tags = Array.isArray(post.tags)
    ? post.tags
    : String(post.tags || "").split(/[\s,]+/);
  const blockedTags = new Set(
    BLOCKED_ADULT_TAGS.map((tag) => tag.slice(1)),
  );
  return tags.some((tag) => blockedTags.has(String(tag).toLowerCase()));
}

function getHtmlAttribute(tag, attribute) {
  const pattern = new RegExp(
    `(?:^|\\s)${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return (match?.[1] || match?.[2] || match?.[3] || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeAdultPosts(payload, referer) {
  return prioritizeExtensions(
    uniqueImages(
      extractPosts(payload)
        .filter((post) => post && typeof post === "object")
        .filter((post) => !hasBlockedAdultTag(post))
        .filter((post) => {
          const rating = String(post.rating || "").toLowerCase();
          return !rating || rating === "e" || rating === "explicit";
        })
        .map((post) =>
          normalizeImageResult(
            post.file_url || post.sample_url || "",
            referer,
            post.file_ext,
          ),
        ),
    ),
  ).slice(0, MAX_RESULTS);
}

async function searchRule34(query) {
  const images = [];

  for (const tags of buildAdultTagQueries(query, "rating:explicit")) {
    const url = new URL(RULE34_API_URL);
    url.searchParams.set("page", "dapi");
    url.searchParams.set("s", "post");
    url.searchParams.set("q", "index");
    url.searchParams.set("json", "1");
    url.searchParams.set("limit", "100");
    url.searchParams.set("tags", tags);
    addBooruCredentials(url, "RULE34");

    images.push(
      ...normalizeAdultPosts(
        await requestJson(url, "Rule34"),
        "https://rule34.xxx/",
      ),
    );
    if (images.length >= MIN_SOURCE_RESULTS) {
      break;
    }
  }

  return prioritizeExtensions(uniqueImages(images)).slice(0, MAX_RESULTS);
}

async function searchGelbooru(query) {
  const images = [];
  let apiError;
  try {
    for (const tags of buildAdultTagQueries(query, "rating:explicit")) {
      const url = new URL(GELBOORU_API_URL);
      url.searchParams.set("page", "dapi");
      url.searchParams.set("s", "post");
      url.searchParams.set("q", "index");
      url.searchParams.set("json", "1");
      url.searchParams.set("limit", "100");
      url.searchParams.set("tags", tags);
      addBooruCredentials(url, "GELBOORU");

      images.push(
        ...normalizeAdultPosts(
          await requestJson(url, "Gelbooru"),
          "https://gelbooru.com/",
        ),
      );
      if (images.length >= MIN_SOURCE_RESULTS) {
        break;
      }
    }
  } catch (error) {
    apiError = error;
  }

  if (images.length >= MIN_SOURCE_RESULTS) {
    return prioritizeExtensions(uniqueImages(images)).slice(0, MAX_RESULTS);
  }

  try {
    for (const tags of buildAdultTagQueries(query, "rating:explicit")) {
      const pageUrl = new URL(GELBOORU_API_URL);
      pageUrl.searchParams.set("page", "post");
      pageUrl.searchParams.set("s", "list");
      pageUrl.searchParams.set("tags", tags);

      const response = await fetch(pageUrl, {
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      if (!response.ok) {
        throw new Error(`Gelbooru respondeu com HTTP ${response.status}.`);
      }

      const html = await response.text();
      const cards = html.matchAll(
        /<article\b[^>]*class=["'][^"']*thumbnail-preview[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi,
      );

      for (const card of cards) {
        const imageTag = card[1].match(/<img\b[^>]*>/i)?.[0];
        if (!imageTag) {
          continue;
        }

        const tags = [
          getHtmlAttribute(imageTag, "title"),
          getHtmlAttribute(imageTag, "alt"),
        ].join(" ");
        if (hasBlockedAdultTag({ tags })) {
          continue;
        }

        images.push(
          normalizeImageResult(
            getHtmlAttribute(imageTag, "src"),
            "https://gelbooru.com/",
          ),
        );
      }

      if (uniqueImages(images).length >= MIN_SOURCE_RESULTS) {
        break;
      }
    }

    const results = prioritizeExtensions(uniqueImages(images)).slice(
      0,
      MAX_RESULTS,
    );
    if (results.length) {
      return results;
    }
    if (apiError) {
      throw new AggregateError(
        [apiError, new Error("Gelbooru não encontrou imagens nessa busca.")],
        "Gelbooru não conseguiu buscar imagens pela API nem pela página pública.",
      );
    }
    return [];
  } catch (pageError) {
    if (images.length) {
      return prioritizeExtensions(uniqueImages(images)).slice(0, MAX_RESULTS);
    }
    if (apiError) {
      throw new AggregateError(
        [apiError, pageError],
        "Gelbooru não conseguiu buscar imagens pela API nem pela página pública.",
      );
    }
    throw pageError;
  }
}

async function searchYande(query) {
  const images = [];

  for (const tags of buildAdultTagQueries(query, "rating:e")) {
    const url = new URL(YANDE_API_URL);
    url.searchParams.set("tags", tags);
    url.searchParams.set("limit", "100");
    images.push(
      ...normalizeAdultPosts(
        await requestJson(url, "Yande.re"),
        "https://yande.re/",
      ),
    );
    if (images.length >= MIN_SOURCE_RESULTS) {
      break;
    }
  }

  return prioritizeExtensions(uniqueImages(images)).slice(0, MAX_RESULTS);
}

async function searchFromSources(sources, query) {
  const images = [];
  const seen = new Set();
  const errors = [];

  for (const source of sources) {
    try {
      const results = await source.search(query);
      for (const image of results) {
        if (!seen.has(image.url)) {
          seen.add(image.url);
          images.push(image);
        }
      }
      if (images.length >= MAX_RESULTS) {
        break;
      }
    } catch (error) {
      errors.push(new Error(`${source.name}: ${error.message || error}`));
    }
  }

  if (!images.length && errors.length === sources.length) {
    const details = errors.map((error) => error.message).join("; ");
    throw new AggregateError(
      errors,
      `Todas as fontes de imagens falharam. ${details}`,
    );
  }

  return prioritizeExtensions(images).slice(0, MAX_RESULTS);
}

export async function searchImages(query, adult) {
  const sources = adult
    ? [
        { name: "Rule34", search: searchRule34 },
        { name: "Gelbooru", search: searchGelbooru },
        { name: "Yande.re", search: searchYande },
      ]
    : [
        { name: "Yandex Images", search: searchYandexImages },
        { name: "Bing Images", search: searchBingImages },
      ];

  return searchFromSources(sources, query);
}

function isPrivateAddress(address, family) {
  if (family === 4) {
    const [first, second] = address.split(".").map(Number);
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && (second === 0 || second === 168)) ||
      (first === 198 && (second === 18 || second === 19 || second === 51)) ||
      (first === 203 && second === 0)
    );
  }

  const normalized = address.toLowerCase().split("%")[0];
  if (normalized.startsWith("::ffff:")) {
    const mappedAddress = normalized.slice("::ffff:".length);
    if (isIP(mappedAddress) === 4) {
      return isPrivateAddress(mappedAddress, 4);
    }
    const parts = mappedAddress.split(":");
    if (parts.length === 2) {
      const high = Number.parseInt(parts[0], 16);
      const low = Number.parseInt(parts[1], 16);
      return isPrivateAddress(
        `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`,
        4,
      );
    }
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("ff")
  );
}

async function validateImageUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("A imagem retornou uma URL inválida.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("A imagem retornou um host não permitido.");
  }

  const family = isIP(hostname);
  const addresses = family
    ? [{ address: hostname, family }]
    : await lookup(hostname, { all: true, verbatim: true });

  if (
    !addresses.length ||
    addresses.some(({ address, family: ipFamily }) =>
      isPrivateAddress(address, ipFamily),
    )
  ) {
    throw new Error("A imagem retornou um host não público.");
  }

  return url;
}

export async function downloadImage(image) {
  let url = await validateImageUrl(image.url);
  let response;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    response = await fetch(url, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        referer: image.referer,
        "user-agent": USER_AGENT,
      },
      redirect: "manual",
      signal: AbortSignal.timeout(IMAGE_TIMEOUT),
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      break;
    }

    const location = response.headers.get("location");
    if (!location || redirectCount === MAX_REDIRECTS) {
      throw new Error("A imagem redirecionou para um destino inválido.");
    }
    await response.body?.cancel();
    url = await validateImageUrl(new URL(location, url).href);
  }

  if (!response.ok) {
    throw new Error(`O host da imagem respondeu com HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("image/") || /svg/i.test(contentType)) {
    throw new Error("O host retornou um arquivo que não é uma imagem compatível.");
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (contentLength > MAX_IMAGE_SIZE) {
    throw new Error("A imagem excedeu o limite de 10 MB.");
  }
  if (!response.body) {
    throw new Error("A resposta da imagem não contém dados.");
  }

  const chunks = [];
  let downloadedSize = 0;
  for await (const chunk of response.body) {
    downloadedSize += chunk.length;
    if (downloadedSize > MAX_IMAGE_SIZE) {
      throw new Error("A imagem excedeu o limite de 10 MB.");
    }
    chunks.push(chunk);
  }
  if (!downloadedSize) {
    throw new Error("O host retornou uma imagem vazia.");
  }

  return Buffer.concat(chunks, downloadedSize);
}
