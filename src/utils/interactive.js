import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { sendButtons } = require("baileys_helper");

export async function sendInteractiveButtons(sock, jid, data) {
  return sendButtons(sock, jid, data);
}