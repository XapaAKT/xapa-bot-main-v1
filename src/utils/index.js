/*index.js*
 * Funções diversas.
 *
 * @author Xapa
 */
import axios from "axios";
import { delay, downloadContentFromMessage } from "baileys";
import { writeFile, unlink } from "fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { pathToFileURL } from "node:url";
import { ASSETS_DIR, COMMANDS_DIR, PREFIX, TEMP_DIR } from "../config.js";
import { errorLog } from "./logger.js";

const execAsync = promisify(exec);

// Cache pra não ler comandos do disco toda hora
let commandCache = null;
let commandCacheTime = 0;
const CACHE_TTL = 60000; // 1 minuto

export function question(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function extractInteractiveResponseId(paramsJson) {
  if (!paramsJson) return null;
  try {
    const params = JSON.parse(paramsJson);
    return (
      params.id ||
      params.selectedId ||
      params.selectedRowId ||
      params.rowId ||
      params.buttonId ||
      params.button_id ||
      null
    );
  } catch {
    return null;
  }
}

export function extractDataFromMessage(webMessage) {
  const msg = webMessage.message || {};
  const textMessage = msg.conversation;
  const extendedTextMessage = msg.extendedTextMessage;
  const imageTextMessage = msg.imageMessage?.caption;
  const videoTextMessage = msg.videoMessage?.caption;
  const buttonsResponseMessage = msg.buttonsResponseMessage?.selectedButtonId;
  const templateButtonReplyMessage = msg.templateButtonReplyMessage?.selectedId;
  const listResponseMessage = msg.listResponseMessage?.singleSelectReply?.selectedRowId;
  const interactiveResponseId = extractInteractiveResponseId(
    msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson,
  );

  let fullMessage =
    textMessage ||
    extendedTextMessage?.text ||
    imageTextMessage ||
    videoTextMessage ||
    buttonsResponseMessage ||
    templateButtonReplyMessage ||
    listResponseMessage ||
    interactiveResponseId ||
    "#auto-command";

  const isReply =!!extendedTextMessage?.contextInfo?.quotedMessage;
  const replyLid = extendedTextMessage?.contextInfo?.participant || null;

  const quoted = extendedTextMessage?.contextInfo?.quotedMessage;
  const replyText =
    quoted?.conversation ||
    quoted?.extendedTextMessage?.text ||
    quoted?.imageMessage?.caption ||
    "";

  const userLid = webMessage?.key?.participant?.replace(/:[0-9]+/g, "") || webMessage?.key?.remoteJid;

  const [command,...args] = fullMessage.trim().split(/\s+/);
  const prefix = command.charAt(0);
  const commandWithoutPrefix = command.replace(new RegExp(`^[${PREFIX}]+`), "");

  return {
    args: splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    commandName: formatCommand(commandWithoutPrefix),
    fullArgs: args.join(" "),
    fullMessage,
    isReply,
    prefix,
    remoteJid: webMessage?.key?.remoteJid,
    replyLid,
    replyText,
    userLid,
  };
}

export function splitByCharacters(str, characters) {
  if (!str) return [];
  const escaped = characters.map((char) => (char === "\\"? "\\\\" : `\\${char}`));
  const regex = new RegExp(`[${escaped.join("")}]`);
  return str.split(regex).map((s) => s.trim()).filter(Boolean);
}

export function formatCommand(text) {
  return onlyLettersAndNumbers(removeAccentsAndSpecialCharacters(text.toLowerCase().trim()));
}

export const isGroup = (remoteJid) => remoteJid?.endsWith("@g.us");

export const onlyLettersAndNumbers = (text) => text.replace(/[^a-zA-Z0-9]/g, "");

export function removeAccentsAndSpecialCharacters(text) {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const baileysIs = (webMessage, context) =>!!getContent(webMessage, context);

export function getContent(webMessage, context) {
  const paths = [
    `message.${context}Message`,
    `message.extendedTextMessage.contextInfo.quotedMessage.${context}Message`,
    `message.viewOnceMessage.message.${context}Message`,
    `message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message.${context}Message`,
    `message.viewOnceMessageV2.message.${context}Message`,
    `message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.${context}Message`,
  ];
  for (const p of paths) {
    const val = p.split('.').reduce((o, k) => o?.[k], webMessage);
    if (val) return val;
  }
  return null;
}

export async function download(webMessage, fileName, context, extension) {
  const content = getContent(webMessage, context);
  if (!content) return null;

  const stream = await downloadContentFromMessage(content, context);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);
  await writeFile(filePath, buffer);
  removeFileWithTimeout(filePath, 30000); // deleta em 30s
  return filePath;
}

export function readDirectoryRecursive(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const itemPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...readDirectoryRecursive(itemPath));
    } else if (!item.name.startsWith("_") && /\.(js|ts)$/.test(item.name)) {
      results.push(itemPath);
    }
  }
  return results;
}

export async function findCommandImport(commandName) {
  const commands = await readCommandImports();
  for (const [type, cmds] of Object.entries(commands)) {
    const targetCommand = cmds.find((cmd) =>
      cmd?.commands?.some((cmdName) => formatCommand(cmdName) === commandName)
    );
    if (targetCommand) return { type, command: targetCommand };
  }
  return { type: "", command: null };
}

export async function readCommandImports() {
  const now = Date.now();
  if (commandCache && now - commandCacheTime < CACHE_TTL) {
    return commandCache;
  }

  const subdirectories = fs.readdirSync(COMMANDS_DIR, { withFileTypes: true })
 .filter((d) => d.isDirectory())
 .map((d) => d.name);

  const commandImports = {};
  await Promise.all(
    subdirectories.map(async (subdir) => {
      const subdirectoryPath = path.join(COMMANDS_DIR, subdir);
      const files = await Promise.all(
        readDirectoryRecursive(subdirectoryPath).map(async (filePath) => {
          try {
            const module = await import(`${pathToFileURL(filePath).href}?v=${now}`);
            return module.default?? module;
          } catch (err) {
            errorLog(`Erro ao importar ${filePath}: ${err.message}`);
            return null;
          }
        }),
      );
      commandImports[subdir] = files.filter(Boolean);
    }),
  );

  commandCache = commandImports;
  commandCacheTime = now;
  return commandImports;
}

export const onlyNumbers = (text) => String(text || "").replace(/[^0-9]/g, "");

export const toUserLid = (value) => `${onlyNumbers(value)}@lid`;
export const toUserJid = (value) => `${onlyNumbers(value)}@s.whatsapp.net`;

export async function getBuffer(url, options = {}) {
  try {
    const res = await axios.get(url, {
      headers: { DNT: 1, "Upgrade-Insecure-Request": 1, range: "bytes=0-" },
      responseType: "arraybuffer",
      timeout: 15000,
      proxy: false,
   ...options,
    });
    return res.data;
  } catch (err) {
    errorLog(`getBuffer error: ${err.message}`);
    throw err;
  }
}

export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function formatSecondsToMinutesAndSeconds(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// PRA PLAY-AUDIO
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "Desconhecido";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// PRA YT-SEARCH
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  num = Number(num);
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const readMore = () => "\u200B".repeat(4000);

export const getRandomName = (extension) => {
  const fileName = `xapa_${Date.now()}_${getRandomNumber(0, 9999)}`;
  return extension? `${fileName}.${extension}` : fileName;
};

export async function removeFileIfExists(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) await unlink(filePath);
  } catch (error) {
    errorLog("Erro ao remover arquivo: " + error.message);
  }
}

export function removeFileWithTimeout(filePath, timeout = 5000) {
  setTimeout(() => removeFileIfExists(filePath), timeout);
}

export const getUserName = (webMessage, userLid, fallback = "usuario") =>
  webMessage?.pushName || webMessage?.notifyName || onlyNumbers(userLid) || fallback;

export async function ajustAudioByBuffer(audioBuffer, isPtt = true) {
  const tempPath = path.resolve(TEMP_DIR, getRandomName(isPtt? "ogg" : "mp3"));
  await writeFile(tempPath, audioBuffer);
  const outputPath = path.resolve(TEMP_DIR, getRandomName(isPtt? "ogg" : "mp3"));

  const command = isPtt
 ? `ffmpeg -i "${tempPath}" -vn -c:a libopus -b:a 48k -ac 1 -y "${outputPath}"`
    : `ffmpeg -i "${tempPath}" -vn -c:a libmp3lame -ar 44100 -ac 2 -b:a 128k -y "${outputPath}"`;

  try {
    await execAsync(command);
    const audioBuffer = await fs.promises.readFile(outputPath);
    removeFileIfExists(tempPath);
    removeFileWithTimeout(outputPath);
    return { oldAudioPath: tempPath, audioPath: outputPath, audioBuffer };
  } catch (error) {
    removeFileIfExists(tempPath);
    throw error;
  }
}

export async function getImageBuffer(url, options = {}) {
  try {
    const response = await fetch(url, { headers: { Accept: "image/*" },...options });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    errorLog(`Erro ao obter buffer da imagem: ${error.message}`);
    throw error;
  }
}

export const randomDelay = () => delay([1000, 2000, 3000][getRandomNumber(0, 2)]);

export const isAtLeastMinutesInPast = (timestamp, minimumMinutes = 5) =>
  Math.floor((Date.now() / 1000 - timestamp) / 60) >= minimumMinutes;

export function getLastTimestampCreds() {
  try {
    const credsJson = JSON.parse(fs.readFileSync(path.resolve(ASSETS_DIR, "auth", "baileys", "creds.json"), "utf-8"));
    return credsJson.lastAccountSyncTimestamp;
  } catch {
    return 0;
  }
}

export const extractUserLid = (data) => {
  if (typeof data === "string") {
    try { return JSON.parse(data).id || data; } catch { return data; }
  }
  return data?.id || data;
};

export const hasDirectMedia = (webMessage, context) =>
  webMessage?.message?.[`${context}Message`] ||
  webMessage?.message?.viewOnceMessage?.message?.[`${context}Message`] ||
  webMessage?.message?.viewOnceMessageV2?.message?.[`${context}Message`];

export const GROUP_PARTICIPANT_ADD = 27;
export const GROUP_PARTICIPANT_LEAVE = 32;
export const isAddOrLeave = [GROUP_PARTICIPANT_ADD, GROUP_PARTICIPANT_LEAVE];