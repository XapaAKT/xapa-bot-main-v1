// socar.js
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "socar",
  description: "Convida um usuário para socar.",
  commands: ["socar", "soca", "socador"],
  usage: `${PREFIX}socar @usuario`,
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
        "Você precisa mencionar um usuário ou responder uma mensagem para socar."
      );

      return;
    }

    const userNumber = onlyNumbers(userLid);
    const targetNumber = onlyNumbers(targetLid);

    // Lista de GIFs
    const gifs = [
      "socar1.mp4",
      "socar2.mp4",
      "socar3.mp4",
      "socar4.mp4",
      "socar5.mp4",
      "socar6.mp4",
      "socar7.mp4",
      "socar8.mp4",
    ];

    // Escolhe um gif aleatório
    const gifAleatorio =
      gifs[Math.floor(Math.random() * gifs.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
      `@${userNumber} socou @${targetNumber}!`,
      [userLid, targetLid]
    );
  },
};