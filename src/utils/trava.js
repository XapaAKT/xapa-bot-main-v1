import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { BOT_NAME, DATABASE_DIR, TEMP_DIR } from "../config.js";
import { DangerError, WarningError } from "../errors/index.js";
import { Ffmpeg } from "../services/ffmpeg.js";
import { patchMp4Duration } from "./mp4Trava.js";

const execFileAsync = promisify(execFile);

export const VIDEO_PATH = path.join(DATABASE_DIR, "get", "video", "media.mp4");
const RAW_PATH = path.join(DATABASE_DIR, "get", "video", "message.json");

// 0xFFFFFFFF segundos = ~136 anos.
export const MAX_FAKE_SECONDS = 4_294_967_295;

const BASE_SECONDS = 3;
const BASE_WIDTH = 720;

export const MUSIC_TITLE =
  "꧁༒꧂𖤐⃟𝅥⃝🩸 𝙐̷͝𝙇̸͝𝙌̷͝𝙐̸͝𝙄̷͝𝙊̸͝𝙍̷͝𝙍̸͝𝘼̷͝-𝘽̸͝𝙊̷͝𝙏̸ 🩸⃝𝅥⃟꧁༒꧂ ⛧☠︎☣︎⸸𓂀𓆩𖣘𓆪⛧༺═━━━━━━━༒︎━━━━━━━═༻ 𝕯̷𝕬̸𝕿̷𝕬̸_𝕮̷𝕺̸𝕽̷𝕽̸𝖀̷𝕻̸𝕿̷𝕰̸𝕯̷ ▓▒░▓▒░▓▒░";

export const SPAM = "~.*@45*.🚀.*@8401*.🚀.*@5616*.~~.";

export async function assertVideo() {
  try {
    await fs.access(VIDEO_PATH);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new WarningError("Nenhum vídeo salvo. Salve um primeiro usando o comando de get.");
    }
    throw error;
  }
}

export function resolveWantedSeconds(args) {
  const parsed = Number(String(args?.[0] ?? "").replace(/[^\d]/g, ""));

  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, MAX_FAKE_SECONDS)
    : MAX_FAKE_SECONDS;
}

// Reencoda um clipe curto, 720p, sem b-frames e com UM keyframe só.
// Isso impede transcode no servidor e impede o player de pular pelo stss.
async function buildBaseVideo() {
  const tempPath = path.join(TEMP_DIR, `trava-base-${Date.now()}.mp4`);

  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i", VIDEO_PATH,
        "-t", String(BASE_SECONDS),
        "-vf", `scale='min(${BASE_WIDTH},iw)':-2,fps=24`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "28",
        "-profile:v", "baseline",
        "-level", "3.0",
        "-bf", "0",
        "-g", "600",
        "-keyint_min", "600",
        "-sc_threshold", "0",
        "-force_key_frames", "expr:eq(n,0)",
        "-c:a", "aac",
        "-b:a", "32k",
        "-ac", "1",
        "-ar", "44100",
        "-sn",
        "-dn",
        "-map_metadata", "-1",
        "-movflags", "+faststart",
        tempPath,
      ],
      { timeout: 120_000 },
    );

    return await fs.readFile(tempPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new DangerError("ffmpeg não encontrado no PATH.");
    }
    throw new DangerError(`Falha ao preparar o vídeo: ${error.message}`);
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

export async function readArtworkPath() {
  return fs
    .readFile(RAW_PATH, "utf8")
    .then((raw) => JSON.parse(raw))
    .then(
      (raw) =>
        raw.message?.videoMessage?.annotations?.[0]?.embeddedContent?.embeddedMusic
          ?.artworkDirectPath || "",
    )
    .catch(() => "");
}

export async function buildLockedVideo(wantedSeconds) {
  await assertVideo();

  const ffmpeg = new Ffmpeg();
  const originalDuration = Math.round(await ffmpeg.getVideoDuration(VIDEO_PATH));

  const video = await buildBaseVideo();
  const fakeDuration = patchMp4Duration(video, wantedSeconds);

  return { video, originalDuration, fakeDuration };
}

export function buildCaption(fakeDuration, extraLine = "") {
  return [
    "꧁༺𖤐⃟𝆺𝅥⃝🩸𝙐𝙇𝙌𝙐𝙄𝙊𝙍𝙍𝘼-𝘽𝙊𝙏🩸⃝𝆺𝅥⃟𖤐༻꧂",
    "",
    "      ⛧ 𝐓 𝐑 𝐀 𝐕 𝐀   𝐓 𝐈 𝐌 𝐄 ⛧",
    "",
    `   ☣︎ contador travado em ${fakeDuration.toLocaleString("pt-BR")}s`,
    extraLine,
    "   ☣︎ abre o vídeo e reza",
    "   ☣︎ não tente arrastar a barra",
    "",
    SPAM.repeat(20),
  ]
    .filter((line) => line !== null)
    .join("\n");
}