import fs from "node:fs";
import path from "node:path";
import { BOT_EMOJI, BOT_NAME, PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { processStaticSticker } from "../../services/sticker.js";
import { getRandomName } from "../../utils/index.js";
import sharp from "sharp";

const CANVAS_SIZE = 1000;
const MAX_TEXT_LENGTH = 180;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text, maxChars = 18) {
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) =>
      word.length > maxChars
        ? word.match(new RegExp(`.{1,${maxChars}}`, "g")) || [word]
        : [word],
    );
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 9);
}

async function createBratCanvas(text) {
  const lines = wrapText(text);
  const fontSize = Math.max(54, Math.min(92, Math.floor(700 / Math.max(lines.length, 1))));
  const startY = CANVAS_SIZE / 2 - ((lines.length - 1) * fontSize * 0.58);
  const textSvg = lines
    .map(
      (line, index) =>
        `<text x="500" y="${startY + index * fontSize * 1.16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="900">${escapeXml(line)}</text>`,
    )
    .join("");

  const svg = `
    <svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#8bdc65"/>
      <g transform="rotate(-4 500 500)" fill="#111">${textSvg}</g>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export default {
  name: "brat",
  description: "Gera localmente uma imagem ou figurinha no estilo brat.",
  commands: ["brat", "bratcanvas"],
  usage: `${PREFIX}brat <texto> | ${PREFIX}brat canvas <texto>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendWaitReact,
    fullArgs,
    sendStickerFromFile,
    sendSuccessReact,
    sendErrorReply,
    webMessage,
    userLid,
    sendImageFromBuffer,
    commandName,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa informar o texto que deseja transformar em imagem.",
      );
    }

    await sendWaitReact();

    let inputPath = null;
    let finalStickerPath = null;

    try {
      const rawText = fullArgs.trim();
      const canvasMode =
        commandName === "bratcanvas" || /^canvas\s+/i.test(rawText);
      const text = rawText.replace(/^canvas\s+/i, "").trim();

      if (!text) {
        throw new InvalidParameterError(
          `Use ${PREFIX}brat <texto> ou ${PREFIX}brat canvas <texto>.`,
        );
      }

      inputPath = path.resolve(TEMP_DIR, getRandomName("png"));

      const imageBuffer = await createBratCanvas(
        text.slice(0, MAX_TEXT_LENGTH),
      );

      if (canvasMode && sendImageFromBuffer) {
        await sendSuccessReact();
        await sendImageFromBuffer(
          imageBuffer,
          `🟩 BRAT CANVAS\nTexto: ${text.slice(0, MAX_TEXT_LENGTH)}`,
        );
        return;
      }

      await fs.promises.writeFile(inputPath, imageBuffer);

      const username =
        webMessage.pushName ||
        webMessage.notifyName ||
        userLid.replace(/@lid/, "");

      const metadata = {
        username,
        botName: `${BOT_EMOJI} ${BOT_NAME}`,
      };

      finalStickerPath = await processStaticSticker(inputPath, metadata);

      await sendSuccessReact();

      await sendStickerFromFile(finalStickerPath);
    } finally {
      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      if (finalStickerPath && fs.existsSync(finalStickerPath)) {
        fs.unlinkSync(finalStickerPath);
      }
    }
  },
};
