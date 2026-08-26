import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "dedada",
  description: "Convida um usuário para uma dedada.",
  commands: ["dedada", "dedadada", "dedar"],
  usage: `${PREFIX}dedada @usuario`,
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
        "Você precisa mencionar um usuário ou responder uma mensagem para dedada."
      );

      return;
    }

    const userNumber = onlyNumbers(userLid);
    const targetNumber = onlyNumbers(targetLid);

    // Lista de GIFs
    const gifs = [
      "dedada1.mp4",
      "dedada2.mp4",
      "dedada3.mp4",
    ];

    // Escolhe um gif aleatório
    const gifAleatorio =
      gifs[Math.floor(Math.random() * gifs.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
      `@${userNumber} deu uma dedada em @${targetNumber}!`,
      [userLid, targetLid]
    );
  },
};