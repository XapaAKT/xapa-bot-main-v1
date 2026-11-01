import { explore } from "../../../services/rpgGame.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgexplorar",
  description: "Explora o mapa em busca de tesouros e monstros.",
  commands: ["rpgexplorar", "explorar"],
  usage: "/explorar",
  requiresRpg: true,
  handle: async ({ userLid, sendReply, webMessage, sendLocation, sendReact, sendTypingState }) => {
    const name = getUserName(webMessage, userLid, "Aventureiro");
    await sendTypingState();
    await sendReact("🗺️");
    await sendLocation(-23.55052, -46.633308);
    await sendReply(`╔═══〔 🌲 FLORESTA SOMBRIA 〕═══╗
║ ${name}, você atravessou o velho portão.
║ O mapa foi marcado com uma localização antiga...
╚══════════════════════════════╝`);
    return sendReply(await explore(userLid, name));
  },
};
