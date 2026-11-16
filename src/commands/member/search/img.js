import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import {
  downloadImage,
  parseImageSearchQuery,
  searchImages,
} from "../../../services/image-search.js";
import { errorLog } from "../../../utils/logger.js";

// Mini tutorial:
// 1. MAX_ALBUM_IMAGES define quantas fotos o comando tenta enviar.
// 2. Busca normal usa Yandex e depois Bing; +18 usa Rule34, Gelbooru e Yande.re.
// 3. Imagens que falham no download sao ignoradas antes de montar o album.
// 4. Rule34/Gelbooru aceitam credenciais opcionais no .env; sem elas, tenta Yande.re.
const MAX_ALBUM_IMAGES = 15;
const MIN_ALBUM_IMAGES = 3;
const DOWNLOAD_BATCH_SIZE = 6;

export default {
  name: "img",
  description: "Busca imagens no Yandex, Bing e fontes +18.",
  commands: ["img"],
  usage: `${PREFIX}img gatos | ${PREFIX}img hentai +18`,
  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendWarningReply,
    sendErrorReply,
    socket,
    remoteJid,
  }) => {
    let search;
    try {
      search = parseImageSearchQuery(fullArgs);
    } catch (error) {
      throw new InvalidParameterError(error.message);
    }

    if (!search.query) {
      throw new InvalidParameterError(
        `Informe o que deseja pesquisar. Para conteúdo adulto, use ${PREFIX}img <busca> +18.`,
      );
    }
    if (search.query.length > 100) {
      throw new InvalidParameterError("A busca pode ter no máximo 100 caracteres.");
    }

    if (search.adult) {
      await sendWarningReply("⚠️ Conteúdo adulto");
    }
    await sendWaitReact();

    let images;
    try {
      images = await searchImages(search.query, search.adult);
    } catch (error) {
      errorLog(`[IMG] ${error.stack || error.message || error}`);
      await sendErrorReply("Não consegui buscar imagens agora. Tente novamente em instantes.");
      return;
    }

    if (!images.length) {
      await sendWarningReply(
        search.adult
          ? "Não encontrei imagens +18 com essas tags. Tente usar tags canônicas (por exemplo, kimetsu_no_yaiba) ou configure o acesso às APIs Rule34/Gelbooru."
          : "Não encontrei imagens para essa pesquisa.",
      );
      return;
    }

    const albumImages = [];
    for (
      let offset = 0;
      offset < images.length && albumImages.length < MAX_ALBUM_IMAGES;
      offset += DOWNLOAD_BATCH_SIZE
    ) {
      const batch = await Promise.all(
        images.slice(offset, offset + DOWNLOAD_BATCH_SIZE).map(async (image) => {
          try {
            return await downloadImage(image);
          } catch (error) {
            errorLog(`[IMG] Imagem ignorada (${image.url}): ${error.message || error}`);
            return null;
          }
        }),
      );
      albumImages.push(
        ...batch
          .filter(Boolean)
          .slice(0, MAX_ALBUM_IMAGES - albumImages.length),
      );
    }

    if (albumImages.length < MIN_ALBUM_IMAGES) {
      await sendWarningReply(
        `Só consegui baixar ${albumImages.length} imagem(ns) utilizável(is); preciso de pelo menos ${MIN_ALBUM_IMAGES} para montar o álbum.`,
      );
      return;
    }

    try {
      await socket.sendMessage(remoteJid, {
        album: albumImages.map((image) => ({
          image,
        })),
        caption: `🔎 Imagens: ${search.query}`,
      });
    } catch (error) {
      errorLog(`[IMG] Falha ao enviar álbum: ${error.stack || error.message || error}`);
      await sendErrorReply("Não consegui enviar o álbum de imagens. Tente novamente.");
      return;
    }

    await sendSuccessReact();
  },
};
