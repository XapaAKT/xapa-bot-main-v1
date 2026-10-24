import { PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "omenu",
  description: "Menu de comandos do dono",
  commands: ["omenu", "menu-owner"],
  usage: `${PREFIX}omenu`,
  
  handle: async ({ socket, remoteJid }) => {
    await socket.sendMessage(remoteJid, {
      text: `╔═══════ೋღ🌑ღೋ═══════╗
      ⛓️ 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊 ⛓️
          『 𝐎𝐖𝐍𝐄𝐑 • 𝐇𝐔𝐁 』
╚═══════ೋღ🌑ღೋ═══════╝

${readMore()}

╭━──────༺🦇༻──────━╮
┃ ☠️ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐑𝐄𝐒𝐓𝐑𝐈𝐓𝐎
┃ 🕸️ 𝐒𝐎𝐌𝐄𝐍𝐓𝐄 𝐎 𝐃𝐎𝐍𝐎
┃     𝐏𝐎𝐃𝐄 𝐏𝐑𝐎𝐒𝐒𝐄𝐆𝐔𝐈𝐑
╰━──────༺🦇༻──────━╯

           ✞ 𝔒𝔚ℑ𝔑𝔈ℜ ✞

╔═ೋ༺☠️༻ೋ═╗
┃ 👑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐄 𝐃𝐎 𝐁𝐎𝐓
╚═ೋ༺☠️༻ೋ═╝

◈ addvip
◈ addblacklist
◈ blacklist
◈ viplist
◈ get-group-id
◈ lsugestoes
◈ puxbanfig

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺⚙️༻ೋ═╗
┃ ⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐎̃𝐄𝐒
╚═ೋ༺⚙️༻ೋ═╝

◈ on
◈ off
◈ set-prefix
◈ set-menu-image
◈ SMT (1=botoes|2=lista)
◈ SMC (1=ativar|0=desativar)
◈ test-carousel
◈ test-menu (testa 1 a 7 cards)
◈ set-spider-api-token

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺🦇༻ೋ═╗
┃ 🌑 𝐒𝐈𝐒𝐓𝐄𝐌𝐀𝐒
╚═ೋ༺🦇༻ೋ═╝

◈ catalogo
◈ alugar
◈ backupgrupo
◈ exec
◈ gitbot
◈ metaai
◈ restart
◈ update
◈ void
◈ xic
◈ ip
◈ tel

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺⛓️༻ೋ═╗
┃ 🔒 𝐀𝐑𝐐𝐔𝐈𝐕𝐎𝐒 𝐎𝐂𝐔𝐋𝐓𝐎𝐒
╚═ೋ༺⛓️༻ೋ═╝

◈ nuke

✦━━━━━━━━━━━━━━━━━━━━✦

╔══════༺✞༻══════╗
┃ ☠️ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐃𝐎
┃
┃ 🦇 𝐍𝐢́𝐯𝐞𝐥: 𝐎𝐖𝐍𝐄𝐑
┃ ⛓️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐚̃𝐨: 𝐓𝐎𝐓𝐀𝐋
┃ 🌑 𝐒𝐢𝐬𝐭𝐞𝐦𝐚: 𝐀𝐓𝐈𝐕𝐎
╚══════༺✞༻══════╝

✦━━━━━━━━━━━━━━━━━━━━✦

╭────ೋ༺☠️༻ೋ────╮
┃ 🕸️ "𝐐𝐮𝐞𝐦 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐚
┃ 𝐚𝐬 𝐜𝐨𝐫𝐫𝐞𝐧𝐭𝐞𝐬...
┃ 𝐧𝐮𝐧𝐜𝐚 𝐩𝐫𝐞𝐜𝐢𝐬𝐚
┃ 𝐠𝐫𝐢𝐭𝐚𝐫.
┃
┃ 𝐎 𝐬𝐢𝐥𝐞̂𝐧𝐜𝐢𝐨
┃ 𝐣𝐚́ 𝐞́ 𝐮𝐦𝐚
┃ 𝐨𝐫𝐝𝐞𝐦."
╰────ೋ༺☠️༻ೋ────╯`,
      viewOnce: true
    });
  },
};