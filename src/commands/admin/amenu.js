import { PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "amenu",
  description: "Menu de comandos para administradores",
  commands: ["amenu", "menu-admin"],
  usage: `${PREFIX}amenu`,
  
  handle: async ({ socket, remoteJid }) => {
    await socket.sendMessage(remoteJid, {
      text: `╔═══════ೋღ🩸ღೋ═══════╗
      ⛓️ 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊 ⛓️
          『 𝐀𝐃𝐌𝐈𝐍 • 𝐇𝐔𝐁 』
╚═══════ೋღ🩸ღೋ═══════╝

${readMore()}

╭━──────༺🩸༻──────━╮
┃ ☠️ 𝐀𝐜𝐞𝐬𝐬𝐨 𝐀𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐢𝐯𝐨
┃ ⛓️ 𝐀 𝐨𝐫𝐝𝐞𝐦 𝐝𝐨 𝐠𝐫𝐮𝐩𝐨
┃     𝐝𝐞𝐩𝐞𝐧𝐝𝐞 𝐝𝐞 𝐯𝐨𝐜𝐞̂.
╰━──────༺🩸༻──────━╯

◦•●◉✠ 𝔄𝔇𝔐ℑ𝔑 ✠◉●•◦

╔═ೋ༺⛓️༻ೋ═╗
┃ 🛡️ 𝐀𝐍𝐓𝐈𝐒
╚═ೋ༺⛓️༻ೋ═╝

◈ def
◈ anti-audio
◈ anti-document
◈ anti-event
◈ anti-image
◈ anti-link
◈ anti-lottier-sticker
◈ anti-payment
◈ anti-product
◈ anti-status-grupo
◈ anti-sticker
◈ anti-video

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺🩸༻ೋ═╗
┃ ⚔️ 𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎
╚═ೋ༺🩸༻ೋ═╝

◈ ban
◈ delete
◈ mute
◈ warn
◈ unwarn
◈ warn-reactivate

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺☠️༻ೋ═╗
┃ 👑 𝐆𝐄𝐑𝐄𝐍𝐂𝐈𝐀𝐌𝐄𝐍𝐓𝐎
╚═ೋ༺☠️༻ೋ═╝

◈ promover
◈ rebaixar
◈ exit

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺🩸༻ೋ═╗
┃ 💬 𝐂𝐇𝐀𝐓
╚═ೋ༺🩸༻ೋ═╝

◈ limpar-chat
◈ abrir
◈ fechar
◈ only-admin
◈ welcome

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺⛓️༻ೋ═╗
┃ 🔥 𝐒𝐈𝐒𝐓𝐄𝐌𝐀𝐒
╚═ೋ༺⛓️༻ೋ═╝

◈ blacklist
◈ ant-plv

✦━━━━━━━━━━━━━━━━━━━━✦

╭────ೋ༺☠️༻ೋ────╮
┃ 🩸 "𝐐𝐮𝐞𝐦 𝐧𝐚̃𝐨
┃ 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐚 𝐨
┃ 𝐜𝐚𝐨𝐬...
┃ 𝐚𝐜𝐚𝐛𝐚
┃ 𝐜𝐨𝐧𝐬𝐮𝐦𝐢𝐝𝐨
┃ 𝐩𝐨𝐫 𝐞𝐥𝐞."
╰────ೋ༺☠️༻ೋ────╯`,
      viewOnce: true
    });
  },
};