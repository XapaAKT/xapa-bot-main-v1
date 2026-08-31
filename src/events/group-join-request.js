import { BOT_LID } from "../config.js";
import { sendInteractiveButtons } from "../utils/interactive.js";

const ACTION_PREFIX = "__join_request__";

function normalizeJid(value = "") {
  return String(value).replace(/:[0-9]+(?=@)/g, "").trim();
}

function encode(value) {
  return encodeURIComponent(String(value));
}

function decode(value) {
  return decodeURIComponent(value);
}

function sameJid(left, right) {
  return normalizeJid(left) === normalizeJid(right);
}

export async function notifyJoinRequest({ socket, data }) {
  const remoteJid = data?.id || data?.groupJid || data?.remoteJid;
  const participant = data?.participant || data?.jid || data?.user;

  if (!remoteJid?.endsWith("@g.us") || !participant) return;

  const participantJid = normalizeJid(participant);
  const participantNumber = participantJid.replace(/\D/g, "");
  const approveId = `${ACTION_PREFIX}approve:${encode(remoteJid)}:${encode(participantJid)}`;
  const rejectId = `${ACTION_PREFIX}reject:${encode(remoteJid)}:${encode(participantJid)}`;

  await sendInteractiveButtons(socket, remoteJid, {
    title: "Pedido para entrar no grupo",
    text: `👤 @${participantNumber} pediu para entrar neste grupo.\n\nEscolha uma ação:`,
    footer: "XIC-BOT • Solicitação de entrada",
    buttons: [
      { id: approveId, text: "✅ Aceitar" },
      { id: rejectId, text: "❌ Recusar" },
    ],
    mentions: [participantJid],
  });
}

export function isJoinRequestAction(value = "") {
  return String(value).startsWith(ACTION_PREFIX);
}

export async function processJoinRequestAction({
  socket,
  commonFunctions,
  actionId,
}) {
  if (!isJoinRequestAction(actionId)) return false;

  const match = String(actionId).match(
    /^__join_request__(approve|reject):([^:]+):([^:]+)$/,
  );
  if (!match) return false;

  const [, action, encodedRemoteJid, encodedParticipant] = match;
  const remoteJid = decode(encodedRemoteJid);
  const participant = decode(encodedParticipant);
  const userLid = normalizeJid(commonFunctions?.userLid);

  if (
    !remoteJid.endsWith("@g.us") ||
    !participant ||
    !["approve", "reject"].includes(action)
  ) {
    return false;
  }

  if (!userLid || sameJid(userLid, BOT_LID)) return true;

  const metadata = await socket.groupMetadata(remoteJid);
  const participantInfo = metadata.participants.find((item) =>
    [item.id, item.lid, item.phoneNumber].some((id) => sameJid(id, userLid)),
  );
  const allowed =
    sameJid(metadata.owner, userLid) ||
    participantInfo?.admin === "admin" ||
    participantInfo?.admin === "superadmin";

  if (!allowed) {
    await commonFunctions.sendReply(
      "❌ Apenas administradores podem aceitar ou recusar pedidos de entrada.",
    );
    return true;
  }

  const requestAction = action === "approve" ? "approve" : "reject";
  await socket.groupRequestParticipantsUpdate(
    remoteJid,
    [participant],
    requestAction,
  );

  await commonFunctions.sendReply(
    action === "approve"
      ? `✅ Pedido de @${participant.replace(/\D/g, "")} aceito.`
      : `❌ Pedido de @${participant.replace(/\D/g, "")} recusado.`,
    [participant],
  );

  return true;
}
