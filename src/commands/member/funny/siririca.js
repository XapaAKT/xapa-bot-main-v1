// siririca.js
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "siririca",
  description: "Convida um usuário para uma festa de siririca.",
  commands: ["siririca", "siriricada", "siriricão"],
  usage: `${PREFIX}siririca @usuario`,
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
      throw new InvalidParameterError(
        "Você precisa mencionar ou marcar um membro!"
      );
    }

    const targetLid = isReply
      ? replyLid
      : args[0]
      ? `${onlyNumbers(args[0])}@lid`
      : null;

    if (!targetLid) {
      await sendErrorReply(
        "Você precisa mencionar um usuário ou responder uma mensagem para siririca."
      );

      return;
    }

    const userNumber = onlyNumbers(userLid);
    const targetNumber = onlyNumbers(targetLid);

    // Lista de GIFs
    const gifs = [
      "siririca1.mp4",
      "siririca2.mp4",
      "siririca3.mp4",
      "siririca4.mp4",
    ];

    // Escolhe um gif aleatório
    const gifAleatorio =
      gifs[Math.floor(Math.random() * gifs.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
      `@${userNumber} foi a uma siririca com @${targetNumber}!`,
      [userLid, targetLid]
    );
  },
};