import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";
import { WarningError } from "../../errors/index.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const barra = (pct) => {
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
};

export default {
  name: "animal",
  description: "Analisa o DNA da vítima.",
  commands: ["animal", "dna"],
  usage: `${PREFIX}animal @mencao`,
  handle: async ({ sendReply, sender, mentionedJidList, socket, webMessage }) => {
    let alvoJid = sender;
    let alvoNome = "Você";

    if (mentionedJidList?.length) {
      alvoJid = mentionedJidList[0];
      try {
        const contato = await socket.onWhatsApp(alvoJid);
        alvoNome = contato?.[0]?.notify || contato?.[0]?.verifiedName || getUserName(webMessage, alvoJid, "Usuário");
      } catch {
        alvoNome = getUserName(webMessage, alvoJid, "Usuário");
      }
    } else {
      alvoNome = getUserName(webMessage, sender, "Você");
    }

    const animais = [
      "🐒 Macaco", "🦍 Gorila", "🐀 Rato", "🦆 Pato", "🐸 Sapo",
      "🦥 Preguiça", "🐷 Porco", "🐴 Cavalo", "🐓 Galo", "🐔 Galinha",
      "🐕 Cachorro", "🐈 Gato", "🦝 Guaxinim", "🦭 Foca", "🦦 Lontra",
      "🦎 Lagarto", "🦈 Tubarão", "🐺 Lobo", "🦒 Girafa", "🐘 Elefante",
      "🦖 Dinossauro", "🐧 Pinguim", "🦫 Capivara", "🐭 Hamster", "🦡 Texugo"
    ];

    const observacoes = [
      "⚠️ Recomenda-se manter longe de bananas.",
      "⚠️ Costuma aparecer perto da geladeira às 03:00.",
      "⚠️ Vive roubando comida da panela.",
      "⚠️ Alto risco de comer pizza com ketchup.",
      "⚠️ Costuma latir para motocicletas.",
      "⚠️ Muito perigoso quando está com fome.",
      "⚠️ Espécie extremamente fofoqueira.",
      "⚠️ Vive dormindo durante o expediente.",
      "⚠️ Encontrado frequentemente em grupos de WhatsApp.",
      "⚠️ Apresenta comportamento duvidoso.",
      "⚠️ Detectado DNA de capivara. Fica na água o dia todo.",
      "⚠️ Tem instinto de colecionar tampinhas.",
      "⚠️ Reage mal quando cortam a internet.",
      "⚠️ Costuma sumir quando tem que lavar a louça."
    ];

    const animal = animais[Math.floor(Math.random() * animais.length)];
    const porcentagem = Math.floor(Math.random() * 41) + 60; // 60 a 100%
    const humano = 100 - porcentagem;
    const obs = observacoes[Math.floor(Math.random() * observacoes.length)];

    // Animação em 1 mensagem só pra não floodar
    const etapas = [
      { txt: "Iniciando análise genética...", pct: 10 },
      { txt: "Coletando DNA...", pct: 35 },
      { txt: "Comparando com o banco genético...", pct: 65 },
      { txt: "Finalizando...", pct: 90 },
    ];

    let msg = `🧬 *INSTITUTO XIC*\n\n${etapas[0].txt}\n${barra(etapas[0].pct)} ${etapas[0].pct}%`;
    const sent = await sendReply(msg);

    for (let i = 1; i < etapas.length; i++) {
      await delay(1500);
      msg = `🧬 *INSTITUTO XIC*\n\n${etapas[i].txt}\n${barra(etapas[i].pct)} ${etapas[i].pct}%`;
      await socket.sendMessage(webMessage.key.remoteJid, { text: msg, edit: sent.key });
    }

    await delay(1500);
    
    const resultado = `🧬 *DNA ANALISADO*

████████████ 100%

👤 *${alvoNome}*

━━━━━━━━━━━━━━━━━━

🧬 *Espécie predominante*
${animal}
*${porcentagem}%*

👤 *Ser Humano*
*${humano}%*

━━━━━━━━━━━━━━━━━━

${obs}

> Use ${PREFIX}animal @alguem pra analisar outra pessoa`;

    await socket.sendMessage(webMessage.key.remoteJid, { text: resultado, edit: sent.key });
  },
};