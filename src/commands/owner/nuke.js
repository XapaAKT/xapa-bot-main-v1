import { OWNER_LID } from "../../config.js";

export default {
  name: "nuke",
  commands: ["nuke"],

  handle: async ({
    socket,
    remoteJid,
    userLid,
    sendReply
  }) => {

    if (userLid !== OWNER_LID) return;

    if (!remoteJid.endsWith("@g.us"))
      return sendReply("⛓️ Apenas grupos.");

    const metadata = await socket.groupMetadata(remoteJid);


    // Mensagem inicial
    await sendReply(`
╔═══════☣═══════╗
     𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 𝐍𝐔𝐊𝐄
╚═══════☣═══════╝

🕯️ 𝕬𝖘 𝖑𝖚𝖟𝖊𝖘 𝖘𝖊 𝖆𝖕𝖆𝖌𝖆𝖒.
⛓️ 𝕬𝖘 𝖈𝖔𝖗𝖗𝖊𝖓𝖙𝖊𝖘 𝖘𝖊 𝖗𝖔𝖒𝖕𝖊𝖒.
🌹 𝕺 𝖏𝖆𝖗𝖉𝖎𝖒 𝖋𝖊𝖈𝖍𝖆 𝖘𝖊𝖚𝖘 𝖕𝖔𝖗𝖙õ𝖊𝖘.

𝕺𝖇𝖗𝖎𝖌𝖆𝖉𝖔 𝖕𝖊𝖑𝖔𝖘 𝖒𝖔𝖒𝖊𝖓𝖙𝖔𝖘.
𝕺𝖇𝖗𝖎𝖌𝖆𝖉𝖔 𝖕𝖊𝖑𝖆𝖘 𝖗𝖎𝖘𝖆𝖉𝖆𝖘.
𝕺𝖇𝖗𝖎𝖌𝖆𝖉𝖔 𝖕𝖊𝖑𝖆𝖘 𝖙𝖗𝖊𝖙𝖆𝖘.

❝ 𝕹𝖔𝖙𝖍𝖎𝖓𝖌 𝖑𝖆𝖘𝖙𝖘 𝖋𝖔𝖗𝖊𝖛𝖊𝖗 ❞

𖤐 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
`);



    // Contagem regressiva
    for(let i = 10; i >= 0; i--){

      await sendReply(`
☣ 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 𝐍𝐔𝐊𝐄

⏳ 𝕯𝖊𝖘𝖙𝖗𝖚𝖎çã𝖔 𝖊𝖒...

『 ${i} 』
`);

      await new Promise(r => setTimeout(r,1000));
    }


    let removidos = 0;
    const total = metadata.participants.length;


    for(const p of metadata.participants){

      const jid = p.id;

      if(jid === OWNER_LID)
        continue;

      if(jid === socket.user.id)
        continue;


      try{

        await socket.groupParticipantsUpdate(
          remoteJid,
          [jid],
          "remove"
        );

        removidos++;

        if(removidos % 5 === 0){

          await sendReply(`
☣ 𝕽𝖊𝖒𝖔𝖛𝖊𝖓𝖉𝖔 𝖒𝖊𝖒𝖇𝖗𝖔𝖘...

『 ${removidos}/${total} 』
`);

        }

        await new Promise(r=>setTimeout(r,800));

      }catch{}

    }


    await sendReply(`
╔═══════☣═══════╗
     𝐍𝐔𝐊𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐎
╚═══════☣═══════╝

☣ 𝕿𝖔𝖉𝖔𝖘 𝖋𝖔𝖗𝖆𝖒 𝖈𝖔𝖓𝖘𝖚𝖒𝖎𝖉𝖔𝖘.

⛓️ 𝕹ã𝖔 𝖍á 𝖒𝖆𝖎𝖘 𝖓𝖆𝖉𝖆.
🌹 𝕬𝖕𝖊𝖓𝖆𝖘 𝖘𝖎𝖑ê𝖓𝖈𝖎𝖔.

𖤐 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
`);



    await new Promise(r=>setTimeout(r,3000));

    await socket.groupLeave(remoteJid);

  }
};