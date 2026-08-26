import { PREFIX } from "../../config.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "mmenu",
  description: "Menu de comandos para membros",
  commands: ["mmenu", "menu-membro"],
  usage: `${PREFIX}mmenu`,
  
  handle: async ({ socket, remoteJid }) => {
    await socket.sendMessage(remoteJid, {
      text: `╔═══════ೋღ🫧ღೋ═══════╗
      ⛓️ 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊 ⛓️
         『 𝐌𝐄𝐌𝐁𝐄𝐑 • 𝐇𝐔𝐁 』
╚═══════ೋღ🫧ღೋ═══════╝

${readMore()}

╭━──────༺🫧༻──────━╮
┃ ⛓️ 𝐒𝐞𝐣𝐚 𝐛𝐞𝐦-𝐯𝐢𝐧𝐝𝐨.
┃ 🌊 𝐎 𝐜𝐨𝐧𝐡𝐞𝐜𝐢𝐦𝐞𝐧𝐭𝐨
┃     𝐜𝐨𝐦𝐞𝐜̧𝐚 𝐚𝐪𝐮𝐢.
╰━──────༺🫧༻──────━╯

◦•●◉✿ 𝔐𝔈𝔐𝔅𝔈ℜ ✿◉●•◦

╔═ೋ༺🌊༻ೋ═╗
┃ 🎭 『 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎 』
╚═ೋ༺🌊༻ೋ═╝

◈ animal
◈ cancelar
◈ cpf
◈ eununca
◈ fofoca
◈ hackear
◈ ibge
◈ morte
◈ ppp
◈ prisao
◈ processo
◈ qi
◈ dado 
◈ tirarfoto

✦━━━━━━━━━━━━✦

╔═ೋ༺⚔️༻ೋ═╗
┃ ⚔️ 『 𝐀𝐂̧𝐎̃𝐄𝐒 』
╚═ೋ༺⚔️༻ೋ═╝

◈ abracar
◈ beijar
◈ carinho
◈ cozinhar
◈ educar
◈ jantar
◈ lutar
◈ matar
◈ roubar
◈ socar
◈ suicidio
◈ tapa
◈ foto

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺🔥༻ೋ═╗
┃ 🔥 『 𝐀𝐂̧𝐎̃𝐄𝐒 𝟏𝟖+ 』
╚═ೋ༺🔥༻ೋ═╝

◈ boquete
◈ dedada
◈ gozar
◈ sexo
◈ siririca
◈ suruba

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺💰༻ೋ═╗
┃ 💰 『 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀 』
╚═ೋ༺💰༻ೋ═╝

◈ cassino
◈ corrida
◈ diario
◈ economia
◈ toprico
◈ trabalhar
◈ transferir

✦━━━━━━━━━━━━✦

╔═ೋ༺🫧༻ೋ═╗
┃ 🎨 『 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 』
╚═ೋ༺🫧༻ೋ═╝

◈ attp
◈ brat
◈ bratvid
◈ sticker
◈ ia-sticker
◈ ttp

✦━━━━━━━━━━━━✦

╔═ೋ༺🖼️༻ೋ═╗
┃ 🖼️ 『 𝐈𝐌𝐀𝐆𝐄𝐍𝐒 』
╚═ೋ༺🫧༻ೋ═╝

◈ blur
◈ espelhar
◈ inverter
◈ pixel

✦━━━━━━━━━━━━✦

╔═ೋ༺🎞️༻ೋ═╗
┃ 🎞️ 『 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐎𝐑𝐄𝐒 』
╚═ೋ༺🎞️༻ೋ═╝

◈ to-gif
◈ to-image
◈ to-mp3

✦━━━━━━━━━━━━━━━━━━━━✦

╔═ೋ༺📥༻ೋ═╗
┃ 📥 『 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 』
╚═ೋ༺📥༻ೋ═╝

◈ facebook
◈ instagram
◈ pinterest
◈ play-audio
◈ play-video
◈ tik-tok
◈ tik-tok-audio
◈ yt-mp3
◈ yt-mp4

✦━━━━━━━━━━━━✦

╔═ೋ༺🤖༻ೋ═╗
┃ 🤖 『 𝐗𝐀𝐏𝐀 • 𝐁𝐎𝐓 』
╚═ೋ༺🤖༻ೋ═╝

◈ alugar
◈ catalogo
◈ dono
◈ ping
◈ ddd

✦━━━━━━━━━━━━━━━━━━━━✦

╭────ೋ༺⛓️༻ೋ────╮
┃ 🌊 "𝐎 𝐦𝐚𝐫
┃ 𝐞𝐧𝐬𝐢𝐧𝐚 𝐪𝐮𝐞
┃ 𝐚𝐭𝐞́ 𝐚𝐬
┃ 𝐜𝐨𝐫𝐞𝐧𝐭𝐞𝐬
┃ 𝐬𝐞 𝐦𝐨𝐯𝐞𝐦."
╰────ೋ༺⛓️༻ೋ────╯`,
      viewOnce: true
    });
  },
};