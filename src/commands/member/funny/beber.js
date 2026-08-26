import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "beber",
  description: "Bebe uma cerveja ou vinho. Use 'beber vinho' para vinho.",
  commands: ["beber", "cerveja", "vinho", "bebida"],
  usage: `${PREFIX}beber [vinho] @usuario`,
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
    const isVinho = args[0]?.toLowerCase() === "vinho";
    const argsSemVinho = isVinho? args.slice(1) : args;
    const temAlvo = argsSemVinho.length > 0 || isReply;

    const userNumber = onlyNumbers(userLid);
    const targetLid = isReply
     ? replyLid
      : argsSemVinho[0]
     ? `${onlyNumbers(argsSemVinho[0])}@lid`
      : null;
    const targetNumber = targetLid? onlyNumbers(targetLid) : null;

    if (!temAlvo) {
      // SOZINHO
      if (isVinho) {
        // Gifs de vinho sozinho
        const gifsVinhoSolo = [
          "bsvinho1.mp4",
          "bsvinho2.mp4",
          "bsvinho3.mp4",
          "avaliarvinho1.mp4",
          "avaliarvinho2.mp4",
          "avaliarvinhoazul1.mp4",
        ];
        const gifAleatorio = gifsVinhoSolo[Math.floor(Math.random() * gifsVinhoSolo.length)];
        const frases = [
          `@${userNumber} esta bebendo vinho sozinho. A vida é um brinde. 🍷`,
          `@${userNumber} virou sommelier por 5 minutos. 🍷`,
          `@${userNumber} avaliou o vinho: nota 10 e solidão. 🍷`,
        ];
        const frase = frases[Math.floor(Math.random() * frases.length)];

        await sendGifFromFile(
          path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
          frase,
          [userLid]
        );
      } else {
        // Gifs de cerveja sozinho
        const gifsCerveja = ["beber1.mp4", "beber2.mp4", "beber3.mp4"];
        const gifAleatorio = gifsCerveja[Math.floor(Math.random() * gifsCerveja.length)];

        await sendGifFromFile(
          path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
          `@${userNumber} esta bebendo sozinho.🍺`,
          [userLid]
        );
      }
    } else {
      // COM ALGUÉM
      if (!targetLid) {
        await sendErrorReply(
          "Você precisa mencionar um usuário ou responder uma mensagem para beber."
        );
        return;
      }

      if (isVinho) {
        // Gifs de vinho com alguém
        const gifsVinhoCom = [
          "servirvinho1.mp4",
          "servirvinho2.mp4",
          "brindarvinho1.mp4",
        ];
        const gifAleatorio = gifsVinhoCom[Math.floor(Math.random() * gifsVinhoCom.length)];

        const mensagem = gifAleatorio === "brindarvinho1.mp4"
         ? `@${userNumber} brindou com @${targetNumber}! Saúde! 🍷`
          : `@${userNumber} serviu um vinho para @${targetNumber}! 🍷`;

        await sendGifFromFile(
          path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
          mensagem,
          [userLid, targetLid]
        );
      } else {
        // Gifs de cerveja com alguém
        const gifsCervejaCom = ["beberJ1.mp4", "beberBrindar1.mp4"];
        const gifAleatorio = gifsCervejaCom[Math.floor(Math.random() * gifsCervejaCom.length)];

        const mensagem = gifAleatorio === "beberBrindar1.mp4"
         ? `@${userNumber} brindou com @${targetNumber}!`
          : `@${userNumber} deu uma cerveja a @${targetNumber}!`;

        await sendGifFromFile(
          path.resolve(ASSETS_DIR, "images", "funny", gifAleatorio),
          mensagem,
          [userLid, targetLid]
        );
      }
    }
  },
};