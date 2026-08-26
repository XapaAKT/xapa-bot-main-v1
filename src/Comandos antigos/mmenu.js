import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "mmenu",
  description: "Menu de comandos para membros.",
  commands: ["mmenu", "menu-membro", "menu-member"],
  usage: `${PREFIX}mmenu`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "xapa-member.png"),
`
┏═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┓
┣⋆⃟ۣۜ᭪➣ 𖡦 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊 【🌹】
┗═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┛
╎
‎┏═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┓
┃╭━━─ ≪ •❈• ≫ ─━━╮
┃╎✫✫✫✫✫
┃╎  *𝑴𝒆𝒎𝒃𝒆𝒓 𝑯𝒖𝒃*
┃╎ ✯ *Prefixo*: ${PREFIX}
┃╎ ✯ *Bot*: 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊
┃╎ ✯ *Status*: _ONLINE_
┃╎✫✫✫✫✫
┃╰━━─ ≪ •❈• ≫ ─━━╯
┗═•✭･ﾟ✧*･ﾟ| ⊱✿⊰ |*✭˚･ﾟ✧･ﾟ•═┛
╎


${readMore()}

╔═══════༺⛓️༻═══════╗
      𝕮𝕺𝕽𝕰 • 𝕸𝕰𝕸𝕭𝕰𝕽
╚═══════༺⛓️༻═══════╝

🟢 ⛓️ attp
🟢 🌹 alugar
🟢 ✦ brat
🟢 ✦ bratvid
🟢 ☠ dono
🟢 💬 fake-chat
🟢 🔗 gerar-link
🟢 📋 info
🟢 🧩 menu
🟢 🆔 meu-lid
🟢 👁 perfil
🟢 📡 ping
🟢 🖼 removebg
🟢 📝 rename
🟢 🎨 sticker
🟢 🩸 sugestao
🟢 🆘 suporte
🟢 🎞 to-gif
🟢 🖼 to-image
🟢 🎵 to-mp3
🟢 ✍ ttp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


╔══════༺🖼️༻══════╗
   𝕮𝕬𝕹𝖁𝕬𝕾 • 𝕴𝕸𝕬𝕲𝕰𝕹𝕾
╚══════༺🖼️༻══════╝

🟣 ✧ blur
🟣 ✧ contraste
🟣 ✧ espelhar
🟣 ✧ gray
🟣 ✧ inverter
🟣 ✧ pixel

🔴 𝗢𝗙𝗙 𝗡𝗢 𝗠𝗢𝗠𝗘𝗡𝗧𝗢
• bolsonaro
• cadeia
• rip

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════༺⬇️༻══════╗
    𝕯𝕺𝖂𝕹𝕷𝕺𝕬𝕯 • 𝕮𝕺𝕽𝕰
╚══════༺⬇️༻══════╝

🔵 ▸ facebook
🔵 ▸ instagram
🔵 ▸ pinterest
🔵 ▸ play-audio
🔵 ▸ play-video
🔵 ▸ tik-tok
🔵 ▸ tik-tok-audio
🔵 ▸ yt-mp3
🔵 ▸ yt-mp4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════༺🃏༻══════╗
      𝕱𝖀𝕹𝕹𝖄 • 𝕮𝕳𝕬𝕺𝕾
╚══════༺🃏༻══════╝

🟠 ✧ abraçar
🟠 ✧ beijar
🟠 ✧ dado
🟠 ✧ jantar
🟠 ✧ lutar
🟠 ✧ matar
🟠 ✧ socar
🟠 ✧ tapa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════༺🤖༻══════╗
        𝕬𝕴 • 𝕹𝕺𝕯𝕰
╚══════༺🤖༻══════╝

🟢 ▸ deepseek
🟢 ▸ flux
🟢 ▸ gemini
🟢 ▸ gpt-5-mini
🟢 ▸ ia-sticker

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════༺🔎༻══════╗
     𝕾𝕰𝕬𝕽𝕮𝕳 • 𝕹𝕺𝕯𝕰
╚══════༺🔎༻══════╝

🟡 ▸ cep
🟡 ▸ yt-search

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════༺💰༻══════╗
    𝕰𝕮𝕺𝕹𝕺𝕸𝖄 • 𝕮𝕺𝕽𝕰
╚══════༺💰༻══════╝

💵 ▸ saldo
🎁 ▸ diario
🛠 ▸ trabalhar
🎰 ▸ cassino
🏎 ▸ corrida

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 𖤐 𝕋ℍ𝔼 𝕹𝕺𝔻𝔼 𝕴𝕾 𝕾𝕿𝕴𝕷𝕷 𝔸𝕃𝕀𝕍𝔼
┃ ⛓️ 𝐋𝐈𝐆𝐇𝐓 𝐀𝐍𝐃 𝐕𝐎𝐈𝐃 • 𝐁𝐀𝐏𝐇𝐎𝐌𝐄𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`
    );
  },
};