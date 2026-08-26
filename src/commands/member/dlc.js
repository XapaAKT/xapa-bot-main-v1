import fs from "node:fs";
import path from "node:path";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getRandomName } from "../../utils/index.js";

export default {
  name: "salvar",
  description: "Salva uma imagem ou vídeo com visualização única",
  commands: ["dlc", "save", "🔥"],
  usage: `${PREFIX}salvar (marque a imagem/vídeo) ou ${PREFIX}salvar (responda a imagem/vídeo).`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendWaitReact,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem/vídeo ou responder a uma imagem/vídeo para salvá-la"
      );
    }

    await sendWaitReact();

    const saveDir = "./videos";
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const mediaType = isImage ? "jpg" : "mp4";
    const timestamp = Date.now();
    const fileName = `${timestamp}.${mediaType}`;
    const outputPath = path.join(saveDir, fileName);

    let inputPath;

    try {
      if (isImage) {
        inputPath = await downloadImage(webMessage, "input");
        fs.copyFileSync(inputPath, outputPath);
      } else if (isVideo) {
        inputPath = await downloadVideo(webMessage, "input");
        fs.copyFileSync(inputPath, outputPath);
      }

      console.log(`Mídia salva em: ${outputPath}`);
    } catch (error) {
      console.error("Erro ao salvar mídia:", error);
      throw new Error("Ocorreu um erro ao salvar a mídia. Tente novamente.");
    } finally {
      const cleanFile = (filePath) => {
        if (filePath && fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (cleanError) {
            console.error("Erro ao limpar arquivo:", cleanError);
          }
        }
      };

      cleanFile(inputPath);
    }
  },
};