import { PREFIX } from "../../config.js";
import { sendA2UI } from "../../utils/plugins/a2ui.js";

const TOPO = "╭━━━〔 ☠️ 𝐔𝐋𝐐𝐔𝐈𝐎𝐑𝐑𝐀 𝐁𝐎𝐓 〕━━━╮";
const DIVISORIA = "┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫";
const BASE = "╰━━━〔 ⛓️ 𝐗𝐈𝐂 // 𝐀𝐑𝐐𝐔𝐈𝐕𝐎 〕━━━╯";
const DECORACAO = "┃     ✦｡ﾟ🚀ﾟ｡✦ 𝐗𝐈𝐂 𝐁𝐎𝐓 ✦｡ﾟ🦠ﾟ｡✦";
const MENSAGEM = [
  TOPO,
  "┃",
  DECORACAO,
  DIVISORIA,
  "┃  ✧ 𝐀 𝐏𝐄𝐒𝐓𝐄 𝐂𝐇𝐄𝐆𝐎𝐔 𝐀𝐓𝐄́ 𝐒𝐔𝐀 𝐓𝐄𝐋𝐀 ✧",
  "┃",
  "┃ 𝙊 𝙫𝙖𝙯𝙞𝙤 𝙨𝙚 𝙖𝙗𝙧𝙞𝙪 𝙚𝙢 𝙨𝙞𝙡𝙚̂𝙣𝙘𝙞𝙤...",
  "┃ 𝙎𝙚𝙣𝙩𝙞𝙧 𝙢𝙚𝙙𝙤 𝙚́ 𝙤𝙥𝙘𝙞𝙤𝙣𝙖𝙡.",
  "┃ 𝘼𝙙𝙢𝙞𝙧𝙖𝙧 𝙤 𝙚𝙨𝙩𝙞𝙡𝙤 𝙚́ 𝙤𝙗𝙧𝙞𝙜𝙖𝙩𝙤́𝙧𝙞𝙤.",
  "┃",
  DIVISORIA,
  "┃  ⚔️ 𝐌𝐎𝐃𝐎: 𝐃𝐄𝐂𝐎𝐑𝐀𝐂̧𝐀̃𝐎 𝐒𝐄𝐆𝐔𝐑𝐀",
  "┃  🕸️ 𝐒𝐓𝐀𝐓𝐔𝐒: 𝐀𝐓𝐈𝐕𝐎 • 𝐒𝐄𝐌 𝐑𝐈𝐒𝐂𝐎",
  BASE,
].join("\n");

export default {
  name: "peste",
  description: "Envia uma mensagem decorativa segura.",
  commands: ["peste", "pestenegra"],
  usage: `${PREFIX}peste`,

  handle: async ({ socket, remoteJid, webMessage }) => {
    const data = {
      version: "v0.9",
      createSurface: {
        surfaceId: `xic-peste=${Date.now()}`,
        catalogId:
          "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
        components: [
          { id: "root", component: "Column", children: ["titulo", "mensagem"] },
          {
            id: "titulo",
            component: "Text",
            text: "☠️ ULQUIORRA BOT • PESTE",
            variant: "h2",
          },
          {
            id: "mensagem",
            component: "Text",
            text: MENSAGEM,
            variant: "body",
          },
        ],
      },
    };

    await sendA2UI(socket, remoteJid, {
      data,
      text: MENSAGEM,
      quoted: webMessage,
    });
  },
};
