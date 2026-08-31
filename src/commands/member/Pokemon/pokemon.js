import {
  buildCollectionText,
  buildPokedexText,
  getUserSummary,
} from "../../../services/pokemonGame.js";

export default {
  name: "pokemon",
  description: "Mostra sua coleção Pokémon.",
  commands: ["pokemon", "pokedex", "colecao"],
  usage: "/pokemon",

  handle: async ({
    commandName,
    userLid,
    sendReply,
    sendErrorReply,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const summary = await getUserSummary(userLid);

      const text = commandName === "pokedex"
        ? buildPokedexText(summary.catalog, summary.pokemons, userLid)
        : buildCollectionText(summary, userLid);

      return await sendReply(text);
    } catch (error) {
      return await reply(error.message || "Erro ao carregar sua coleção.");
    }
  },
};