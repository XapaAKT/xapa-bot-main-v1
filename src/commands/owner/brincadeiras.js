import { delay } from "baileys";
import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";

const lastBotMessages = new Map();

function getQuotedKey(webMessage) {
  const context =
    webMessage?.message?.extendedTextMessage?.contextInfo ||
    webMessage?.message?.imageMessage?.contextInfo ||
    webMessage?.message?.videoMessage?.contextInfo;

  if (!context?.stanzaId) return null;

  return {
    remoteJid: webMessage.key.remoteJid,
    fromMe: false,
    id: context.stanzaId,
    participant: context.participant,
  };
}

function buildMenu() {
  return `╔═══〔 𖤐 BRINCADEIRAS XIC 𖤐 〕═══╗
║ ${PREFIX}brincar editar <texto>
║ ${PREFIX}brincar fixar
║ ${PREFIX}brincar enquete
║ ${PREFIX}brincar caca
║ ${PREFIX}brincar vitrine
╚══════════════════════════════╝`;
}

export default {
  name: "brincadeiras",
  description: "Playground seguro de recursos especiais do WhatsApp.",
  commands: ["brincar", "brincadeiras", "wa-lab"],
  usage: `${PREFIX}brincar [editar|fixar|enquete|caca|vitrine]`,

  handle: async ({
    args,
    fullArgs,
    remoteJid,
    socket,
    webMessage,
    sendReply,
    sendPoll,
    sendLocation,
    sendReact,
    sendSuccessReply,
    sendTypingState,
  }) => {
    const action = String(args?.[0] || "").toLowerCase();

    if (!action) return sendReply(buildMenu());

    if (action === "editar") {
      const text = String(fullArgs || "").replace(/^editar\s*/i, "").trim();
      if (!text) throw new InvalidParameterError(`Use: ${PREFIX}brincar editar <novo texto>`);

      const previous = lastBotMessages.get(remoteJid);
      if (!previous) {
        const sent = await sendReply("📝 Mensagem criada. Agora use editar novamente para alterar esta mensagem.");
        lastBotMessages.set(remoteJid, sent);
        return;
      }

      await socket.sendMessage(remoteJid, {
        text: `✦ Mensagem editada pelo laboratório:\n\n${text}`,
        edit: previous.key,
      });
      await sendReact("📝");
      return;
    }

    if (action === "fixar") {
      const key = getQuotedKey(webMessage);
      if (!key) throw new InvalidParameterError(`Responda uma mensagem e use ${PREFIX}brincar fixar.`);
      await socket.sendMessage(remoteJid, {
        pin: { type: 1, time: 86400, key },
      });
      return sendSuccessReply("📌 Mensagem fixada por 24 horas.");
    }

    if (action === "enquete") {
      await sendPoll(
        "𖤐 Enquete do Laboratório XIC",
        ["⚔️ Poder", "🔮 Magia", "🛡️ Defesa", "🗺️ Exploração"],
        false,
      );
      await sendReact("📊");
      return;
    }

    if (action === "caca") {
      await sendTypingState();
      await sendReact("🗺️");
      await sendLocation(-23.55052, -46.633308);
      await delay(500);
      return sendReply(`╔═══〔 🗺️ CAÇA AO TESOURO 〕═══╗
║ Um mapa antigo foi encontrado.
║ A localização acima é uma área fictícia para a brincadeira.
║ Procure a próxima pista no grupo!
╚══════════════════════════════╝`);
    }

    if (action === "vitrine") {
      await socket.sendMessage(remoteJid, {
        product: {
          productImage: { url: "https://placehold.co/600x600/png?text=XIC+MEME" },
          productId: "xic-meme-demo",
          title: "Poção de Mana do Xapa",
          description: "Produto demonstrativo, sem compra real.",
          currencyCode: "BRL",
          priceAmount1000: 9990,
          retailerId: "xic-demo",
          url: "https://example.com",
        },
      });
      await sendReact("🛒");
      return;
    }

    throw new WarningError(`Brincadeira desconhecida. Use ${PREFIX}brincar para ver o menu.`);
  },
};
