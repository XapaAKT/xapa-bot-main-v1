import { PREFIX } from "../../config.js";
import {
  listAfkMembers,
  removeMember
} from "../../utils/afkManager.js";

export default {
  name: "bafk",

  description:
    "Bane membros que estão AFK há 7 dias ou mais.",

  commands: [
    "bafk",
    "ban-afk",
    "bfk",
    "banafk"
  ],

  usage: `${PREFIX}bafk`,

  handle: async ({
    sendReply,
    socket,
    from,
    sender,
    isGroup
  }) => {

    try {

      if (!isGroup) {
        return sendReply(
`⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧

        ☠️ 𝐁𝐀𝐍 𝐀𝐅𝐊

┃ ❌ Este comando só pode ser
┃ utilizado dentro de grupos.

⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧`
        );
      }

      const metadata =
        await socket.groupMetadata(from);

      const admin =
        metadata.participants.find(
          p =>
            p.id === sender &&
            (p.admin === "admin" ||
             p.admin === "superadmin")
        );

      if (!admin) {
        return sendReply(
`⛓️━━━━━━━━━━━━━━━━━━━━━━━━━━⛓️

        🩸 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎

┃ Apenas administradores podem
┃ executar o Ban-AFK.

⛓️━━━━━━━━━━━━━━━━━━━━━━━━━━⛓️`
        );
      }

      const members =
        await listAfkMembers(from);

      if (!members.length) {
        return sendReply(
`🖤━━━━━━━━━━━━━━━━━━━━━━━━━━🖤

        ☑️ 𝐍𝐄𝐍𝐇𝐔𝐌 𝐀𝐅𝐊

┃ Não existe nenhum membro
┃ elegível para Ban-AFK.

┃ ⏱️ Critério: 7 dias sem mensagem.

🖤━━━━━━━━━━━━━━━━━━━━━━━━━━🖤`
        );
      }

      const targets = [];

      for (const member of members) {

        try {

          await socket.groupParticipantsUpdate(
            from,
            [member.jid],
            "remove"
          );

          targets.push(member);

          await removeMember(
            from,
            member.jid
          );

        } catch (error) {

          console.error(
            `[BAFK] Falha ao remover ${member.jid}:`,
            error
          );
        }
      }

      if (!targets.length) {
        return sendReply(
`☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️

        ❌ 𝐁𝐀𝐍 𝐀𝐅𝐊 𝐅𝐀𝐋𝐇𝐎𝐔

┃ O bot encontrou membros AFK,
┃ porém não conseguiu removê-los.

┃ Verifique se o bot possui
┃ privilégios de administrador.

☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️`
        );
      }

      const list = targets.map(
        (member, index) =>
          `┃ ${index + 1}. @${member.jid.split("@")[0]}`
      );

      await sendReply(
`⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧
        ☠️ 𝐁𝐀𝐍 𝐀𝐅𝐊 ☠️
⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧

┃ 🩸 Limpeza de inativos concluída.

┃ ⏱️ Critério:
┃    7 dias sem enviar mensagem.

╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣

${list.join("\n")}

╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣
┃ 💀 Removidos: ${targets.length}
╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣

        ⛓️ 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧`,
        {
          mentions: targets.map(
            member => member.jid
          )
        }
      );

    } catch (error) {

      console.error(
        "[BAFK ERROR]",
        error
      );

      await sendReply(
`☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️

        ❌ 𝐄𝐑𝐑𝐎 𝐍𝐎 𝐁𝐀𝐍 𝐀𝐅𝐊

┃ ⚙️ ${error.message}

┃ Verifique se o bot é
┃ administrador do grupo.

☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️`
      );
    }
  }
};