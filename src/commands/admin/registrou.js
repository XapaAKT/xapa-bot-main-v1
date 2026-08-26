import { PREFIX } from "../../config.js";
import { markRegistered } from "../../utils/afkManager.js";

export default {
  name: "registrou",

  description:
    "Confirma o registro de um membro no grupo.",

  commands: [
    "registrou",
    "registrado",
    "registro"
  ],

  usage: `${PREFIX}registrou @membro`,

  handle: async ({
    sendReply,
    socket,
    from,
    msg,
    sender,
    isGroup,
    args
  }) => {

    try {

      if (!isGroup) {
        return sendReply(
`⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧

      🩸 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐃𝐄 𝐌𝐄𝐌𝐁𝐑𝐎

┃ ❌ Este comando só pode ser
┃ utilizado dentro de grupos.

⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧`
        );
      }

      const metadata =
        await socket.groupMetadata(from);

      const admin = metadata.participants.find(
        p =>
          p.id === sender &&
          (p.admin === "admin" ||
           p.admin === "superadmin")
      );

      if (!admin) {
        return sendReply(
`⛓️━━━━━━━━━━━━━━━━━━━━━━━━━━⛓️

        ☠️ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎

┃ Apenas administradores podem
┃ confirmar registros de membros.

┃ 🜏 Você não possui permissão
┃ para executar este comando.

⛓️━━━━━━━━━━━━━━━━━━━━━━━━━━⛓️`
        );
      }

      let target;

      if (
        msg?.message?.extendedTextMessage
          ?.contextInfo?.mentionedJid?.length
      ) {
        target =
          msg.message.extendedTextMessage
            .contextInfo.mentionedJid[0];
      }

      if (!target && args?.[0]) {
        target = args[0].replace(/\D/g, "");

        if (target) {
          target += "@s.whatsapp.net";
        }
      }

      if (!target) {
        return sendReply(
`🩸━━━━━━━━━━━━━━━━━━━━━━━━━━🩸

        ⚠️ 𝐌𝐄𝐌𝐁𝐑𝐎 𝐍Ã𝐎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐃𝐎

┃ Marque o membro que deseja
┃ confirmar como registrado.

┃ Exemplo:
┃ ${PREFIX}registrou @membro

🩸━━━━━━━━━━━━━━━━━━━━━━━━━━🩸`
        );
      }

      await markRegistered(from, target);

      await sendReply(
`⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧
        ⛓️ 𝐗𝐈𝐂-𝐁𝐎𝐓 ⛓️
⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧

        🩸 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐎

┃ 👤 𝐌𝐄𝐌𝐁𝐑𝐎:
┃ @${target.split("@")[0]}

┃ ☑️ Status: 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎
┃ 🛡️ Confirmado por: ADM
┃ ⏱️ Prazo de registro: encerrado

╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣
┃ 🜏 O membro foi oficialmente
┃    reconhecido pelo sistema.
╠━━━━━━━━━━━━━━━━━━━━━━━━━━╣

        🖤 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒 ⛓️
⛧━━━━━━━━━━━━━━━━━━━━━━━━━━⛧`,
        {
          mentions: [target]
        }
      );

    } catch (error) {

      console.error(
        "[REGISTROU ERROR]",
        error
      );

      await sendReply(
`☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️

        ❌ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐅𝐀𝐋𝐇𝐎𝐔

┃ Ocorreu um erro ao confirmar
┃ o registro do membro.

┃ ⚙️ ${error.message}

☠️━━━━━━━━━━━━━━━━━━━━━━━━━━☠️`
      );
    }
  }
};