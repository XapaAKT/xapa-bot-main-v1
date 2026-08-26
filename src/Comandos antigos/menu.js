import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { readMore, getUserName } from "../../utils/index.js";

export default {
  name: "menu",
  description: "Central de menus do Xapa-Bot",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,

  handle: async ({ sendImageFromFile, sendSuccessReact, webMessage, userLid }) => {
    await sendSuccessReact();

    const userName = getUserName(webMessage, userLid, "usuário");

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "xapa-hub.png"),
      `╭─────༺🌹⃟𝐗𝐀𝐏𝐀𝅯🫠༺─────╮
${readMore()}
           『 𝐌𝐄𝐍𝐔 𝐇𝐔𝐁 』

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 👤 𝐔𝐒𝐔Á𝐑𝐈𝐎
┃ ✦ Olá, ${userName}
┃ ✦ Escolha um menu abaixo
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 👤 𝐌𝐄𝐌𝐁𝐄𝐑
┃ ✦ Comandos gerais
┃ ➥ ${PREFIX}mmenu
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 🛡️ 𝐀𝐃𝐌𝐈𝐍
┃ ✦ Administração
┃ ➥ ${PREFIX}amenu
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 𝐎𝐖𝐍𝐄𝐑
┃ ✦ Controle total
┃ ➥ ${PREFIX}omenu
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 🌹 𝐃𝐈𝐂𝐀
┃ Apenas digite o comando
┃ do menu desejado.
╰━━━━━━━━━━━━━━━━━━━━╯

𖤐 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
⛓️ 𝐍𝐨 𝐌𝐞𝐫𝐜𝐲 • 𝐍𝐨 𝐄𝐬𝐜𝐚𝐩𝐞 ⛓️

╰─────༺🌹⃟𝐗𝐀𝐏𝐀𝅯🫠༺─────╯`
    );
  },
};