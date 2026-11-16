import { PREFIX } from "../../../config.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../../utils/interactive.js";

const rows = [
  ["🤝 Adotar", "adotar", "Adote alguém para sua família"],
  ["💍 Casar", "casar", "Crie um vínculo de casamento"],
  ["✅ Aceitar", "aceitar", "Aceite um pedido"],
  ["❌ Recusar", "recusar", "Recuse um pedido"],
  ["💔 Divorciar", "divorciar", "Encerre um casamento"],
  ["🚪 Abandonar", "abandonar", "Saia da sua família"],
  ["👪 Família", "familia", "Veja sua família atual"],
  ["💑 Casados", "casados", "Veja os casais do grupo"],
  ["📜 Histórico", "historico", "Consulte o histórico familiar"],
  ["👤 Perfil", "perfil", "Veja seu perfil de membro"],
  ["🏆 Ranking", "rankingfamilia", "Veja o ranking de famílias"],
  ["💞 Ship", "ship", "Consulte a compatibilidade do casal"],
];

export default {
  name: "familymenu",
  description: "Menu de comandos de família",
  commands: ["familia-menu", "familiamenu"],
  usage: `${PREFIX}familia-menu`,

  handle: async ({ socket, remoteJid, webMessage, prefix = PREFIX }) => {
    await sendNativeFlowButtons(
      socket,
      remoteJid,
      {
        title: "👪 Família XIC",
        text: "Escolha uma ação da sua família:",
        footer: "Os pedidos precisam ser aceitos pelos participantes.",
        buttons: [
          createNativeFlowButton("single_select", {
            title: "Abrir família",
            sections: [
              {
                title: "Comandos de família",
                rows: rows.map(([title, command, description]) => ({
                  title,
                  description,
                  id: `${prefix}${command}`,
                })),
              },
            ],
          }),
        ],
      },
      { quoted: webMessage },
    );
  },
};
