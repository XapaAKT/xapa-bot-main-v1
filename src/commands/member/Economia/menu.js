import { PREFIX } from "../../../config.js";
import { createNativeFlowButton, sendNativeFlowButtons } from "../../../utils/interactive.js";

const rows = [
  ["💰 Saldo", "saldo", "Veja suas moedas e XP"],
  ["🎁 Diário", "diario", "Colete sua recompensa diária"],
  ["💼 Trabalhar", "trabalhar", "Trabalhe e receba moedas"],
  ["🎰 Cassino", "cassino", "Aposte suas moedas virtuais"],
  ["🐌 Corrida", "corrida", "Participe da corrida de caracóis"],
  ["💸 Transferir", "transferir", "Envie moedas para alguém"],
  ["🏆 Top Rico", "toprico", "Veja o ranking de riquezas"],
];

export default {
  name: "economiamenu",
  description: "Menu de comandos da economia",
  commands: ["economia-menu", "ecomenu"],
  usage: `${PREFIX}economia-menu`,

  handle: async ({ socket, remoteJid, webMessage, prefix = PREFIX }) => {
    await sendNativeFlowButtons(socket, remoteJid, {
      title: "💰 Economia XIC",
      text: "Escolha uma operação econômica:",
      footer: "Use suas moedas com sabedoria.",
      buttons: [
        createNativeFlowButton("single_select", {
          title: "Abrir economia",
          sections: [
            {
              title: "Comandos econômicos",
              rows: rows.map(([title, command, description]) => ({
                title,
                description,
                id: `${prefix}${command}`,
              })),
            },
          ],
        }),
      ],
    }, { quoted: webMessage });
  },
};
