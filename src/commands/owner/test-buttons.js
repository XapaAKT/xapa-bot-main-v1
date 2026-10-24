import { delay } from "baileys";
import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";
import {
  createNativeFlowButton,
  sendInteractiveButtons,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";

function makeButton(name, parameters) {
  return createNativeFlowButton(name, parameters);
}

function getPhoneNumber(value) {
  const number = String(value || "").replace(/[^\d]/g, "");

  if (number.length < 8 || number.length > 15) {
    throw new InvalidParameterError(
      `Informe o número internacional com DDI. Exemplo: ${PREFIX}TB call 5511999999999`,
    );
  }

  return number;
}

const quickReplyTests = [
  {
    kind: "quick",
    label: "resposta rápida simples",
    text: "Estilo 1/4: resposta rápida simples.",
    buttons: [
      makeButton("quick_reply", {
        display_text: "✅ Confirmar",
        id: "tb_quick_simple",
      }),
    ],
  },
  {
    kind: "quick",
    label: "respostas rápidas múltiplas",
    text: "Estilo 2/4: três respostas rápidas.",
    buttons: [
      makeButton("quick_reply", {
        display_text: "🩸 Opção A",
        id: "tb_quick_a",
      }),
      makeButton("quick_reply", {
        display_text: "⛓️ Opção B",
        id: "tb_quick_b",
      }),
      makeButton("quick_reply", {
        display_text: "☠️ Opção C",
        id: "tb_quick_c",
      }),
    ],
  },
];

const nativeFlowTests = [
  ...quickReplyTests,
  {
    kind: "list",
    label: "lista de seleção",
    text: "Teste de lista interativa com opções.",
    buttons: [
      makeButton("single_select", {
        title: "Escolha uma opção",
        sections: [
          {
            title: "Demonstração",
            rows: [
              {
                title: "Opção um",
                description: "Primeira opção de teste",
                id: "tb_list_one",
              },
              {
                title: "Opção dois",
                description: "Segunda opção de teste",
                id: "tb_list_two",
              },
            ],
          },
        ],
      }),
    ],
  },
  {
    kind: "url",
    label: "CTA de URL",
    text: "Abre um endereço web de demonstração.",
    buttons: [
      makeButton("cta_url", {
        display_text: "🌐 Abrir exemplo",
        url: "https://example.com",
      }),
    ],
  },
  {
    kind: "copy",
    label: "CTA para copiar código",
    text: "Copia um código de teste.",
    buttons: [
      makeButton("cta_copy", {
        display_text: "📋 Copiar código",
        copy_code: "XIC-TESTE-2026",
      }),
    ],
  },
  {
    kind: "reminder",
    label: "criar lembrete",
    text: "Teste do botão para criar um lembrete.",
    buttons: [
      makeButton("cta_reminder", {
        display_text: "⏰ Criar lembrete",
      }),
    ],
  },
  {
    kind: "cancel-reminder",
    label: "cancelar lembrete",
    text: "Teste do botão para cancelar um lembrete.",
    buttons: [
      makeButton("cta_cancel_reminder", {
        display_text: "✖️ Cancelar lembrete",
      }),
    ],
  },
  {
    kind: "address",
    label: "solicitar endereço",
    text: "Teste do botão de compartilhamento de endereço.",
    buttons: [
      makeButton("address_message", {
        display_text: "📍 Enviar endereço",
      }),
    ],
  },
  {
    kind: "location",
    label: "compartilhar localização",
    text: "Teste do botão de compartilhamento de localização.",
    buttons: [
      makeButton("send_location", {
        display_text: "🗺️ Compartilhar localização",
      }),
    ],
  },
  {
    kind: "webview",
    label: "abrir webview",
    text: "Teste do botão que abre conteúdo web dentro do WhatsApp.",
    buttons: [
      makeButton("open_webview", {
        title: "Abrir demonstração",
        link: { url: "https://example.com" },
      }),
    ],
  },
  {
    kind: "style",
    label: "estilo com cabeçalho e rodapé",
    text: "Estilo 3/4: cabeçalho, corpo e rodapé.",
    title: "⛓️ XIC • PAINEL",
    footer: "╰─ 𝑻𝑬𝑺𝑻𝑬 𝑵𝑨𝑻𝑰𝑽𝑶 ─╯",
    buttons: [
      makeButton("quick_reply", {
        display_text: "⚡ Estilo decorado",
        id: "tb_style_decorated",
      }),
    ],
  },
  {
    kind: "style",
    label: "estilo minimalista",
    text: "Estilo 4/4: uma ação, sem excesso de texto.",
    title: "",
    footer: "",
    buttons: [
      makeButton("quick_reply", {
        display_text: "OK",
        id: "tb_style_minimal",
      }),
    ],
  },
];

const standardTests = [
  {
    kind: "compat",
    label: "resposta rápida compatível (legado)",
    text: "Variação compatível com botão de resposta rápida.",
    legacyButtons: true,
    buttons: [{ id: "tb_legacy_yes", text: "✅ Resposta rápida" }],
  },
  ...nativeFlowTests,
];

async function sendTest(socket, remoteJid, test) {
  const common = {
    title: test.title ?? "⛓️ 𝕏𝕀ℂ-𝔹𝕆𝕋 • TESTE DE BOTÕES",
    text: test.text,
    footer: test.footer ?? "Toque no botão para testar esta variação.",
  };

  if (test.legacyButtons) {
    await sendInteractiveButtons(socket, remoteJid, {
      ...common,
      buttons: test.buttons,
    });
    return;
  }

  await sendNativeFlowButtons(socket, remoteJid, {
    ...common,
    buttons: test.buttons,
  });
}

function makeCallTest(number) {
  return {
    kind: "call",
    label: "CTA de ligação",
    text: "O botão solicita uma ligação para o número informado.",
    buttons: [
      makeButton("cta_call", {
        display_text: "📞 Ligar",
        phone_number: number,
      }),
    ],
  };
}

export default {
  name: "test-buttons",
  description:
    "Testa variações de botões compatíveis e fluxos interativos do WhatsApp.",
  commands: ["tb", "test-buttons", "testbuttons", "botoes-teste"],
  usage: `${PREFIX}TB [all|quick|list|compat|url|copy|call <número>|reminder|cancel-reminder|address|location|webview|style]`,

  handle: async ({
    args,
    fullArgs,
    remoteJid,
    socket,
    sendSuccessReply,
  }) => {
    const [rawAction] = (fullArgs || "").trim().split(/\s+/);
    const action = rawAction?.toLowerCase();
    const isAll = action === "all";

    const selectedTests = !action || isAll
      ? [...standardTests]
      : action === "call"
        ? [makeCallTest(getPhoneNumber(args[1]))]
        : standardTests.filter((test) => test.kind === action);

    if (action && !isAll && !selectedTests.length) {
      throw new InvalidParameterError(
        `Opção inválida. Veja: ${PREFIX}TB [all|quick|compat|url|copy|call <número>|reminder|cancel-reminder|address|location|webview|call-permission|catalog|product|catalog-greeting|flow|transaction|order|payment-info|style].`,
      );
    }

    if (isAll && args[1]) {
      selectedTests.push(makeCallTest(getPhoneNumber(args[1])));
    }

    let sent = 0;

    for (const test of selectedTests) {
      try {
        await sendTest(socket, remoteJid, test);
        sent += 1;
        await delay(300);
      } catch (error) {
        errorLog(
          `[TB] Falha no teste "${test.label}": ${error?.stack || error?.message || String(error)}`,
        );
        throw new WarningError(
          `Falha ao enviar "${test.label}". ${sent ? `${sent} teste(s) anterior(es) já foram enviados. ` : ""}Confira o log do terminal.`,
        );
      }
    }

    const callNote =
      (isAll || !action) && !args[1]
        ? `\nCTA de ligação não enviado: use ${PREFIX}TB all <número com DDI>.`
        : "";
    const advancedNote =
      isAll || !action
        ? "\nCatálogo, Flow, pagamento e pedido exigem dados reais da conta Business; não foram enviados."
        : "";

    await sendSuccessReply(
      `${sent} teste(s) interativo(s) enviado(s).${callNote}${advancedNote}`,
    );
  },
};
