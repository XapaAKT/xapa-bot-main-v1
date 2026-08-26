import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX } from "../../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RODRIGUES_ID = "82523971444848";
// SE SEU ARQUIVO TA EM src/commands/personalizado/rodrigues/  TEM QUE TER MAIS UM ../
const GIFS_DIR = path.resolve(__dirname, "../../../../assets/images/personalizado");
const GIFS = ["rodrigues1.mp4", "rodrigues2.mp4", "rodrigues3.mp4"];

export default {
  name: "rodrigues",
  description: "Comando exclusivo do Rodrigues",
  commands: ["soarez", "soaresz", "kaneki", "rodrigues", "Syx"],
  usage: `${PREFIX}rodrigues`,
  handle: async (props) => {
    const { remoteJid, socket, sendReply, sendVideo, sendMedia, webMessage } = props;

    const possibleIds = [
      props.senderJid, props.senderLid, props.participant, props.participantLid,
      props.userJid, props.lid, webMessage?.key?.participant,
      webMessage?.key?.participantAlt, webMessage?.key?.senderLid, webMessage?.key?.senderPn,
      webMessage?.participant,
    ].filter(Boolean).map(String);

    const isRodrigues = possibleIds.some(id => id.includes(RODRIGUES_ID));

    if (!isRodrigues) {
      return await sendReply("⛧ Só o Soaresz pode usar esse comando ♠️");
    }

    const randomGif = GIFS[Math.floor(Math.random() * GIFS.length)];
    const gifPath = path.join(GIFS_DIR, randomGif);

    // DEBUG
    if (!fs.existsSync(gifPath)) {
      console.log(`❌ GIF NÃO ACHADO: ${gifPath}`);
      return await sendReply(`Gif não achado no servidor: ${randomGif}\nCaminho que tentei: ${gifPath}`);
    }

    const caption = `⛧━━━━━༺𖤐༻━━━━━⛓️
┃
┃  👁️‍🗨️ *K A N E K I  M O D E  O N* 👁️‍🗨️
┃
┃  👁️ I'm Rodrigues.
┃
> People are already born liars
> and are used to lying.
> If there was a person who never
> lied in their entire life,
> that existence itself would be a lie.
┃
┃  🕷️ Insta: https://www.instagram.com/syx.soaresz
┃
⛧━━━━━༺𖤐༻━━━━━⛓️`;

    try {
      if (sendVideo) await sendVideo(gifPath, { caption, gifPlayback: true });
      else if (sendMedia) await sendMedia(gifPath, { caption, mimetype: "video/mp4", gifPlayback: true });
      else await socket.sendMessage(remoteJid, { video: fs.readFileSync(gifPath), caption, gifPlayback: true });
    } catch (e) {
      console.error(e);
      await sendReply(caption);
    }
  },
};