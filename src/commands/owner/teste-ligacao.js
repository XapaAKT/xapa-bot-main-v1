import axios from "axios";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v23.0";

export default {
  name: "teste-ligacao",
  description:
    "Configura o pedido de permissão de ligação da WhatsApp Cloud API.",
  commands: ["teste-ligacao", "permissao-ligacao"],
  usage: `${PREFIX}teste-ligacao <ativar|desativar>`,

  handle: async ({ args, sendReply }) => {
    const action = args[0]?.toLowerCase();

    if (!["ativar", "desativar"].includes(action)) {
      throw new InvalidParameterError(
        `Use ${PREFIX}teste-ligacao ativar ou ${PREFIX}teste-ligacao desativar.`,
      );
    }

    const accessToken = process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      await sendReply(
        "Configure WHATSAPP_CLOUD_API_ACCESS_TOKEN e WHATSAPP_CLOUD_PHONE_NUMBER_ID no ambiente do bot antes de usar este comando.",
      );
      return;
    }

    if (!/^\d+$/.test(phoneNumberId)) {
      throw new InvalidParameterError(
        "WHATSAPP_CLOUD_PHONE_NUMBER_ID deve conter o ID numérico do telefone comercial da Cloud API.",
      );
    }

    const permissionStatus = action === "ativar" ? "ENABLED" : "DISABLED";
    const endpoint =
      `https://graph.facebook.com/${GRAPH_API_VERSION}/` +
      `${phoneNumberId}/settings`;
    let response;

    try {
      response = await axios.post(
        endpoint,
        {
          calling: {
            callback_permission_status: permissionStatus,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );
    } catch (error) {
      const apiMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Erro desconhecido";
      const status = error.response?.status
        ? ` HTTP ${error.response.status}.`
        : "";

      errorLog(`[TESTE LIGACAO] Erro na WhatsApp Cloud API: ${apiMessage}`);
      await sendReply(
        `Não foi possível atualizar a permissão de ligação.${status}\nDetalhes: ${apiMessage}`,
      );
      return;
    }

    if (response.data?.success !== true) {
      const message = "A Cloud API não confirmou a alteração das configurações.";
      errorLog(`[TESTE LIGACAO] ${message}`);
      await sendReply(message);
      return;
    }

    const confirmation =
      action === "ativar"
        ? "Permissão de retorno ativada. Para testar a tela da imagem, ligue do WhatsApp para o número comercial conectado à Cloud API; o WhatsApp apresenta o pedido depois dessa ligação."
        : "Pedido automático de permissão de retorno desativado.";

    await sendReply(`⛓️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 𝐃𝐄 𝐋𝐈𝐆𝐀𝐂̧𝐀̃𝐎\n\n${confirmation}`);
  },
};
