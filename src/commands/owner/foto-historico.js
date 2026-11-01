import fs from "node:fs";
import path from "node:path";
import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

const SNAPSHOT_FILE = path.resolve(process.cwd(), "database", "profile-picture-snapshots.json");

function readSnapshots() {
  if (!fs.existsSync(SNAPSHOT_FILE)) return {};
  const parsed = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));
  return parsed && typeof parsed === "object" ? parsed : {};
}

export default {
  name: "foto-historico",
  description: "Salva e consulta snapshots de foto de perfil capturados pelo bot.",
  commands: ["foto-historico", "foto-snapshot"],
  usage: `${PREFIX}foto-historico salvar|listar [jid]`,
  handle: async ({ args, userLid, socket, sendReply }) => {
    const action = String(args?.[0] || "listar").toLowerCase();
    const jid = args?.[1] || userLid;
    const snapshots = readSnapshots();
    if (action === "salvar") {
      const url = await socket.profilePictureUrl(jid, "image");
      snapshots[jid] ||= [];
      snapshots[jid].push({ url, capturedAt: new Date().toISOString() });
      fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshots, null, 2));
      return sendReply("📸 Snapshot atual salvo. O WhatsApp não fornece histórico retroativo de fotos.");
    }
    if (action === "listar") {
      const history = snapshots[jid] || [];
      return sendReply(`📜 Snapshots salvos para ${jid}:\n${history.map((item, index) => `${index + 1}. ${item.capturedAt}\n${item.url}`).join("\n") || "Nenhum snapshot salvo."}`);
    }
    throw new WarningError(`Use ${PREFIX}foto-historico salvar ou ${PREFIX}foto-historico listar.`);
  },
};
