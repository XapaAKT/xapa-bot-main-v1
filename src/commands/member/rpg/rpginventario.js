import { getInventory, renderInventoryCanvas } from "../../../services/rpgGame.js";
import { PREFIX } from "../../../config.js";
import { sendInteractiveButtons } from "../../../utils/interactive.js";
import { getUserName } from "../../../utils/index.js";

export default {
  name: "rpginventario",
  description: "Mostra itens e equipamentos RPG.",
  commands: ["rpginventario", "inventariorpg", "mochila", "inventario"],
  usage: "/mochila",
  requiresRpg: true,
  handle: async ({ userLid, sendReply, sendImageFromBuffer, socket, remoteJid, webMessage }) => {
    const name = getUserName(webMessage, userLid, "Aventureiro");
    await sendReply(await getInventory(userLid, name));
    if (sendImageFromBuffer) await sendImageFromBuffer(await renderInventoryCanvas(userLid, name), "🎒 Mochila do aventureiro");
    if (socket && remoteJid) {
      await socket.sendMessage(remoteJid, {
        text: "╔═══〔 🎒 MOCHILA 〕═══╗",
        title: "Itens guardados",
        footer: "Escolha uma ação",
        buttonText: "Abrir ações",
        sections: [{
          title: "Ações da mochila",
          rows: [
            { title: "🏪 Comprar item", description: "Visitar o mercado", rowId: `${PREFIX}loja` },
            { title: "📜 Ver perfil", description: "Consultar atributos", rowId: `${PREFIX}perfil` },
            { title: "🗺️ Explorar", description: "Partir para uma missão", rowId: `${PREFIX}explorar` },
          ],
        }],
      });
      await sendInteractiveButtons(socket, remoteJid, {
        text: "Escolha o próximo passo da sua jornada:",
        footer: "✦ Crônicas do Reino ✦",
        buttons: [
          { id: `${PREFIX}loja`, text: "🏪 Ir à loja" },
          { id: `${PREFIX}perfil`, text: "📜 Ver perfil" },
          { id: `${PREFIX}explorar`, text: "🗺️ Explorar" },
        ],
      });
    }
  },
};
