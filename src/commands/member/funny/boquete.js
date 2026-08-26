import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "boquete",
  description: "Convida um usuário para um boquete ou pede um.",
  commands: ["boquete", "boquetada", "boquetão", "bj"],
  usage: `${PREFIX}boquete @usuario`,
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
    const temAlvo = args.length > 0 || isReply;
    const userNumber = onlyNumbers(userLid);

    const gifs = [
      "boquete1.mp4",
      "boquete2.mp4",
      "boquete3.mp4",
    ];
    const gifAleatorio = gifs[Math.floor(Math.random() * gifs.length)];

    if (!temAlvo) {
      // SOZINHO - pedindo
      const frasesSolo = [
        `@${userNumber} ta aceitando boquete hj hein... 👀`,
        `@${userNumber} abriu a boca e pediu. Quem vai?`,
        `@${userNumber} ta com a boca coçando...`,
      ];
      const frase = frasesSolo[Math.floor(Math.random() * frasesSolo.length)];

      await sendGifFromFile(
        path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
        frase,
        [userLid]
      );
      return;
    }

    // COM ALGUEM
    const targetLid = isReply
     ? replyLid
      : `${onlyNumbers(args[0])}@lid`;

    if (!targetLid) {
      await sendErrorReply(
        "Marca alguém ou responde a msg da pessoa pra dar o boquete."
      );
      return;
    }

    const targetNumber = onlyNumbers(targetLid);

    const frasesCom = [
      `@${userNumber} desceu ate o chao pra @${targetNumber}! 😈`,
      `@${userNumber} fez um servico caprichado em @${targetNumber}`,
      `@${userNumber} engoliu o orgulho e foi pra cima de @${targetNumber}`,
      `@${userNumber} deu aquela boquetada gostosa em @${targetNumber}`,
      `@${targetNumber} foi abencoado por @${userNumber} hoje`,
    ];
    const frase = frasesCom[Math.floor(Math.random() * frasesCom.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
      frase,
      [userLid, targetLid]
    );
  },
};