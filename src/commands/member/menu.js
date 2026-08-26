import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";
import { sendInteractiveButtons } from "../../utils/interactive.js"; // <- import do helper

export default {
  name: "menu",
  description: "Menu principal do Xapa-BOT",
  commands: ["menu", "xapa"],
  usage: `${PREFIX}menu`,
  
  handle: async ({ socket, remoteJid, sendReply, prefix, webMessage, userLid, m }) => {
    const msg = webMessage || m; // pra garantir
    const userName = getUserName(msg, userLid, "usuário");
    
    const menuText = `╔══════ೋღ🫧ღೋ══════╗
⛓️ 𝕏𝔸ℙ𝔸 𝕀ℕ ℂℍ𝔸𝕀ℕ𝕊 ⛓️
   『 𝐌𝐄𝐍𝐔 • 𝐇𝐔𝐁 』
╚══════ೋღ🫧ღೋ══════╝

╭━──────༺🫧༻──────━╮
┃ ⛓️ 𝐒𝐞𝐣𝐚 𝐛𝐞𝐦-𝐯𝐢𝐧𝐝𝐨.
┃ 🌊 𝐎 𝐜𝐨𝐧𝐡𝐞𝐜𝐢𝐦𝐞𝐧𝐭𝐨
┃     𝐜𝐨𝐦𝐞𝐜̧𝐚 𝐚𝐪𝐮𝐢.
╰━──────༺🫧༻──────━╯

◦•●◉✿ 𝐌𝐄𝐍𝐔 ✿◉●•◦`;

    const menuFooter = `╭━━━━━━━━━━━━━━━━━━━━╮
┃ 👤 𝐔𝐒𝐔Á𝐑𝐈𝐎
┃ ✦ Olá, ${userName}
┃ ✦ Escolha um menu abaixo
╰━━━━━━━━━━━━╯`;

    try {
      await sendInteractiveButtons(socket, remoteJid, {
        title: "⛧ Xapa in Chains ⛧",
        text: menuText,
        footer: menuFooter,
        buttons: [
          { id: `${prefix || PREFIX}mmenu`, text: "👤 Membro" },
          { id: `${prefix || PREFIX}amenu`, text: "♠️ Admin" },
          { id: `${prefix || PREFIX}omenu`, text: "🦇 Dono" },
        ],
      });

      await sendReply("✅ Menu principal enviado!");
      
    } catch (error) {
      console.error("[MENU ERROR]", error);
      // GAMBIARRA se falhar
      await socket.sendMessage(remoteJid, { 
        text: `${menuText}\n\n${menuFooter}\n\nDigite:\n1 - 👤 Membro\n2 - ♠️ Admin\n3 - 🦇 Dono`
      }, { quoted: msg });
    }
  },
};