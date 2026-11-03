import { PREFIX } from "../../config.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const barra = (pct) => {
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
};

function getTargetFromMessage(webMessage) {
  const message = webMessage?.message;
  const content =
    message?.ephemeralMessage?.message ||
    message?.viewOnceMessage?.message ||
    message;
  const contextInfo =
    content?.extendedTextMessage?.contextInfo ||
    content?.imageMessage?.contextInfo ||
    content?.videoMessage?.contextInfo ||
    content?.documentMessage?.contextInfo;
  const mentionedJid =
    contextInfo?.mentionedJid?.[0] ||
    contextInfo?.mentionedJidAlt?.[0];

  return {
    jid: mentionedJid || contextInfo?.participant || null,
    isTargeted: Boolean(mentionedJid || contextInfo?.quotedMessage),
  };
}

export default {
  name: "animal",
  description: "Analisa o DNA da vítima.",
  commands: ["animal", "dna"],
  usage: `${PREFIX}animal @mencao`,
  handle: async ({ sendReply, sender, mentionedJidList, replyLid, isReply, socket, webMessage }) => {
    const messageTarget = getTargetFromMessage(webMessage);
    const alvoJid =
      mentionedJidList?.[0] ||
      (isReply ? replyLid : null) ||
      messageTarget.jid ||
      sender;
    const marcado = Boolean(
      mentionedJidList?.[0] ||
      (isReply && replyLid) ||
      messageTarget.isTargeted,
    );
    const alvoNome = marcado ? `@${alvoJid.split("@")[0]}` : "Você";

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
      "⚠️ Costuma sumir quando tem que lavar a louça.",
      "⚠️ Possui talento raro para aparecer quando a comida fica pronta.",
      "⚠️ Seu habitat natural inclui travesseiro, cobertor e celular.",
      "⚠️ Fica agressivo quando alguém responde apenas 'ok'."
    ];

    const animal = animais[Math.floor(Math.random() * animais.length)];
    const porcentagem = Math.floor(Math.random() * 41) + 60; // 60 a 100%
    const humano = 100 - porcentagem;
    const obs = observacoes[Math.floor(Math.random() * observacoes.length)];
    const habilidade = ["dormir em qualquer lugar", "farejar fofoca a quilômetros", "sumir quando chega a conta", "transformar qualquer assunto em meme", "sobreviver a três dias de miojo"][Math.floor(Math.random() * 5)];
    const nivelFofoqueiro = Math.floor(Math.random() * 51) + 50;

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

🎯 *Habilidade especial:* ${habilidade}
🗣️ *Índice de fofoca:* ${nivelFofoqueiro}%

${obs}

> Use ${PREFIX}animal @alguem pra analisar outra pessoa`;

    await socket.sendMessage(webMessage.key.remoteJid, {
      text: resultado,
      edit: sent.key,
      ...(marcado ? { mentions: [alvoJid] } : {}),
    });
  },
};