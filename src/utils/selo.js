import { getSeloType } from "./database.js";

export const MeuSelo = {
  key: {
    id: "xic",
    participant: "5531997138522@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
  },
  message: {
    contactMessage: {
      displayName: "XIC BOT",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Xapa;;;\nFN:Xapa\nitem1.TEL;waid=5531997138522:5531997138522\nitem1.X-ABLabel:Dono\nEND:VCARD`,
      contextInfo: { forwardingScore: 1, isForwarded: true },
    },
  },
};

export const SeloMeta = {
  key: {
    id: "selinho",
    participant: "13135550002@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
  },
  message: {
    contactMessage: {
      displayName: "MetaAI",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Void;;;\nFN:Void\nitem1.TEL;waid=13135550002:13135550002\nitem1.X-ABLabel:Celular\nEND:VCARD`,
      contextInfo: { forwardingScore: 1, isForwarded: true },
    },
  },
};

export function getSelo() {
  return getSeloType() === 2 ? SeloMeta : MeuSelo;
}
