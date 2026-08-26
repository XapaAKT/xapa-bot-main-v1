import { buildShopText } from "../../../services/pokemonGame.js";

export default {
  name: "loja-pokemon",
  description: "Mostra a loja de packs Pokémon.",
  commands: ["loja-pokemon", "lojapokemon", "loja"],
  usage: "/loja-pokemon",

  handle: async ({ sendReply, sendErrorReply }) => {
    const reply = sendErrorReply || sendReply;

    try {
      return await sendReply(buildShopText());
    } catch (error) {
      return await reply(error.message || "Erro ao abrir a loja.");
    }
  },
};