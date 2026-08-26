export default {
  name: "metaai",
  description: "Teste Meta AI 4",
  commands: ["metaai"],
  usage: ".metaai",

  handle: async ({ socket, sendReply, remoteJid }) => {
    const jid = "103242709127222@lid";

    try {
      console.log("REMOTE JID:", remoteJid);
      console.log("TENTANDO ADICIONAR:", jid);

      const result = await socket.groupParticipantsUpdate(
        remoteJid,
        [jid],
        "add"
      );

      console.dir(result, { depth: null });

      await sendReply("Teste concluído. Veja o terminal.");
    } catch (e) {
      console.error("[META AI TESTE 4]", e);
      await sendReply(`Erro: ${e?.message || e}`);
    }
  },
};