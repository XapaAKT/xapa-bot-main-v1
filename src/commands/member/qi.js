import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toFancy = (text) => {
  text = String(text); // <- FORÇA VIRAR STRING
  const map = {
    'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌',
    'N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
    'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦',
    'n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',' ':' '
  };
  return text.split('').map(c => map[c] || c).join('');
};

const barra = (pct) => {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${toFancy(pct + '%')}`;
};

const box = (title, content) => {
  return `☠️⛧━━━━━𖤐━━━━━☠️
┃ ${toFancy(title)}
┃
${content.split('\n').map(l => `┃ ${l}`).join('\n')}
☠️⛧━━━━━𖤐━━━━━☠️`;
};

const comentarios = [
  "𝐔𝐦𝐚 𝐩𝐨𝐫𝐭𝐚 𝐩𝐨𝐬𝐮𝐢 𝐦𝐚𝐢𝐬 𝐩𝐫𝐨𝐜𝐞𝐬𝐚𝐦𝐞𝐧𝐭𝐨.",
  "𝐀𝐢𝐧𝐝𝐚 𝐞𝐬𝐭𝐚́ 𝐜𝐚𝐫𝐞𝐠𝐚𝐧𝐝𝐨 𝐨 𝐩𝐞𝐧𝐬𝐚𝐦𝐞𝐧𝐭𝐨...",
  "𝐎 𝐆𝐨𝐠𝐥𝐞 𝐭𝐞 𝐩𝐞𝐬𝐪𝐮𝐢𝐬𝐚.",
  "𝐂𝐚𝐩𝐚𝐳 𝐝𝐞 𝐞𝐬𝐪𝐮𝐞𝐜𝐞𝐫 𝐚 𝐩𝐫𝐨́𝐩𝐫𝐢𝐚 𝐬𝐞𝐧𝐡𝐚.",
  "𝐍𝐞𝐦 𝐨 𝐂𝐡𝐚𝐭𝐆𝐏𝐓 𝐜𝐨𝐧𝐬𝐞𝐠𝐮𝐢𝐮 𝐞𝐱𝐩𝐥𝐢𝐜𝐚𝐫.",
  "𝐂𝐨𝐧𝐟𝐮𝐧𝐝𝐞 𝐚𝐫𝐨𝐳 𝐜𝐨𝐦 𝐖𝐢-𝐅𝐢.",
  "𝐄𝐬𝐭𝐚́ 𝐧𝐨 𝐧𝐢́𝐯𝐞𝐥 𝐝𝐞 𝐮𝐦𝐚 𝐛𝐚𝐭𝐚𝐭𝐚.",
  "𝐅𝐨𝐢 𝐝𝐞𝐬𝐥𝐢𝐠𝐚𝐝𝐨 𝐩𝐨𝐫 𝐞𝐱𝐜𝐞𝐬𝐬𝐨 𝐝𝐞 𝐛𝐮𝐫𝐢𝐜𝐞."
];

const faixas = [
  { min: 0, max: 40, msg: "📉 𝐐𝐈 𝐝𝐞 𝐓𝐨𝐫𝐚𝐝𝐞𝐢𝐫𝐚" },
  { min: 41, max: 70, msg: "📊 𝐐𝐈 𝐝𝐞 𝐏𝐚̃𝐨 𝐜𝐨𝐦 𝐎𝐯𝐨" },
  { min: 71, max: 100, msg: "📈 𝐐𝐈 𝐌𝐞́𝐝𝐢𝐨" },
  { min: 101, max: 130, msg: "🧠 𝐐𝐈 𝐑𝐞𝐬𝐩𝐞𝐢𝐭𝐚́𝐯𝐞𝐥" },
  { min: 131, max: 200, msg: "🤯 𝐐𝐈 𝐝𝐞 𝐆𝐞̂𝐧𝐢𝐨" }
];

export default {
  name: "qi",
  description: "Calcula o QI de alguém.",
  commands: ["qi"],
  usage: `${PREFIX}qi @mencao`,

  handle: async ({ sendReply, socket, webMessage, mentionedJidList }) => {
    try {
      let alvoJid = sender = webMessage.key.participant || webMessage.key.remoteJid;
      let alvoNome = "𝐕𝐨𝐜𝐞̂";

      if (mentionedJidList?.length) {
        alvoJid = mentionedJidList[0];
      }

      // Pega nome e força pra string
      alvoNome = String(await getUserName(webMessage, alvoJid, "𝐔𝐬𝐮𝐚𝐫𝐢𝐨"));

      const etapas = [
        { txt: "𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 𝐎 𝐂𝐄́𝐑𝐄𝐁𝐑𝐎...", pct: 0 },
        { txt: "𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎...", pct: 35 },
        { txt: "𝐅𝐀𝐙𝐄𝐍𝐃𝐎 𝐂𝐀́𝐋𝐂𝐔𝐋𝐎𝐒...", pct: 72 },
        { txt: "𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎...", pct: 100 },
      ];

      let msg = box(`𝐓𝐄𝐒𝐓𝐄 𝐃𝐄 𝐐𝐈`, `👤 𝐀𝐥𝐯𝐨: ${alvoNome}\n\n${etapas[0].txt}\n${barra(etapas[0].pct)}`);
      const sent = await sendReply(msg);

      for (let i = 1; i < etapas.length; i++) {
        await delay(1200);
        msg = box(`𝐓𝐄𝐒𝐓𝐄 𝐃𝐄 𝐐𝐈`, `👤 𝐀𝐥𝐯𝐨: ${alvoNome}\n\n${etapas[i].txt}\n${barra(etapas[i].pct)}`);
        await socket.sendMessage(webMessage.key.remoteJid, { text: msg, edit: sent.key });
      }

      await delay(800);
      const qi = Math.floor(Math.random() * 201);
      const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
      const faixa = faixas.find(f => qi >= f.min && qi <= f.max);

      const resultado = box(`𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 𝐃𝐎 𝐐𝐈`,
`👤 𝐀𝐥𝐯𝐨: ${alvoNome}
🧠 𝐐𝐈: ${toFancy(qi)}
${faixa.msg}

💬 𝐂𝐨𝐦𝐞𝐧𝐭𝐚́𝐫𝐢𝐨:
${comentario}

${toFancy(`Use ${PREFIX}qi @alguem`)}`
      );

      await socket.sendMessage(webMessage.key.remoteJid, { text: resultado, edit: sent.key });

    } catch (error) {
      await sendReply(`☠️⛧━━━━━𖤐━━━━━☠️
┃ 𝐄𝐑𝐎 𝐈𝐍𝐓𝐄𝐑𝐍𝐎
┃ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 :: qi
┃ 📄 ${error.message}
☠️⛧━━━━━𖤐━━━━━☠️`);
    }
  },
};