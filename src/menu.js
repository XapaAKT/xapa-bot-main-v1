/**
* XAPA IN CHAINS BOT
* NECROTIC SYSTEM INTERFACE
* REWRITTEN FOR CHAOS & AESTHETICS
*/

import pkg from "../package.json" with { type: "json" };
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";

export function menuMessage(groupJid) {
const date = new Date();
const prefix = getPrefix(groupJid);

const timeStr = date.toLocaleTimeString("pt-br", { hour: '2-digit', minute: '2-digit' });
const dateStr = date.toLocaleDateString("pt-br");

return `
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
☠️ X A P A I N C H A I N S ☠️
▒▒▒▒ SYSTEM CORRUPTED // NO ESCAPE ▒▒▒
${readMore()}
╔═════════════════════════════╗
║ 🩸 STATUS: ║
║ ⛓ BOT: ${BOT_NAME}
║ ⚠ VER: ${pkg.version} // BUILD unstable
║ 📅 DATE: ${dateStr} | ⏰ ${timeStr}
║ ⚔ PREFIX: [ ${prefix} ]
╚═════════════════════════════╝

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

…………..█……………………………………..█…………..
…………██……………………………………..██…………
…………██……………………………………..██…………
…………..██▓……………………………▓██…………..
……………████………………………████…………….
………………████..████████..████………………
………………..████..██████..████………………..
………………█..█████..████..█████..█………………
…………….███..███..██████..███..███……………
…………….███….████████████….████…………
…………….████████████████████████……
………………..████████████████████…………
………………..██……..████……….██………………..
………………..██……..████……….██………………..
………………..████████..████████………………..
………………….██████……██████……………….
……………………….████████…………………………
……………………….█..█..█..█..█…………………………
…………█…………..█…………..█…………..█…………..
……….██……………………………………….██…………
……….██……………………………………….██…………
……….██…………..██……….██…………..██…………
……….██..██..██..█…………..█..██..██..██…………
……█..██..██..██..█…………..█..██..██..██..█……
….██..██..██..██..█…………..█..██..██..██..██……
……████..██..██………………….██..██..████………

▒▒▒▒▒▒▒▒▒▒▒▒▒▒
XIC://DEAD_NODE_07 
▒▒▒▒▒▒▒▒▒▒▒▒▒▒


▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
╔═〔 🩸 ROOT ACCESS // OWNER HELL 🩸 〕╗
║ ┌──────────────────────────────
║ ├ ⛓ ${prefix}exec
║ ├ ⛓ ${prefix}get-group-id
║ ├ ⛓ ${prefix}off | ${prefix}on
║ ├ ⛓ ${prefix}set-menu-image
║ ├ ⛓ ${prefix}set-prefix
║ └ ⛓ ${prefix}set-spider-api-token
╚═════════════════════════════╝

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
╔〔 ⚰ ADMIN CONTROL // CHAINS ⚰ ╗
║ ┌──────────────────────────────
║ ├ 🩸 GRUPO: ${prefix}abrir, ${prefix}fechar, ${prefix}mute, ${prefix}unmute
║ ├ 🩸 MEMBROS: ${prefix}ban, ${prefix}promover, ${prefix}rebaixar
║ ├ 🩸 ANTI-FLOOD: ${prefix}anti-link, ${prefix}anti-audio, ${prefix}anti-image
║ ├ 🩸 UTILS: ${prefix}hidetag, ${prefix}link-grupo, ${prefix}delete, ${prefix}limpar-chat
║ ├ 🩸 AUTO: ${prefix}auto-responder, ${prefix}auto-sticker, ${prefix}welcome
║ └ 🩸 CONFIG: ${prefix}only-admin, ${prefix}exit, ${prefix}set-proxy
╚═════════════════════════════╝

███████████████████████████████
╔〔 🔥 DEAD COMMANDS // TOOLS 🔥 〕═╗
║ ┌──────────────────────────────
║ ├ ☣ STICKER/FUN: ${prefix}sticker, ${prefix}to-gif, ${prefix}to-image, ${prefix}to-mp3
║ ├ ☣ TEXT: ${prefix}attp, ${prefix}ttp, ${prefix}brat, ${prefix}bratvid, ${prefix}fake-chat
║ ├ ☣ INFO: ${prefix}ping, ${prefix}info, ${prefix}perfil, ${prefix}meu-lid, ${prefix}cep
║ ├ ☣ MEDIA: ${prefix}removebg, ${prefix}rename, ${prefix}raw-message
║ └ ☣ OTHER: ${prefix}yt-search, ${prefix}gerar-link, ${prefix}exemplos-de-mensagens
╚═════════════════════════════╝

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
╔〔 🎧 NECRO DOWNLOAD // ROTTEN 🎧 〕╗
║ ┌──────────────────────────────
║ ├ ⚡ VIDEO: ${prefix}tik-tok, ${prefix}facebook, ${prefix}instagram, ${prefix}pinterest
║ ├ ⚡ AUDIO: ${prefix}tik-tok-audio, ${prefix}play-audio, ${prefix}yt-mp3
║ └ ⚡ FILME: ${prefix}play-video, ${prefix}yt-mp4
╚═════════════════════════════╝

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
╔〔 ☠ BLOOD FUN // VIOLENCE ☠ 〕╗
║ ┌──────────────────────────────
║ └ 🩸 ${prefix}abracar, ${prefix}beijar, ${prefix}lutar, ${prefix}matar, ${prefix}socar, ${prefix}dado, ${prefix}jantar
╚═════════════════════════════╝

███████████████████████████████
╔══〔 🤖 ABYSS AI // VOID 🤖 〕═══════╗
║ ┌──────────────────────────────
║ ├ ⛓ ${prefix}deepseek    ⛓ ${prefix}flux
║ ├ ⛓ ${prefix}gemini        ⛓ ${prefix}gpt-5-mini
║ └ ⛓ ${prefix}ia-sticker
╚═════════════════════════════╝

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
╔〔 🕯 ROTTEN CANVAS // DISTORT 🕯 〕╗
║ ┌──────────────────────────────
║ └ ☠ ${prefix}blur, ${prefix}gray, ${prefix}inverter, ${prefix}pixel, ${prefix}contraste
║ ☠ ${prefix}espelhar, ${prefix}cadeia, ${prefix}rip, ${prefix}bolsonaro
╚═════════════════════════════╝

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
║ ☠ SYSTEM ONLINE // XAPA IN CHAINS ☠ ║
║ ⛓ NO MERCY • NO ESCAPE • DEAD SOUL ⛓ ║
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
`;
}