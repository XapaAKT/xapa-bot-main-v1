import { sellPokemon, formatMoney } from "../../../services/pokemonGame.js";

export default {
  name: "venderpokemon",
  description: "Vende um Pokémon da sua coleção.",
  commands: ["venderpokemon", "venderpoke", "vender"],
  usage: "/venderpokemon Pikachu",

  handle: async ({
    fullArgs,
    userLid,
    sendReply,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const query = String(fullArgs || "").trim();
      const result = await sellPokemon(userLid, query);

      if (sendSuccessReact) await sendSuccessReact();

      return await sendReply(
        `💸 Você vendeu ${result.pokemon.name} por ${formatMoney(result.sellValue)}.`
      );
    } catch (error) {
      return await reply(error.message || "Erro ao vender o Pokémon.");
    }
  },
};