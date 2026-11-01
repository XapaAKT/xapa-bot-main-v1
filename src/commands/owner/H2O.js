import { PREFIX } from "../../config.js";
import { sendA2UI } from "../../utils/plugins/a2ui.js";

const HEADER = "╭━━━〔 ☠️ ULQUIORRA BOT • H2O 〕━━━╮";
const FOOTER = "╰━━━〔 ⛓️ XIC // ARQUIVO 〕━━━╯";
const MESSAGE = [
  HEADER,
  "┃",
  "┃ ✦｡ﾟ🚀ﾟ｡✦ XIC BOT ✦｡ﾟ🦠ﾟ｡✦",
  "┃",
  "┃ O vazio chegou até a sua tela.",
  "┃ Sentir medo é opcional; admirar o estilo é obrigatório.",
  "┃",
  "┃ ⚔️ MODO: DECORAÇÃO SEGURA",
  FOOTER,
].join("\n");

export default {
  name: "h2o",
  description: "Envia uma mensagem decorativa segura.",
  commands: ["h2o"],
  usage: `${PREFIX}h2o`,

  handle: async ({ socket, remoteJid, webMessage }) => {
    const data = {
      version: "v0.9",
      createSurface: {
        surfaceId: `xic-h2o-${Date.now()}`,
        catalogId:
          "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
        components: [
          {
            id: "root",
            component: "Column",
            children: ["titulo", "mensagem"],
          },
          {
            id: "titulo",
            component: "Text",
            text: "☠️ ULQUIORRA BOT • H2O",
            variant: "h2",
          },
          {
            id: "mensagem",
            component: "Text",
            text: MESSAGE,
            variant: "body",
          },
        ],
      },
    };

    try {
      await sendA2UI(socket, remoteJid, {
        data,
        text: MESSAGE,
        quoted: webMessage,
      });
    } catch (error) {
      console.error("[H2O] Erro no A2UI, usando fallback de texto simples:", error);
      await socket.sendMessage(remoteJid, {
        text: MESSAGE,
        quoted: webMessage,
      });
    }
  },
};
