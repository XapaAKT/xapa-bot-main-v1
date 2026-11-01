import { PREFIX } from "../../config.js";

export default {
  name: "chamadas",
  description: "Mostra o status do tratamento automático de chamadas.",
  commands: ["chamadas", "status-chamadas"],
  usage: `${PREFIX}chamadas`,
  handle: async ({ socket, sendReply }) => {
    const supported = typeof socket.rejectCall === "function";
    return sendReply(`╔═══〔 📞 CHAMADAS 〕═══╗
║ Detecção de chamadas: ${supported ? "disponível" : "indisponível"}
║ Recusa automática: ${supported ? "ativada" : "não suportada pela conexão"}
║
║ O evento call é tratado pelo loader.
╚══════════════════════════════╝`);
  },
};
