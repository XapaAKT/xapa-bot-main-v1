import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import { readdir, readFile } from "node:fs/promises";
import { PREFIX } from "../../config.js";
import { errorLog } from "../../utils/logger.js";

const execFile = promisify(execFileCallback);
const BATTERY_STATUS = {
  1: "Estado desconhecido",
  2: "Carregando",
  3: "Na bateria",
  4: "Conectada, sem carregar",
  5: "Carga completa",
};

function formatDuration(seconds) {
  const totalSeconds = Math.floor(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    `${minutes}min`,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatBytes(bytes) {
  const gigabytes = bytes / 1024 ** 3;
  return `${gigabytes.toFixed(2)} GB`;
}

function formatBatteryStatus(status) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "charging") return "Carregando";
  if (normalized === "discharging") return "Na bateria";
  if (normalized === "full" || normalized === "charged") {
    return "Carga completa";
  }
  if (normalized === "not charging") return "Conectada, sem carregar";
  return "Estado desconhecido";
}

async function getLinuxBattery() {
  let powerSupplies;

  try {
    powerSupplies = await readdir("/sys/class/power_supply");
  } catch (error) {
    if (error.code === "ENOENT") return { available: false };
    throw error;
  }

  for (const supply of powerSupplies) {
    const directory = `/sys/class/power_supply/${supply}`;
    let type;

    try {
      type = (await readFile(`${directory}/type`, "utf8")).trim();
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }

    if (type !== "Battery") continue;

    const capacity = Number(
      (await readFile(`${directory}/capacity`, "utf8")).trim(),
    );
    let status = "Estado desconhecido";

    try {
      status = formatBatteryStatus(
        (await readFile(`${directory}/status`, "utf8")).trim(),
      );
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    if (Number.isFinite(capacity)) {
      return { available: true, capacity, status };
    }
  }

  return { available: false };
}

async function getWindowsBattery() {
  const script =
    "Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue | " +
    "Select-Object -First 1 EstimatedChargeRemaining, BatteryStatus | " +
    "ConvertTo-Json -Compress";
  const { stdout } = await execFile(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    { timeout: 5000, windowsHide: true },
  );
  const output = stdout.trim();

  if (!output || output === "null") return { available: false };

  const battery = JSON.parse(output);
  const capacity = Number(battery.EstimatedChargeRemaining);
  if (!Number.isFinite(capacity)) return { available: false };

  return {
    available: true,
    capacity,
    status: BATTERY_STATUS[battery.BatteryStatus] || "Estado desconhecido",
  };
}

async function getMacBattery() {
  const { stdout } = await execFile("pmset", ["-g", "batt"], {
    timeout: 5000,
  });
  const capacity = Number(stdout.match(/(\d+)%/)?.[1]);

  if (!Number.isFinite(capacity)) return { available: false };

  const status = stdout.match(/;\s*(charging|discharging|charged|full)\b/i)?.[1];
  return {
    available: true,
    capacity,
    status: status ? formatBatteryStatus(status) : "Estado desconhecido",
  };
}

async function getBattery() {
  if (process.platform === "win32") return getWindowsBattery();
  if (process.platform === "darwin") return getMacBattery();
  if (process.platform === "linux") return getLinuxBattery();
  return { available: false };
}

async function checkInternet() {
  const startedAt = performance.now();

  try {
    const response = await fetch("https://www.google.com/generate_204", {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: `Sem confirmação (HTTP ${response.status})` };
    }

    return {
      status: "Conectada",
      latency: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    const status =
      error.name === "TimeoutError" || error.name === "AbortError"
        ? "Tempo limite excedido"
        : "Sem resposta ao teste HTTP";

    return { status };
  }
}

function getSystemStats() {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const processMemory = process.memoryUsage();

  return {
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    cpu: cpus[0]?.model || "Não identificado",
    cores: cpus.length,
    totalMemory,
    usedMemory: totalMemory - freeMemory,
    processMemory: processMemory.rss,
    systemUptime: os.uptime(),
    processUptime: process.uptime(),
  };
}

export default {
  name: "pc",
  description: "Mostra conexão, bateria e informações do servidor do bot.",
  commands: ["pc"],
  usage: `${PREFIX}pc`,

  handle: async ({ sendReply, sendWaitReact }) => {
    await sendWaitReact();

    const stats = getSystemStats();
    const [internet, battery] = await Promise.all([
      checkInternet(),
      getBattery().catch((error) => {
        errorLog(
          `[PC] Não foi possível consultar a bateria: ${error.stack || error.message}`,
        );
        return { available: false, error: true };
      }),
    ]);

    const batteryInfo = battery.available
      ? `${battery.capacity}% — ${battery.status}`
      : battery.error
        ? "Não foi possível consultar"
        : "Não detectada ou não disponível neste sistema";
    const latencyInfo =
      internet.latency === undefined ? "" : ` (${internet.latency} ms)`;

    await sendReply(
      `🖥️ *STATUS DO PC / SERVIDOR*\n\n` +
        `🌐 Internet: ${internet.status}${latencyInfo}\n` +
        `🔋 Bateria: ${batteryInfo}\n\n` +
        `💻 Sistema: ${stats.platform}\n` +
        `⚙️ Processador: ${stats.cpu} (${stats.cores} núcleos)\n` +
        `🧠 Memória RAM: ${formatBytes(stats.usedMemory)} / ${formatBytes(stats.totalMemory)} em uso\n` +
        `🤖 Memória do bot: ${formatBytes(stats.processMemory)}\n` +
        `⏱️ Sistema ligado há: ${formatDuration(stats.systemUptime)}\n` +
        `⏳ Bot ligado há: ${formatDuration(stats.processUptime)}\n\n` +
        `ℹ️ O teste de internet verifica uma conexão HTTPS externa; a latência é aproximada.`,
    );
  },
};
