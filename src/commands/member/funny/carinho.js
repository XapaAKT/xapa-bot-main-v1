import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "carinho",
  description: "Da um carinho em um usuário que você ama.",
  commands: ["carinho", "cafufu", "cafuné", "cafune"],
  usage: `${PREFIX}carinho @usuario`,
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
        "Você precisa mencionar um usuário ou responder uma mensagem para carinho."
      );

      return;
    }

    const userNumber = onlyNumbers(userLid);
    const targetNumber = onlyNumbers(targetLid);

    // Lista de GIFs
    const gifs = [
      "carinho1.mp4",
      "carinho2.mp4",
      "carinho3.mp4",
      "carinho4.mp4",
    ];

    // Escolhe um gif aleatório
    const gifAleatorio =
      gifs[Math.floor(Math.random() * gifs.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
      `@${userNumber} deu um carinho em @${targetNumber}!`,
      [userLid, targetLid]
    );
  },
};