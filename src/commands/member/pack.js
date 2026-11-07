import fs from "node:fs/promises";
import path from "node:path";

import { PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  downloadPackMedia,
  searchPackMedia,
} from "../../services/pack-media-search.js";
import { processPackSticker } from "../../services/sticker.js";
import { getRandomName, removeFileIfExists } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

const PACK_SIZE = 50;
const MAX_QUERY_LENGTH = 100;
const PACK_PUBLISHER = "Pack criado pelo XIC-BOT";
const PROCESSING_CONCURRENCY = 4;

async function createCover(stickerPath) {
  const coverPath = path.resolve(TEMP_DIR, getRandomName("webp"));
  const { exec } = await import("node:child_process");
  await new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -i "${stickerPath}" -frames:v 1 -vf "scale=96:96:force_original_aspect_ratio=decrease,pad=96:96:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -c:v libwebp -q:v 70 "${coverPath}"`,
      (error, _, stderr) => {
        if (error) reject(new Error(stderr || "Falha ao criar capa."));
        else resolve();
      },
    );
  });
  return coverPath;
}

export default {
  name: "pack",
  description: "Cria um pacote nativo de figurinhas a partir de um tema.",
  commands: ["pack", "pack-figurinha", "pack-figurinhas"],
  usage: `${PREFIX}pack <tema>`,

  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendStickerPack,
  }) => {
    const theme = String(fullArgs || "").trim();
    if (!theme) {
      throw new InvalidParameterError(
        `Informe um tema. Exemplo: ${PREFIX}pack Light yagami`,
      );
    }
    if (theme.length > MAX_QUERY_LENGTH) {
      throw new InvalidParameterError(
        `O tema pode ter no máximo ${MAX_QUERY_LENGTH} caracteres.`,
      );
    }

    await sendWaitReact();
    const media = await searchPackMedia(theme, PACK_SIZE * 3);
    if (!media.length) {
      throw new WarningError("Não achei figurinha pra esse tema");
    }

    const metadata = {
      username: theme,
      botName: PACK_PUBLISHER,
      categories: [""],
    };
    const stickerPaths = [];
    let coverPath;

    for (let index = 0; index < media.length; index += PROCESSING_CONCURRENCY) {
      const batch = media.slice(index, index + PROCESSING_CONCURRENCY);
      await Promise.all(
        batch.map(async (item) => {
          if (stickerPaths.length >= PACK_SIZE) return;

          let inputPath;
          try {
            const downloaded = await downloadPackMedia(item.url);
            inputPath = path.resolve(
              TEMP_DIR,
              getRandomName(downloaded.animated ? "pack-media" : "pack-image"),
            );
            await fs.writeFile(inputPath, downloaded.buffer);
            const stickerPath = await processPackSticker(
              inputPath,
              metadata,
              downloaded.animated,
            );
            stickerPaths.push({ path: stickerPath, animated: downloaded.animated });
          } catch (error) {
            errorLog(`Mídia ignorada no pack (${item.source}): ${error.message}`);
          } finally {
            await removeFileIfExists(inputPath);
          }
        }),
      );

      if (stickerPaths.length >= PACK_SIZE) break;
    }

    if (stickerPaths.length < PACK_SIZE) {
      await Promise.all(
        stickerPaths.map(({ path: filePath }) => removeFileIfExists(filePath)),
      );
      throw new WarningError("Não achei figurinha pra esse tema");
    }

    try {
      const selectedStickers = stickerPaths.slice(0, PACK_SIZE);
      coverPath = await createCover(selectedStickers[0].path);
      const stickers = await Promise.all(
        selectedStickers.map(async ({ path: filePath }) => ({
          data: await fs.readFile(filePath),
          emojis: [""],
        })),
      );

      await sendStickerPack({
        cover: await fs.readFile(coverPath),
        stickers,
        name: theme,
        publisher: PACK_PUBLISHER,
        description: `Pack criado pelo XIC-BOT: ${theme}`,
      });
      await sendSuccessReact();
    } finally {
      await Promise.all(
        stickerPaths.map(({ path: filePath }) => removeFileIfExists(filePath)),
      );
      if (coverPath) await removeFileIfExists(coverPath);
    }
  },
};
