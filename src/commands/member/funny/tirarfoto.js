import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "tirarfoto",
  description: "Tira uma foto de você ou de alguém. Se cair nerd tem chance de virar chad.",
  commands: ["tirarfoto", "foto", "click", "selfie"],
  usage: `${PREFIX}tirarfoto @usuario`,
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

    const targetLid = temAlvo
    ? isReply
      ? replyLid
        : `${onlyNumbers(args[0])}@lid`
      : null;
    const targetNumber = targetLid? onlyNumbers(targetLid) : null;

    // LIDS PROTEGIDOS - NÃO PODEM CAIR COMO CORNO
    const LIDS_PROTEGIDOS = [
      "61792281747590@lid" // coloca mais aqui se precisar
    ];

    // SORTEIA SÓ OS 3 PRIMEIROS. O de limpar camera só vem na sequência
    const gifsBase = [
      "tirarfotoboi1.mp4",
      "tirarfotochad1.mp4",
      "tirarfotonerd1.mp4",
    ];
    let gifSorteado = gifsBase[Math.floor(Math.random() * gifsBase.length)];
    let gifFinal = gifSorteado;
    let tipo = "";

    // SE CAIU NERD, 40% DE CHANCE DE VIRAR SEQUENCIA CHAD LIMPANDO
    if (gifSorteado === "tirarfotonerd1.mp4" && Math.random() < 0.4) {
      gifFinal = "tirarfotolimparcamerachad1.mp4";
      tipo = "chadlimpa";
    } else if (gifSorteado === "tirarfotoboi1.mp4") {
      tipo = "boi";
    } else if (gifSorteado === "tirarfotochad1.mp4") {
      tipo = "chad";
    } else {
      tipo = "nerd";
    }

    // SE O ALVO É PROTEGIDO E CAIU BOI, RESORTEIA ATÉ NÃO SER BOI
    if (temAlvo && LIDS_PROTEGIDOS.includes(targetLid) && tipo === "boi") {
      do {
        gifSorteado = gifsBase[Math.floor(Math.random() * gifsBase.length)];
        gifFinal = gifSorteado;

        if (gifSorteado === "tirarfotonerd1.mp4" && Math.random() < 0.4) {
          gifFinal = "tirarfotolimparcamerachad1.mp4";
          tipo = "chadlimpa";
        } else if (gifSorteado === "tirarfotoboi1.mp4") {
          tipo = "boi";
        } else if (gifSorteado === "tirarfotochad1.mp4") {
          tipo = "chad";
        } else {
          tipo = "nerd";
        }
      } while (tipo === "boi"); // continua sorteando enquanto cair boi
    }

    if (!temAlvo) {
      // SOZINHO
      let frases = [];

      if (tipo === "boi") {
        frases = [
          `@${userNumber} *CLICK* Eita porra saiu um CORNO. 📸🐂`,
          `@${userNumber} tirou selfie e confirmou: É CORNO MESMO`,
          `@${userNumber} foto oficial do chifre. Ta gravado.`,
          `@${userNumber} *flash* Boiola detectado no grupo`,
        ];
      } else if (tipo === "nerd") {
        frases = [
          `@${userNumber} *CLICK* NERDOLA BIZARRO NA ÁREA. 📸🤓`,
          `@${userNumber} tirou foto e saiu um cabaço. Nerdola nível hard`,
          `@${userNumber} *flash* Cuidado, nerdola bizarro soltando fedor`,
          `@${userNumber} selfie de quem usa meia com sandália`,
        ];
      } else if (tipo === "chadlimpa") {
        frases = [
          `@${userNumber} TAVA NERDOLA BIZARRO... MAS LIMPOU A CAMERA E VIROU CHAD 😎📸`,
          `@${userNumber} *limpou a lente* AGORA PRESTA. Evoluiu de nerdola pra chad`,
          `@${userNumber} PASSOU O PANO E SALVOU A SELFIE. Chad emergencial`,
        ];
      } else {
        frases = [
          `@${userNumber} *CLICK* MODO CHAD ATIVADO. Pode postar. 📸`,
          `@${userNumber} tirou foto e ficou gostoso. Inveja.`,
          `@${userNumber} *flash* Quem aguenta esse chad?`,
        ];
      }

      const frase = frases[Math.floor(Math.random() * frases.length)];

      await sendGifFromFile(
        path.resolve(ASSETS_DIR, "images", "funny", gifFinal),
        frase,
        [userLid]
      );
      return;
    }

    // COM ALGUEM
    let frases = [];

    if (tipo === "boi") {
      frases = [
        `@${userNumber} *CLICK* PEGOU @${targetNumber} NO FLAGRA: CORNO. 📸🐂`,
        `@${userNumber} fotografou o corno oficial do grupo: @${targetNumber}`,
        `@${userNumber} *flash* Boiola @${targetNumber} detectado`,
        `@${userNumber} registrou @${targetNumber} usando chifre de enfeite`,
      ];
    } else if (tipo === "nerd") {
      frases = [
        `@${userNumber} *CLICK* NERDOLA BIZARRO: @${targetNumber}. 📸🤓`,
        `@${userNumber} tirou foto de @${targetNumber} e saiu um cabaço`,
        `@${userNumber} *flash* Cuidado galera, nerdola bizarro a vista: @${targetNumber}`,
        `@${userNumber} transformou @${targetNumber} em nerdola que usa meia com sandália`,
      ];
    } else if (tipo === "chadlimpa") {
      frases = [
        `@${userNumber} TAVA TIRANDO FOTO DE @${targetNumber} NERDOLA... LIMPOU A CAMERA E VIROU CHAD 😎📸`,
        `@${userNumber} salvou @${targetNumber} de ser nerdola. Passou o pano e ficou chad`,
        `@${userNumber} *limpou a lente* PRONTO @${targetNumber} AGORA PRESTA`,
      ];
    } else {
      frases = [
        `@${userNumber} *CLICK* @${targetNumber} MODO CHAD ATIVADO. Respeita. 📸`,
        `@${userNumber} fotografou @${targetNumber} e ficou gostoso. Inveja`,
        `@${userNumber} *flash* Quem aguenta esse chad @${targetNumber}?`,
      ];
    }

    const frase = frases[Math.floor(Math.random() * frases.length)];

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", gifFinal),
      frase,
      [userLid, targetLid]
    );
  },
};