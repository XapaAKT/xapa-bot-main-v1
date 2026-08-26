import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const barra = (pct) => {
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
};

export default {
  name: "ibge",
  description: "Consulta o cadastro secreto do IBGE.",
  commands: ["ibge"],
  usage: `${PREFIX}ibge @mencao`,
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

    const especies = [
      "Capivara Doméstica", "Macaco Urbano", "Pombo Premium", "Calango Atômico",
      "Jacaré de Chinelo", "Pinguim do Cerrado", "Gorila Carente", "Cachorro Caramelo",
      "Rato Nutella", "Preguiça Profissional", "Dinossauro Aposentado", "Coruja Sem Sono",
      "Peixe Terrestre", "Pato Tático", "Galinha Ninja", "Lontra Influencer", "Foca do Tiktok"
    ];

    const habitats = [
      "Grupo de WhatsApp", "Bar da Esquina", "TikTok", "Instagram", "Free Fire",
      "Discord", "Na casa da avó", "Embaixo da cama", "Fila do SUS", "Academia (não treina)",
      "Padaria", "Banheiro da escola", "Terminal Rodoviário", "Mata Atlântica", "Shopping",
      "Call do Zap", "Servidor do Minecraft"
    ];

    const comidas = [
      "Figurinhas e fofoca", "Miojo cru", "Pizza com ketchup", "Bolo de pote",
      "Pão com mortadela", "Energia dos outros", "Café e ódio", "Pastel de vento",
      "Coxinha", "Lasanha congelada", "Arroz sem feijão", "Água da torneira",
      "Ração Premium", "Internet grátis", "Problemas", "Salgadinho e redbull"
    ];

    const risco = ["Baixo 🟢", "Moderado 🟡", "Alto 🟠", "Extremamente Perigoso 🔴"];

    // Animação editando 1 msg só
    const etapas = [
      { txt: "Consultando cadastro nacional...", pct: 15 },
      { txt: "Pesquisando registros...", pct: 50 },
      { txt: "Cruzando informações...", pct: 85 },
    ];

    let msg = `📡 *IBGE - CADASTRO NACIONAL*\n\n${etapas[0].txt}\n${barra(etapas[0].pct)} ${etapas[0].pct}%`;
    const sent = await sendReply(msg);

    for (let i = 1; i < etapas.length; i++) {
      await delay(1800);
      msg = `📡 *IBGE - CADASTRO NACIONAL*\n\n${etapas[i].txt}\n${barra(etapas[i].pct)} ${etapas[i].pct}%`;
      await socket.sendMessage(webMessage.key.remoteJid, { text: msg, edit: sent.key });
    }

    await delay(1800);

    const especie = especies[Math.floor(Math.random()*especies.length)];
    const habitat = habitats[Math.floor(Math.random()*habitats.length)];
    const comida = comidas[Math.floor(Math.random()*comidas.length)];
    const nivelRisco = risco[Math.floor(Math.random()*risco.length)];

    const resultado = `📋 *IBGE - CADASTRO NACIONAL*

━━━━━━━━━━

👤 *Nome:* ${alvoNome}
🆔 *ID:* ${alvoJid.split('@')[0]}

━━━━━━━━━━

🧬 *Espécie:* ${especie}
🏠 *Habitat:* ${habitat}
🍕 *Alimentação:* ${comida}
☣️ *Nível de risco:* ${nivelRisco}

━━━━━━━━━━

✅ *Registro atualizado com sucesso*
> Use ${PREFIX}ibge @alguem pra consultar outra pessoa`;

    await socket.sendMessage(webMessage.key.remoteJid, { text: resultado, edit: sent.key });
  },
};