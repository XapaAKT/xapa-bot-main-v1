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
  const numbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  for (const factor of [10, 11]) {
    const total = numbers.reduce((sum, number, index) => sum + number * (factor - index), 0);
    numbers.push((total * 10) % 11 % 10);
  }

  return `${numbers.slice(0, 3).join("")}.${numbers.slice(3, 6).join("")}.${numbers.slice(6, 9).join("")}-${numbers.slice(9).join("")}`;
}

export default {
  name: "cpf",
  description: "Consulta CPF",
  commands: ["cpf"],
  usage: `${PREFIX}cpf`,

  handle: async ({ sendReply, userLid }) => {
    const nome = userLid?.split("@")[0] || "cidadão misterioso";

    await sendReply(`╭━━━〔 🕵️‍♂️ 𝐂𝐏𝐅 𝐒𝐄𝐂𝐑𝐄𝐓𝐎 〕━━━╮
┃ 🔐 Acessando o banco de dados...
┃ ██████████ 100%
╰━━━━━━━━━━━━━━━━━━━━━━╯`);

    await delay(3000);

    const motivo = motivos[Math.floor(Math.random()*motivos.length)];

    await sendReply(`╭━━━〔 🗂️ 𝐃𝐎𝐒𝐒𝐈𝐄̂ 𝐃𝐎 𝐂𝐏𝐅 〕━━━╮

👤 𝐍𝐨𝐦𝐞: ${nome}

📄 𝐂𝐏𝐅: ${gerarCPF()}

📌 𝐒𝐢𝐭𝐮𝐚𝐜̧𝐚̃𝐨: 🔴 PROCURADO

⚠️ 𝐀𝐜𝐮𝐬𝐚𝐜̧𝐚̃𝐨:
${motivo}

╰━━━〔 🚨 Receita Federal do XIC 〕━━━╯`);

  },
};