import { buildCollectionText, getUserSummary } from "../../../services/pokemonGame.js";

export default {
  name: "pokemon",
  description: "Mostra sua coleção Pokémon.",
  commands: ["pokemon", "pokedex", "colecao"],
  usage: "/pokemon",

  handle: async ({
    userLid,
    sendReply,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const summary = await getUserSummary(userLid);

      const text = buildCollectionText(
        {
          coins: summary.coins,
          packs: summary.packs,
          pokemons: [],
        },
        userLid
      );

      return await sendReply(text);
    } catch (error) {
      return await reply(error.message || "Erro ao carregar sua coleção.");
    }
  },
};