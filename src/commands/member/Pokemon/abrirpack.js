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

      if (sendWaitReact) {
        await sendWaitReact();
      }

      await sendReply(`📦 Abrindo pack *${packType}*...`);
      await delay(1200);

      const result = await openPack(userLid, packType);

      if (sendSuccessReact) {
        await sendSuccessReact();
      }

      await sendReply(
`🎉 ━━━━━━━━━━━━━━━━━━━━
📦 *PACK ABERTO!*

✨ Você encontrou um Pokémon!

🏷️ Nome: *${result.pokemon.name}*
⭐ Raridade: *${result.pokemon.rarity}*
💰 Valor: *${formatMoney(result.pokemon.value)}*

📥 Adicionado à sua coleção!`
      );

      return await sendStickerFromFile(result.imagePath);
    } catch (error) {
      return await reply(
        error.message || "Erro ao abrir pack."
      );
    }
  },
};