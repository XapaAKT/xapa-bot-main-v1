import { PREFIX } from "../../config.js";
import { sendInteractiveButtons } from "../../utils/interactive.js";

const DEMO_NUMBER = "5531997138522";

export default {
  name: "contato-demo",
  description: "Envia um contato demonstrativo com empresa e botão.",
  commands: ["contato-demo", "contato-botao"],
  usage: `${PREFIX}contato-demo`,
  handle: async ({ socket, remoteJid, sendReply }) => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:XIC Laboratório",
      "ORG:XIC Bot;",
      `TEL;type=CELL;type=VOICE;waid=${DEMO_NUMBER}:+${DEMO_NUMBER}`,
      "URL:https://example.com",
      "NOTE:Contato demonstrativo do XIC Bot.",
      "END:VCARD",
    ].join("\n");

    await socket.sendMessage(remoteJid, {
      contacts: {
        displayName: "XIC Laboratório",
        contacts: [{ vcard }],
      },
    });
    await sendInteractiveButtons(socket, remoteJid, {
      title: "📇 Contato demonstrativo",
      text: "Contato de teste com empresa e ação rápida.",
      footer: "XIC Bot Lab",
      buttons: [
        { id: `${PREFIX}brincar vitrine`, text: "🛒 Abrir vitrine" },
        { id: `${PREFIX}brincar caca`, text: "🗺️ Caça ao tesouro" },
      ],
    });
    return sendReply("📇 Contato e botões demonstrativos enviados.");
  },
};
