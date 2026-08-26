import { PREFIX } from "../../config.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const causas = [
  "𝐅𝐨𝐢 𝐚𝐭𝐫𝐨𝐩𝐞𝐥𝐚𝐝𝐨 𝐩𝐨𝐫 𝐮𝐦 𝐩𝐚𝐭𝐨.",
  "𝐌𝐨𝐫𝐫𝐞𝐮 𝐝𝐞 𝐯𝐞𝐫𝐠𝐨𝐧𝐡𝐚 𝐚𝐥𝐡𝐞𝐢𝐚.",
  "𝐂𝐨𝐦𝐞𝐮 𝐩𝐢𝐳𝐳𝐚 𝐜𝐨𝐦 𝐤𝐞𝐭𝐜𝐡𝐮𝐩.",
  "𝐂𝐚𝐢𝐮 𝐝𝐚 𝐜𝐚𝐝𝐞𝐢𝐫𝐚.",
  "𝐅𝐨𝐢 𝐞𝐬𝐦𝐚𝐠𝐚𝐝𝐨 𝐩𝐨𝐫 𝐮𝐦𝐚 𝐜𝐚𝐩𝐢𝐯𝐚𝐫𝐚.",
  "𝐅𝐨𝐢 𝐚𝐭𝐚𝐜𝐚𝐝𝐨 𝐩𝐨𝐫 𝐮𝐦 𝐩𝐨𝐦𝐛𝐨.",
  "𝐃𝐞𝐬𝐚𝐟𝐢𝐨𝐮 𝐮𝐦 𝐠𝐚𝐥𝐨.",
  "𝐄𝐬𝐜𝐨𝐫𝐫𝐞𝐠𝐨𝐮 𝐧𝐨 𝐬𝐚𝐛𝐚̃𝐨.",
  "𝐌𝐨𝐫𝐫𝐞𝐮 𝐝𝐞𝐩𝐨𝐢𝐬 𝐝𝐞 𝐜𝐨𝐦𝐞𝐫 𝟑𝟕 𝐜𝐨𝐱𝐢𝐧𝐡𝐚𝐬.",
  "𝐅𝐨𝐢 𝐞𝐧𝐠𝐨𝐥𝐢𝐝𝐨 𝐩𝐞𝐥𝐨 𝐚𝐬𝐩𝐢𝐫𝐚𝐝𝐨𝐫.",
  "𝐅𝐨𝐢 𝐞𝐬𝐩𝐚𝐧𝐜𝐚𝐝𝐨 𝐩𝐨𝐫 𝐮𝐦𝐚 𝐯𝐞𝐥𝐡𝐚.",
  "𝐅𝐨𝐢 𝐞𝐥𝐞𝐭𝐫𝐨𝐜𝐮𝐭𝐚𝐝𝐨 𝐩𝐞𝐥𝐨 𝐜𝐚𝐫𝐫𝐞𝐠𝐚𝐝𝐨𝐫.",
  "𝐎 𝐚𝐫𝐫𝐨𝐳 𝐜𝐨𝐛𝐫𝐨𝐮 𝐯𝐢𝐧𝐠𝐚𝐧𝐜̧𝐚.",
  "𝐎 𝐛𝐨𝐥𝐨 𝐝𝐞 𝐩𝐨𝐭𝐞 𝐞𝐬𝐭𝐚𝐯𝐚 𝐚𝐫𝐦𝐚𝐝𝐨.",
  "𝐅𝐨𝐢 𝐞𝐱𝐩𝐮𝐥𝐬𝐨 𝐝𝐚 𝐭𝐞𝐫𝐫𝐚.",
  "𝐅𝐨𝐢 𝐚𝐛𝐝𝐮𝐳𝐢𝐝𝐨.",
  "𝐂𝐨𝐫𝐫𝐞𝐮 𝐝𝐞𝐦𝐚𝐢𝐬.",
  "𝐅𝐨𝐢 𝐚𝐟𝐨𝐠𝐚𝐝𝐨 𝐧𝐨 𝐛𝐚𝐧𝐡𝐨.",
  "𝐎 𝐦𝐢𝐨𝐣𝐨 𝐞𝐱𝐩𝐥𝐨𝐝𝐢𝐮.",
  "𝐃𝐞𝐬𝐚𝐟𝐢𝐨𝐮 𝐮𝐦𝐚 𝐠𝐚𝐥𝐢𝐧𝐡𝐚."
];

const epitafios = [
  "𝐑𝐈𝐏.",
  "𝐃𝐞𝐬𝐜𝐚𝐧𝐬𝐞 𝐞𝐦 𝐩𝐚𝐳.",
  "𝐕𝐢𝐫𝐨𝐮 𝐞𝐬𝐭𝐚𝐭𝐢́𝐬𝐭𝐢𝐜𝐚.",
  "𝐅𝐨𝐢 𝐝𝐞 𝐛𝐚𝐬𝐞.",
  "𝐍𝐚̃𝐨 𝐯𝐨𝐥𝐭𝐚 𝐦𝐚𝐢𝐬.",
  "𝐀𝐜𝐚𝐛𝐨𝐮 𝐨 𝐠𝐚𝐦𝐞.",
  "𝐏𝐫𝐞𝐬𝐬 𝐅.",
  "𝐒𝐞𝐦 𝐫𝐞𝐬𝐩𝐚𝐰𝐧."
];

export default {
  name: "morte",
  description: "Descobre como você vai morrer.",
  commands: ["morte"],
  usage: `${PREFIX}morte`,

  handle: async ({
    sendReply,
    sender,
    mentionedJidList,
    socket
  }) => {

    let alvo = sender;

    if (mentionedJidList?.length){
      const contato = await socket.onWhatsApp(mentionedJidList[0]);
      alvo = contato?.[0]?.notify || contato?.[0]?.verifiedName || "Usuário";
    }

    await sendReply(`☠️ 𝐂𝐎𝐍𝐒𝐔𝐋𝐓𝐀𝐍𝐃𝐎 𝐎 𝐃𝐄𝐒𝐓𝐈𝐍𝐎...

█░░░░░░░░░`);

    await delay(1200);

    await sendReply(`☠️ 𝐀𝐂𝐄𝐒𝐒𝐀𝐍𝐃𝐎 𝐀𝐒 𝐋𝐈𝐍𝐇𝐀𝐒 𝐃𝐎 𝐓𝐄𝐌𝐏𝐎...

████░░░░░`);

    await delay(1200);

    await sendReply(`☠️ 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐍𝐃𝐎 𝐎 𝐅𝐔𝐓𝐔𝐑𝐎...

██████████`);

    await delay(1800);

    const idade = Math.floor(Math.random()*91)+10;
    const causa = causas[Math.floor(Math.random()*causas.length)];
    const epitafio = epitafios[Math.floor(Math.random()*epitafios.length)];

    await sendReply(`☠️━━━━━━━━━━━━━━━━━━━━━━☠️
         𝐂𝐄𝐑𝐓𝐈𝐃𝐀̃𝐎 𝐃𝐄 𝐎́𝐁𝐈𝐓𝐎
━━━━━━━━━━━━━━━━━━━━━━
👤 𝐍𝐨𝐦𝐞
${alvo}
━━━━━━━━━━━━━━━━━━━━━━
📅 𝐈𝐝𝐚𝐝𝐞
${idade} 𝐚𝐧𝐨𝐬
━━━━━━━━━━━━━━━━━━━━━━
⚰️ 𝐂𝐚𝐮𝐬𝐚
${causa}
━━━━━━━━━━━━━━━━━━━━━━
🪦 ${epitafio}
☠️━━━━━━━━━━━━━━━━━━━━━━☠️`);
  }
};