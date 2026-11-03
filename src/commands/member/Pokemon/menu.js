import { PREFIX } from "../../../config.js";
import { createNativeFlowButton, sendNativeFlowButtons } from "../../../utils/interactive.js";

const rows = [
  ["🎒 Minha coleção", "pokemon", "Veja seus Pokémon"],
  ["📖 Pokédex", "pokedex", "Consulte seu progresso"],
  ["🎣 Pescar", "pescar", "Pesque novos Pokémon"],
  ["🏪 Loja", "loja-pokemon", "Compre itens e pacotes"],
  ["📦 Comprar pack", "comprarpack", "Adquira um novo pack"],
  ["🎁 Abrir pack", "abrirpack", "Abra um pack recebido"],
  ["💵 Vender Pokémon", "venderpokemon", "Venda Pokémon da coleção"],
];

export default {
  name: "pokemonmenu",
  description: "Menu de comandos Pokémon",
  commands: ["pokemon-menu", "pokemenu"],
  usage: `${PREFIX}pokemon-menu`,

  handle: async ({ socket, remoteJid, webMessage, prefix = PREFIX }) => {
    await sendNativeFlowButtons(socket, remoteJid, {
      title: "🎮 Pokémon XIC",
      text: "Escolha uma atividade Pokémon:",
      footer: "Capture, treine e negocie.",
      buttons: [
        createNativeFlowButton("single_select", {
          title: "Abrir Pokémon",
          sections: [
            {
              title: "Comandos Pokémon",
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
