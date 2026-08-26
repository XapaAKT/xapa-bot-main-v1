
import fs from "node:fs";

const VIP_FILE = "./assets/vip.json";

function normalizeId(value) {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
}

export function isVip(userId) {
  try {
    if (!fs.existsSync(VIP_FILE)) return false;

    const raw = fs.readFileSync(VIP_FILE, "utf8").trim();
    if (!raw) return false;

    const vip = JSON.parse(raw);
    if (!Array.isArray(vip)) return false;

    const target = normalizeId(userId);
    if (!target) return false;

    return vip.some((v) => normalizeId(v?.id) === target);
  } catch {
    return false;
  }
}