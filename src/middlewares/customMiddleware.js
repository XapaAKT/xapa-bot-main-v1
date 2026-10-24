/**
 * Middleware customizado para adicionar lógica personalizada
 * sem modificar os arquivos principais do bot.
 *
 * Este middleware é chamado em dois momentos:
 * 1. Antes de processar qualquer mensagem (type: "message")
 * 2. Antes de processar eventos de participantes add/remove (type: "participant")
 *
 * @param {CustomMiddlewareProps} params - Parâmetros do middleware
 *
 * Para exemplos de uso, consulte:
 * - README.md (seção "Custom Middleware")
 *
 * @author Xapa
 */
import { readdir } from "node:fs/promises";
import path from "node:path";

const MESSAGES_AUDIO_DIR = path.resolve(
  process.cwd(),
  "assets",
  "audios",
  "Mensagens",
);

const LAUGHTER_PATTERN =
  /(?:^|[^\p{L}\p{N}])(?:k{2,}|(?:ka){2,}k?|(?:ks){2,}k?|(?:ha){2,}|(?:he){2,}|(?:rs){2,}|(?:hue){2,}|(?:lol)+|x+d+)(?=$|[^\p{L}\p{N}])/iu;

function getMessageText(webMessage) {
  const message = webMessage?.message;
  if (!message) return "";

  const text =
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption;

  if (typeof text === "string") return text;

  const wrappedMessage =
    message.ephemeralMessage?.message ||
    message.viewOnceMessage?.message ||
    message.viewOnceMessageV2?.message;

  return wrappedMessage
    ? getMessageText({ ...webMessage, message: wrappedMessage })
    : "";
}

async function pickAudioFile(category) {
  const audioDirectory = path.join(MESSAGES_AUDIO_DIR, category);
  const entries = await readdir(audioDirectory, { withFileTypes: true });
  const audioFiles = entries
    .filter(
      (entry) =>
        entry.isFile() && /\.(?:mp3|ogg|opus|wav|m4a|aac)$/i.test(entry.name),
    )
    .map((entry) => path.join(audioDirectory, entry.name));

  if (!audioFiles.length) {
    throw new Error(`Nenhum áudio encontrado em ${audioDirectory}`);
  }

  return audioFiles[Math.floor(Math.random() * audioFiles.length)];
}

export async function customMiddleware({
  webMessage,
  type,
  commonFunctions,
}) {
  if (type !== "message" || webMessage?.key?.fromMe) return;
  if (!commonFunctions?.sendAudioFromFile) return;

  const messageText = getMessageText(webMessage);
  if (!messageText) return;

  const isOieMessage = /\boie\b/i.test(messageText);
  const isLaughingMessage = LAUGHTER_PATTERN.test(messageText);

  if (!isOieMessage && !isLaughingMessage) return;

  const chance = isOieMessage ? 80 : 1;
  if (Math.random() * 100 >= chance) return;

  const audioCategory = isOieMessage ? "Oie" : "Laughs";
  const audioPath = await pickAudioFile(audioCategory);
  await commonFunctions.sendAudioFromFile(audioPath, true);
}
