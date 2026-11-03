import { PREFIX } from "../../../config.js";
import { createNativeFlowButton, sendNativeFlowButtons } from "../../../utils/interactive.js";

const rows = [
  ["📖 Guia do RPG", "rpghelp", "Aprenda a jogar"],
  ["👤 Perfil", "rpgperfil", "Veja seu personagem"],
  ["🧭 Explorar", "rpgexplorar", "Explore o mundo"],
  ["🎒 Mochila", "rpginventario", "Veja itens e equipamentos"],
  ["⚔️ Batalha", "rpgbatalha", "Enfrente um monstro"],
  ["🗡️ Atacar", "rpgatacar", "Ataque o inimigo atual"],
  ["🏃 Fugir", "rpgfugir", "Fuja da batalha"],
  ["🏪 Loja", "rpgloja", "Veja os equipamentos"],
  ["🛒 Comprar", "rpgcomprar", "Compre um item"],
  ["🛡️ Classe", "rpgclasse", "Escolha sua classe"],
  ["🔨 Profissão", "rpgprofissao", "Escolha sua profissão"],
];

export default {
  name: "rpgmenu",
  description: "Menu de comandos do RPG",
  commands: ["rpg-menu", "menurpg"],
  usage: `${PREFIX}rpg-menu`,
  requiresRpg: true,

  handle: async ({ socket, remoteJid, webMessage, prefix = PREFIX }) => {
    await sendNativeFlowButtons(socket, remoteJid, {
      title: "⚔️ RPG XIC",
      text: "Escolha o próximo passo da sua aventura:",
      footer: "Sua lenda começa agora.",
      buttons: [
        createNativeFlowButton("single_select", {
          title: "Abrir RPG",
          sections: [
            {
              title: "Comandos RPG",
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
