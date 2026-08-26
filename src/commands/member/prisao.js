import { PREFIX } from "../../config.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const crimes = [
  "🍍 𝐂𝐨𝐦𝐞𝐫 𝐩𝐢𝐳𝐳𝐚 𝐜𝐨𝐦 𝐤𝐞𝐭𝐜𝐡𝐮𝐩.",
  "🍫 𝐑𝐨𝐮𝐛𝐚𝐫 𝐚 𝐮́𝐥𝐭𝐢𝐦𝐚 𝐛𝐚𝐫𝐫𝐚 𝐝𝐞 𝐜𝐡𝐨𝐜𝐨𝐥𝐚𝐭𝐞.",
  "🥄 𝐂𝐨𝐥𝐨𝐜𝐚𝐫 𝐟𝐞𝐢𝐣𝐚̃𝐨 𝐩𝐨𝐫 𝐜𝐢𝐦𝐚 𝐝𝐨 𝐚𝐫𝐫𝐨𝐳.",
  "🩴 𝐅𝐮𝐫𝐭𝐨 𝐝𝐞 𝐜𝐡𝐢𝐧𝐞𝐥𝐨.",
  "🥛 𝐂𝐨𝐥𝐨𝐜𝐚𝐫 𝐥𝐞𝐢𝐭𝐞 𝐚𝐧𝐭𝐞𝐬 𝐝𝐨 𝐧𝐞𝐬𝐜𝐚𝐮.",
  "🐔 𝐑𝐨𝐮𝐛𝐨 𝐝𝐞 𝐠𝐚𝐥𝐢𝐧𝐡𝐚 𝐧𝐨 𝐢𝐧𝐭𝐞𝐫𝐢𝐨𝐫.",
  "🍔 𝐂𝐨𝐦𝐞𝐫 𝐨 𝐥𝐚𝐧𝐜𝐡𝐞 𝐝𝐨 𝐚𝐦𝐢𝐠𝐨.",
  "📺 𝐃𝐚𝐫 𝐬𝐩𝐨𝐢𝐥𝐞𝐫 𝐝𝐞 𝐬𝐞́𝐫𝐢𝐞.",
  "📱 𝐌𝐚𝐧𝐝𝐚𝐫 '𝐛𝐨𝐦 𝐝𝐢𝐚' 𝐜𝐨𝐦 𝐟𝐥𝐨𝐫𝐳𝐢𝐧𝐡𝐚.",
  "💀 𝐔𝐬𝐚𝐫 𝐓𝐢𝐤𝐓𝐨𝐤 𝐞𝐦 𝐯𝐨𝐥𝐮𝐦𝐞 𝐦𝐚́𝐱𝐢𝐦𝐨."
];

export default {
  name: "prisao",
  description: "Prende um usuário.",
  commands: ["prisao"],
  usage: `${PREFIX}prisao @usuario`,

  handle: async ({
    sendReply,
    sender,
    mentionedJidList,
  }) => {

    const alvo = mentionedJidList?.[0] || sender;
    const nome = mentionedJidList?.[0] ? "@"+mentionedJidList[0].split("@")[0] : sender;

    const pena = Math.floor(Math.random() * 120) + 1;
    const crime = crimes[Math.floor(Math.random() * crimes.length)];

    await sendReply(`🚓 𝐏𝐎𝐋𝐈́𝐂𝐈𝐀 𝐃𝐎 𝐗𝐈𝐂

████░░░░░░ 𝟏𝟎%
███░░░░░░░ 𝟑𝟎%
██████░░░░ 𝟔𝟎%
██████████ 𝟏𝟎𝟎%

🔎 𝐋𝐨𝐜𝐚𝐥𝐢𝐳𝐚𝐧𝐝𝐨 𝐨 𝐬𝐮𝐬𝐩𝐞𝐢𝐭𝐨...`);

    await delay(3500);

    await sendReply({
      text: `⛓️━━━━━━━━━━━━━━━━━━━━━━⛓️

🚨 𝐏𝐑𝐈𝐒𝐀̃𝐎 𝐄𝐅𝐄𝐓𝐔𝐀𝐃𝐀

👤 𝐏𝐫𝐞𝐬𝐨:
${nome}

📜 𝐂𝐫𝐢𝐦𝐞:
${crime}

⚖️ 𝐏𝐞𝐧𝐚:

⛓️ ${pena} 𝐚𝐧𝐨𝐬 𝐝𝐞 𝐜𝐚𝐝𝐞𝐢𝐚.

🚫 𝐒𝐞𝐦 𝐝𝐢𝐫𝐞𝐢𝐭𝐨 𝐚 𝐟𝐢𝐚𝐧𝐜̧𝐚.

👮 𝐀𝐠𝐞𝐧𝐭𝐞 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐚́𝐯𝐞:
𝐗𝐈𝐂 𝐏𝐨𝐥𝐢𝐜𝐞

⛓️━━━━━━━━━━━━━━━━━━━━━━⛓️`,
      mentions: [alvo],
    });

  },
};