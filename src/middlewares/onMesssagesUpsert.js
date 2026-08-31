/**
 * Evento chamado quando uma mensagem
 * é enviada para o grupo do WhatsApp
 *
 * @author Xapa
 */

import { DEVELOPER_MODE } from "../config.js";
import { handleBan, isOfficialBanSticker } from "../commands/admin/ban.js";
import { processJoinRequestAction } from "../events/group-join-request.js";

import { badMacHandler } from "../utils/badMacHandler.js";

import {
  checkIfMemberIsMuted,
} from "../utils/database.js";

import { dynamicCommand } from "../utils/dynamicCommand.js";

import { handleOwnerReplyAudio } from "../msg.js";

import {
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
  isAtLeastMinutesInPast,
} from "../utils/index.js";

import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";

import {
  errorLog,
  infoLog,
} from "../utils/logger.js";

import { customMiddleware } from "./customMiddleware.js";
import { isAdmin } from "./index.js";

import { messageHandler } from "./messageHandler.js";
import { isVip } from "../utils/vip.js";

import {
  onGroupParticipantsUpdate,
} from "./onGroupParticipantsUpdate.js";

// ============================================================
// AFK GERAL
// ============================================================

import {
  touchMember,
} from "../utils/afkManager.js";

// ============================================================
// SZ AFK
// ============================================================

import {
  SZ_LID,
  isSzAfk,
  deactivateSzAfk,
  sendSzOff,
  sendSzOn,
} from "../commands/member/personalizado/sz.js";

// ============================================================
// NORMALIZAR JID
// ============================================================

function normalizeJid(jid) {
  if (!jid) return null;

  return String(jid)
    .replace(/:[0-9]+(?=@)/g, "")
    .trim();
}

// ============================================================
// PEGAR TEXTO
// ============================================================

function getMessageText(webMessage) {
  const message = webMessage?.message;

  if (!message) {
    return "";
  }

  if (typeof message.conversation === "string") {
    return message.conversation;
  }

  if (
    typeof message.extendedTextMessage?.text ===
    "string"
  ) {
    return message.extendedTextMessage.text;
  }

  if (
    typeof message.imageMessage?.caption ===
    "string"
  ) {
    return message.imageMessage.caption;
  }

  if (
    typeof message.videoMessage?.caption ===
    "string"
  ) {
    return message.videoMessage.caption;
  }

  if (
    typeof message.documentMessage?.caption ===
    "string"
  ) {
    return message.documentMessage.caption;
  }

  // Mensagens ephemeral
  if (
    message.ephemeralMessage?.message
  ) {
    return getMessageText({
      ...webMessage,
      message:
        message.ephemeralMessage.message,
    });
  }

  // Mensagens view-once
  if (
    message.viewOnceMessage?.message
  ) {
    return getMessageText({
      ...webMessage,
      message:
        message.viewOnceMessage.message,
    });
  }

  return "";
}

// ============================================================
// PEGAR CONTEXT INFO DE QUALQUER TIPO DE MENSAGEM
// ============================================================

function getContextInfo(webMessage) {
  const message = webMessage?.message;

  if (!message) {
    return null;
  }

  const candidates = [
    message.extendedTextMessage?.contextInfo,

    message.imageMessage?.contextInfo,

    message.videoMessage?.contextInfo,

    message.documentMessage?.contextInfo,

    message.audioMessage?.contextInfo,

    message.stickerMessage?.contextInfo,
  ];

  for (const context of candidates) {
    if (context) {
      return context;
    }
  }

  if (
    message.ephemeralMessage?.message
  ) {
    return getContextInfo({
      ...webMessage,
      message:
        message.ephemeralMessage.message,
    });
  }

  if (
    message.viewOnceMessage?.message
  ) {
    return getContextInfo({
      ...webMessage,
      message:
        message.viewOnceMessage.message,
    });
  }

  return null;
}

// ============================================================
// PEGAR MENÇÕES
// ============================================================

function getMentionedJids(webMessage) {
  const contextInfo =
    getContextInfo(webMessage);

  if (!contextInfo) {
    return [];
  }

  const result = [];

  // mentionedJid normal
  if (
    Array.isArray(
      contextInfo.mentionedJid
    )
  ) {
    result.push(
      ...contextInfo.mentionedJid
    );
  }

  // Algumas estruturas podem carregar mentionedJidAlt
  if (
    Array.isArray(
      contextInfo.mentionedJidAlt
    )
  ) {
    result.push(
      ...contextInfo.mentionedJidAlt
    );
  }

  return [
    ...new Set(
      result
        .filter(Boolean)
        .map((jid) => String(jid).trim())
    ),
  ];
}

// ============================================================
// VERIFICA SE O SZ FOI MENCIONADO
// ============================================================

async function wasSzMentioned(
  socket,
  webMessage
) {
  const mentioned =
    getMentionedJids(webMessage);

  // Comparação direta com LID
  if (
    mentioned.some((jid) => normalizeJid(jid) === normalizeJid(SZ_LID))
  ) {
    return true;
  }

  /*
   * Se o WhatsApp entregou a menção como PN,
   * tenta converter PN -> LID usando o mapa
   * de LIDs do Baileys.
   */
  try {
    const lidMapping =
      socket?.signalRepository
        ?.lidMapping;

    if (
      lidMapping?.getLIDForPN
    ) {
      for (const jid of mentioned) {
        if (
          jid?.endsWith(
            "@s.whatsapp.net"
          )
        ) {
          try {
            const resolvedLid =
              await lidMapping.getLIDForPN(
                jid
              );

            if (
              normalizeJid(resolvedLid) === normalizeJid(SZ_LID)
            ) {
              return true;
            }
          } catch {
            // Ignora falha individual
          }
        }
      }
    }
  } catch {
    // Não deixa o detector quebrar o bot
  }

  return false;
}

// ============================================================
// VERIFICA RESPOSTA A UMA MENSAGEM DO SZ
// ============================================================

async function wasReplyToSz(
  socket,
  webMessage
) {
  const contextInfo =
    getContextInfo(webMessage);

  if (!contextInfo) {
    return false;
  }

  const participant = String(contextInfo.participant || "").trim();
  const normalizedParticipant = normalizeJid(participant);

  if (
    normalizedParticipant === normalizeJid(SZ_LID)
  ) {
    return true;
  }

  try {
    const lidMapping =
      socket?.signalRepository
        ?.lidMapping;

    if (
      lidMapping?.getLIDForPN &&
      participant?.endsWith(
        "@s.whatsapp.net"
      )
    ) {
      const resolvedLid =
        await lidMapping.getLIDForPN(
          participant
        );

      if (
        normalizeJid(resolvedLid) === normalizeJid(SZ_LID)
      ) {
        return true;
      }
    }
  } catch {
    // ignora
  }

  return false;
}

async function wasMessageSentBySz(socket, webMessage, commonFunctions) {
  const candidates = [
    webMessage?.key?.participant,
    webMessage?.key?.senderPn,
    webMessage?.participant,
    commonFunctions?.userLid,
  ].filter(Boolean);

  if (candidates.some((jid) => normalizeJid(jid) === normalizeJid(SZ_LID))) {
    return true;
  }

  const getLIDForPN = socket?.signalRepository?.lidMapping?.getLIDForPN;
  if (!getLIDForPN) return false;

  for (const jid of candidates) {
    if (!String(jid).includes("@s.whatsapp.net")) continue;

    try {
      const resolvedLid = await getLIDForPN.call(
        socket.signalRepository.lidMapping,
        jid,
      );

      if (normalizeJid(resolvedLid) === normalizeJid(SZ_LID)) {
        return true;
      }
    } catch {
      // Tenta o próximo identificador disponível.
    }
  }

  return false;
}

// ============================================================
// PROCESSAR SZ AFK
// ============================================================

async function processSzAfk({
  socket,
  webMessage,
  commonFunctions,
}) {
  const groupId =
    webMessage?.key?.remoteJid;

  if (
    !groupId?.endsWith("@g.us")
  ) {
    return;
  }

  const szAfk =
    isSzAfk(groupId);

  // ==========================================================
  // SZ MANDOU QUALQUER MENSAGEM
  // ==========================================================

  if (szAfk && await wasMessageSentBySz(socket, webMessage, commonFunctions)) {
    deactivateSzAfk(groupId);

    await sendSzOn(
      socket,
      groupId
    );

    return;
  }

  // Se o Sz não está AFK, não precisamos verificar menção.
  if (!szAfk) {
    return;
  }

  // ==========================================================
  // ALGUÉM MENCIONOU O SZ
  // ==========================================================

  const mentionedSz =
    await wasSzMentioned(
      socket,
      webMessage
    );

  // ==========================================================
  // ALGUÉM RESPONDEU UMA MENSAGEM DO SZ
  // ==========================================================

  const repliedToSz =
    await wasReplyToSz(
      socket,
      webMessage
    );

  if (
    mentionedSz ||
    repliedToSz
  ) {
    await sendSzOff(
      socket,
      groupId
    );
  }
}

// ============================================================
// EVENTO PRINCIPAL
// ============================================================

export async function onMessagesUpsert({
  socket,
  messages,
  startProcess,
}) {
  if (!messages.length) {
    return;
  }

  for (const webMessage of messages) {
    if (DEVELOPER_MODE) {
      infoLog(
        `\n\n⪨========== [ MENSAGEM RECEBIDA ] ==========⪩\n\n${JSON.stringify(
          messages,
          null,
          2
        )}`
      );
    }

    try {
      const timestamp =
        webMessage.messageTimestamp;

      // ======================================================
      // PROCESSA A MENSAGEM
      // ======================================================

      if (webMessage?.message) {
        messageHandler(
          socket,
          webMessage
        );
      }

      // ======================================================
      // IGNORA MENSAGENS ANTIGAS
      // ======================================================

      if (
        isAtLeastMinutesInPast(
          timestamp
        )
      ) {
        continue;
      }

      // ======================================================
      // ENTRADA / SAÍDA
      // ======================================================

      if (
        isAddOrLeave.includes(
          webMessage.messageStubType
        )
      ) {
        let action = "";

        if (
          webMessage.messageStubType ===
          GROUP_PARTICIPANT_ADD
        ) {
          action = "add";
        }

        else if (
          webMessage.messageStubType ===
          GROUP_PARTICIPANT_LEAVE
        ) {
          action = "remove";
        }

        await customMiddleware({
          socket,
          webMessage,
          type: "participant",
          action,
          data:
            webMessage
              .messageStubParameters[0],
          commonFunctions: null,
        });

        await onGroupParticipantsUpdate({
          data:
            webMessage
              .messageStubParameters[0],
          remoteJid:
            webMessage.key.remoteJid,
          socket,
          action,
        });

        continue;
      }

      // ======================================================
      // MEMBRO MUTADO
      // ======================================================

      if (
        checkIfMemberIsMuted(
          webMessage?.key?.remoteJid,
          normalizeJid(
            webMessage?.key?.participant
          )
        )
      ) {
        try {
          const {
            id,
            remoteJid,
            participant,
          } = webMessage.key;

          const deleteKey = {
            remoteJid,
            fromMe: false,
            id,
            participant,
          };

          await socket.sendMessage(
            remoteJid,
            {
              delete: deleteKey,
            }
          );
        } catch (error) {
          errorLog(
            `Erro ao deletar mensagem de membro silenciado: ${error.message}`
          );
        }

        continue;
      }

      // ======================================================
      // FUNÇÕES COMUNS
      // ======================================================

      const commonFunctions =
        loadCommonFunctions({
          socket,
          webMessage,
        });

      if (!commonFunctions) {
        continue;
      }

      const handledJoinRequestAction = await processJoinRequestAction({
        socket,
        commonFunctions,
        actionId: commonFunctions.fullMessage,
      });

      if (handledJoinRequestAction) {
        continue;
      }

      const isBanSticker =
        commonFunctions.isReply &&
        await isOfficialBanSticker({
          webMessage,
          downloadSticker: commonFunctions.downloadSticker,
        });

      if (isBanSticker) {
        const canModerate =
          isVip(commonFunctions.userLid) ||
          await isAdmin({
            remoteJid: commonFunctions.remoteJid,
            userLid: commonFunctions.userLid,
            socket,
          });

        if (canModerate) {
          await handleBan({
            ...commonFunctions,
            args: [],
            isReply: true,
            sendReply: commonFunctions.sendReply,
            sendErrorReply: commonFunctions.sendErrorReply,
          });
          continue;
        }
      }

      // ======================================================
      // AFK GERAL
      // ======================================================

      try {
        const groupId =
          webMessage?.key?.remoteJid;

        const senderId =
          webMessage?.key?.participant ||
          webMessage?.key?.senderPn;

        if (
          groupId?.endsWith("@g.us") &&
          senderId
        ) {
          await touchMember(
            groupId,
            normalizeJid(
              senderId
            )
          );
        }
      } catch (afkError) {
        errorLog(
          `Erro ao atualizar atividade AFK: ${afkError.message}`
        );
      }

      // ======================================================
      // SZ AFK
      // ======================================================

      try {
        await processSzAfk({
          socket,
          webMessage,
          commonFunctions,
        });
      } catch (szError) {
        errorLog(
          `Erro no AFK personalizado do Sz: ${szError.message}`
        );
      }

      // ======================================================
      // MIDDLEWARE
      // ======================================================

      await customMiddleware({
        socket,
        webMessage,
        type: "message",
        commonFunctions,
      });

      // ======================================================
      // ÁUDIO DO XAPA
      // ======================================================

      try {
        await handleOwnerReplyAudio({
          socket,
          webMessage,
          commonFunctions,
        });
      } catch (eventError) {
        errorLog(
          `Erro no evento handleOwnerReplyAudio: ${eventError.message}`
        );
      }

      // ======================================================
      // COMANDOS
      // ======================================================

      await dynamicCommand(
        commonFunctions,
        startProcess
      );

    } catch (error) {

      if (
        badMacHandler.handleError(
          error,
          "message-processing"
        )
      ) {
        continue;
      }

      if (
        badMacHandler.isSessionError(
          error
        )
      ) {
        errorLog(
          `Erro de sessão ao processar mensagem: ${error.message}`
        );

        continue;
      }

      errorLog(
        `Erro ao processar mensagem: ${error.message}\n${error.stack}`
      );
    }
  }
}