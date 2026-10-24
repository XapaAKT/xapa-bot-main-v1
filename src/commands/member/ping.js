// ping.js
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  COMMANDS_DIR,
  PREFIX,
} from "../../config.js";

import { getPrefix } from "../../utils/database.js";
import { readDirectoryRecursive } from "../../utils/index.js";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0GB";
  }

  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

function formatUptime(seconds) {
  const totalSeconds = Math.floor(seconds);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts = [];

  if (days > 0) parts.push(`${days}ᴅ`);
  if (hours > 0) parts.push(`${hours}ʜ`);
  if (minutes > 0) parts.push(`${minutes}ᴍ`);

  parts.push(`${secs}ꜱ`);

  return parts.join(" ");
}

function formatTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function formatDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

async function getCommandCount() {
  try {
    const files = await readDirectoryRecursive(COMMANDS_DIR);

    return files.filter(
      (file) => path.extname(file).toLowerCase() === ".js"
    ).length;
  } catch {
    return 0;
  }
}

async function getGroupCount(socket) {
  try {
    if (!socket?.groupFetchAllParticipating) return 0;

    const groups = await socket.groupFetchAllParticipating();

    return Object.keys(groups || {}).filter((jid) =>
      jid.endsWith("@g.us")
    ).length;
  } catch {
    return 0;
  }
}

// READ MORE
function readMore(count = 4000) {
  return "\u200e".repeat(count);
}

export default {
  name: "ping",

  description: "Exibe informações e status do ULQUIORRA BOT.",

  commands: ["ping", "pong"],

  usage: `${PREFIX}ping`,

  noPrefix: true,

  isEmojiCommand: true,

  handle: async ({
    sendReply,
    sendEditedReply,
    sendWaitReact,
    sendSuccessReact,
    socket,
    webMessage,
    remoteJid,
  }) => {
    try {
      if (sendWaitReact) {
        await sendWaitReact();
      }

      const start = performance.now();

      /*
       * PREFIXO DO GRUPO
       *
       * Se for grupo, pega o prefixo salvo no database.json.
       * Se não conseguir pegar, usa o PREFIX global do config.js.
       */
      let groupPrefix = PREFIX;

      if (remoteJid && remoteJid.endsWith("@g.us")) {
        try {
          groupPrefix = getPrefix(remoteJid) || PREFIX;
        } catch (error) {
          console.error(
            "[PING] Erro ao obter prefixo do grupo:",
            error
          );

          groupPrefix = PREFIX;
        }
      }

      const message = await sendReply(
        `⛧━━━━━<⛧>━━━━━⛓️━━━━━<⛧>━━━━━⛧
╠━━━፝֟━̷━🩸━━<⛧>━━🩸━̷━፝֟━━━╮
┃ ⛓️ 𝐗𝐈𝐂-𝐁𝐎𝐓 :: 𝐂𝐎𝐍𝐄𝐂𝐓𝐈𝐍𝐆...
╠━━━፝֟━̷━🩸━━<⛧>━━🩸━̷━፝֟━━━╯
⛧━━━━━<⛧>━━━━━⛓️━━━━━<⛧>━━━━━⛧`
      );

      const afterMessage = performance.now();

      const responseTime = afterMessage - start;

      const memory = process.memoryUsage();

      const ramUsed = memory.rss;
      const ramTotal = os.totalmem();

      const uptime = formatUptime(process.uptime());

      const platform = os.platform();

      const nodeVersion = process.version;

      const commandCount = await getCommandCount();

      const groupCount = await getGroupCount(socket);

      const latency = Math.max(0.01, responseTime);

      const delay = (responseTime / 4000).toFixed(4);

      const rm = readMore(3000);

      const text =
`⛧━━━━━<⛧>━━━━━⛓️━━━━━<⛧>━━━━━⛧
╠━━━፝֟━̷━🩸━━<⛧>━━🩸━̷━፝֟━━━╮
┃ ⛓️ 𝐗𝐈𝐂-𝐁𝐎𝐓 • 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
┃${rm}
┃ 🩸 𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 :: ${responseTime.toFixed(3)}ms
┃ ☠ 𝐏𝐈𝐍𝐆 :: ${latency.toFixed(2)}ms
┃ ⛓️ 𝐀𝐓𝐑𝐀𝐒𝐎 :: ${delay}s
┃ 🜏 𝐑𝐀𝐌 :: ${formatBytes(ramUsed)} / ${formatBytes(ramTotal)}
┃ ✞ 𝐆𝐑𝐔𝐏𝐎𝐒 :: ${groupCount}
┃ 🩸 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 :: ${commandCount}
┃ ☠ 𝐔𝐏𝐓𝐈𝐌𝐄 :: ${uptime}
┃ 🕯 𝐇𝐎𝐑𝐀 :: ${formatTime()}
┃ 🜏 𝐃𝐀𝐓𝐀 :: ${formatDate()}
┃
┃ 🜏 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 :: ${groupPrefix}
┃ ✞ 𝐌𝐄𝐍𝐔 :: ${groupPrefix}menu
┃
╠━━━፝֟━̷━🩸━━<⛧>━━🩸━̷━፝֟━━━╯
⛧━━━━━<⛧>━━━━━⛓️━━━━━<⛧>━━━━━⛧

> <⛧> 𝐗𝐈𝐂-𝐁𝐎𝐓 • 𝐗𝐚𝐩𝐚 𝐢𝐧 𝐂𝐡𝐚𝐢𝐧𝐬 ⛓️

🖤 𝐒𝐓𝐀𝐓𝐔𝐒 :: 𝐎𝐍𝐋𝐈𝐍𝐄
⚙️ 𝐍𝐎𝐃𝐄 :: ${nodeVersion}
🖥️ 𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌 :: ${platform}`;

      if (sendEditedReply && message) {
        await sendEditedReply(text, message);
      } else {
        await sendReply(text);
      }

      if (sendSuccessReact) {
        await sendSuccessReact();
      }

    } catch (error) {
      console.error("[PING ERROR]", error);

      await sendReply(
        `⛧ ⚠️ 𝐄𝐑𝐑𝐎 :: ${error.message} ⛧`
      );
    }
  },
};