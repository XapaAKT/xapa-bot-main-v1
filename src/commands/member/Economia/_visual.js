export function economyBox(title, content) {
  return `╭━━━〔 💠 𝐗𝐈𝐂 • 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀 〕━━━╮
┃
┃ ${title}
┃
${content
  .split("\n")
  .map((line) => `┃ ${line}`)
  .join("\n")}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}

export function economyStats(eco) {
  const level = getLevelInfo(eco.xp, eco.level);
  return `👤 𝐏𝐞𝐫𝐟𝐢𝐥: ${eco.name}
💰 𝐂𝐚𝐫𝐭𝐞𝐢𝐫𝐚: ${Number(eco.coins || 0).toLocaleString("pt-BR")} XC$
⭐ 𝐄𝐱𝐩𝐞𝐫𝐢𝐞̂𝐧𝐜𝐢𝐚: ${Number(eco.xp || 0).toLocaleString("pt-BR")} XP
🏅 𝐍𝐢́𝐯𝐞𝐥: ${level.level}`;
}

export function economyBar(value, total = 100, size = 10) {
  const progress = Math.max(0, Math.min(1, Number(value) / Number(total)));
  const filled = Math.round(progress * size);
  return `${"▰".repeat(filled)}${"▱".repeat(size - filled)}`;
}

export function economyShortcuts(prefix) {
  return `⚡ ${prefix}saldo  •  ${prefix}diario  •  ${prefix}trabalhar
🎲 ${prefix}cassino  •  ${prefix}corrida  •  ${prefix}toprico`;
}

export function economyLevelProgress(eco) {
  const level = getLevelInfo(eco.xp, eco.level);
  return `🏅 𝐍𝐢́𝐯𝐞𝐥 ${level.level}  •  ${level.currentXp}/${level.requiredXp} XP
${economyBar(level.progress, level.requiredXp)} 𝐩𝐚𝐫𝐚 𝐨 𝐧𝐢́𝐯𝐞𝐥 ${level.level + 1}`;
}
import { getLevelInfo } from "../../../utils/economy.js";
