import fs from "node:fs/promises";
import path from "node:path";

import { BOT_NAME, PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { processStaticSticker } from "../../services/sticker.js";
import { searchCommonsImages } from "../../services/commons-image-search.js";
import { errorLog } from "../../utils/logger.js";
import { getRandomName, removeFileIfExists } from "../../utils/index.js";

const PACK_SIZE = 6;
const PACK_DELAY_MS = 500;
const MAX_QUERY_LENGTH = 100;
const MAX_ATTRIBUTION_LENGTH = 140;

function cleanLabel(value) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_ATTRIBUTION_LENGTH);
}

function createStickerPackName(query) {
  return `Pack: ${cleanLabel(query).slice(0, 60)}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  name: "pack",
  description:
    "Busca imagens com licença aberta no Wikimedia Commons e envia um pack de figurinhas.",
  commands: ["pack", "pack-figurinha", "pack-figurinhas"],
  usage: `${PREFIX}pack <personagem ou tema>`,

  handle: async ({
    fullArgs,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    sendStickerFromFile,
  }) => {
    const query = String(fullArgs || "").trim();
    if (!query) {
      throw new InvalidParameterError(
        `Informe um personagem ou tema. Exemplo: ${PREFIX}pack paisagem montanhosa`,
      );
    }
    if (query.length > MAX_QUERY_LENGTH) {
      throw new InvalidParameterError(
        `A busca pode ter no máximo ${MAX_QUERY_LENGTH} caracteres.`,
      );
    }

    await sendWaitReact();
    const images = await searchCommonsImages(query, PACK_SIZE);
    if (!images.length) {
      throw new WarningError(
        "Não encontrei imagens adequadas com licença aberta ou domínio público para essa busca. Tente outro termo.",
      );
    }

    const packName = createStickerPackName(query);
    await sendReply(
      `🎨 Encontrei ${images.length} imagem(ns) com licença aberta/domínio público.\nVou enviar as figurinhas uma por uma no pack “${packName}”.`,
    );

    const credits = [];
    let sentCount = 0;

    for (const [index, image] of images.entries()) {
      const inputPath = path.join(TEMP_DIR, getRandomName("img"));
      let stickerPath;

      try {
        await fs.writeFile(inputPath, image.buffer);
        stickerPath = await processStaticSticker(inputPath, {
          username: packName,
          botName: BOT_NAME,
          categories: ["🎨"],
        });
        await sendStickerFromFile(stickerPath, false);
        sentCount++;
        credits.push(
          `${index + 1}. ${cleanLabel(image.title)} — ${cleanLabel(image.author)}; ${cleanLabel(image.license)}${image.licenseUrl ? ` (${image.licenseUrl})` : ""}\n${image.sourceUrl}`,
        );
      } catch (error) {
        errorLog(`Erro ao criar figurinha do Wikimedia Commons: ${error.message}`);
      } finally {
        await removeFileIfExists(inputPath);
        if (stickerPath) await removeFileIfExists(stickerPath);
      }

      if (index < images.length - 1) await wait(PACK_DELAY_MS);
    }

    if (!sentCount) {
      throw new WarningError(
        "Encontrei imagens, mas não consegui convertê-las em figurinhas. Tente novamente mais tarde.",
      );
    }

    const creditMessage = [
      `✅ *Pack “${packName}” enviado:* ${sentCount}/${images.length} figurinha(s).`,
      "",
      "📜 *Créditos e licenças das imagens:*",
      ...credits,
      "",
      "As figurinhas são enviadas individualmente e compartilham o nome do pack; cada imagem mantém seu crédito/licença listado acima.",
    ].join("\n");

    await sendReply(creditMessage);
    await sendSuccessReact();
  },
};
