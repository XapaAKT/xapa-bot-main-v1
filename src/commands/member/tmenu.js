import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "tmenu",
  description: "Menu de comandos para membros.",
  commands: ["tmenu", "menu-membro", "menu-member"],
  usage: `${PREFIX}mmenu`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "xapa-member.png"),
      `
╭━━━〔 👤 MENU DO MEMBRO 〕━━━╮
┃ ✨ Comandos organizados para você
┃ 🎯 Escolha o que deseja usar
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

📖 Clique em *Ler mais* para ver a lista completa.

${readMore(3)}

╭─ 🎨 EDIÇÃO DE IMAGENS ─╮
│ 🖌️ blur
│ 🎭 contraste
│ 🪞 espelhar
│ ⚫ gray
│ 🔄 inverter
│ 🧩 pixel
╰──────────────────────╯

╭─ 📥 DOWNLOADS ─╮
│ 📷 facebook
│ 📷 instagram
│ 📌 pinterest
│ 🎵 play-audio
│ 🎥 play-video
│ 🎵 tik-tok
│ 🎵 tik-tok-audio
│ ▶ yt-mp3
│ ▶ yt-mp4
╰────────────────╯

╭─ 🤖 IA ─╮
│ 🧠 deepseek
│ ✨ flux
│ 🌌 gemini
│ 💬 gpt-5-mini
│ 🖼️ ia-sticker
╰─────────╯

╭─ 🎭 FUNNY ─╮
│ 🤗 abraçar
│ 💋 beijar
│ 🎲 dado
│ 🍽️ jantar
│ ⚔️ lutar
│ 🩸 matar
│ 👊 socar
│ 👋 tapa
╰──────────╯

╭─ 🔎 SEARCH ─╮
│ 📍 cep
│ 🎧 yt-search
╰────────────╯

╭─ 🛠️ UTILIDADES ─╮
│ 📝 attp
│ 🎞️ brat
│ 🎬 bratvid
│ 👤 dono
│ 💬 fake-chat
│ 🔗 gerar-link
│ ℹ️ info
│ 🪪 meu-lid
│ 👤 perfil
│ ⚡ ping
│ 🧼 removebg
│ ✍️ rename
│ 🧱 sticker
│ 📢 suporte
│ 🎞️ to-gif
│ 🖼️ to-image
│ 🎵 to-mp3
│ ✨ ttp
╰──────────────────╯

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🌟 Xapa In Chains Bot
┃ 📡 Status: Online
┃ 💡 Use os comandos com o prefixo configurado
╰━━━━━━━━━━━━━━━━━━━━━━╯
`
    );
  },
};