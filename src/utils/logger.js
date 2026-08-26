/**
 * Logs
 *
 * @author Xapa
 */
import pkg from "../../package.json" with { type: "json" };

export function sayLog(message) {
  console.log("\x1b[36m[XIC-BOT | TALK]\x1b[0m", message);
}

export function inputLog(message) {
  console.log("\x1b[30m[XIC-BOT | INPUT]\x1b[0m", message);
}

export function infoLog(message) {
  console.log("\x1b[34m[XIC-BOT | INFO]\x1b[0m", message);
}

export function successLog(message) {
  console.log("\x1b[32m[XIC-BOT | SUCCESS]\x1b[0m", message);
}

export function errorLog(message) {
  console.log("\x1b[31m[XIC-BOT | ERROR]\x1b[0m", message);
}

export function warningLog(message) {
  console.log("\x1b[33m[XIC-BOT | WARNING]\x1b[0m", message);
}

export function bannerLog() {
  console.clear();

  console.log("\x1b[36m");
  console.log("██╗  ██╗██╗ ██████╗      ██████╗  ██████╗ ████████╗");
  console.log("╚██╗██╔╝██║██╔════╝      ██╔══██╗██╔═══██╗╚══██╔══╝");
  console.log(" ╚███╔╝ ██║██║           ██████╔╝██║   ██║   ██║");
  console.log(" ██╔██╗ ██║██║           ██╔══██╗██║   ██║   ██║");
  console.log("██╔╝ ██╗██║╚██████╗      ██████╔╝╚██████╔╝   ██║");
  console.log("╚═╝  ╚═╝╚═╝ ╚═════╝      ╚═════╝  ╚═════╝    ╚═╝");
  console.log("\x1b[0m");

  console.log("\x1b[35m╔══════════════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[36m║               ☠ XIC-BOT ☠                  ║\x1b[0m");
  console.log("\x1b[32m║        Desenvolvido por Xapa in Chains      ║\x1b[0m");
  console.log(`\x1b[33m║               Versão ${pkg.version.padEnd(18)}║\x1b[0m`);
  console.log("\x1b[35m╚══════════════════════════════════════════════╝\x1b[0m\n");
}
