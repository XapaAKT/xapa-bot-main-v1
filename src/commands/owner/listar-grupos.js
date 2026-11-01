import { PREFIX } from "../../config.js";

export default {
  name: "listar-grupos",
  description: "Lista os grupos em que o bot participa.",
  commands: ["listar-grupos", "grupos-bot"],
  usage: `${PREFIX}listar-grupos`,
  handle: async ({ socket, sendReply }) => {
    if (typeof socket.groupFetchAllParticipating !== "function") {
      throw new Error("Esta versão da conexão não oferece groupFetchAllParticipating.");
    }
    const groups = await socket.groupFetchAllParticipating();
    const entries = Object.values(groups || {});
    return sendReply(`╔═══〔 👥 GRUPOS DO BOT 〕═══╗
${entries.map((group, index) => `║ ${index + 1}. ${group.subject || "Sem nome"}\n║    ID: ${group.id}`).join("\n") || "║ Nenhum grupo encontrado."}
╚══════════════════════════════╝`);
  },
};
