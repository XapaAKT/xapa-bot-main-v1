/**
 * Desenvolvido por: Xapa
 * Refatorado por: Xapa
 *
 * @author Xapa
 */
import { PREFIX } from "../../config.js";
import { DangerError, WarningError } from "../../errors/index.js";
import { checkIfMemberIsMuted, unmuteMember } from "../../utils/database.js";
import { onlyNumbers } from "../../utils/index.js";

export default {
  name: "unmute",
  description: "Desativa o mute de um membro ou de todos do grupo",
  commands: ["unmute", "desmutar"],
  usage: `${PREFIX}unmute @usuario\n${PREFIX}unmute @todos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, sendSuccessReply, sendErrorReply, args, isGroup, replyLid, getGroupMetadata }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    const groupMetadata = await getGroupMetadata();
    const participants = groupMetadata.participants.filter(p =>!p.id.includes("status"));

    // UNMUTE @TODOS
    if (args[0]?.toLowerCase() === "@todos" || args[0]?.toLowerCase() === "todos") {
      const mutados = participants.filter(p => checkIfMemberIsMuted(remoteJid, p.id));

      if (mutados.length === 0) {
        throw new WarningError("Ninguém está mutado neste grupo.");
      }

      for (const member of mutados) {
        unmuteMember(remoteJid, member.id);
      }

      await sendSuccessReply(`🔊 *UNMUTE GERAL*\n\n${mutados.length} membros foram desmutados. Podem voltar a falar.`);
      return;
    }

    // UNMUTE INDIVIDUAL
    if (!args.length &&!replyLid) {
      throw new DangerError(
        `Você precisa mencionar um usuário, responder à mensagem ou usar @todos.\n\nExemplo: ${PREFIX}unmute @fulano`
      );
    }

    const userId = replyLid
     ? replyLid
      : args[0]
     ? `${onlyNumbers(args[0])}@lid`
      : null;

    if (!checkIfMemberIsMuted(remoteJid, userId)) {
      throw new WarningError(`Este usuário não está silenciado!`);
    }

    unmuteMember(remoteJid, userId);
    await sendSuccessReply(`🔊 Usuário @${onlyNumbers(userId)} desmutado com sucesso!`, [userId]);
  },
};