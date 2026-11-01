import { PREFIX } from "../../../config.js";

export default {
  name: "menucanvas",
  description: "Mostra as opções de personalização do canvas.",
  commands: ["menucanvas", "menu-canvas"],
  usage: `${PREFIX}menucanvas`,

  handle: async ({ sendReply }) => {
    await sendReply(
      [
        "╭━━━〔 🎨 𝐌𝐄𝐍𝐔 𝐂𝐀𝐍𝐕𝐀𝐒 〕━━━╮",
        "┃",
        `┃ 🖼️ ${PREFIX}perfil`,
        `┃ 🔄 ${PREFIX}testecanvas`,
        "┃",
        "┃ 👤 Alterar nome",
        `┃ ➜ ${PREFIX}testecanvas nome <nome>`,
        "┃ ✏️ Alterar descrição",
        `┃ ➜ ${PREFIX}testecanvas desc <texto>`,
        "┃ 🔤 Escolher fonte",
        `┃ ➜ ${PREFIX}testecanvas fontes`,
        "┃ 🎨 Escolher tema",
        `┃ ➜ ${PREFIX}testecanvas temas`,
        "┃ 🖼️ Alterar fundo",
        `┃ ➜ Responda uma imagem com ${PREFIX}testecanvas fundo`,
        "┃",
        "┃ ℹ️ O perfil mostra XIC Coins,",
        "┃ Pokédolares, XP e Pokémon capturados.",
        "╰━━━━━━━━━━━━━━━━━━━━━━╯",
      ].join("\n"),
    );
  },
};
