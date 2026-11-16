import { Blob } from "node:buffer";
import sharp from "sharp";

const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

export async function removeBackground(imageBuffer, filename = "imagem.png") {
  const apiKey = process.env.REMOVE_BG_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Configure a variável de ambiente REMOVE_BG_API_KEY para usar o RemoveBG.",
    );
  }

  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new Error("A imagem recebida está vazia ou inválida.");
  }

  const pngBuffer = await sharp(imageBuffer).png().toBuffer();
  const formData = new FormData();
  formData.append(
    "image_file",
    new Blob([pngBuffer], { type: "image/png" }),
    filename,
  );
  formData.append("size", "auto");

  const response = await fetch(REMOVE_BG_ENDPOINT, {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: formData,
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(
      `Remove.bg respondeu com HTTP ${response.status}${detail ? `: ${detail}` : "."}`,
    );
  }

  const result = Buffer.from(await response.arrayBuffer());
  if (!result.length) {
    throw new Error("Remove.bg retornou uma imagem vazia.");
  }

  return result;
}
