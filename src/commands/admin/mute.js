/**
 * Desenvolvido por: Xapa
 * Refatorado por: In
 *
 * @author Chains
 */
import { BOT_LID, OWNER_LID, PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";
import { checkIfMemberIsMuted, muteMember, unmuteMember } from "../../utils/database.js";
import { onlyNumbers } from "../../utils/index.js";

export default {
  name: "mute",
  description: "Silencia um usuário ou todos do grupo.",
  commands: ["mute", "mutar", "silenciar"],
  usage: `${PREFIX}mute @usuario\n${PREFIX}mute @todos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    remoteJid,
    replyLid,
    sendErrorReply,
    sendSuccessReply,
    getGroupMetadata,
    isGroup,
    userLid,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    const groupMetadata = await getGroupMetadata();
    const participants = groupMetadata.participants.filter(p =>!p.id.includes("status"));

    // MUTE @TODOS
    if (args[0]?.toLowerCase() === "@todos" || args[0]?.toLowerCase() === "todos") {
      const muteaveis = participants.filter(p =>
        p.id!== BOT_LID &&
        p.id!== OWNER_LID &&
       !p.admin &&
        p.id!== userLid // não muta quem deu o comando
      );

      let mutados = 0;
      let jaMutados = 0;

      for (const member of muteaveis) {
        if (checkIfMemberIsMuted(remoteJid, member.id)) {
          jaMutados++;
          continue;
        }
        muteMember(remoteJid, member.id);
        mutados++;
      }

      await sendSuccessReply(
        `🔇 *MUTE GERAL ATIVADO*\n\n` +
        `✅ ${mutados} membros silenciados\n` +
        `⚠️ ${jaMutados} já estavam mutados\n` +
        `🛡️ Admins, dono e bot foram ignorados`
      );
      return;
    }

    // MUTE INDIVIDUAL
    if (!args.length &&!replyLid) {
      throw new DangerError(
        `Você precisa mencionar um usuário, responder à mensagem ou usar @todos.\n\nExemplo: ${PREFIX}mute @fulano`
      );
    }

    const userId = replyLid
     ? replyLid
      : args[0]
     ? `${onlyNumbers(args[0])}@lid`
      : null;

    const targetUserNumber = onlyNumbers(userId);

    if (OWNER_LID && userId === OWNER_LID) {
      throw new DangerError("Você não pode mutar o dono do bot!");
    }

    if (BOT_LID && userId === BOT_LID) {
      throw new DangerError("Você não pode mutar o bot.");
    }

    const targetMember = participants.find(p => p.id === userId);

    if (!targetMember) {
      return sendErrorReply(`O usuário @${targetUserNumber} não está neste grupo.`, [userId]);
    }

    if (targetMember.admin) {
      throw new DangerError("Você não pode mutar um administrador.");
    }

    if (userId === userLid) {
      throw new DangerError("Você não pode se mutar kkkk");
    }

    if (checkIfMemberIsMuted(remoteJid, userId)) {
      return sendErrorReply(`O usuário @${targetUserNumber} já está silenciado neste grupo.`, [userId]);
    }

    muteMember(remoteJid, userId);

    await sendSuccessReply(`🔇 @${targetUserNumber} foi mutado com sucesso neste grupo!`, [userId]);
  },
};