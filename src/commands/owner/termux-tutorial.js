import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../utils/interactive.js";
import { errorLog } from "../../utils/logger.js";

const FDROID_APK_URL = "https://f-droid.org/F-Droid.apk";
const TERMUX_FDROID_URL = "https://f-droid.org/en/packages/com.termux/";
const TERMUX_NODE_URL = "https://wiki.termux.com/wiki/Node.js";
const BOT_REPOSITORY_URL = "https://github.com/XapaAKT/xapa-bot-main-v1.git";
const BOT_ARCHIVE_URL =
  "https://github.com/XapaAKT/xapa-bot-main-v1/archive/refs/heads/main.zip";

const STEPS = [
  {
    title: "Tutorial: Termux no Android",
    text:
      "Este guia mostra como instalar o F-Droid, baixar o Termux e preparar o ambiente do bot.\n\n" +
      "Escolha uma forma de instalar:\n" +
      "• F-Droid: baixe a loja pelo botão.\n" +
      "• Manual: abra a página oficial do Termux no F-Droid e baixe o APK do app.\n\n" +
      "O Termux pelo F-Droid requer Android 7 ou superior. O APK manual não recebe avisos de atualização da loja.",
    links: [
      { label: "⬇️ Baixar F-Droid", url: FDROID_APK_URL },
      { label: "📦 Termux manual (APK)", url: TERMUX_FDROID_URL },
    ],
  },
  {
    title: "Passo 1/5: instalar o Termux",
    text:
      "Pelo F-Droid: abra a loja, aguarde a atualização dos repositórios, pesquise “Termux”, escolha o app oficial e toque em Instalar.\n\n" +
      "Instalação manual: abra a página oficial pelo botão, procure a versão mais recente e toque em “Download APK”. Depois abra o arquivo e, se solicitado, permita a instalação pelo navegador.\n\n" +
      "Ao abrir o Termux pela primeira vez, aguarde a configuração inicial. Instale o Termux e seus plugins sempre da mesma fonte: F-Droid e GitHub usam assinaturas diferentes. Para trocar de fonte, faça backup dos dados antes de desinstalar a versão existente.",
    links: [{ label: "Abrir página oficial do Termux", url: TERMUX_FDROID_URL }],
  },
  {
    title: "Passo 2/5: preparar o Termux",
    text:
      "Abra o Termux, aguarde o primeiro carregamento e execute:\n\n" +
      "pkg update && pkg upgrade -y\n\n" +
      "Confirme as atualizações se for solicitado. Se houver erro de repositório, execute termux-change-repo, escolha outro espelho e tente novamente.\n\n" +
      "O Termux usa pacotes próprios: não adicione repositórios Debian ou Ubuntu.",
  },
  {
    title: "Passo 3/5: instalar JavaScript (Node.js)",
    text:
      "JavaScript é a linguagem do bot. Node.js é o programa que executa JavaScript fora do navegador; Java é outra linguagem e não é necessário para este bot.\n\n" +
      "Instale Node.js LTS, Git e ferramentas usadas pelo projeto:\n\n" +
      "pkg install nodejs-lts git ffmpeg python build-essential pkg-config libvips -y\n\n" +
      "Confira as versões:\n" +
      "node --version\n" +
      "npm --version\n\n" +
      "O projeto exige Node.js 22.8.0 ou superior. Se nodejs-lts não estiver disponível, consulte a documentação oficial do Termux.",
    links: [{ label: "Ajuda oficial: Node.js", url: TERMUX_NODE_URL }],
  },
  {
    title: "Passo 4/5: colocar os arquivos do bot",
    text:
      "Clone o repositório do XIC BOT com estes comandos:\n\n" +
      `git clone ${BOT_REPOSITORY_URL} bot\n` +
      "cd bot\n\n" +
      "Ou use o botão abaixo para receber o projeto em um arquivo ZIP neste chat.\n\n" +
      "Se recebeu um ZIP: execute termux-setup-storage, permita o acesso aos arquivos, instale unzip com pkg install unzip -y e extraia o ZIP da pasta Downloads para ~/bot. Depois entre na pasta do projeto com cd ~/bot.\n\n" +
      "Não compartilhe arquivos de sessão, tokens ou credenciais.",
  },
  {
    title: "Passo 5/5: instalar dependências e iniciar",
    text:
      "Dentro da pasta do projeto, instale as dependências:\n\n" +
      "SHARP_FORCE_GLOBAL_LIBVIPS=1 npm install\n\n" +
      "Para iniciar agora, execute:\n" +
      "npm start\n\n" +
      "Para ligar o bot novamente pelo celular depois: abra o aplicativo Termux, entre na pasta do projeto com cd ~/bot e execute npm start. Não é necessário instalar as dependências de novo a cada inicialização.\n\n" +
      "Siga o pareamento exibido pelo bot e vincule o WhatsApp em Aparelhos conectados. Nunca envie seu QR Code, código de pareamento ou pasta assets/auth para outra pessoa.",
  },
  {
    title: "Bot iniciado: limitações e dicas",
    text:
      "Mantenha o Termux aberto durante a execução. Para reduzir a chance de suspensão, execute termux-wake-lock e configure a bateria do Android para não restringir o Termux. Ao terminar, use termux-wake-unlock.\n\n" +
      "O Android pode encerrar processos em segundo plano; um celular não garante disponibilidade contínua como um servidor. O projeto também usa dependências nativas, como sharp. Se npm install falhar, confira a versão do Node.js e o erro de compilação; algumas dependências podem não ser compatíveis com o Android do seu aparelho.\n\n" +
      "Para parar o bot, pressione Ctrl+C no Termux.",
  },
];

function makeButton(name, parameters) {
  return createNativeFlowButton(name, parameters);
}

function makeStepButtons(stepIndex, prefix) {
  const step = STEPS[stepIndex];
  const buttons = (step.links || []).map(({ label, url }) =>
    makeButton("cta_url", {
      display_text: label,
      url,
    }),
  );

  if (stepIndex === 4) {
    buttons.push(
      makeButton("quick_reply", {
        display_text: "📦 Baixar bot (.zip)",
        id: `${prefix}termux-tutorial download`,
      }),
    );
  }

  if (stepIndex > 0) {
    buttons.push(
      makeButton("quick_reply", {
        display_text: "⬅️ Passo anterior",
        id: `${prefix}termux-tutorial ${stepIndex - 1}`,
      }),
    );
  }

  if (stepIndex < STEPS.length - 1) {
    buttons.push(
      makeButton("quick_reply", {
        display_text: "Próximo passo ➡️",
        id: `${prefix}termux-tutorial ${stepIndex + 1}`,
      }),
    );
  } else {
    buttons.push(
      makeButton("quick_reply", {
        display_text: "🔄 Voltar ao início",
        id: `${prefix}termux-tutorial 0`,
      }),
    );
  }

  return buttons;
}

export default {
  name: "termux-tutorial",
  description: "Tutorial interativo para instalar o Termux e iniciar o bot.",
  commands: ["termux-tutorial", "tutorial-termux", "termuxtutorial"],
  usage: `${PREFIX}termux-tutorial`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    prefix,
    webMessage,
    sendErrorReply,
    sendDocumentFromBuffer,
  }) => {
    const isDownloadRequest = args.length === 1 && args[0] === "download";
    if (
      args.length > 1 ||
      (args.length === 1 && !isDownloadRequest && !/^\d+$/.test(args[0]))
    ) {
      throw new InvalidParameterError(
        `Use ${prefix || PREFIX}termux-tutorial para abrir o tutorial ou escolha uma etapa pelos botões.`,
      );
    }

    if (isDownloadRequest) {
      try {
        const response = await fetch(BOT_ARCHIVE_URL, {
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) {
          throw new Error(`Download do ZIP retornou HTTP ${response.status}.`);
        }

        const archive = Buffer.from(await response.arrayBuffer());
        if (archive.length === 0) {
          throw new Error("O arquivo ZIP baixado está vazio.");
        }

        await sendDocumentFromBuffer(
          archive,
          "application/zip",
          "xic-bot.zip",
        );
      } catch (error) {
        errorLog(`[TERMUX TUTORIAL DOWNLOAD ERROR] ${error.stack || error.message || error}`);
        await sendErrorReply(
          "Não consegui baixar o ZIP do bot agora. Tente novamente mais tarde ou use o comando git clone mostrado no tutorial.",
        );
      }
      return;
    }

    const stepIndex = args.length === 0 ? 0 : Number(args[0]);
    if (stepIndex < 0 || stepIndex >= STEPS.length) {
      throw new InvalidParameterError(
        `Etapa inválida. Abra ${prefix || PREFIX}termux-tutorial para começar.`,
      );
    }

    const activePrefix = prefix || PREFIX;
    const step = STEPS[stepIndex];

    try {
      await sendNativeFlowButtons(
        socket,
        remoteJid,
        {
          title: step.title,
          text: step.text,
          footer: `Tutorial Termux • ${stepIndex + 1}/${STEPS.length}`,
          buttons: makeStepButtons(stepIndex, activePrefix),
        },
        { quoted: webMessage },
      );
    } catch (error) {
      errorLog(`[TERMUX TUTORIAL ERROR] ${error.stack || error.message || error}`);
      await sendErrorReply(
        "Não consegui enviar os botões do tutorial. Tente novamente ou consulte os links oficiais do F-Droid e Termux.",
      );
    }
  },
};
