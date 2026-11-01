import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

const IMAGES = [
  "https://placehold.co/800x500/241b2f/e7c77b.png?text=XIC+ALBUM+01",
  "https://placehold.co/800x500/172334/d4b36b.png?text=XIC+ALBUM+02",
];

export default {
  name: "album-demo",
  description: "Demonstra duas imagens como álbum.",
  commands: ["album-demo", "album"],
  usage: `${PREFIX}album-demo`,
  handle: async ({ socket, remoteJid, sendReply, sendReact }) => {
    if (!remoteJid) throw new WarningError("Destinatário não encontrado.");
    const albumId = `xic-album-${Date.now()}`;
    for (const [index, url] of IMAGES.entries()) {
      await socket.sendMessage(remoteJid, {
        image: { url },
        caption: `𖤐 Álbum XIC ${index + 1}/2`,
        albumMessage: { albumId, itemIndex: index, totalItems: IMAGES.length },
      });
    }
    await sendReact("🖼️");
    return sendReply("🖼️ Álbum demonstrativo enviado com duas imagens.");
  },
};
