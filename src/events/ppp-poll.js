import { createHash } from "node:crypto";
import { decryptPollVote } from "baileys";

const pppPolls = new Map();
const notifiedVoters = new Set();
const PARTICIPATE_OPTION = "✅ Vou participar 😈";

function pollId(key) {
  return `${key?.remoteJid || ""}:${key?.id || ""}`;
}

function jidFromKey(key) {
  return key?.participant || key?.senderPn || key?.remoteJid || null;
}

function optionHash(option) {
  return createHash("sha256").update(option).digest("hex");
}

export function registerPppPoll(message, socket) {
  const key = message?.key;
  const secret = message?.message?.messageContextInfo?.messageSecret;

  if (!key?.id || !secret) {
    throw new Error("Não foi possível registrar a enquete do PPP.");
  }

  pppPolls.set(pollId(key), {
    key,
    secret,
    creatorJid: key?.participant || key?.senderPn || socket?.user?.lid || socket?.user?.id,
    participateHash: optionHash(PARTICIPATE_OPTION),
  });
}

async function requestPhoto(socket, voterJid) {
  if (!voterJid || !voterJid.includes("@")) return;

  const notificationId = `${voterJid}:${Date.now()}`;
  if ([...notifiedVoters].some((id) => id.startsWith(`${voterJid}:`))) return;
  notifiedVoters.add(notificationId);

  await socket.sendMessage(voterJid, {
    text: "Você selecionou que vai participar do PPP. Me envie uma foto no privado para continuar.",
  });
}

async function handleSelectedOptions(socket, poll, pollUpdate) {
  const selectedOptions = pollUpdate?.vote?.selectedOptions || [];
  const voterJid = jidFromKey(pollUpdate?.pollUpdateMessageKey);

  if (selectedOptions.some((selected) => selected.toString() === poll.participateHash)) {
    await requestPhoto(socket, voterJid);
  }
}

export async function handlePppPollUpdate({ socket, update }) {
  const creationKey = update?.key;
  const poll = pppPolls.get(pollId(creationKey));

  if (!poll) return false;

  for (const pollUpdate of update?.update?.pollUpdates || []) {
    await handleSelectedOptions(socket, poll, pollUpdate);
  }

  return true;
}

export async function handlePppPollVote({ socket, message }) {
  const vote = message?.message?.pollUpdateMessage;
  const creationKey = vote?.pollCreationMessageKey;

  if (!vote || !creationKey) return false;

  const poll = pppPolls.get(pollId(creationKey));
  if (!poll) return false;

  const voterJid = jidFromKey(message.key);
  if (!voterJid) return false;
  const decryptedVote = decryptPollVote(vote.vote, {
    pollCreatorJid: poll.creatorJid,
    pollMsgId: creationKey.id,
    pollEncKey: poll.secret,
    voterJid,
  });

  await handleSelectedOptions(socket, poll, {
    vote: decryptedVote,
    pollUpdateMessageKey: message.key,
  });

  return true;
}