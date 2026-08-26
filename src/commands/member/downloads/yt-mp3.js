import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { ytmp3 } from "../../../services/tokito.js";

export default {
  name: "yt-mp3",
  description: "Baixa um vídeo do YouTube em MP3.",
  commands: ["yt-mp3", "ytmp3"],
  usage: `${PREFIX}yt-mp3 <link>`,

  handle: async ({
    args,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
    sendAudioFromURL,
  }) => {
    if (!args?.length) {
      throw new InvalidParameterError(
        `Uso: ${PREFIX}yt-mp3 <link>`
      );
    }

    const url = args[0];

    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      throw new InvalidParameterError(
        "Me manda a URL do vídeo do YouTube."
      );
    }

    await sendWaitReact();

    try {
      const data = await ytmp3(url);

      if (!data?.arquivo) {
        throw new Error(
          "A Tokito não retornou o arquivo MP3."
        );
      }

      await sendSuccessReact();

      await sendAudioFromURL(
        data.arquivo,
        "youtube-mp3"
      );

    } catch (error) {
      console.error(
        "[YT-MP3 ERROR]",
        error
      );

      await sendErrorReact();

      await sendErrorReply(
        `❌ Não consegui baixar o MP3.\n\n${error.message}`
      );
    }
  },
};