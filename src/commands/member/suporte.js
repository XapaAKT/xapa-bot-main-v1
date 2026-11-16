import { PREFIX } from "../../config.js";

function getSupportTopics(prefix) {
  return [
    {
      match: /\b(prefixo|prefix)\b/i,
      answer: `Para ver o prefixo e os menus disponíveis, use ${prefix}menu. Se o prefixo do grupo foi alterado, confirme-o com um administrador.`,
    },
    {
      match: /\b(download|youtube|música|musica|mp3|mp4|vídeo|video)\b/i,
      answer: `Para áudio, use ${prefix}play-audio <nome ou link do YouTube>. Para incluir o link junto do áudio, acrescente --link. Para vídeo, use ${prefix}play-video <pesquisa ou link do YouTube>.`,
    },
    {
      match: /\b(figurinha|sticker|fig)\b/i,
      answer: `Para criar uma figurinha, responda a uma imagem ou vídeo com ${prefix}sticker. Os comandos de IA estão temporariamente desativados.`,
    },
    {
      match: /\b(grupo|admin|administrador|banir|ban|link)\b/i,
      answer: `Os comandos administrativos aparecem em ${prefix}amenu e só podem ser usados por administradores do grupo.`,
    },
    {
      match: /\b(economia|saldo|moeda|dinheiro)\b/i,
      answer: `Os comandos da economia estão no menu ${prefix}economia-menu.`,
    },
    {
      match: /\b(pok[eé]mon|pokemon)\b/i,
      answer: `Os comandos de Pokémon estão no menu ${prefix}pokemon-menu.`,
    },
    {
      match: /\brpg\b/i,
      answer: `Os comandos e o guia do RPG estão no menu ${prefix}rpg-menu.`,
    },
  ];
}

export default {
  name: "suporte",
  description: "Ajuda rápida com os comandos e recursos do bot.",
  commands: ["suporte", "help", "ajuda"],
  usage: `${PREFIX}suporte <dúvida>`,

  handle: async ({
    fullArgs,
    replyText,
    isImage,
    prefix = PREFIX,
    sendReply,
  }) => {
    const question = fullArgs?.trim() || replyText?.trim() || "";

    if (!question) {
      await sendReply(
        `🛠️ *Suporte XIC BOT*\n` +
          `Este suporte usa respostas rápidas, sem IA.\n\n` +
          `Exemplos:\n` +
          `• ${prefix}suporte como usar downloads\n` +
          `• ${prefix}suporte comandos de economia\n` +
          `• ${prefix}suporte comandos de administrador\n\n` +
          (isImage
            ? "A análise automática de imagens está desativada."
            : "Para dúvidas fora desses tópicos, fale com o dono do bot."),
      );
      return;
    }

    const topic = getSupportTopics(prefix).find(({ match }) =>
      match.test(question),
    );
    await sendReply(
      topic?.answer ||
        "Não encontrei uma resposta rápida para essa dúvida. Consulte o menu do bot ou fale com o dono; este comando não usa IA para responder perguntas abertas.",
    );
  },
};
