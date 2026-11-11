import { getWhatsAppName, setWhatsAppNames } from "./database.js";

const MAX_CACHED_PARTICIPANTS = 10_000;
const participantNames = new Map();

function normalizeJid(jid) {
  return typeof jid === "string" ? jid.replace(/:\d+(?=@)/g, "").trim() : "";
}

export function rememberParticipantName(
  webMessage,
  { persist = true, saveNames = setWhatsAppNames } = {},
) {
  const name = String(webMessage?.pushName || webMessage?.notifyName || "").trim();
  const key = webMessage?.key;
  if (!name || !key || key.fromMe) return;

  const identifiers = [
    key.participant,
    key.participantAlt,
    key.participantPn,
    key.senderPn,
    !key.remoteJid?.endsWith("@g.us") ? key.remoteJidAlt : null,
    !key.remoteJid?.endsWith("@g.us") ? key.remoteJid : null,
  ]
    .map(normalizeJid)
    .filter(Boolean);

  for (const identifier of new Set(identifiers)) {
    participantNames.delete(identifier);
    participantNames.set(identifier, name);
  }
  if (persist) saveNames(identifiers, name);

  while (participantNames.size > MAX_CACHED_PARTICIPANTS) {
    participantNames.delete(participantNames.keys().next().value);
  }
}

export function getRememberedParticipantName(identifiers) {
  for (const identifier of identifiers) {
    const normalizedId = normalizeJid(identifier);
    const name = participantNames.get(normalizedId);
    if (name) return name;
  }

  return getWhatsAppName(identifiers);
}

export function clearRememberedParticipantNames() {
  participantNames.clear();
}
