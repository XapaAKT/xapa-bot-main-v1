import { errorLog } from "../utils/logger.js";

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const COMMONS_IMAGE_HOST = "upload.wikimedia.org";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const USER_AGENT =
  "XICBot/1.0 (Wikimedia Commons open-license image search)";

function getMetadataValue(metadata, key) {
  return String(metadata?.[key]?.value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function isOpenImageLicense(license) {
  return /^(?:CC0(?:\s|$)|Public domain(?:\s|$)|PD(?:\s|$)|CC BY(?:-SA)?(?:\s|$))/i.test(
    String(license || "").trim(),
  );
}

function getImageUrl(imageInfo) {
  const value = imageInfo.thumburl || imageInfo.url;
  if (!value) return null;

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== COMMONS_IMAGE_HOST) {
    return null;
  }

  return url;
}

async function readLimitedImage(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("O Commons retornou um arquivo que não é uma imagem.");
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (contentLength > MAX_IMAGE_SIZE) {
    throw new Error("A imagem excede o limite de 10 MB.");
  }

  if (!response.body) {
    throw new Error("A resposta não contém dados da imagem.");
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_IMAGE_SIZE) {
      throw new Error("A imagem excede o limite de 10 MB.");
    }
    chunks.push(chunk);
  }

  if (!size) throw new Error("O Commons retornou uma imagem vazia.");
  return Buffer.concat(chunks, size);
}

async function downloadCommonsImage(imageUrl) {
  const response = await fetch(imageUrl, {
    headers: { "user-agent": USER_AGENT, accept: "image/*" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem do Commons (HTTP ${response.status}).`);
  }

  const finalUrl = new URL(response.url || imageUrl);
  if (
    finalUrl.protocol !== "https:" ||
    finalUrl.hostname !== COMMONS_IMAGE_HOST
  ) {
    throw new Error("O Commons redirecionou para um endereço não permitido.");
  }

  return readLimitedImage(response);
}

export async function searchCommonsImages(searchTerm, limit = 6) {
  const apiUrl = new URL(COMMONS_API_URL);
  apiUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: searchTerm,
    gsrnamespace: "6",
    gsrlimit: String(Math.min(Math.max(limit * 3, limit), 30)),
    prop: "info|imageinfo",
    inprop: "url",
    iiprop: "url|extmetadata|mime",
    iiurlwidth: "1024",
  });

  const response = await fetch(apiUrl, {
    headers: { "user-agent": USER_AGENT, accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Busca no Wikimedia Commons falhou (HTTP ${response.status}).`);
  }

  const data = await response.json();
  const pages = Object.values(data?.query?.pages || {});
  const images = [];
  let lastDownloadError;

  for (const page of pages) {
    const imageInfo = page.imageinfo?.[0];
    const metadata = imageInfo?.extmetadata || {};
    const license = getMetadataValue(metadata, "LicenseShortName");
    const imageUrl = getImageUrl(imageInfo || {});

    if (
      !imageUrl ||
      !String(imageInfo?.mime || "").startsWith("image/") ||
      !isOpenImageLicense(license)
    ) {
      continue;
    }

    try {
      const buffer = await downloadCommonsImage(imageUrl);
      images.push({
        buffer,
        title: String(page.title || "Imagem do Commons").replace(/^File:/i, ""),
        author: getMetadataValue(metadata, "Artist") || "Autor não informado",
        license,
        licenseUrl: getMetadataValue(metadata, "LicenseUrl"),
        sourceUrl:
          page.fullurl ||
          imageInfo.descriptionurl ||
          `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || "")}`,
      });
    } catch (error) {
      lastDownloadError = error;
      errorLog(`Wikimedia Commons: imagem ignorada (${error.message})`);
    }

    if (images.length >= limit) break;
  }

  if (!images.length && lastDownloadError) throw lastDownloadError;
  return images;
}
