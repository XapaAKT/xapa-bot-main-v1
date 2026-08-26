import path from "node:path";
import { delay } from "baileys";
import { fishPokemon, formatMoney } from "../../../services/pokemonGame.js";

export default {
  name: "pescar",
  description: "Sistema de pesca com chance de dinheiro, pack e pokémon.",
  commands: ["pescar"],
  usage: "/pescar",

  handle: async ({
    userLid,
    sendReply,
    sendGifFromFile,
    sendStickerFromFile,
    sendSuccessReact,
    sendWaitReact,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      if (sendWaitReact) {
        await sendWaitReact();
      }

      const baseDir = path.resolve(
        process.cwd(),
        "assets",
        "images",
        "funny"
      );

      const fish1 = path.join(baseDir, "pescar1.mp4");
      const sea = path.join(baseDir, "mar1.mp4");

      // Animação da pesca
      await sendGifFromFile(
        fish1,
        "🎣 Você lançou a vara...",
        null,
        true
      );

      await delay(1500);

      await sendGifFromFile(
        sea,
        "🌊 Algo está se aproximando...",
        null,
        true
      );

      await delay(1500);

      const result = await fishPokemon(userLid);

      // Não pescou nada
      if (result.type === "nothing") {
        return await sendReply(result.message);
      }

      // Dinheiro
      if (result.type === "coins") {
        if (sendSuccessReact) {
          await sendSuccessReact();
        }

        return await sendReply(
          `${result.message}\n\n💰 + ${formatMoney(result.coins)}`
        );
      }

      // Pack
      if (result.type === "pack") {
        if (sendSuccessReact) {
          await sendSuccessReact();
        }

        return await sendReply(
          `${result.message}\n\n📦 Use * /abrirpack ${result.packType} *`
        );
      }

      // Pokémon
      if (result.type === "pokemon") {
        if (sendSuccessReact) {
          await sendSuccessReact();
        }

        await sendReply(
`🎣 ━━━━━━━━━━━━━━━━━━━━
✨ *VOCÊ PESCOU UM POKÉMON!*

🏷️ Nome: *${result.pokemon.name}*
⭐ Raridade: *${result.pokemon.rarity}*
💰 Valor: *${formatMoney(result.pokemon.value)}*

📦 Adicionado à sua coleção!`
        );

        return await sendStickerFromFile(result.imagePath);
      }

      return await sendReply(
        result.message || "Pesca concluída."
      );
    } catch (error) {
      return await reply(
        error.message || "Erro ao pescar."
      );
    }
  },
};