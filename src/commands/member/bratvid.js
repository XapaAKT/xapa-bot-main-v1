import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { BOT_EMOJI, BOT_NAME, PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { processAnimatedGifToSticker } from "../../services/sticker.js";
import { getRandomName } from "../../utils/index.js";
import {
  createTextCanvas,
  parseTextCanvasArgs,
} from "../../utils/textCanvas.js";

const execFileAsync = promisify(execFile);

export default {
  name: "bratvid",
  description: "Gera localmente uma figurinha animada no estilo brat.",
  commands: ["bratvid", "abrat", "btv"],
  usage: `${PREFIX}bratvid texto | ${PREFIX}bratvid texto fundo #ffcc00`,

  handle: async ({
    sendWaitReact,
    fullArgs,
    sendStickerFromFile,
    sendSuccessReact,
    webMessage,
    userLid,
  }) => {
    if (!fullArgs?.trim()) {
      throw new InvalidParameterError(
        "Informe o texto que será transformado em figurinha animada.",
      );
    }

    await sendWaitReact();

    let inputPath = null;
    let gifPath = null;
    let finalStickerPath = null;

    try {
      const { text, background } = parseTextCanvasArgs(fullArgs.trim().split(/\s+/));
      inputPath = path.resolve(TEMP_DIR, getRandomName("png"));
      gifPath = path.resolve(TEMP_DIR, getRandomName("gif"));

      await fs.promises.writeFile(
        inputPath,
        await createTextCanvas(text, { background, bratStyle: true }),
      );

      await execFileAsync("ffmpeg", [
        "-y",
        "-loop",
        "1",
        "-i",
        inputPath,
        "-t",
        "2",
        "-vf",
        "scale=350:350:force_original_aspect_ratio=decrease,pad=350:350:(ow-iw)/2:(oh-ih)/2",
        gifPath,
      ]);

      const username =
        webMessage?.pushName ||
        webMessage?.notifyName ||
        userLid?.replace(/@lid$/, "") ||
        "usuário";

      finalStickerPath = await processAnimatedGifToSticker(gifPath, {
        username,
        botName: `${BOT_EMOJI} ${BOT_NAME}`,
      });

      await sendSuccessReact();
      await sendStickerFromFile(finalStickerPath);
    } finally {
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (gifPath && fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
      if (finalStickerPath && fs.existsSync(finalStickerPath)) {
        fs.unlinkSync(finalStickerPath);
      }
    }
  },
};
