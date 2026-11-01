import { buildShopText } from "../../../services/rpgGame.js";

export default {
  name: "rpgloja",
  description: "Exibe a loja de equipamentos RPG.",
  commands: ["rpgloja", "loja"],
  usage: "/loja",
  requiresRpg: true,
  handle: async ({ args, sendReply, socket, remoteJid }) => {
    await sendReply(buildShopText(args?.[0]));
    if (socket && remoteJid && !args?.[0]) {
      await socket.sendMessage(remoteJid, {
        text: "╔═══〔 🏰 MERCADO DO REINO 〕═══╗",
        title: "Sublojas",
        footer: "Escolha uma ala",
        buttonText: "Abrir mercado",
        sections: [{
          title: "Armazéns da cidade",
          rows: [
            { title: "⚗️ Poções", description: "Elixires e efeitos", rowId: `${PREFIX}loja pocoes` },
            { title: "⚔️ Armas", description: "Lâminas e cajados", rowId: `${PREFIX}loja armas` },
            { title: "🛡 Armaduras", description: "Defesas e escudos", rowId: `${PREFIX}loja armaduras` },
          ],
        }],
      });
    }
  },
};
