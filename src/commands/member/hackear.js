import { PREFIX } from "../../config.js";
import { getUserName } from "../../utils/index.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const barra = (pct) => {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${pct}%`;
};

export default {
  name: "hackear",
  description: "Simulador de invasão - só zoeira",
  commands: ["hackear", "hack"],
  usage: `${PREFIX}hackear @mencao`,
  handle: async ({ sendReply, socket, webMessage, mentionedJidList }) => {

    let alvoNome = "Servidor do Governo";
    if (mentionedJidList?.length) {
      alvoNome = getUserName(webMessage, mentionedJidList[0], "Alvo");
    }

    const alvos = [
      "NASA", "Pentágono", "CIA", "WhatsApp", "Facebook", "Google",
      "ULQUIORRA BOT", "Pix do Nubank", "Servidor do GOV", "Instagram",
      "Banco Central", "PC do Vizinho", "Roteador da Claro", "Netflix"
    ];

    const sucessos = [
      "✅ Senha encontrada: 123456",
      "✅ Backdoor instalada com sucesso",
      "✅ Banco de dados baixado",
      "✅ Acesso root concedido",
      "✅ Câmera ativada",
      "✅ 2FA bypassado com sucesso"
    ];

    const falhas = [
      "❌ O antivírus era melhor.",
      "❌ A senha era '123456' e já foi trocada.",
      "❌ O WiFi caiu na hora H.",
      "❌ O modem esquentou e desligou.",
      "❌ Servidor entrou em manutenção.",
      "❌ Seu PC pediu arroz.",
      "❌ O cabo de rede foi comido pela capivara.",
      "❌ Sua mãe desligou o roteador.",
      "❌ O FBI bateu na porta.",
      "❌ Cloudflare bloqueou o IP"
    ];

    const alvo = alvos[Math.floor(Math.random() * alvos.length)];
    const deuCerto = Math.random() > 0.7; // 30% de chance de dar certo kkk

    const logs = [
      "Iniciando varredura de portas...",
      "Bypass no firewall...",
      "Quebrando criptografia AES-256...",
      "Injetando payload...",
      "Escalando privilégios...",
      "Acessando dados sigilosos...",
      "Evitando detecção do IDS...",
      "Fazendo dump da memória RAM..."
    ];

    let msg = `💻 *XAPA HACKER v2.0*\n\n🎯 Alvo: *${alvoNome}*\n📡 Servidor: *${alvo}*\n\n${barra(0)}`;
    const sent = await sendReply(msg);

    for (let i = 0; i <= 10; i++) {
      await delay(700);
      const pct = i * 10;
      const log = logs[Math.floor(Math.random() * logs.length)];
      msg = `💻 *XAPA HACKER v2.0*\n\n🎯 Alvo: *${alvoNome}*\n📡 Servidor: *${alvo}*\n\n${barra(pct)}\n\n> ${log}`;
      await socket.sendMessage(webMessage.key.remoteJid, { text: msg, edit: sent.key });
    }

    await delay(1000);

    const resultado = deuCerto
     ? `✅ *INVASÃO CONCLUÍDA*\n\n${sucessos[Math.floor(Math.random() * sucessos.length)]}\n\n☠️ *ULQUIORRA BOT foi o melhor hacker do bairro*`
      : `❌ *FALHA NA INVASÃO*\n\n${falhas[Math.floor(Math.random() * falhas.length)]}\n\n😭 *Volta pra hackear WiFi do vizinho*`;

    await socket.sendMessage(webMessage.key.remoteJid, { text: resultado, edit: sent.key });
  },
};