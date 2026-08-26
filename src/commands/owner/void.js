import { OWNER_LID } from "../../config.js";

export default {
  name: "void",
  description: "Banir todos e sair do grupo",
  commands: ["void", "vazio"],
  usage: ".void",

  handle: async ({
    socket,
    remoteJid,
    userLid,
  }) => {

    if (userLid !== OWNER_LID) return;

    if (!remoteJid.endsWith("@g.us"))
      return;

    const metadata = await socket.groupMetadata(remoteJid);

    // Banir todos os membros
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
      }catch{}
    }

    // Sair do grupo
    await socket.groupLeave(remoteJid);
  }
};