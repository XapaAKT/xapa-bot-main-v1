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

const DEFAULT_CALL_NUMBER = "5531997138522";

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
  {
    kind: "round",
    label: "botões redondos decorativos",
    text: "Modelo visual redondo: os emojis funcionam como ícones dos botões.",
    title: "◯ 𝑪𝑰́𝑹𝑪𝑼𝑳𝑶 𝑫𝑨𝑺 𝑨𝑪̧𝑶̃𝑬𝑺 ◯",
    footer: "Cada opção representa um círculo de ação.",
    buttons: [
      makeButton("quick_reply", { display_text: "◉ Vida", id: "tb_round_life" }),
      makeButton("quick_reply", { display_text: "◉ Mana", id: "tb_round_mana" }),
      makeButton("quick_reply", { display_text: "◉ XP", id: "tb_round_xp" }),
    ],
  },
  {
    kind: "square",
    label: "botões quadrados",
    text: "Modelo visual quadrado com rótulos curtos.",
    title: "▣ PAINEL QUADRADO ▣",
    footer: "[ 01 ] [ 02 ] [ 03 ]",
    buttons: [
      makeButton("quick_reply", { display_text: "[01] Abrir", id: "tb_square_open" }),
      makeButton("quick_reply", { display_text: "[02] Editar", id: "tb_square_edit" }),
      makeButton("quick_reply", { display_text: "[03] Fechar", id: "tb_square_close" }),
    ],
  },
  {
    kind: "ornate",
    label: "botões medievais decorativos",
    text: "Modelo temático com Unicode para menus de RPG.",
    title: "╔═══〔 𖤐 SALÃO DOS HERÓIS 𖤐 〕═══╗",
    footer: "╚═══════ Escolha seu destino ═══════╝",
    buttons: [
      makeButton("quick_reply", { display_text: "⚔ Atacar", id: "tb_ornate_attack" }),
      makeButton("quick_reply", { display_text: "🛡 Defender", id: "tb_ornate_defend" }),
      makeButton("quick_reply", { display_text: "✦ Explorar", id: "tb_ornate_explore" }),
    ],
  },
  {
    kind: "mixed",
    label: "botões mistos de ação",
    text: "Mistura de ícones, texto e símbolos em um único conjunto.",
    buttons: [
      makeButton("quick_reply", { display_text: "➤ Continuar", id: "tb_mixed_continue" }),
      makeButton("quick_reply", { display_text: "✕ Cancelar", id: "tb_mixed_cancel" }),
      makeButton("quick_reply", { display_text: "❔ Ajuda", id: "tb_mixed_help" }),
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
  {
    kind: "list-message",
    label: "lista nativa clássica",
    text: "Modelo clássico de lista do WhatsApp.",
    listMessage: true,
    sections: [
      {
        title: "Formatos disponíveis",
        rows: [
          { title: "◉ Redondo", description: "Teste com símbolos circulares", rowId: "tb_round" },
          { title: "▣ Quadrado", description: "Teste com símbolos quadrados", rowId: "tb_square" },
          { title: "𖤐 Medieval", description: "Teste decorativo para RPG", rowId: "tb_ornate" },
        ],
      },
    ],
  },
];

async function sendTest(socket, remoteJid, test) {
  const common = {
    title: test.title ?? "⛓️ 𝕏𝕀ℂ-𝔹𝕆𝕋 • TESTE DE BOTÕES",
    text: test.text,
    footer: test.footer ?? "Toque no botão para testar esta variação.",
  };

  if (test.listMessage) {
    await socket.sendMessage(remoteJid, {
      ...common,
      buttonText: "Abrir catálogo",
      sections: test.sections,
      viewOnce: true,
    });
    return;
  }

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

function getCallNumber(args, isAll) {
  const requested = isAll ? args[1] : args[1];
  return getPhoneNumber(requested || DEFAULT_CALL_NUMBER);
}

export default {
  name: "test-buttons",
  description:
    "Testa variações de botões compatíveis e fluxos interativos do WhatsApp.",
  commands: ["tb", "test-buttons", "testbuttons", "botoes-teste"],
  usage: `${PREFIX}TB [all|quick|list-message|compat|url|copy|call <número>|round|square|ornate|mixed|style]`,

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
        ? [makeCallTest(getCallNumber(args, false))]
        : standardTests.filter((test) => test.kind === action);

    if (action && !isAll && !selectedTests.length) {
      throw new InvalidParameterError(
        `Opção inválida. Veja: ${PREFIX}TB [all|quick|list-message|compat|url|copy|call <número>|round|square|ornate|mixed|style].`,
      );
    }

    if (isAll && args[1]) {
      selectedTests.push(makeCallTest(getCallNumber(args, true)));
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
        ? `\nCTA de ligação padrão não enviado. Use ${PREFIX}TB call <número com DDI> para testar outro número.`
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
