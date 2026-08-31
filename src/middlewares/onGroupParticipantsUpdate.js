/**
 * Evento chamado quando um usuário
 * entra ou sai de um grupo de WhatsApp.
 *
 * @author Xapa
 */

import fs from "node:fs";

import { BOT_LID } from "../config.js";
import { exitMessage, welcomeMessage } from "../messages.js";
import { getProfileImageData } from "../services/baileys.js";
import { getBlacklistEntry } from "../services/blacklist.js";

import {
  isActiveExitGroup,
  isActiveGroup,
  isActiveWelcomeGroup,
  deactivateGroup,
} from "../utils/database.js";

import {
  extractUserLid,
  onlyNumbers,
} from "../utils/index.js";

import { errorLog } from "../utils/logger.js";

import {
  markMemberJoined,
  removeMember,
} from "../utils/afkManager.js";

export async function onGroupParticipantsUpdate({
  data,
  remoteJid,
  socket,
  action,
}) {
  try {
    if (!remoteJid.endsWith("@g.us")) {
      return;
    }

    const normalizedBotLid = String(BOT_LID).replace(/:[0-9]+(?=@)/g, "");
    const normalizedUserLid = String(extractUserLid(data)).replace(
      /:[0-9]+(?=@)/g,
      "",
    );

    if (action === "add" && normalizedUserLid === normalizedBotLid) {
      deactivateGroup(remoteJid);
    }

    if (!isActiveGroup(remoteJid)) {
      return;
    }

    const userLid = extractUserLid(data);

    /*
     * ==========================
     * SISTEMA AFK
     * ==========================
     */

    try {
      if (action === "add") {
        // Inicia o contador do membro.
        await markMemberJoined(
          remoteJid,
          userLid
        );
      }

      if (action === "remove") {
        // Remove o membro do controle AFK/registro.
        await removeMember(
          remoteJid,
          userLid
        );
      }
    } catch (afkError) {
      errorLog(
        `Erro ao atualizar sistema AFK: ${afkError.message}`
      );
    }

    /*
     * ==========================
     * ALERTA DE BLACKLIST
     * ==========================
     */

    if (action === "add") {
      const blacklistEntry =
        await getBlacklistEntry(userLid);

      if (blacklistEntry) {
        await socket.sendMessage(remoteJid, {
          text: `🚨 *ALERTA DE BLACKLIST* 🚨

Um usuário presente na blacklist acabou de entrar neste grupo.

👤 ${blacklistEntry.mention}
📱 ${blacklistEntry.number}
📝 Motivo: ${
            blacklistEntry.reason ||
            "Não informado"
          }

⚠️ Fiquem atentos!`,
          mentions: [userLid],
        });
      }
    }

    /*
     * ==========================
     * BOAS-VINDAS
     * ==========================
     */

    if (
      isActiveWelcomeGroup(remoteJid) &&
      action === "add"
    ) {
      const {
        buffer,
        profileImage,
      } = await getProfileImageData(
        socket,
        userLid
      );

      const hasMemberMention =
        welcomeMessage.includes("@member");

      const mentions = [];
      let finalWelcomeMessage =
        welcomeMessage;

      if (hasMemberMention) {
        const userNumber =
          onlyNumbers(userLid);

        finalWelcomeMessage =
          welcomeMessage.replace(
            "@member",
            `@${userNumber}`
          );

        mentions.push(userLid);
      }

      if (buffer) {
        try {
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: finalWelcomeMessage,
            mentions,
          });
        } catch {
          await socket.sendMessage(remoteJid, {
            text: finalWelcomeMessage,
            mentions,
          });
        }
      } else {
        await socket.sendMessage(remoteJid, {
          text: finalWelcomeMessage,
          mentions,
        });
      }

      if (
        !profileImage.includes(
          "default-user"
        )
      ) {
        fs.unlinkSync(profileImage);
      }
    }

    /*
     * ==========================
     * SAÍDA
     * ==========================
     */

    else if (
      isActiveExitGroup(remoteJid) &&
      action === "remove"
    ) {
      const {
        buffer,
        profileImage,
      } = await getProfileImageData(
        socket,
        userLid
      );

      const hasMemberMention =
        exitMessage.includes("@member");

      const mentions = [];
      let finalExitMessage =
        exitMessage;

      if (hasMemberMention) {
        const userNumber =
          onlyNumbers(userLid);

        finalExitMessage =
          exitMessage.replace(
            "@member",
            `@${userNumber}`
          );

        mentions.push(userLid);
      }

      if (buffer) {
        try {
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: finalExitMessage,
            mentions,
          });
        } catch {
          await socket.sendMessage(remoteJid, {
            text: finalExitMessage,
            mentions,
          });
        }
      } else {
        await socket.sendMessage(remoteJid, {
          text: finalExitMessage,
          mentions,
        });
      }

      if (
        !profileImage.includes(
          "default-user"
        )
      ) {
        fs.unlinkSync(profileImage);
      }
    }

  } catch (error) {
    errorLog(
      `Erro em onGroupParticipantsUpdate: ${error.message}`
    );

    errorLog(
      JSON.stringify(
        error,
        null,
        2
      )
    );
  }
}