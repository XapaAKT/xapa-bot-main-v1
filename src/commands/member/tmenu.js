import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "tmenu",
  description: "Menu de comandos para membros.",
  commands: ["tmenu", "menu-member"],
  usage: `${PREFIX}tmenu`,

  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();
    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "xapa-member.png"),
      `
╭━━━〔 👤 MENU DO MEMBRO 〕━━━╮
┃ 🎯 Comandos organizados por categoria
┃ 📖 Leia a lista completa abaixo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

${readMore(3)}

🎮 JOGOS
◈ doom
◈ ttt
◈ dinossauro
◈ truco

🖼️ EDIÇÃO DE IMAGENS
◈ blur
◈ contraste
◈ espelhar
◈ gray
◈ pixel
◈ imagem

📥 DOWNLOADS
◈ facebook (DESATIVADO)
◈ instagram (DESATIVADO)
◈ google (DESATIVADO)
◈ tik-tok (DESATIVADO)
◈ tik-tok-audio (DESATIVADO)
◈ pinterest
◈ play-audio (busca ou link; yt-mp3)
◈ play-video (busca ou link; yt-mp4)
◈ yt-search
◈ music-lyrics

🤖 INTELIGÊNCIA ARTIFICIAL (DESATIVADA)
◈ deepseek (DESATIVADO)
◈ flux (DESATIVADO)
◈ gemini (DESATIVADO)
◈ gpt-5-mini (DESATIVADO)
◈ ia-sticker (DESATIVADO)

🛠️ XAPA BOT
◈ catalogo (DESATIVADO)
◈ calculadora
◈ dono
◈ ddd
◈ info
◈ removebg (requer REMOVE_BG_API_KEY)
◈ rename
◈ sugestao
◈ suporte
◈ dlc
◈ nias
◈ attp
◈ brat
◈ bratvid
◈ pack
◈ sticker
◈ ttp
◈ to-gif
◈ to-image
◈ to-mp3

📂 MENUS ESPECÍFICOS
◈ familia-menu
◈ economia-menu
◈ pokemon-menu
◈ rpg-menu

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🌟 XAPA BOT
┃ 💡 Use os comandos com o prefixo configurado
╰━━━━━━━━━━━━━━━━━━━━━━╯
`,
    );
  },
};
