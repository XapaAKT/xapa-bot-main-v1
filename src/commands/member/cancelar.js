import { PREFIX } from "../../config.js";

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const motivos = [
  "𝐂𝐨𝐥𝐨𝐜𝐨𝐮 𝐟𝐞𝐢𝐣𝐚̃𝐨 𝐩𝐨𝐫 𝐛𝐚𝐢𝐱𝐨 𝐝𝐨 𝐚𝐫𝐫𝐨𝐳.",
  "𝐂𝐨𝐦𝐞𝐮 𝐩𝐢𝐳𝐳𝐚 𝐜𝐨𝐦 𝐤𝐞𝐭𝐜𝐡𝐮𝐩.",
  "𝐂𝐡𝐚𝐦𝐨𝐮 𝐛𝐨𝐥𝐚𝐜𝐡𝐚 𝐝𝐞 𝐛𝐢𝐬𝐜𝐨𝐢𝐭𝐨.",
  "𝐃𝐢𝐬𝐬𝐞 𝐪𝐮𝐞 𝐌𝐢𝐨𝐣𝐨 𝐞́ 𝐦𝐞𝐥𝐡𝐨𝐫 𝐜𝐫𝐮.",
  "𝐂𝐨𝐥𝐨𝐜𝐨𝐮 𝐥𝐞𝐢𝐭𝐞 𝐚𝐧𝐭𝐞𝐬 𝐝𝐨 𝐜𝐞𝐫𝐞𝐚𝐥."
];

export default {
  name: "cancelar",
  description: "Cancela alguém",
  commands: ["cancelar"],
  usage: `${PREFIX}cancelar`,
  
  handle: async ({ sendReply, sender }) => {
    await sendReply(`🚨 𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐌𝐄𝐍𝐓𝐎...
  
████████`);
    
    await delay(3000);
    
    const motivo = motivos[Math.floor(Math.random() * motivos.length)];
    const seguidores = (Math.random() * 9000000 + 500000).toLocaleString("pt-BR");
    
    await sendReply(`🚨━━━━━━━━━━━━━━━━━━🚨
🌐 𝐈𝐍𝐓𝐄𝐑𝐍𝐄𝐓
👤 ${sender}
❌ 𝐀𝐜𝐚𝐛𝐚 𝐝𝐞 𝐬𝐞𝐫 𝐜𝐚𝐧𝐜𝐞𝐥𝐚𝐝𝐨.
📄 𝐌𝐨𝐭𝐢𝐯𝐨
${motivo}
📉 𝐒𝐞𝐠𝐮𝐢𝐝𝐨𝐫𝐞𝐬 𝐩𝐞𝐫𝐝𝐢𝐝𝐨𝐬
${seguidores}
🚨━━━━━━━━━━━━━━━━━━🚨`);
  }
};