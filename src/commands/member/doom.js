import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";
import { sendNativeFlowButtons } from "../../utils/interactive.js";
import {
  controlDoomGame,
  getDoomGameFrame,
  startDoomGame,
  stopDoomGame,
} from "../../services/doom-game.js";

const BUTTON_GROUPS = [
  [
    { action: "up", label: "⬆️ Avançar" },
    { action: "left", label: "⬅️ Virar" },
    { action: "right", label: "➡️ Virar" },
  ],
  [
    { action: "down", label: "⬇️ Recuar" },
    { action: "fire", label: "🔫 Atirar" },
    { action: "use", label: "🚪 Usar" },
  ],
];

function getPlayerId(userLid, remoteJid) {
  return userLid || remoteJid;
}

async function sendGameFrame({
  buffer,
  action,
  remoteJid,
  socket,
  sendImageFromBuffer,
}) {
  await sendImageFromBuffer(
    buffer,
    `☠️ 𝙁𝙍𝙀𝙀𝘿𝙊𝙊𝙈 • ${action}\nEscolha um botão para continuar. Use ${PREFIX}doom help para ver todos os comandos.`,
  );

  for (const buttons of BUTTON_GROUPS) {
    await sendNativeFlowButtons(socket, remoteJid, {
      text: "🎮 CONTROLES DO JOGO",
      footer: "Também pode digitar /doom run, fire, use ou strafe.",
      buttons: buttons.map(({ action: buttonAction, label }) => ({
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: label,
          id: `${PREFIX}doom ${buttonAction}`,
        }),
      })),
    });
  }
}

export default {
  name: "doom",
  description:
    "Jogue FreeDoom por comandos e botões; cada ação retorna um quadro do jogo.",
  commands: ["doom", "freedoom"],
  usage: `${PREFIX}doom start|up|down|left|right|run|fire|use|strafe_left|strafe_right|status|stop`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    remoteJid,
    socket,
    userLid,
    sendReply,
    sendImageFromBuffer,
  }) => {
    const action = (args[0] || "help").toLowerCase();
    const playerId = getPlayerId(userLid, remoteJid);

    if (action === "help") {
      await sendReply(
        `🎮 𝙁𝙍𝙀𝙀𝘿𝙊𝙊𝙈 NO WHATSAPP\n\n` +
          `• ${PREFIX}doom start — inicia uma partida\n` +
          `• ${PREFIX}doom up|down|left|right — movimenta\n` +
          `• ${PREFIX}doom run — corre para frente\n` +
          `• ${PREFIX}doom fire — dispara\n` +
          `• ${PREFIX}doom use — usa portas e interruptores\n` +
          `• ${PREFIX}doom strafe_left|strafe_right — anda de lado\n` +
          `• ${PREFIX}doom status — recebe o quadro atual\n` +
          `• ${PREFIX}doom stop — encerra sua sessão\n\n` +
          "Cada comando avança o jogo e envia uma captura. A sessão encerra após 15 minutos sem ações.",
      );
      return;
    }

    if (action === "stop") {
      try {
        const stopped = stopDoomGame({ remoteJid, playerId });
        await sendReply(
          stopped
            ? "🛑 Sua sessão de FreeDoom foi encerrada."
            : "Não há uma partida ativa.",
        );
      } catch (error) {
        await sendReply(error.message);
      }
      return;
    }

    if (
      action !== "start" &&
      action !== "status" &&
      ![
        "up",
        "down",
        "left",
        "right",
        "run",
        "fire",
        "use",
        "strafe_left",
        "strafe_right",
      ].includes(action)
    ) {
      throw new InvalidParameterError(
        `Ação desconhecida. Use ${PREFIX}doom help para ver os controles.`,
      );
    }

    try {
      let frame;

      if (action === "start") {
        frame = await startDoomGame({ remoteJid, playerId });
      } else if (action === "status") {
        frame = getDoomGameFrame({ remoteJid, playerId });
      } else {
        frame = await controlDoomGame({ remoteJid, playerId, action });
      }

      await sendGameFrame({
        buffer: frame,
        action: action === "status" ? "QUADRO ATUAL" : action.toUpperCase(),
        remoteJid,
        socket,
        sendImageFromBuffer,
      });
    } catch (error) {
      errorLog(`[DOOM] Falha na ação "${action}": ${error?.stack || error}`);
      throw new WarningError(
        error.message.includes("Engine DOOM")
          ? `${error.message} O pacote kaboom.claude é compatível com Linux/macOS.`
          : error.message,
      );
    }
  },
};
