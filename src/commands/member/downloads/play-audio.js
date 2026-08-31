import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import {
  removeScrapedAudio,
  scrapeMusic,
} from "../../../services/music-scraper.js";

export default {
  name: "play-audio",
  description: "Baixa e envia músicas em MP3.",
  commands: ["play-audio", "play", "p", "musica"],
  usage: `${PREFIX}play-audio nome da música`,

  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
    sendImageFromURL,
    sendReply,
    sendAudioFromFile,
  }) => {
    if (!fullArgs?.trim()) {
      throw new InvalidParameterError(
        `Me fala o nome da música mano.\n\nExemplo:\n${PREFIX}play Alice in Chains`
      );
    }

    if (/https?:\/\//i.test(fullArgs)) {
      throw new InvalidParameterError(
        `Isso aí é link 😂\nUse ${PREFIX}yt-mp3 <link>`
      );
    }

    await sendWaitReact();
    let scrapedFile;

    try {
      scrapedFile = await scrapeMusic(fullArgs.trim());
      const title = scrapedFile.title || "Música";
      const caption = `╭─❏ 🎵 *XAPA MUSIC*
│
├ *Título:* ${title}
├ *Artista:* ${scrapedFile.author || "Desconhecido"}
├ *Duração:* ${scrapedFile.duration || "Desconhecida"}
│
├ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁
╰───────────────❏`;

      await sendSuccessReact();

      if (scrapedFile.thumbnail) {
        await sendImageFromURL(scrapedFile.thumbnail, caption);
      } else {
        await sendReply(caption);
      }

      await sendAudioFromFile(scrapedFile.filePath, false, false);
    } catch (error) {
      console.error("[PLAY-AUDIO ERROR]", error);
      await sendErrorReact();
      await sendErrorReply(`❌ Deu ruim ao baixar a música.\n\n${error.message}`);
    } finally {
      if (scrapedFile?.filePath) {
        await removeScrapedAudio(scrapedFile.filePath);
      }
    }
  },
};