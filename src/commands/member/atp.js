import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import { TEMP_DIR } from "../../config.js";
import { processStaticSticker } from "../../services/sticker.js";
import { getRandomName } from "../../utils/index.js";
import { createTextCanvas, parseTextCanvasArgs } from "../../utils/textCanvas.js";

export default {
  name: "atp",
  description: "Gera uma figurinha ATTP.",
  commands: ["atp"],
  usage: `${PREFIX}atp texto | ${PREFIX}atp texto fundo #ffcc00`,

  handle: async ({
    args,
    sendReply,
    sendStickerFromFile,
    sendWaitReact,
    sendSuccessReact,
    webMessage,
    userLid,
  }) => {
    if (!args?.length) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}atp XAPA IN CHAINS`
      );
    }

    await sendWaitReact();

    let inputPath = null;
    let stickerPath = null;

    try {
      const { text, background } = parseTextCanvasArgs(args);
      inputPath = path.resolve(TEMP_DIR, getRandomName("png"));
      await fs.writeFile(
        inputPath,
        await createTextCanvas(text, { background }),
      );
      stickerPath = await processStaticSticker(inputPath, {
        username:
          webMessage?.pushName ||
          webMessage?.notifyName ||
          userLid?.replace(/@lid$/, "") ||
          "usuário",
        botName: "ULQUIORRA BOT",
      });

      await sendStickerFromFile(stickerPath);
      await sendSuccessReact();
    } catch (error) {
      console.error("[ATTP ERROR]", error);
      await sendReply(`❌ Não consegui gerar o ATTP.\n\n${error.message}`);
    } finally {
      if (inputPath) await fs.rm(inputPath, { force: true });
      if (stickerPath) await fs.rm(stickerPath, { force: true });
    }
  },
};