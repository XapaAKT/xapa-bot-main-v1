import { PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import fs from "node:fs/promises";
import path from "node:path";
import { processStaticSticker } from "../../services/sticker.js";
import { getRandomName } from "../../utils/index.js";
import { createTextCanvas, parseTextCanvasArgs } from "../../utils/textCanvas.js";

export default {
  name: "attp",
  description: "Faz figurinhas locais de texto.",
  commands: ["attp"],
  usage: `${PREFIX}attp teste | ${PREFIX}attp teste fundo #ffcc00`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendWaitReact,
    args,
    sendStickerFromFile,
    sendSuccessReact,
    webMessage,
    userLid,
  }) => {
    if (!args?.length) {
      throw new InvalidParameterError(
        "Você precisa informar o texto que deseja transformar em figurinha."
      );
    }

    await sendWaitReact();
    const { text, background } = parseTextCanvasArgs(args);
    const inputPath = path.resolve(TEMP_DIR, getRandomName("png"));
    let stickerPath = null;

    try {
      await fs.writeFile(inputPath, await createTextCanvas(text, { background }));
      stickerPath = await processStaticSticker(inputPath, {
        username: webMessage?.pushName || userLid?.replace(/@lid$/, "") || "usuário",
        botName: "ULQUIORRA BOT",
      });
      await sendSuccessReact();
      await sendStickerFromFile(stickerPath);
    } finally {
      await fs.rm(inputPath, { force: true });
      if (stickerPath) await fs.rm(stickerPath, { force: true });
    }
  },
};
