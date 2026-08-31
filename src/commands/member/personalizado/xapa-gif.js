import fs from "node:fs";
import path from "node:path";
import { PREFIX } from "../../../config.js";

const XAPA_MEDIA_DIR = path.resolve(
  process.cwd(),
  "assets",
  "images",
  "personalizado",
  "xapa",
);

export default {
  name: "xapa-gif",
  description: "Envia um GIF aleatório do Xapa.",
  commands: ["xapa-gif", "gifxapa", "xapagif"],
  usage: `${PREFIX}xapa-gif`,

  handle: async ({ sendGifFromFile, sendReply }) => {
    const files = fs
      .readdirSync(XAPA_MEDIA_DIR, { withFileTypes: true })
      .filter(
        (file) =>
          file.isFile() && /\.(gif|mp4|webm)$/i.test(file.name),
      )
      .map((file) => path.join(XAPA_MEDIA_DIR, file.name));

    if (!files.length) {
      return sendReply("❌ Nenhum GIF personalizado foi encontrado.");
    }

    const selectedFile = files[Math.floor(Math.random() * files.length)];
    await sendGifFromFile(selectedFile, "🎞️ XAPA MODE ON");
  },
};