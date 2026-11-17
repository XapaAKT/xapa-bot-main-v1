import { PREFIX } from "../../config.js";
import {
  BOT_NAME,
  MUSIC_TITLE,
  buildCaption,
  buildLockedVideo,
  readArtworkPath,
  resolveWantedSeconds,
} from "../../utils/trava.js";

export default {
  name: "Trava",
  description: "Trava o WhatsApp com um vídeo de duração impossível.",
  commands: ["trava"],
  usage: `${PREFIX}trava [segundos]`,

  handle: async ({ remoteJid, socket, webMessage, args, sendReply, sendSuccessReact }) => {
    const wantedSeconds = resolveWantedSeconds(args);
    const { video, originalDuration, fakeDuration } = await buildLockedVideo(wantedSeconds);
    const artworkDirectPath = await readArtworkPath();

    await sendReply(
      `⏳ Montando a trava: ${originalDuration}s reais, contador em ${fakeDuration.toLocaleString("pt-BR")}s...`,
    );

    await socket.sendMessage(
      remoteJid,
      {
        video,
        gifPlayback: false,
        annotations: [
          {
            polygonVertices: [
              { x: 0.17499999701976776, y: 0.3405156135559082 },
              { x: 0.824999988079071, y: 0.3405156135559082 },
              { x: 0.824999988079071, y: 0.6594765782356262 },
              { x: 0.17499999701976776, y: 0.6594765782356262 },
            ],
            shouldSkipConfirmation: true,
            embeddedContent: {
              embeddedMusic: {
                musicContentMediaId: "1594709651870049",
                songId: "1201970084729695",
                author: BOT_NAME,
                title: MUSIC_TITLE,
                artworkDirectPath,
                musicSongStartTimeInMs: 14500000000,
                isExplicit: true,
              },
            },
          },
        ],
        seconds: fakeDuration,
        caption: buildCaption(fakeDuration),
      },
      { quoted: JSON.parse(JSON.stringify(webMessage)) },
    );

    await sendSuccessReact();
  },
};