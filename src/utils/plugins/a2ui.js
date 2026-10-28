import { randomUUID } from "node:crypto";
import { MessageBuilder } from "baileys";

const BASIC_CATALOG =
  "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json";
const MAX_DATA_BYTES = 16 * 1024;
const MAX_FALLBACK_LENGTH = 4096;
const MAX_BUTTONS = 3;

export async function sendA2UI(
  socket,
  jid,
  { data, text = "", buttons = [], quoted = null } = {},
) {
  if (!socket || typeof socket.relayMessage !== "function") {
    throw new TypeError("sendA2UI: socket inválido ou não informado.");
  }
  if (!jid) {
    throw new TypeError("sendA2UI: destinatário não informado.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("sendA2UI: data deve ser um objeto.");
  }

  const components = data.createSurface?.components;
  if (!Array.isArray(components) || components.length === 0) {
    throw new TypeError(
      "sendA2UI: data.createSurface.components deve conter componentes.",
    );
  }
  const root = data.createSurface.root || "root";
  if (!components.some((component) => component?.id === root)) {
    throw new TypeError(
      `sendA2UI: nenhum componente define o root "${root}".`,
    );
  }
  if (typeof text !== "string" || text.length > MAX_FALLBACK_LENGTH) {
    throw new TypeError(
      `sendA2UI: text deve ser um texto de até ${MAX_FALLBACK_LENGTH} caracteres.`,
    );
  }
  if (!Array.isArray(buttons) || buttons.length > MAX_BUTTONS) {
    throw new TypeError(`sendA2UI: informe até ${MAX_BUTTONS} botões.`);
  }
  const validatedButtons = buttons.map((button, index) => {
    if (
      !button ||
      typeof button.name !== "string" ||
      !button.name.trim() ||
      typeof button.buttonParamsJson !== "string"
    ) {
      throw new TypeError(
        `sendA2UI: botão ${index + 1} deve ter name e buttonParamsJson.`,
      );
    }

    JSON.parse(button.buttonParamsJson);
    return button;
  });

  const widgetUuid = randomUUID();
  const surfaceData = MessageBuilder.a2uiSurface(components, {
    surfaceId: data.createSurface.surfaceId || `starcore-widget=${widgetUuid}`,
    root,
    catalogId: data.createSurface.catalogId || BASIC_CATALOG,
    version: data.version || "v0.9",
    type: data.type,
    title: data.title,
  });
  const serializedData = JSON.stringify(surfaceData);
  if (Buffer.byteLength(serializedData, "utf8") > MAX_DATA_BYTES) {
    throw new RangeError(
      `sendA2UI: data excede o limite de ${MAX_DATA_BYTES} bytes.`,
    );
  }

  return MessageBuilder.sendA2UI(socket, jid, components, {
    buttons: validatedButtons,
    data: surfaceData,
    fallback: text,
    quoted,
    uuid: widgetUuid,
  });
}
