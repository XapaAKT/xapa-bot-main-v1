import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PREFIX, TOKITO_API_TOKEN } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../database.json");

const defaultDatabase = () => ({
    users: {},
    groups: {},
    autoresponder: [],
    settings: {
        prefix: PREFIX,
        menuType: "buttons",
        menuCarousel: false,
        youtubeSearchCarousel: false,
    },
});

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase(), null, 2));
}

const readDB = () => {
    try {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        data.users??= {};
        data.groups??= {};
        data.autoresponder??= [];
        data.settings??= {};
        data.settings.prefix??= PREFIX;
        data.settings.menuType??= "buttons";
        data.settings.menuCarousel??= false;
        data.settings.youtubeSearchCarousel??= false;
        return data;
    } catch (error) {
        console.error("Erro ao ler database.json:", error);
        return defaultDatabase();
    }
};

const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// USERS, AUTO-RESPONDER, ETC... (mantive igual)
export function getUser(jid) {
    const db = readDB();
    if (!db.users[jid]) {
        db.users[jid] = { xp: 0, level: 1, banned: false };
        writeDB(db);
    }
    return db.users[jid];
}
export function addXP(jid, amount) { const db = readDB(); if (!db.users[jid]) db.users[jid] = { xp: 0, level: 1, banned: false }; db.users[jid].xp += amount; writeDB(db); }
export function isBanned(jid) { const db = readDB(); return db.users[jid]?.banned || false; }
export function addAutoResponderItem(k, r) { const db = readDB(); db.autoresponder.push({ keyword: k.toLowerCase(), response: r }); writeDB(db); }
export function getAutoResponderItems() { return readDB().autoresponder; }
export function listAutoResponderItems() { return getAutoResponderItems().map((i, idx) => ({ key: idx + 1, match: i.keyword, answer: i.response })); }

function getGroup(jid) {
    const db = readDB();
    if (!db.groups[jid]) {
        db.groups[jid] = {
            active: false,
            prefix: PREFIX, // <- AGORA JÁ NASCE COM PREFIX
            antiAudio: false, antiSticker: false, antiLink: false,
            autoResponder: false, autoSticker: false, ownerReplyAudio: false,
            exit: true, welcome: true, onlyAdmins: false, muted: [],
        };
        writeDB(db);
    }
    let changed = false;
    if (!Array.isArray(db.groups[jid].muted)) { db.groups[jid].muted = []; changed = true; }
    if (typeof db.groups[jid].prefix!== "string" ||!db.groups[jid].prefix) {
        db.groups[jid].prefix = db.settings?.prefix || PREFIX;
        changed = true;
    }
    if (changed) writeDB(db);
    return db.groups[jid];
}

export function isActiveGroupRestriction(jid, type) { return getGroup(jid)[type] || false; }
export function updateIsActiveGroupRestriction(jid, type, value) { getGroup(jid); const db = readDB(); db.groups[jid][type] = value; writeDB(db); }
export const activateAntiLinkGroup = (jid) => updateIsActiveGroupRestriction(jid, "antiLink", true);
export const deactivateAntiLinkGroup = (jid) => updateIsActiveGroupRestriction(jid, "antiLink", false);
export const isActiveAntiLinkGroup = (jid) => isActiveGroupRestriction(jid, "antiLink");
export const activateAntiAudioGroup = (jid) => updateIsActiveGroupRestriction(jid, "antiAudio", true);
export const deactivateAntiAudioGroup = (jid) => updateIsActiveGroupRestriction(jid, "antiAudio", false);
export const isActiveAntiAudioGroup = (jid) => isActiveGroupRestriction(jid, "antiAudio");
export const activateAntiStickerGroup = (jid) => updateIsActiveGroupRestriction(jid, "antiSticker", true);
export const deactivateAntiStickerGroup = (jid) => updateIsActiveGroupRestriction(jid, "antiSticker", false);
export const isActiveAntiStickerGroup = (jid) => isActiveGroupRestriction(jid, "antiSticker");
export const activateAutoResponderGroup = (jid) => updateIsActiveGroupRestriction(jid, "autoResponder", true);
export const deactivateAutoResponderGroup = (jid) => updateIsActiveGroupRestriction(jid, "autoResponder", false);
export const isActiveAutoResponderGroup = (jid) => isActiveGroupRestriction(jid, "autoResponder");
export const activateAutoStickerGroup = (jid) => updateIsActiveGroupRestriction(jid, "autoSticker", true);
export const deactivateAutoStickerGroup = (jid) => updateIsActiveGroupRestriction(jid, "autoSticker", false);
export const isActiveAutoStickerGroup = (jid) => isActiveGroupRestriction(jid, "autoSticker");
export const activateOwnerReplyAudio = (jid) => updateIsActiveGroupRestriction(jid, "ownerReplyAudio", true);
export const deactivateOwnerReplyAudio = (jid) => updateIsActiveGroupRestriction(jid, "ownerReplyAudio", false);
export const isActiveOwnerReplyAudio = (jid) => isActiveGroupRestriction(jid, "ownerReplyAudio");
export const activateExitGroup = (jid) => updateIsActiveGroupRestriction(jid, "exit", true);
export const deactivateExitGroup = (jid) => updateIsActiveGroupRestriction(jid, "exit", false);
export const isActiveExitGroup = (jid) => isActiveGroupRestriction(jid, "exit");
export function activateGroup(jid) { updateIsActiveGroupRestriction(jid, "active", true); }
export function deactivateGroup(jid) { updateIsActiveGroupRestriction(jid, "active", false); }
export const activateOnlyAdmins = (jid) => updateIsActiveGroupRestriction(jid, "onlyAdmins", true);
export const deactivateOnlyAdmins = (jid) => updateIsActiveGroupRestriction(jid, "onlyAdmins", false);
export const isActiveOnlyAdmins = (jid) => isActiveGroupRestriction(jid, "onlyAdmins");
export const activateWelcomeGroup = (jid) => updateIsActiveGroupRestriction(jid, "welcome", true);
export const deactivateWelcomeGroup = (jid) => updateIsActiveGroupRestriction(jid, "welcome", false);
export const isActiveWelcomeGroup = (jid) => isActiveGroupRestriction(jid, "welcome");

// ========================================
// PREFIXO POR GRUPO - CORRIGIDO
// ========================================
export function getPrefix(groupJid) {
    const db = readDB();
    if (!groupJid ||!groupJid.endsWith("@g.us")) {
        return db.settings?.prefix || PREFIX;
    }
    if (!db.groups[groupJid]) {
        db.groups[groupJid] = {
            active: false, prefix: PREFIX, antiAudio: false, antiSticker: false, antiLink: false,
            autoResponder: false, autoSticker: false, exit: true, welcome: true, onlyAdmins: false, muted: []
        };
        writeDB(db);
    }
    if (!db.groups[groupJid].prefix) {
        db.groups[groupJid].prefix = db.settings?.prefix || PREFIX;
        writeDB(db);
    }
    return db.groups[groupJid].prefix;
}

export function setPrefix(groupJid, newPrefix) {
    const db = readDB();
    if (!groupJid ||!groupJid.endsWith("@g.us")) return false;
    if (!newPrefix || typeof newPrefix!== "string") return false;
    newPrefix = newPrefix.trim();
    if (!newPrefix || newPrefix.length > 3 || newPrefix.includes("@g.us")) return false;

    if (!db.groups[groupJid]) {
        db.groups[groupJid] = {
            active: false, prefix: PREFIX, antiAudio: false, antiSticker: false, antiLink: false,
            autoResponder: false, autoSticker: false, exit: true, welcome: true, onlyAdmins: false, muted: []
        };
    }
    db.groups[groupJid].prefix = newPrefix;
    writeDB(db);
    return true;
}

export function getMenuSettings() {
    const settings = readDB().settings;
    return {
        type: settings.menuType === "list" ? "list" : "buttons",
        carousel: settings.menuCarousel === true,
    };
}

export function setMenuType(type) {
    if (type !== "buttons" && type !== "list") {
        throw new TypeError("O tipo do menu deve ser 'buttons' ou 'list'.");
    }

    const db = readDB();
    db.settings.menuType = type;
    writeDB(db);
}

export function setMenuCarousel(enabled) {
    if (typeof enabled !== "boolean") {
        throw new TypeError("O estado do carrossel deve ser booleano.");
    }

    const db = readDB();
    db.settings.menuCarousel = enabled;
    writeDB(db);
}

export function getYoutubeSearchCarousel() {
    return readDB().settings.youtubeSearchCarousel === true;
}

export function setYoutubeSearchCarousel(enabled) {
    if (typeof enabled !== "boolean") {
        throw new TypeError("O estado do carrossel da busca do YouTube deve ser booleano.");
    }

    const db = readDB();
    db.settings.youtubeSearchCarousel = enabled;
    writeDB(db);
}

export function getSpiderApiToken() { return readDB().settings?.tokitoApiToken || TOKITO_API_TOKEN; }
export function setSpiderApiToken(t) { const db = readDB(); db.settings??= {}; db.settings.tokitoApiToken = t; writeDB(db); }
export function checkIfMemberIsMuted(g, m) { return (getGroup(g).muted || []).includes(m); }
export function muteMember(g, m) { const db = readDB(); const group = getGroup(g); if (!group.muted.includes(m)) { group.muted.push(m); db.groups[g] = group; writeDB(db); } }
export function unmuteMember(g, m) { const db = readDB(); const group = getGroup(g); group.muted = group.muted.filter(id => id!== m); db.groups[g] = group; writeDB(db); }
export function readGroupRestrictions(jid) { const g = getGroup(jid); return { active: g.active?? true, antiAudio: g.antiAudio?? false, antiSticker: g.antiSticker?? false, antiLink: g.antiLink?? false, autoResponder: g.autoResponder?? false, autoSticker: g.autoSticker?? false, exit: g.exit?? true, welcome: g.welcome?? true, onlyAdmins: g.onlyAdmins?? false, muted: g.muted?? [] }; }
export function readRestrictedMessageTypes(jid) { const g = getGroup(jid); const r = []; if (g.antiAudio) r.push("audio"); if (g.antiSticker) r.push("sticker"); if (g.antiLink) r.push("link"); if (g.onlyAdmins) r.push("text"); return r; }
export function isActiveGroup(jid) { return getGroup(jid).active?? true; }
export function setActiveGroup(jid, v) { updateIsActiveGroupRestriction(jid, "active", v); }
export function getAutoResponderResponse(msg) { const db = readDB(); const low = msg.toLowerCase(); const item = db.autoresponder.find(i => low.includes(i.keyword)); return item? item.response : null; }