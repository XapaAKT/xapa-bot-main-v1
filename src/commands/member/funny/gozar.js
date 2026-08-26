import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "gozar",
  description: "Gozar em alguém ou sozinho.",
  commands: ["gozar", "gozada", "gozão", "leitar"],
  usage: `${PREFIX}gozar @usuario`,
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
    const userNumber = onlyNumbers(userLid);
    const temAlvo = args.length > 0 || isReply;

    // Pega o alvo primeiro
    const targetLid = temAlvo
    ? isReply
      ? replyLid
        : `${onlyNumbers(args[0])}@lid`
      : null;
    const targetNumber = targetLid? onlyNumbers(targetLid) : null;

    // Lista de GIFs - agora as frases são funções
    const gifs = [
      {
        nome: "gozouboca1.mp4",
        frasesSolo: [
          () => `@${userNumber} gozou na própria boca. Auto-serviço. 💦`,
          () => `@${userNumber} decidiu não desperdiçar. 💦`,
        ],
        frasesCom: [
          () => `@${userNumber} descarregou tudo na boca de @${targetNumber}! 💦`,
          () => `@${userNumber} fez @${targetNumber} tomar leitinho.`,
          () => `@${userNumber} encheu a boca de @${targetNumber}. Engole!`,
        ]
      },
      {
        nome: "gozoubunda1.mp4",
        frasesSolo: [
          () => `@${userNumber} gozou na própria bunda. Flexibilidade é tudo. 💦🍑`,
          () => `@${userNumber} fez ioga e gozou.`,
        ],
        frasesCom: [
          () => `@${userNumber} pintou a bunda de @${targetNumber} de branco! 💦🍑`,
          () => `@${userNumber} deu aquela gozada na bunda de @${targetNumber}`,
          () => `@${userNumber} deixou @${targetNumber} melado.`,
        ]
      },
      {
        nome: "gozoucara1.mp4",
        frasesSolo: [
          () => `@${userNumber} se auto-facial. Arte. 💦`,
          () => `@${userNumber} gozou na cara no espelho.`,
        ],
        frasesCom: [
          () => `@${userNumber} estragou a maquiagem de @${targetNumber}! 💦`,
          () => `@${userNumber} deu um facial em @${targetNumber}. Ficou marcado`,
          () => `@${userNumber} cagou na cara de @${targetNumber}. Literalmente.`,
        ]
      },
      {
        nome: "gozoupeito1.mp4",
        frasesSolo: [
          () => `@${userNumber} gozou no próprio peito. Musculoso. 💦`,
          () => `@${userNumber} fez whey natural.`,
        ],
        frasesCom: [
          () => `@${userNumber} fez uma tatuagem de leite no peito de @${targetNumber}! 💦`,
          () => `@${userNumber} encheu o peito de @${targetNumber}`,
          () => `@${userNumber} deixou @${targetNumber} parecendo propaganda de leite`,
        ]
      }
    ];

    // Sorteia o gif
    const gifEscolhido = gifs[Math.floor(Math.random() * gifs.length)];

    if (!temAlvo) {
      // SOZINHO
      const frases = gifEscolhido.frasesSolo;
      const fraseFunc = frases[Math.floor(Math.random() * frases.length)];
      const frase = fraseFunc(); // executa a função

      await sendGifFromFile(
        path.resolve(ASSETS_DIR, "images", "funny", gifEscolhido.nome),
        frase,
        [userLid]
      );
      return;
    }

    // COM ALGUEM
    if (!targetLid) {
      await sendErrorReply("Marca alguém ou responde a msg pra gozar na pessoa.");
      return;
    }

    const frases = gifEscolhido.frasesCom;
    const fraseFunc = frases[Math.floor(Math.random() * frases.length)];
    const frase = fraseFunc(); // executa a função com targetNumber já definido

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifEscolhido.nome),
      frase,
      [userLid, targetLid]
    );
  },
};