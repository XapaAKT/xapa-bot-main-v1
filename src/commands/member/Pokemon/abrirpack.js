import { delay } from "baileys";
import {
  openPack,
  formatMoney,
} from "../../../services/pokemonGame.js";

export default {
  name: "abrirpack",
  description: "Abre um pack Pokémon.",
  commands: ["abrirpack"],
  usage: "/abrirpack comum",

  handle: async ({
    fullArgs,
    sendReply,
    sendStickerFromFile,
    sendSuccessReact,
    sendWaitReact,
    sendErrorReply,
    userLid,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const packType =
        String(fullArgs || "")
          .trim()
          .split(/\s+/)[0] || "comum";
      const amount = Number(
        String(fullArgs || "").trim().split(/\s+/)[1] || "1"
      );

      if (sendWaitReact) {
        await sendWaitReact();
      }

      await sendReply(`📦 Abrindo *${amount}x pack ${packType}*...`);
      await delay(1200);

      const result = await openPack(userLid, packType, amount);

      if (sendSuccessReact) {
        await sendSuccessReact();
      }

      const results = result.pokemons
        .map((pokemon, index) =>
          `${index + 1}. *${pokemon.name}* | ${pokemon.rarity} | ${formatMoney(pokemon.value)}`
        )
        .join("\n");

      await sendReply(
`🎉 ━━━━━━━━━━━━━━━━━━━━
📦 *${result.amount} PACK(S) ABERTO(S)!*

${results}

📥 Tudo foi adicionado à sua coleção!`
      );

      try {
        return await sendStickerFromFile(result.imagePath);
      } catch {
        return await sendReply("✅ Os Pokémon foram salvos, mas a imagem não está disponível.");
      }
    } catch (error) {
      return await reply(
        error.message || "Erro ao abrir pack."
      );
    }
  },
};