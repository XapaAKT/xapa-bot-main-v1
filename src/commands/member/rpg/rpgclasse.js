import { chooseClass } from "../../../services/rpgGame.js";
import { getUserName } from "../../../utils/index.js";
import { PREFIX } from "../../../config.js";

export default {
  name: "rpgclasse",
  description: "Escolhe sua profissão de combate.",
  commands: ["rpgclasse", "classe"],
  usage: "/classe guerreiro|mago|cacador",
  requiresRpg: true,
  handle: async ({ args, userLid, sendReply, socket, remoteJid, webMessage }) => {
    if (!args?.[0] && socket && remoteJid) {
      await socket.sendMessage(remoteJid, {
        text: "╔═══〔 ⚔ ESCOLHA DE CLASSE 〕═══╗",
        title: "Classes do Reino",
        footer: "A escolha é permanente",
        buttonText: "Ver classes",
        sections: [{
          title: "Caminhos disponíveis",
          rows: [
            { title: "⚔ Guerreiro", description: "Resistência e defesa", rowId: `${PREFIX}rpgclasse guerreiro` },
            { title: "🔮 Mago", description: "Poder arcano e dano", rowId: `${PREFIX}rpgclasse mago` },
            { title: "🏹 Caçador", description: "Precisão e equilíbrio", rowId: `${PREFIX}rpgclasse cacador` },
            { title: "🛡 Paladino", description: "Guardião sagrado", rowId: `${PREFIX}rpgclasse paladino` },
            { title: "🗡 Ladino", description: "Velocidade e críticos", rowId: `${PREFIX}rpgclasse ladino` },
            { title: "🌿 Druida", description: "Natureza e adaptação", rowId: `${PREFIX}rpgclasse druida` },
          ],
        }],
      });
      return;
    }
    const name = getUserName(webMessage, userLid, "Aventureiro");
    const selected = await chooseClass(userLid, args?.[0], name);
    return sendReply(`╔═══〔 ✦ CAMINHO ESCOLHIDO ✦ 〕═══╗
║ ${selected.emoji} ${selected.name}
║ A floresta aguarda seus primeiros passos.
║ Use ${PREFIX}explorar para iniciar.
╚══════════════════════════════╝`);
  },
};
