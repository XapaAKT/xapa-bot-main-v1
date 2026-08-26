/**
 * ⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧
 * 𝐃𝐈𝐑𝐄𝐂𝐈𝐎𝐍𝐀𝐃𝐎𝐑 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒
 * 𝐗𝐈𝐂-𝐁𝐎𝐓 • 𝐗𝐀𝐏𝐀 𝐈𝐍 𝐂𝐇𝐀𝐈𝐍𝐒
 * ⛧━━━━━༺𖤐༻━━━━━⛓️━━━━━༺𖤐༻━━━━━⛧
 * @author Xapa
 */
import { BOT_EMOJI, ONLY_GROUP_ID } from "../config.js";
import {
  DangerError,
  InvalidParameterError,
  WarningError,
} from "../errors/index.js";
import {
  checkPermission,
  hasTypeAndCommand,
  isAdmin,
  isBotOwner,
  isLink,
  verifyPrefix,
} from "../middlewares/index.js";
import { processAutoSticker } from "../services/sticker.js";
import { badMacHandler } from "./badMacHandler.js";
import {
  getAutoResponderResponse,
  getPrefix,
  isActiveAntiLinkGroup,
  isActiveAutoResponderGroup,
  isActiveAutoStickerGroup,
  isActiveGroup,
  isActiveOnlyAdmins,
} from "./database.js";
import { findCommandImport } from "./index.js";
import { errorLog } from "./logger.js";
import { isVip } from "./vip.js";

// READMORE PADRÃO OCULTO
const rm = '\u200e'.repeat(4001);

export async function dynamicCommand(paramsHandler, startProcess) {
  const {
    commandName,
    fullMessage,
    prefix,
    remoteJid,
    sendErrorReply,
    sendReact,
    sendReply,
    sendWarningReply,
    socket,
    userLid,
    webMessage,
  } = paramsHandler;

  if (!socket) {
    console.error("⛧ [𝐗𝐈𝐂] 𝐒𝐨𝐜𝐤𝐞𝐭 𝐢𝐧𝐯𝐚́𝐥𝐢𝐝𝐨");
    return;
  }

  const activeGroup = isActiveGroup(remoteJid);
  const normalizedFullMessage = fullMessage?.trim();
  let foundCommand = await findCommandImport(commandName);

  if (
    (!foundCommand?.command ||!hasTypeAndCommand(foundCommand)) &&
    normalizedFullMessage
  ) {
    foundCommand = await findCommandImport(normalizedFullMessage);
  }

  const { type, command } = foundCommand;
  const isNoPrefixCommand = command?.noPrefix === true || command?.isEmojiCommand === true;
  const messageHasPrefix = verifyPrefix(prefix, remoteJid);

  // ANTI-LINK OCULTO
  if (activeGroup && isActiveAntiLinkGroup(remoteJid) && isLink(fullMessage)) {
    if (!userLid) return;
    if (!(await isAdmin({ remoteJid, userLid, socket }))) {
      await socket.groupParticipantsUpdate(remoteJid, [userLid], "remove");
      await sendReply(
`⛧━━━━━<⛧>━━━━━⛓️
┃ 🩸 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 𝐀𝐓𝐈𝐕𝐀𝐃𝐎
┃ ☠ 𝐕𝐨𝐜𝐞̂ 𝐟𝐨𝐢 𝐛𝐚𝐧𝐢𝐝𝐨
╰━━━፝֟━̷━🩸━━╯
⛧━━━━━<⛧>━━━━━⛓️`
      );
      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid, fromMe: false,
          id: webMessage.key.id,
          participant: webMessage.key.participant,
        },
      });
      return;
    }
  }

  if (activeGroup && isActiveAutoStickerGroup(remoteJid)) {
    const processed = await processAutoSticker(paramsHandler);
    if (processed) return;
  }

  const vipCanUseBan = command?.name === "ban" && isVip(userLid);

  if (ONLY_GROUP_ID && ONLY_GROUP_ID!== remoteJid) return;

  if (activeGroup) {
    if ((!messageHasPrefix &&!isNoPrefixCommand) ||!hasTypeAndCommand({ type, command })) {
      if (isActiveAutoResponderGroup(remoteJid)) {
        const response = getAutoResponderResponse(fullMessage);
        if (response) await sendReply(response);
      }

      if (fullMessage.toLocaleLowerCase().includes("prefixo")) {
        await sendReact(BOT_EMOJI);
        const groupPrefix = getPrefix(remoteJid);
        await sendReply(
`⛧━━━━━<⛧>━━━━━⛓️
╠━━━፝֟━̷━🩸━━╮
┃ 🜏 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 :: ${groupPrefix}
┃ ✞ 𝐔𝐒𝐄 :: ${groupPrefix}menu
╰━━━፝֟━̷━🩸━━╯
⛧━━━━━<⛧>━━━━━⛓️`
);
      }
      return;
    }

    if (!vipCanUseBan &&!(await checkPermission({ type,...paramsHandler }))) {
      await sendErrorReply(
`☠️⛧━━━━━༺𖤐༻━━━━━☠️
╠━━━፝֟━̷━🩸━━╮
┃ ☠ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎
┃ ⛓️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐚̃𝐨 𝐢𝐧𝐬𝐮𝐟𝐢𝐜𝐢𝐞𝐧𝐭𝐞
╰━━━፝֟━̷━🩸━━╯
☠️⛧━━━━━༺𖤐༻━━━━━☠️`
);
      return;
    }

    if (isActiveOnlyAdmins(remoteJid) &&!(await isAdmin({ remoteJid, userLid, socket })) &&!vipCanUseBan) {
      await sendWarningReply(
`⛧━━━━━<⛧>━━━━━⛓️
┃ ✞ 𝐒𝐎𝐌𝐄𝐍𝐓𝐄 𝐀𝐃𝐌𝐒
┃ 🩸 𝐒𝐞𝐦 𝐩𝐞𝐫𝐦𝐢𝐬𝐚̃𝐨
⛧━━━━━<⛧>━━━━━⛓️`
      );
      return;
    }
  }

  // GRUPO DESATIVADO
  if (!isBotOwner({ userLid }) &&!activeGroup) {
    if ((messageHasPrefix || isNoPrefixCommand) && hasTypeAndCommand({ type, command })) {
      if (command.name!== "on") {
       await sendWarningReply(
`hum`
);
        return;
      }

      if (!vipCanUseBan &&!(await checkPermission({ type,...paramsHandler }))) {
        await sendErrorReply(`☠️⛧━━━━━𖤐━━━━━☠️\n╠━━━፝֟━̷━🩸━━╮\n┃ ☠ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎\n╰━━━፝֟━̷━🩸━━╯\n☠️⛧━━━━━𖤐━━━━━☠️`);
        return;
      }
    } else { return; }
  }

  if (!messageHasPrefix &&!isNoPrefixCommand) return;

  const groupPrefix = getPrefix(remoteJid);

  if (fullMessage === groupPrefix) {
    await sendReact(BOT_EMOJI);
    await sendReply(
`⛧━━━━━<⛧>━━━━━⛓️
┃ 🜏 𝐄𝐬𝐭𝐞 𝐞́ 𝐦𝐞𝐮 𝐩𝐫𝐞𝐟𝐢𝐱𝐨
┃ ✞ 𝐔𝐬𝐞 :: ${groupPrefix}menu
⛧━━━━━<⛧>━━━━━⛓️`
    );
    return;
  }

  if (!hasTypeAndCommand({ type, command })) {
    await sendWarningReply(
`⛧━━━━━<⛧>━━━━━⛓️
┃ ☠ 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎
┃ 🜏 𝐔𝐬𝐞 :: ${groupPrefix}menu
⛧━━━━━<⛧>━━━━━⛓️`
    );
    return;
  }

  try {
    await command.handle({...paramsHandler, type, startProcess });
  } catch (error) {
    if (badMacHandler.handleError(error, `command:${command?.name}`)) {
      await sendWarningReply(`⛧ 𝐄𝐫𝐫𝐨 𝐭𝐞𝐦𝐩𝐨𝐫𝐚́𝐫𝐢𝐨. 𝐓𝐞𝐧𝐭𝐞 𝐧𝐨𝐯𝐚𝐦𝐞𝐧𝐭𝐞 ⛧`);
      return;
    }
    if (badMacHandler.isSessionError(error)) {
      errorLog(`⛧ 𝐒𝐞𝐬𝐬𝐚̃𝐨 𝐟𝐚𝐥𝐡𝐨𝐮 :: ${error.message}`);
      await sendWarningReply(`⛧ 𝐅𝐚𝐥𝐡𝐚 𝐝𝐞 𝐜𝐨𝐦𝐮𝐧𝐢𝐜𝐚𝐜̧𝐚̃𝐨 ⛧`);
      return;
    }
    if (error instanceof InvalidParameterError) {
      await sendWarningReply(`⛧ 𝐏𝐀𝐑𝐀𝐌𝐄𝐓𝐑𝐎𝐒 𝐈𝐍𝐕𝐀𝐋𝐈𝐃𝐎𝐒 :: ${error.message} ⛧`);
    } else if (error instanceof WarningError) {
      await sendWarningReply(`⛧ ${error.message} ⛧`);
    } else if (error instanceof DangerError) {
      await sendErrorReply(`☠️ ${error.message} ☠️`);
    } else if (error.isAxiosError) {
      const messageText = error.response?.data?.message || error.message;
      const url = error.config?.url || "URL desconhecida";
      const isSpiderAPIError = url.includes("api.spiderx.com.br");
      await sendErrorReply(
`☠️⛧━━━━━𖤐━━━━━☠️
┃ 🩸 𝐄𝐑𝐑𝐎 𝐃𝐄 𝐀𝐏𝐈
┃ ☠ 𝐒𝐞𝐫𝐯𝐢𝐜̧𝐨 :: ${isSpiderAPIError? "𝐒𝐩𝐢𝐝𝐞𝐫 𝐗" : url}
┃ 📄 ${messageText}
☠️⛧━━━━━𖤐━━━━━☠️`
      );
    } else {
      errorLog("⛧ 𝐄𝐑𝐑𝐎 𝐀𝐎 𝐄𝐗𝐄𝐂𝐔𝐓𝐀𝐑", error);
      await sendErrorReply(
`☠️⛧━━━━━𖤐━━━━━☠️
┃ ☠ 𝐄𝐑𝐑𝐎 𝐈𝐍𝐓𝐄𝐑𝐍𝐎
┃ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 :: ${command.name}
┃ 📄 ${error.message}
☠️⛧━━━━━𖤐━━━━━☠️`
      );
    }
  }
}