import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "metadados-grupo",
  description: "Exibe metadados e administradores do grupo atual.",
  commands: ["metadados-grupo", "dados-grupo"],
  usage: `${PREFIX}metadados-grupo`,
  handle: async ({ socket, remoteJid, isGroup, sendReply }) => {
    if (!isGroup) throw new WarningError("Use este comando em um grupo.");
    const metadata = await socket.groupMetadata(remoteJid);
    const admins = (metadata.participants || []).filter((participant) => participant.admin);
    return sendReply(`╔═══〔 📜 METADADOS DO GRUPO 〕═══╗
║ 🏰 Nome: ${metadata.subject || "Sem nome"}
║ 👥 Membros: ${metadata.participants?.length || 0}
║ 👑 Dono: ${metadata.owner || "indisponível"}
║ 🔐 Somente admins: ${metadata.announce ? "sim" : "não"}
║ ✅ Aprovação: ${metadata.restrict ? "sim" : "não"}
║
║ 👑 ADMINISTRAÇÃO
${admins.map((participant) => `║ • ${participant.id} — ${participant.admin}`).join("\n") || "║ • Nenhum dado disponível"}
║
║ ℹ️ Histórico de entrada e “desde quando é ADM” só aparece se a versão da API fornecer esses campos.
╚══════════════════════════════╝`);
  },
};
