import {
  buildCollectionText,
  buildPokedexText,
  getUserSummary,
} from "../../../services/pokemonGame.js";
import { PREFIX } from "../../../config.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js";

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
    socket,
    remoteJid,
  }) => {
    const reply = sendErrorReply || sendReply;

    try {
      const summary = await getUserSummary(userLid);

      const text = commandName === "pokedex"
        ? buildPokedexText(summary.catalog, summary.pokemons, userLid)
        : buildCollectionText(summary, userLid);

      await sendReply(text);
      if (socket && remoteJid) {
        await sendInteractiveButtons(socket, remoteJid, {
          text: "🎒 O que você quer fazer agora?",
          footer: "Pokémon Xapa",
          buttons: [
            { id: `${PREFIX}loja-pokemon`, text: "🏪 Loja" },
            { id: `${PREFIX}pescar`, text: "🎣 Pescar" },
            { id: `${PREFIX}pokedex`, text: "📖 Pokédex" },
          ],
        });
      }
      return;
    } catch (error) {
      return await reply(error.message || "Erro ao carregar sua coleção.");
    }
  },
};