import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { searchPinterest } from "../../../services/pinterest-scraper.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "pinterest",
  description: "Busco imagens no Pinterest e envio em formato carrossel.",
  commands: ["pinterest", "pin"],
  usage: `${PREFIX}pinterest gatos fofos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendImageFromURL,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que deseja buscar no Pinterest!",
      );
    }

    await sendWaitReact();

    try {
      const images = await searchPinterest(fullArgs.trim());

      if (!images.length) {
        await sendErrorReply(
          "Não foi possível montar o carrossel com as imagens retornadas.",
        );
        return;
      }

      await sendSuccessReact();

      await sendImageFromURL(
        images[0],
        `📌 *PINTEREST*\n\nBusca: ${fullArgs}\n\nImagem 1/${images.length}`,
      );

      for (let index = 1; index < images.length; index += 1) {
        await sendImageFromURL(
          images[index],
          `📌 *PINTEREST*\n\nBusca: ${fullArgs}\n\nImagem ${index + 1}/${images.length}`,
        );
      }
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(JSON.stringify(error.message));
    }
  },
};
