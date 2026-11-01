import { PREFIX } from "../../config.js";
import { sendA2UI } from "../../utils/plugins/a2ui.js";

const TOPO = "╭━━━〔 ☠️ 𝐔𝐋𝐐𝐔𝐈𝐎𝐑𝐑𝐀 𝐁𝐎𝐓 〕━━━╮";
const BASE = "╰━━━〔 ⛓️ 𝐗𝐈𝐂 // 𝐀𝐑𝐐𝐔𝐈𝐕𝐎 〕━━━╯";
const DECORACAO = "┃ ✦｡ﾟ🚀ﾟ｡✦ 𝐗𝐈𝐂 𝐁𝐎𝐓 ✦｡ﾟ🦠ﾟ｡✦";

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
            text: "☠️ ULQUIORRA BOT • MENSAGEM DECORATIVA",
            variant: "h2",
          },
          {
            id: "mensagem",
            component: "Text",
            text: [
              TOPO,
              "┃",
              DECORACAO,
              "┃",
              "┃ 𝙊 𝙫𝙖𝙯𝙞𝙤 𝙘𝙝𝙚𝙜𝙤𝙪 𝙖𝙩𝙚́ 𝙖 𝙨𝙪𝙖 𝙩𝙚𝙡𝙖.",
              "┃ 𝙎𝙚𝙣𝙩𝙞𝙧 𝙢𝙚𝙙𝙤 𝙚́ 𝙤𝙥𝙘𝙞𝙤𝙣𝙖𝙡; 𝙖𝙙𝙢𝙞𝙧𝙖𝙧 𝙤 𝙚𝙨𝙩𝙞𝙡𝙤 𝙚́ 𝙤𝙗𝙧𝙞𝙜𝙖𝙩𝙤́𝙧𝙞𝙤.",
              "┃",
              "┃ ⚔️ 𝐌𝐎𝐃𝐎: 𝐃𝐄𝐂𝐎𝐑𝐀𝐂̧𝐀̃𝐎 𝐒𝐄𝐆𝐔𝐑𝐀",
              BASE,
            ].join("\n"),
            variant: "body",
          },
        ],
      },
    };

    await sendA2UI(socket, remoteJid, {
      data,
      text: [
        TOPO,
        "┃",
        DECORACAO,
        "┃",
        "┃ 𝙊 𝙫𝙖𝙯𝙞𝙤 𝙘𝙝𝙚𝙜𝙤𝙪 𝙖𝙩𝙚́ 𝙖 𝙨𝙪𝙖 𝙩𝙚𝙡𝙖.",
        "┃ ⚔️ 𝐔𝐋𝐐𝐔𝐈𝐎𝐑𝐑𝐀 𝐁𝐎𝐓 • 𝐗𝐈𝐂",
        BASE,
      ].join("\n"),
      quoted: webMessage,
    });
  },
};
