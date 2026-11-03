import { PREFIX } from "../../config.js";

const delay = (ms) => new Promise((resolve)=>setTimeout(resolve,ms));

const crimes = [
"𝐑𝐨𝐮𝐛𝐨𝐮 𝐚 𝐮́𝐥𝐭𝐢𝐦𝐚 𝐜𝐨𝐱𝐢𝐧𝐡𝐚.",
"𝐂𝐨𝐥𝐨𝐜𝐨𝐮 𝐟𝐞𝐢𝐣𝐚̃𝐨 𝐩𝐨𝐫 𝐛𝐚𝐢𝐱𝐨 𝐝𝐨 𝐚𝐫𝐫𝐨𝐳.",
"𝐂𝐨𝐦𝐞𝐮 𝐩𝐢𝐳𝐳𝐚 𝐜𝐨𝐦 𝐤𝐞𝐭𝐜𝐡𝐮𝐩.",
"𝐂𝐨𝐥𝐨𝐜𝐨𝐮 𝐚𝐧𝐚𝐧𝐚́𝐬 𝐧𝐚 𝐩𝐢𝐳𝐳𝐚.",
"𝐑𝐨𝐮𝐛𝐨𝐮 𝐨 𝐖𝐢-𝐅𝐢 𝐝𝐨 𝐯𝐢𝐳𝐢𝐧𝐡𝐨.",
"𝐃𝐞𝐮 𝐬𝐩𝐨𝐢𝐥𝐞𝐫 𝐝𝐚 𝐧𝐨𝐯𝐞𝐥𝐚 𝐞 𝐚𝐢𝐧𝐝𝐚 𝐝𝐢𝐬𝐬𝐞 𝐪𝐮𝐞 𝐟𝐨𝐢 𝐬𝐞𝐦 𝐪𝐮𝐞𝐫𝐞𝐫.",
"𝐔𝐬𝐨𝐮 𝐨 𝐠𝐫𝐮𝐩𝐨 𝐜𝐨𝐦𝐨 𝐜𝐨𝐟𝐫𝐞 𝐩𝐞𝐬𝐬𝐨𝐚𝐥 𝐝𝐞 𝐟𝐢𝐠𝐮𝐫𝐢𝐧𝐡𝐚𝐬.",
"𝐅𝐚𝐥𝐬𝐢𝐟𝐢𝐜𝐨𝐮 𝐮𝐦 𝐚𝐮́𝐝𝐢𝐨 𝐝𝐞 𝐛𝐨𝐦 𝐝𝐢𝐚."
];

export default {

name:"processo",

description:"Processo",

commands:["processo"],

usage:`${PREFIX}processo`,

handle:async({sendReply, sender, mentionedJidList, replyLid, isReply})=>{

await sendReply(`⚖️ 𝐀𝐂𝐄𝐒𝐒𝐀𝐍𝐃𝐎 𝐓𝐑𝐈𝐁𝐔𝐍𝐀𝐋...

████████`);

await delay(3000);

const alvoJid = mentionedJidList?.[0] || (isReply ? replyLid : null) || sender;
const marcado = Boolean(mentionedJidList?.[0] || (isReply && replyLid));
const alvoNome = marcado ? `@${alvoJid.split("@")[0]}` : "Você";

const crime=crimes[Math.floor(Math.random()*crimes.length)];

const multa=(Math.random()*9000+1000).toFixed(2);

await sendReply(`⚖️━━━━━━━━━━━━━━━━━━⚖️

🏛️ 𝐓𝐑𝐈𝐁𝐔𝐍𝐀𝐋 𝐅𝐄𝐃𝐄𝐑𝐀𝐋

👤 ${alvoNome}

❌ 𝐏𝐞𝐫𝐝𝐞𝐮 𝐨 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐨.

📄 𝐌𝐨𝐭𝐢𝐯𝐨

${crime}

💰 𝐌𝐮𝐥𝐭𝐚

𝐑$ ${multa}

⚖️━━━━━━━━━━━━━━━━━━⚖️`, marcado ? [alvoJid] : undefined);

}

};