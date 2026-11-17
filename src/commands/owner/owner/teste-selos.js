import { PREFIX } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { SELOS } from "../../utils/selos.js";

const DELAY_MS = 1500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function montarFila(alvo) {
  const categorias = Object.keys(SELOS);

  if (!alvo || alvo === "todos") {
    return Object.entries(SELOS).flatMap(([categoria, lista]) =>
      lista.map((selo) => ({ categoria, selo })),
    );
  }

  if (!categorias.includes(alvo)) {
    return null;
  }

  return SELOS[alvo].map((selo) => ({ categoria: alvo, selo }));
}

export default {
  name: "teste-selos",
  description: "Envia todos os selos em sequência para conferir como aparecem.",
  commands: ["testeselos", "testarselos"],
  usage: `${PREFIX}testeselos [categoria|todos] [limite]`,

  handle: async ({ args, socket, remoteJid, sendReply, prefix }) => {
    const prefixo = prefix || PREFIX;

    if (!socket || !remoteJid) {
      throw new DangerError("Não consegui obter o socket ou o chat da mensagem.");
    }

    const alvo = (args[0] || "todos").toLowerCase();
    const limite = Number(args[1]);

    let fila = montarFila(alvo);

    if (!fila) {
      throw new InvalidParameterError(
        `Categorias: ${Object.keys(SELOS).join(", ")} ou "todos". Exemplo: ${prefixo}testeselos bancos`,
      );
    }

    if (Number.isFinite(limite) && limite > 0) {
      fila = fila.slice(0, limite);
    }

    await sendReply(
      `🧪 *Teste de selos*\n\nAlvo: *${alvo}*\nTotal: *${fila.length}*\nIntervalo: ${DELAY_MS}ms`,
    );

    await sleep(800);

    let enviados = 0;
    const falhas = [];
    let categoriaAtual = null;

    for (const { categoria, selo } of fila) {
      if (categoria !== categoriaAtual) {
        categoriaAtual = categoria;
        await sendReply(`━━━━ *${categoria.toUpperCase()}* ━━━━`);
        await sleep(600);
      }

      try {
        await socket.sendMessage(remoteJid, {
          forward: {
            key: selo.key,
            message: selo.message,
          },
        });
        enviados++;
      } catch (error) {
        falhas.push(selo.key.id);
        console.error(`[teste-selos] falha em ${selo.key.id}:`, error?.message);
      }

      await sleep(DELAY_MS);
    }

    const resumo = [
      "📋 *Resultado do teste*",
      "",
      `✅ Enviados: *${enviados}*`,
      `⚠️ Falhas: *${falhas.length}*`,
    ];

    if (falhas.length) {
      resumo.push("", `Ids com falha: ${falhas.join(", ")}`);
    }

    await sendReply(resumo.join("\n"));
  },
};
