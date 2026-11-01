import { buyItem } from "../../../services/rpgGame.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpgcomprar",
  description: "Compra uma poção ou equipamento.",
  commands: ["rpgcomprar", "comprar"],
  usage: "/comprar espada",
  requiresRpg: true,
  handle: async ({ args, userLid, sendReply, webMessage }) => sendReply(await buyItem(userLid, args?.[0], getUserName(webMessage, userLid, "Aventureiro"))),
};
