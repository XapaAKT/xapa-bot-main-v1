// cozinhar.js
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "cozinhar",
  description: "Cozinha um prato para um usuário.",
  commands: ["cozinhar", "cozinhar1", "cozinhar2", "cozinhar3", "cozinhar4", "cozinhar5"],
  usage: `${PREFIX}cozinhar @usuario`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userLid,
    replyLid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      // Sem menção - usa GIFs de cozinhar1 ao 5
      const gifs = [
        "cozinhar1.mp4",
        "cozinhar2.mp4",
        "cozinhar3.mp4",
        "cozinhar4.mp4",
        "cozinhar5.mp4",
      ];

      // Escolhe um gif aleatório
      const gifAleatorio =
        gifs[Math.floor(Math.random() * gifs.length)];

      await sendGifFromFile(
        path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
        `@${onlyNumbers(userLid)} esta cozinhando um prato!`,
        [userLid]
      );
    } else {
      // Com menção - usa GIFs de cozinharJ1 ou cozinharJ2
      const targetLid = isReply
        ? replyLid
        : args[0]
        ? `${onlyNumbers(args[0])}@lid`
        : null;

      if (!targetLid) {
        await sendErrorReply(
          "Você precisa mencionar um usuário ou responder uma mensagem para cozinhar."
        );

        return;
      }

      const userNumber = onlyNumbers(userLid);
      const targetNumber = onlyNumbers(targetLid);

      // Lista de GIFs para menções
      const gifs = [
        "cozinharJ1.mp4",
        "cozinharJ2.mp4",
      ];

      // Escolhe um gif aleatório
      const gifAleatorio =
        gifs[Math.floor(Math.random() * gifs.length)];

      await sendGifFromFile(
        path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
        `@${userNumber} e @${targetNumber} estão cozinhando um prato delicioso!! 🤤🍔`,
        [userLid, targetLid]
      );
    }
  },
};