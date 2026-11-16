import fs from "node:fs/promises";
import sharp from "sharp";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { upload } from "../../services/linker.js";
import { getRandomNumber, removeFileIfExists } from "../../utils/index.js";

export default {
  name: "gerar-link",
  description: "Faço upload da imagens",
  commands: ["to-link", "up", "upload", "gera-link", "gerar-link"],
  usage: `${PREFIX}gerar-link (marque a imagem) ou ${PREFIX}gerar-link (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendReply,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você deve marcar ou responder uma imagem!"
      );
    }

    await sendWaitReact();

    const fileName = getRandomNumber(10_000, 99_999).toString();
    let filePath;
    try {
      filePath = await downloadImage(webMessage, fileName);
      const buffer = await sharp(await fs.readFile(filePath))
        .png()
        .toBuffer();
      const link = await upload(buffer, `${fileName}.png`);

      if (!link) {
        throw new Error(
          "Erro ao fazer upload da imagem. Tente novamente mais tarde.",
        );
      }

      await sendSuccessReact();
      await sendReply(`Aqui está o link da sua imagem!\n\n${link}`);
    } finally {
      if (filePath) {
        removeFileIfExists(filePath);
      }
    }
  },
};
