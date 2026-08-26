import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { youtubePlay } from "../../../services/tokito.js";
import {
  getRandomNumber,
} from "../../../utils/index.js";

export default {
  name: "play-audio",
  description: "Baixa e envia músicas em MP3.",
  commands: ["play-audio", "play", "pa", "musica"],
  usage: `${PREFIX}play-audio nome da música`,

  handle: async ({
    sendAudioFromURL,
    sendImageFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
  }) => {
    if (!fullArgs?.trim()) {
      throw new InvalidParameterError(
        `Me fala o nome da música mano.\n\nExemplo:\n${PREFIX}play Alice in Chains`
      );
    }

    if (
      fullArgs.includes("http://") ||
      fullArgs.includes("https://")
    ) {
      throw new InvalidParameterError(
        `Isso aí é link 😂\nUse ${PREFIX}yt-mp3 <link>`
      );
    }

    await sendWaitReact();

    try {
      const response = await youtubePlay(fullArgs);

      const result = response?.resultado;

      if (!response?.status || !result) {
        throw new Error(
          "Nenhum resultado foi encontrado."
        );
      }

      const audioUrl =
        result.download ||
        result.url;

      if (!audioUrl) {
        throw new Error(
          "A Tokito não retornou a URL do áudio."
        );
      }

      const title =
        result.title || "Música";

      const channel =
        result.canal || "Desconhecido";

      const duration =
        result.duration || "Desconhecida";

      const thumbnail =
        result.thumbnail ||
        result.image;

      const randomSeconds =
        getRandomNumber(5, 15);

      const progressBar =
        `0:${String(randomSeconds).padStart(2, "0")} ━━━●──────── ${duration} ↻ ⊲ Ⅱ ⊳ ↺`;

      const caption = `╭─❏ 🎵 *XAPA MUSIC*
│
├ *Título:* ${title}
├ *Artista:* ${channel}
├ *Duração:* ${duration}
│
├ ${progressBar}
├ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁
╰───────────────❏`;

      await sendSuccessReact();

      if (thumbnail) {
        await sendImageFromURL(
          thumbnail,
          caption
        );
      } else {
        await sendReply(caption);
      }

      await sendAudioFromURL(
        audioUrl,
        title
      );

    } catch (error) {
      console.error(
        "[PLAY-AUDIO ERROR]",
        error
      );

      await sendErrorReact();

      await sendErrorReply(
        `❌ Deu ruim ao baixar a música, Culpa EXCLUSIVAMENTE DO TOKITO-APIS, aguarde um pouco por favor, não tenho culpa disso. \n\n${error.message}`
      );
    }
  },
};