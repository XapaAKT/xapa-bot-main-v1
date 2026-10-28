import { PREFIX } from "../../config.js";
import { sendA2UI } from "../../utils/plugins/a2ui.js";

export default {
  name: "a2ui",
  description: "Envia uma interface A2UI de demonstração",
  commands: ["a2ui", "teste-a2ui", "enviar-a2ui"],
  usage: `${PREFIX}a2ui`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
  }) => {
    const data = {
      version: "v0.9",
      createSurface: {
        surfaceId: `starcore-widget=${Date.now()}`,
        catalogId: "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
        components: [
          {
            id: "root",
            component: "Column",
            children: ["titulo", "mensagem"],
          },
          {
            id: "titulo",
            component: "Text",
            text: "Demonstração A2UI",
            variant: "h2",
          },
          {
            id: "mensagem",
            component: "Text",
            text: "Interface enviada pelo XIC BOT.",
            variant: "body",
          },
        ],
      },
    };

    await sendA2UI(socket, remoteJid, {
      data,
      text: "Demonstração de interface A2UI.",
      quoted: webMessage,
    });
  },
};
