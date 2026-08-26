import { PREFIX } from "../../config.js";
import { listAfkMembers } from "../../utils/afkManager.js";

export default {
  name: "lafk",

  description:
    "Lista membros que estão AFK há 7 dias ou mais.",

  commands: [
    "lafk",
    "afk-list",
    "lista-afk",
    "listafk"
  ],

  usage: `${PREFIX}lafk`,

  handle: async ({
    sendReply,
    isGroup,
    from
  }) => {

    try {

      if (!isGroup) {
        return sendReply(
`⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧

      🜏 𝐋𝐈𝐒𝐓𝐀 𝐀𝐅𝐊

┃ ❌ Este comando só pode ser
┃ utilizado dentro de grupos.

⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧`
        );
      }

      const members =
        await listAfkMembers(from);

      if (!members.length) {
        return sendReply(
`⛓️━━━━━━━━━━━━━━━━━━━━━━━━━━⛓️

        🖤 𝐋𝐈𝐒𝐓𝐀 𝐀𝐅𝐊

┃ ☑️ Nenhum membro está AFK
┃    há 7 dias ou mais.

┃ Todos ainda estão respirando
┃ por aqui. 💀

⛓️━━━━━━━━━━━━━━━━━━━━━━━━━━⛓️`
        );
      }

      const now = Date.now();

      const lines = members.map(
        (member, index) => {

          const days = Math.floor(
            (now - member.lastMessage) /
            (24 * 60 * 60 * 1000)
          );

          return (
`┃ ${String(index + 1).padStart(2, "0")} ┃ @${member.jid.split("@")[0]}
┃    ☠️ Inativo há: ${days} dias`
          );
        }
      );

      await sendReply(
`⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧
        ☠️ 𝐋𝐈𝐒𝐓𝐀 𝐀𝐅𝐊 ☠️
⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧

┃ 🩸 Membros sem atividade
┃    durante 7 dias ou mais:

╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣

${lines.join("\n\n")}

╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣
┃ ⚠️ Esses membros estão
┃    elegíveis para ${PREFIX}bafk
╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣

        ⛓️ 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧`,
        {
          mentions: members.map(
            member => member.jid
          )
        }
      );

    } catch (error) {

      console.error(
        "[LAFK ERROR]",
        error
      );

      await sendReply(
`☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️

        ❌ 𝐄𝐑𝐑𝐎 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀 𝐀𝐅𝐊

┃ Não foi possível consultar
┃ os membros inativos.

┃ ⚙️ ${error.message}

☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️`
      );
    }
  }
};