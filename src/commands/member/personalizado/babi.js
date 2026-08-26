import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREFIX } from "../../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BABI_ID = "150139943551199";
const GIFS_DIR = path.resolve(__dirname, "../../../../assets/images/personalizado");
const GIFS = ["babi1.mp4"];

export default {
  name: "babi",
  description: "Comando exclusivo da Babi",
  commands: ["babi", "bibi", "babizinha", "bibizinha", "dimdim"],
  usage: `${PREFIX}babi`,
  handle: async (props) => {
    const { remoteJid, socket, sendReply, sendVideo, sendMedia, webMessage } = props;

    const possibleIds = [
      props.senderJid, props.senderLid, props.participant, props.participantLid,
      props.userJid, props.lid, webMessage?.key?.participant,
      webMessage?.key?.participantAlt, webMessage?.key?.senderLid, webMessage?.key?.senderPn,
      webMessage?.participant,
    ].filter(Boolean).map(String);

    const isBabi = possibleIds.some(id => id.includes(BABI_ID));

    if (!isBabi) {
      return await sendReply("Só a Babi pode usar esse comando");
    }

    const randomGif = GIFS[Math.floor(Math.random() * GIFS.length)];
    const gifPath = path.join(GIFS_DIR, randomGif);

    const caption = `⛓️━━━━━ 𝐁𝐀𝐁𝐈 ━━━━━⛓️
┃
┃  > vivendo entre a paz e o caos
┃
┃  🖇️ ig: https://www.instagram.com/babicms?igsi=MXBoaWt0NjNoNHFjbA==
┃
⛓️━━━━━━━━━━━━━━━━⛓️`;

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