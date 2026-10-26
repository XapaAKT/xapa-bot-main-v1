import { existsSync } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import yts from "yt-search";
import YTDlpWrapModule from "yt-dlp-wrap";
import { ASSETS_DIR } from "../config.js";

const TEMP_AUDIO_DIR = path.join(ASSETS_DIR, "temp");
const YTDLP_PATH = path.resolve(
  process.cwd(),
  "node_modules",
  ".cache",
  "yt-dlp.exe",
);
const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;
let ytDlpPromise;

function toVideoData(video) {
  return {
    videoId: video.videoId,
    url: video.url,
    title: video.title || "Música",
    author: video.author?.name || "Desconhecido",
    duration: video.duration?.timestamp || "Desconhecida",
    thumbnail: video.thumbnail,
    views: video.views,
    releaseDate: video.uploadedAt || video.publishedAt,
  };
}

export async function searchMusic(query, limit = 5) {
  const searchResult = await yts(query);

  return (searchResult.videos || [])
    .filter((video) => video.url && video.videoId)
    .slice(0, limit)
    .map(toVideoData);
}

async function findVideo(query) {
  const videoId = getVideoId(query);

  if (videoId) {
    return { ...toVideoData({ url: query, videoId }), videoId };
  }

  const searchResult = await yts(query);
  const video = searchResult.videos?.[0];

  if (!video?.url) {
    throw new Error("Nenhuma música foi encontrada.");
  }

  return toVideoData(video);
}

function getVideoId(value) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1);
    if (url.searchParams.get("v")) return url.searchParams.get("v");

    const match = url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

async function getYtDlp() {
  ytDlpPromise ??= (async () => {
    await mkdir(path.dirname(YTDLP_PATH), { recursive: true });

    if (!existsSync(YTDLP_PATH)) {
      await YTDlpWrap.downloadFromGithub(YTDLP_PATH, undefined, "win32");
    }

    return new YTDlpWrap(YTDLP_PATH);
  })();

  return ytDlpPromise;
}

export async function scrapeMusic(query) {
  const video = await getMusicInfo(query);
  await mkdir(TEMP_AUDIO_DIR, { recursive: true });

  const filePath = path.join(
    TEMP_AUDIO_DIR,
    `play-audio-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`,
  );

  try {
    const ytDlp = await getYtDlp();
    const info = await ytDlp.getVideoInfo([
      video.url,
      "--no-playlist",
      "--js-runtimes",
      "node",
      "--format",
      "bestaudio/best",
    ]);

    await ytDlp.execPromise([
      video.url,
      "--no-playlist",
      "--js-runtimes",
      "node",
      "--format",
      "bestaudio/best",
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--output",
      filePath,
      "--no-warnings",
    ]);

    return {
      ...video,
      title: info.title || video.title || "Música",
      author: info.uploader || video.author || "Desconhecido",
      duration: info.duration_string || video.duration || "Desconhecida",
      thumbnail: info.thumbnail || video.thumbnail,
      views: info.view_count ?? video.views,
      releaseDate: info.release_date || video.releaseDate,
      filePath,
    };
  } catch (error) {
    await unlink(filePath).catch(() => {});
    throw new Error(`Não foi possível baixar o áudio: ${error.message}`);
  }
}

export async function getMusicInfo(query) {
  const video = await findVideo(query.trim());
  const ytDlp = await getYtDlp();
  const info = await ytDlp.getVideoInfo([
    video.url,
    "--no-playlist",
    "--js-runtimes",
    "node",
    "--format",
    "bestaudio/best",
  ]);

  return {
    ...video,
    title: info.title || video.title || "Música",
    author: info.uploader || video.author || "Desconhecido",
    duration: info.duration_string || video.duration || "Desconhecida",
    thumbnail: info.thumbnail || video.thumbnail,
    views: info.view_count ?? video.views,
    releaseDate: info.release_date || video.releaseDate,
  };
}

export async function scrapeVideo(query) {
  const video = await findVideo(query.trim());
  await mkdir(TEMP_AUDIO_DIR, { recursive: true });

  const filePath = path.join(
    TEMP_AUDIO_DIR,
    `play-video-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`,
  );

  try {
    const ytDlp = await getYtDlp();
    const info = await ytDlp.getVideoInfo([
      video.url,
      "--no-playlist",
      "--js-runtimes",
      "node",
      "--format",
      "bestvideo+bestaudio/best",
    ]);

    await ytDlp.execPromise([
      video.url,
      "--no-playlist",
      "--js-runtimes",
      "node",
      "--format",
      "bestvideo+bestaudio/best",
      "--merge-output-format",
      "mp4",
      "--output",
      filePath,
      "--no-warnings",
    ]);

    return {
      ...video,
      title: info.title || video.title || "Vídeo",
      author: info.uploader || video.author || "Desconhecido",
      duration: info.duration_string || video.duration || "Desconhecida",
      thumbnail: info.thumbnail || video.thumbnail,
      filePath,
    };
  } catch (error) {
    await unlink(filePath).catch(() => {});
    throw new Error(`Não foi possível baixar o vídeo: ${error.message}`);
  }
}

export async function removeScrapedAudio(filePath) {
  await unlink(filePath).catch(() => {});
}
