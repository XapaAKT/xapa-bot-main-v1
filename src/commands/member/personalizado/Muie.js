/**
 * ============================================================
 * ୨୧ SARAH / SAYATA ୨୧
 * ============================================================
 *
 * Comando especial e romântico do Xapa para Sarah.
 *
 * Estética:
 * 💜 Roxo
 * 🖤 Preto
 * ♡ Romântico
 * ୨୧ Delicado
 * ✦ Brilhos / detalhes
 *
 * @author Xapa
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PREFIX } from "../../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const MEU_ID = "227886971789349";

const PERSONALIZADO_DIR = path.resolve(
  __dirname,
  "../../../../assets/images/personalizado"
);

const VIDEO_PATH = path.join(
  PERSONALIZADO_DIR,
  "kuromi.mp4"
);

// Evita duas execuções simultâneas
let commandRunning = false;

// ============================================================
// UTILIDADES
// ============================================================

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function normalizeId(value) {
  if (!value) return "";
  return String(value)
   .replace(/:[0-9]+(?=@)/g, "")
   .trim()
   .toLowerCase();
}

function isOwner(props) {
  const possibleIds = [
    props?.sender,
    props?.senderJid,
    props?.senderLid,
    props?.participant,
    props?.participantLid,
    props?.userJid,
    props?.userLid,
    props?.lid,
    props?.webMessage?.key?.participant,
    props?.webMessage?.key?.participantAlt,
    props?.webMessage?.key?.senderLid,
    props?.webMessage?.key?.senderPn,
    props?.webMessage?.participant,
  ]
   .filter(Boolean)
   .map(normalizeId);

  return possibleIds.some(
    (id) => id.includes(normalizeId(MEU_ID))
  );
}

// ============================================================
// ARTE
// ============================================================

const heart = ` ⣠⣤⣶⣶⣦⣄⡀ ⢀⣤⣴⣶⣶⣤⣀
⣼⣿⣿⣿⣿⣿⣿⣿⣷⣤⣾⣿⣿⣿⣿⣿⣿⣧
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏
 ⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋
   ⠙⢿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁
     ⠙⢿⣿⣿⣿⣿⠋
       ⠙⢿⡿⠋
         ♡`;

// ============================================================
// FRAMES DA ANIMAÇÃO - TEMPO LENTO + LETRA LEGÍVEL
// ============================================================

const frames = [
  `♡`,

  `♡

      ✦`,

  `♡

   ⋆｡°✩

      ✦`,

  `♡

   ⋆｡°✩

   ୨୧ ｡･ﾟ･

      ✦`,

  `╭───────────────╮
│
│ ୨୧
│
│ um pequeno
│ presente...
│
╰───────────────╯`,

  `╭───────────────╮
│ ♡
│
│ para
│
│ você...
│
╰───────────────╯`,

  `╭───────────────╮
│
│ ✦
│
│ my baby...
│
│ ♡
│
╰───────────────╯`,

  `╭───────────────────╮
│
│ ୨୧ Sarah ୨୧
│
│ Vida
│ espera uma
│ pequena
│ surpresa calma ai kkk.
│
╰───────────────────╯`,

  `\`\`\`
${heart}
\`\`\`

୨୧ Sarah ୨୧

✦ minha princesa ✦`,

  `\`\`\`
${heart}
\`\`\`

🖤 Sarah 💜

My
little girl.

୨୧ ♡ ୨୧`,

  `\`\`\`
${heart}
\`\`\`

╭───────────────╮
│
│ 𐙚
│
│ Sarah meu amor...
│
│ escrevi um pequeno texto
│ for you.
│
╰───────────────╯`,

  `\`\`\`
${heart}
\`\`\`

       ୨୧ ♡ ୨୧

    Sarah,
    minha princesa. 💜`
];

// ============================================================
// MENSAGEM FINAL - LEGÍVEL
// ============================================================

function createFinalCaption() {
  return `╭─────────── ୨୧ ───────────╮
│
│ 𐙚 Pra Sarah 𐙚
│
│ Sayata
│
│ ✦ minha princesa ✦
│
│
│ Você é minha paz
│ no meio do meu caos.
│
│ 🖤 Minha bebe.
│ 💜 Minha nenem.
│ ୨୧ Minha lolizinha kkk.
│
│
│ Você consegue deixar
│ tudo um pouco mais
│ bonito só por existir.
│
│
│ ୨୧ ♡ ୨୧
│
│ Eu te amo.
│ Mais do que eu consigo dizer.
│
│
╰─────────── ୨୧ ───────────╯

       ˚₊‧꒰ა ♡ ໒꒱ ‧₊˚

> ⛓️ Do seu Enzo,
> pra sua Sayata. 💜

♡ Sempre.`;
}

// ============================================================
// COMANDO
// ============================================================

export default {
  name: "sarah",
  description: "Comando especial para a Sarah 💜",
  commands: [
    "sarah",
    "saya",
    "sayata",
    "princesa",
    "bebe",
    "nenem",
    "amor",
    "minhavida",
  ],
  usage: `${PREFIX}sarah`,
  handle: async (props) => {
    const { remoteJid, socket, sendReply } = props;

    if (!isOwner(props)) return;
    if (commandRunning) return;
    commandRunning = true;

    try {
      let sent = await socket.sendMessage(
        remoteJid,
        { text: frames[0] }
      );

      for (let i = 1; i < frames.length; i++) {

        // DELAY ESPECIAL PRA PARTE DO TEXTO
        let delay = 1600;

        if (i <= 4) {
          delay = 900; // começo - brilhos
        } else if (i === 5) {
          delay = 2800; // "um pequeno presente..."
        } else if (i === 6) {
          delay = 2800; // "para você..."
        } else if (i === 7) {
          delay = 3000; // "Sarah..." - mais suspense
        } else if (i === 8) {
          delay = 3200; // "Guarda uma pequena surpresa..." - mais tempo ainda
        } else {
          delay = 1800; // resto - coração
        }

        await sleep(delay);

        try {
          await socket.sendMessage(
            remoteJid,
            { text: frames[i], edit: sent.key }
          );
        } catch (error) {
          console.error("[SARAH FRAME EDIT ERROR]", error.message);
          sent = await socket.sendMessage(
            remoteJid,
            { text: frames[i] }
          );
        }
      }

      await sleep(2500);

      const finalCaption = createFinalCaption();

      if (fs.existsSync(VIDEO_PATH)) {
        await socket.sendMessage(
          remoteJid,
          {
            video: fs.readFileSync(VIDEO_PATH),
            caption: finalCaption,
            gifPlayback: true,
          }
        );
      } else {
        await sendReply(finalCaption);
      }
    } catch (error) {
      console.error("[SARAH COMMAND ERROR]", error);
    } finally {
      commandRunning = false;
    }
  },
};