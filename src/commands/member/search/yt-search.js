import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import { searchMusic } from "../../../services/music-scraper.js";
import {
  createNativeFlowButton,
  sendInteractiveCarousel,
} from "../../../utils/interactive.js";
import { errorLog } from "../../../utils/logger.js";
import { readMore, formatNumber } from "../../../utils/index.js";
import { getYoutubeSearchCarousel } from "../../../utils/database.js";

export default {
  name: "yt-search",
  description: "Pesquisa vídeos no YouTube",
  commands: ["yt-search", "youtube-search", "yts"],
  usage: `${PREFIX}yt-search nirvana`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    socket,
    remoteJid,
    prefix,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReact,
    sendErrorReply,
    sendSuccessReply,
  }) => {
    const input = fullArgs?.trim() || "";
    const carouselOption = /(?:^|\s)--(?:carousel|carrossel)(?=\s|$)/i;
    const requestedCarousel = carouselOption.test(input);
    const carouselMode =
      requestedCarousel || getYoutubeSearchCarousel();
    const query = carouselMode
      ? input.replace(carouselOption, " ").replace(/\s+/g, " ").trim()
      : input;

    if (!query) {
      throw new InvalidParameterError(
        `Me fala o que quer pesquisar mano\nExemplo: ${prefix || PREFIX}yt-search one piece amv\nPara ativar o carrossel por padrão: ${prefix || PREFIX}yts-type 1`
      );
    }

    const maxLength = 100;
    if (query.length > maxLength) {
      throw new InvalidParameterError(
        `O tamanho máximo da pesquisa é de ${maxLength} caracteres.`
      );
    }

    await sendWaitReact();

    let data;
    try {
      data = await searchMusic(query, carouselMode ? 5 : 10);
    } catch (error) {
      errorLog(`[YT-SEARCH ERROR] ${error.stack || error.message || error}`);
      await sendErrorReact();
      await sendErrorReply(
        "Não consegui pesquisar no YouTube agora. Tente novamente em instantes."
      );
      return;
    }

    if (data.length === 0) {
      await sendErrorReact();
      throw new WarningError(
        "Não foi possível encontrar resultados para a pesquisa."
      );
    }

    const activePrefix = prefix || PREFIX;
    if (carouselMode) {
      const cards = data.map((item, index) => ({
        title: `${index + 1}. ${item.title}`,
        ...(item.thumbnail && { imageUrl: item.thumbnail }),
        text: `🎬 *${item.title}*\n\n` +
          `👤 Canal: ${item.author}\n` +
          `⏱️ Duração: ${item.duration}\n` +
          `👁️ Visualizações: ${item.views ? formatNumber(item.views) : "N/A"}\n` +
          `📅 Publicado: ${item.releaseDate || "N/A"}`,
        footer: "YouTube Search",
        nativeFlowButtons: [
          createNativeFlowButton("cta_url", {
            display_text: "▶️ Assistir no YouTube",
            url: item.url,
          }),
          createNativeFlowButton("cta_copy", {
            display_text: "📋 Copiar link",
            copy_code: item.url,
          }),
        ],
      }));

      try {
        await sendInteractiveCarousel(
          socket,
          remoteJid,
          {
            text: `🔎 Resultados para: ${query}\nDeslize pelos cards para escolher um vídeo.`,
            footer: `${data.length} resultado(s)`,
            cards,
          },
          { quoted: webMessage },
        );
        await sendSuccessReact();
      } catch (error) {
        errorLog(`[YT-SEARCH CAROUSEL ERROR] ${error.stack || error.message || error}`);
        await sendErrorReact();
        await sendErrorReply(
          "Não consegui enviar o carrossel. Tente novamente ou faça a busca sem a opção --carousel."
        );
      }
      return;
    }

    let text = `╭─❏ 🔍 *YOUTUBE SEARCH*\n`;
    text += `│\n`;
    text += `├ *Termo:* ${query}\n`;
    text += `├ *Resultados:* ${data.length}\n`;
    text += `│\n`;
    text += `╰───────────────❏\n\n`;

    text += `${readMore()}\n\n`;

    data.slice(0, 10).forEach((item, i) => {
      const views = item.views ? formatNumber(item.views) : "N/A";
      text += `╭─❏ ${i + 1}\n`;
      text += `│ 🎬 *${item.title}*\n`;
      text += `│ ⏱️ *Duração:* ${item.duration}\n`;
      text += `│ 👁️ *Views:* ${views}\n`;
      text += `│ 📅 *Postado:* ${item.releaseDate || "N/A"}\n`;
      text += `│ 🔗 ${item.url}\n`;
      text += `╰────────────────❏\n\n`;
    });

    text += `> Toque em um link para abrir ou pressione e segure para copiar.\n`;
    text += `> Use ${activePrefix}play-audio <nome> ou ${activePrefix}yt-mp4 <link> pra baixar`;

    await sendSuccessReply(text);
  },
};