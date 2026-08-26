/**
 * Script de
 * inicialização do bot.
 *
 * Este script é
 * responsável por
 * iniciar a conexão
 * com o WhatsApp.
 *
 * Não é recomendado alterar
 * este arquivo,
 * a menos que você saiba
 * o que está fazendo.
 *
 * @author Xapa in Chains
 */
import makeWASocket, {
  DisconnectReason,
  isJidBroadcast,
  isJidNewsletter,
  isJidStatusBroadcast,
  useMultiFileAuthState,
} from "baileys";
import NodeCache from "node-cache";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";
import { PREFIX, TEMP_DIR } from "./config.js";
import { load } from "./loader.js";
import { badMacHandler } from "./utils/badMacHandler.js";
import { onlyNumbers, question } from "./utils/index.js";
import {
  bannerLog,
  errorLog,
  infoLog,
  successLog,
  warningLog,
} from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Versão fixa do WhatsApp Web.
// Substitui o uso de fetchLatestBaileysVersion().
const WA_VERSION = [2, 3000, 1044006379];

// Contador global de reconexões.
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Determina se está rodando no Termux.
const isTermux =
  process.env.PREFIX?.includes("com.termux") ||
  process.env.HOME?.includes("com.termux");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const logger = pino(
  {
    timestamp: () => `,"time":"${new Date().toJSON()}"`,
  },
  pino.destination(path.join(TEMP_DIR, "wa-logs.txt")),
);

logger.level = "error";

const msgRetryCounterCache = new NodeCache();

function formatPairingCode(code) {
  if (!code) {
    return code;
  }

  return code.match(/.{1,4}/g)?.join("-") || code;
}

function clearScreenWithBanner() {
  console.clear();
  bannerLog();
}

export async function connect() {
  // Determina a pasta de sessão com base na plataforma.
  let baileysFolder;

  if (isTermux) {
    baileysFolder = path.resolve(
      __dirname,
      "..",
      "assets",
      "auth",
      "android",
    );
  } else {
    baileysFolder = path.resolve(
      __dirname,
      "..",
      "assets",
      "auth",
      "windows",
    );
  }

  // Garante que a pasta da sessão exista.
  if (!fs.existsSync(baileysFolder)) {
    fs.mkdirSync(baileysFolder, { recursive: true });
  }

  console.log(`Sessão utilizada:\n${baileysFolder}`);

  const { state, saveCreds } =
    await useMultiFileAuthState(baileysFolder);

  const socket = makeWASocket({
    version: WA_VERSION,
    logger,
    defaultQueryTimeoutMs: undefined,
    retryRequestDelayMs: 5000,
    auth: state,

    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) ||
      isJidStatusBroadcast(jid) ||
      isJidNewsletter(jid),

    connectTimeoutMs: 20_000,
    keepAliveIntervalMs: 30_000,
    maxMsgRetryCount: 5,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    emitOwnEvents: false,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
  });

  // Verificação de socket completo
  socket.ev.on("connection.update", async (update) => {
    console.log("Atualização de conexão:", update);
    
    if (update.connection === "open") {
      console.log("Conexão aberta");
      
      // Verifica se o socket está completo
      if (!socket.send || !socket.relayMessage) {
        console.error("Socket incompleto");
        return;
      }
    }
  });

  if (!socket.authState.creds.registered) {
    clearScreenWithBanner();

    console.log(
      'Informe o número do bot (SP/RJ exigem 9º dígito).\n' +
        'Exemplo: "+553199999999", demais estados: "+55419999999":',
    );

    const phoneNumber = await question("Número: ");

    if (!phoneNumber) {
      errorLog(
        'Número de telefone inválido! Tente novamente com o comando "npm start".',
      );

      process.exit(1);
    }

    const normalizedPhoneNumber = onlyNumbers(phoneNumber);

    try {
      const code =
        await socket.requestPairingCode(normalizedPhoneNumber);

      console.log(
        `Código de pareamento: ${formatPairingCode(code)}`,
      );
    } catch (error) {
      errorLog(
        `Não foi possível gerar o código de pareamento: ${error.message}`,
      );

      throw error;
    }
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const error = lastDisconnect?.error;
      const statusCode = error?.output?.statusCode;

      console.log("\n========== ERRO COMPLETO ==========");
      console.log("Status:", statusCode);
      console.log(
        "Reason:",
        DisconnectReason[statusCode] || statusCode,
      );
      console.log("Error:", error);
      console.log("Stack:", error?.stack);
      console.log("===================================\n");

      const hasBadMacError =
        error?.message?.includes("Bad MAC") ||
        error?.toString()?.includes("Bad MAC");

      if (hasBadMacError) {
        errorLog("Bad MAC error na desconexão detectado");

        if (
          badMacHandler.handleError(
            error,
            "connection.update",
          )
        ) {
          if (badMacHandler.hasReachedLimit()) {
            warningLog(
              "Limite de erros Bad MAC atingido. Limpando arquivos de sessão problemáticos...",
            );

            badMacHandler.clearProblematicSessionFiles();
            badMacHandler.resetErrorCount();

            reconnectAttempts = 0;

            await new Promise((resolve) =>
              setTimeout(resolve, 3000),
            );

            try {
              socket.end?.();
            } catch {
              // Ignora erro ao fechar socket antigo.
            }

            const newSocket = await connect();
            load(newSocket);
            return;
          }
        }
      }

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("Bot desconectado!");
        return;
      }

      switch (statusCode) {
        case DisconnectReason.badSession: {
          warningLog("Sessão inválida!");

          reconnectAttempts = 0;

          const sessionError = new Error(
            "Bad session detected",
          );

          if (
            badMacHandler.handleError(
              sessionError,
              "badSession",
            )
          ) {
            if (badMacHandler.hasReachedLimit()) {
              warningLog(
                "Limite de erros de sessão atingido. Limpando arquivos de sessão...",
              );

              badMacHandler.clearProblematicSessionFiles();
              badMacHandler.resetErrorCount();
            }
          }

          break;
        }

        case DisconnectReason.connectionClosed:
          warningLog("Conexão fechada!");
          break;

        case DisconnectReason.connectionLost:
          warningLog("Conexão perdida!");
          break;

        case DisconnectReason.connectionReplaced:
          warningLog("Conexão substituída!");
          break;

        case DisconnectReason.multideviceMismatch:
          warningLog("Dispositivo incompatível!");
          break;

        case DisconnectReason.forbidden:
          warningLog("Conexão proibida!");
          break;

        case DisconnectReason.restartRequired:
          infoLog(
            'Me reinicie por favor! Digite "npm start".',
          );
          break;

        case DisconnectReason.unavailableService:
          warningLog("Serviço indisponível!");
          break;

        default:
          warningLog(
            `Conexão encerrada com status: ${
              statusCode || "desconhecido"
            }`,
          );
          break;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 3000),
      );

      try {
        socket.end?.();
      } catch {
        // Ignora erro ao fechar socket antigo.
      }

      if (
        reconnectAttempts < MAX_RECONNECT_ATTEMPTS
      ) {
        reconnectAttempts++;

        console.log(
          `Tentando reconectar... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
        );

        const newSocket = await connect();
        load(newSocket);
      } else {
        console.log(
          "Limite de tentativas de reconexão atingido.",
        );
      }

      return;
    }

    if (connection === "open") {
      clearScreenWithBanner();

      successLog("✅ Bot iniciado com sucesso!");
      successLog("Fui conectado com sucesso!");

      infoLog(
        `Versão do WhatsApp Web: ${WA_VERSION.join(".")}`,
      );

      successLog(
        `✅ Estou pronto para uso!
Verifique o prefixo, digitando a palavra "prefixo" no WhatsApp.
O prefixo padrão definido no config.js é ${PREFIX}`,
      );

      reconnectAttempts = 0;
      badMacHandler.resetErrorCount();
      return;
    }

    if (connection === "connecting") {
      infoLog("Conectando...");
      return;
    }

    infoLog("Atualizando conexão...");
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}