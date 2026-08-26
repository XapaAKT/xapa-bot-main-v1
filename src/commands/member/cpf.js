import { PREFIX } from "../../config.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const motivos = [
  "𝐒𝐨𝐧𝐞𝐠𝐨𝐮 𝐢𝐦𝐩𝐨𝐬𝐭𝐨 𝐯𝐞𝐧𝐝𝐞𝐧𝐝𝐨 𝐛𝐨𝐥𝐨 𝐝𝐞 𝐩𝐨𝐭𝐞.",
  "𝐃𝐞𝐜𝐥𝐚𝐫𝐨𝐮 𝐮𝐦𝐚 𝐜𝐚𝐩𝐢𝐯𝐚𝐫𝐚 𝐜𝐨𝐦𝐨 𝐝𝐞𝐩𝐞𝐧𝐝𝐞𝐧𝐭𝐞.",
  "𝐄𝐦𝐢𝐭𝐢𝐮 𝐍𝐅 𝐩𝐚𝐫𝐚 𝐮𝐦 𝐝𝐢𝐧𝐨𝐬𝐬𝐚𝐮𝐫𝐨.",
  "𝐓𝐞𝐧𝐭𝐨𝐮 𝐩𝐚𝐠𝐚𝐫 𝐨 𝐈𝐏𝐕𝐀 𝐜𝐨𝐦 𝐟𝐢𝐠𝐮𝐫𝐢𝐧𝐡𝐚.",
  "𝐃𝐞𝐯𝐞 𝟒𝟕 𝐩𝐚𝐜𝐨𝐭𝐞𝐬 𝐝𝐞 𝐦𝐢𝐨𝐣𝐨."
];

function gerarCPF() {
  const n = () => Math.floor(Math.random() * 900 + 100);
  const d = () => Math.floor(Math.random() * 90 + 10);
  return `${n()}.${n()}.${n()}-${d()}`;
}

export default {
  name: "cpf",
  description: "Consulta CPF",
  commands: ["cpf"],
  usage: `${PREFIX}cpf`,

  handle: async ({ sendReply, sender }) => {

    await sendReply(`🗂️ 𝐂𝐎𝐍𝐒𝐔𝐋𝐓𝐀𝐍𝐃𝐎...

████████████`);

    await delay(3000);

    const motivo = motivos[Math.floor(Math.random()*motivos.length)];

    await sendReply(`🗂️━━━━━━━━━━━━━━━━━━🗂️

👤 𝐍𝐨𝐦𝐞

${sender}

📄 𝐂𝐏𝐅

${gerarCPF()}

📌 𝐒𝐢𝐭𝐮𝐚𝐜̧𝐚̃𝐨

🔴 𝐏𝐫𝐨𝐜𝐮𝐫𝐚𝐝𝐨 𝐩𝐞𝐥𝐚 𝐑𝐞𝐜𝐞𝐢𝐭𝐚 𝐅𝐞𝐝𝐞𝐫𝐚𝐥.

⚠️ 𝐌𝐨𝐭𝐢𝐯𝐨

${motivo}

🗂️━━━━━━━━━━━━━━━━━━🗂️`);

  },
};