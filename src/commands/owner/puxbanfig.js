import fs from "node:fs";
import path from "node:path";
import { PREFIX } from "../../config.js";

const BAN_STICKERS_DIR = path.resolve(
  process.cwd(),
  "assets",
  "images",
  "personalizado",
  "xapa",
);

export default {
  name: "puxbanfig",
  description: "Envia todas as figurinhas usadas pelo ban.",
  commands: ["puxbanfig"],
  usage: `${PREFIX}puxbanfig`,

  handle: async ({ sendStickerFromFile, sendReply }) => {
    const stickerFiles = ["ban1.webp", "ban2.webp", "ban3.webp"]
      .map((fileName) => path.join(BAN_STICKERS_DIR, fileName))
      .filter((filePath) => fs.existsSync(filePath));

    if (stickerFiles.length !== 3) {
      const missing = ["ban1.webp", "ban2.webp", "ban3.webp"].filter(
        (fileName) => !fs.existsSync(path.join(BAN_STICKERS_DIR, fileName)),
      );

      return sendReply(
        `❌ Não encontrei todas as figurinhas de ban.\n\nFaltando: ${missing.join(", ")}`,
      );
    }

    for (const stickerFile of stickerFiles) {
      await sendStickerFromFile(stickerFile, false);
    }

    await sendReply("✅ Figurinhas de ban enviadas!");
  },
};
