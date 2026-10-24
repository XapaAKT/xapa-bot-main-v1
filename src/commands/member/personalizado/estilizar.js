import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";

function toBoldUnicode(text) {
  return Array.from(text, (character) => {
    const codePoint = character.codePointAt(0);

    if (codePoint >= 0x41 && codePoint <= 0x5a) {
      return String.fromCodePoint(0x1d400 + codePoint - 0x41);
    }
    if (codePoint >= 0x61 && codePoint <= 0x7a) {
      return String.fromCodePoint(0x1d41a + codePoint - 0x61);
    }
    if (codePoint >= 0x30 && codePoint <= 0x39) {
      return String.fromCodePoint(0x1d7ce + codePoint - 0x30);
    }

    return character;
  }).join("");
}

export default {
  name: "estilizar",
  description: "Transforma um texto em uma assinatura cheia de estilo.",
  commands: ["estilizar", "trava2020"],
  usage: `${PREFIX}estilizar <texto>`,

  handle: async ({ args, sendReply }) => {
    const text = args.join(" ").replace(/[\r\n]/g, " ").trim();

    if (!text) {
      throw new InvalidParameterError(
        `Escreva algo para estilizar. Exemplo: ${PREFIX}estilizar Xapa in Chains`,
      );
    }

    const characters = Array.from(text);
    if (characters.length > 60) {
      throw new InvalidParameterError(
        "O texto pode ter no máximo 60 caracteres para continuar legível.",
      );
    }

    await sendReply(
      `꧁༒︎ 𝕏𝕀ℂ-𝔹𝕆𝕋 ༒︎꧂
╔═══════ ⛓️ ═══════╗
   𝐎𝐅𝐈𝐂𝐈𝐍𝐀 𝐃𝐄 𝐄𝐒𝐓𝐈𝐋𝐎
╚═══════ ⛓️ ═══════╝

꧁༺ ${toBoldUnicode(text)} ༻꧂

✦ 𝑬𝒔𝒕𝒊𝒍𝒐 𝒂𝒕𝒊𝒗𝒂𝒅𝒐.
⌁ ${characters.length}/60 caracteres`,
    );
  },
};
