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
│ 🔎 google
│ 🎵 play-audio
│ 🎥 play-video
│ 🎵 tik-tok
│ 🎵 tik-tok-audio
│ 🎼 music-audio
│ 🎬 music-video
│ 📝 music-lyrics
│ ▶ yt-mp3
│ ▶ yt-mp4
│ 🔎 yt-search
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
│ 🍺 beber
│ 💦 cuspir
│ 🍽️ jantar
│ ⚔️ lutar
│ 🩸 matar
│ 👊 socar
│ 👋 tapa
│ 📸 tirarfoto
│ 🎭 verdadeoudesafio
╰──────────╯

╭─ 👪 FAMÍLIA ─╮
│ abandonar
│ aceitar
│ adotar
│ casados
│ casar
│ divorciar
│ familia
│ historico
│ perfil
│ recusar
│ rankingfamilia
│ ship
╰─────────────╯

╭─ 🎮 POKÉMON ─╮
│ abrirpack
│ comprarpack
│ loja-pokemon
│ pescar
│ pokemon
│ venderpokemon
╰─────────────╯

╭─ 💰 ECONOMIA ─╮
│ cassino
│ corrida
│ diario
│ economia
│ saldo
│ toprico
│ trabalhar
│ transferir
╰──────────────╯

╭─ 🔎 SEARCH ─╮
│ 📍 cep
│ 🎧 yt-search
╰────────────╯

╭─ 🛠️ UTILIDADES ─╮
│ 📝 attp
│ 🎞️ brat
│ 🎬 bratvid
│ 👤 dono
│ 📞 ddd
│ 💬 fake-chat
│ 🔗 gerar-link
│ ℹ️ info
│ 🧮 calculadora
│ 🪪 meu-lid
│ 👤 perfil
│ ⚡ ping
│ 🧼 removebg
│ ✍️ rename
│ 🧱 sticker
│ 💡 sugestao
│ 📢 suporte
│ 🗃️ dlc
│ 🔓 revelar
│ 🕸️ nias
│ 🎞️ to-gif
│ 🖼️ to-image
│ 🎵 to-mp3
│ ✨ ttp
╰──────────────────╯

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🌟 ULQUIORRA BOT
┃ 📡 Status: Online
┃ 💡 Use os comandos com o prefixo configurado
╰━━━━━━━━━━━━━━━━━━━━━━╯
`
    );
  },
};