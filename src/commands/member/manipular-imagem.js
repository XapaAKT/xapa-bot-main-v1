import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

const USAGE =
  `${PREFIX}imagem <pb|sepia|blur|girar|espelhar|virar|nitidez|brilho|contraste|saturacao|redimensionar>`;

function parseNumber(value, label, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new InvalidParameterError(
      `${label} deve ser um número entre ${min} e ${max}.`,
    );
  }

  return number;
}

function makePipeline(input, operation, values) {
  let image = sharp(input, {
    failOn: "error",
    limitInputPixels: 40_000_000,
  }).rotate();

  switch (operation) {
    case "pb":
    case "pretoebranco":
    case "gray":
      image = image.grayscale();
      break;
    case "sepia":
      image = image
        .recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131],
        ])
        .modulate({ saturation: 0.8 });
      break;
    case "blur":
    case "desfoque":
      image = image.blur(values[0]);
      break;
    case "girar":
    case "rotate":
      image = image.rotate(values[0], { background: "#ffffff" });
      break;
    case "espelhar":
    case "mirror":
      image = image.flop();
      break;
    case "virar":
    case "flip":
      image = image.flip();
      break;
    case "nitidez":
    case "sharpen":
      image = image.sharpen();
      break;
    case "brilho":
    case "brightness":
      image = image.modulate({ brightness: values[0] });
      break;
    case "contraste":
    case "contrast": {
      const multiplier = 1 + values[0] / 100;
      image = image.linear(multiplier, 128 * (1 - multiplier));
      break;
    }
    case "saturacao":
    case "saturation":
      image = image.modulate({ saturation: values[0] });
      break;
    case "redimensionar":
    case "resize":
      image = image.resize({
        width: values[0],
        height: values[1],
        fit: "inside",
        withoutEnlargement: true,
      });
      break;
    default:
      throw new InvalidParameterError(
        `Efeito desconhecido. Opções: pb, sepia, blur, girar, espelhar, virar, nitidez, brilho, contraste, saturacao, redimensionar.\nUso: ${USAGE}`,
      );
  }

  return image;
}

function getOperationValues(operation, parameters) {
  switch (operation) {
    case "blur":
    case "desfoque":
      return [parseNumber(parameters[0] ?? "5", "Desfoque", 0.3, 20)];
    case "girar":
    case "rotate":
      return [parseNumber(parameters[0] ?? "90", "Ângulo", -360, 360)];
    case "brilho":
    case "brightness":
      return [parseNumber(parameters[0] ?? "1.2", "Brilho", 0.1, 3)];
    case "contraste":
    case "contrast":
      return [parseNumber(parameters[0] ?? "20", "Contraste", -100, 100)];
    case "saturacao":
    case "saturation":
      return [parseNumber(parameters[0] ?? "1.5", "Saturação", 0, 3)];
    case "redimensionar":
    case "resize":
      if (!parameters[0] || !parameters[1]) {
        throw new InvalidParameterError(
          `Informe largura e altura. Exemplo: ${PREFIX}imagem redimensionar 800 800`,
        );
      }

      return [
        parseNumber(parameters[0], "Largura", 1, 8000),
        parseNumber(parameters[1], "Altura", 1, 8000),
      ];
    default:
      return [];
  }
}

export default {
  name: "manipular-imagem",
  description:
    "Aplica efeitos e ajustes em uma imagem enviada ou respondida.",
  commands: ["imagem", "editar-imagem", "manipular-imagem"],
  usage: `${USAGE} (marque ou responda a uma imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    isImage,
    downloadImage,
    sendImageFromBuffer,
    sendWaitReact,
    sendSuccessReact,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        `Marque ou responda a uma imagem.\nUso: ${USAGE}`,
      );
    }

    const [operation, ...parameters] = args;
    if (!operation) {
      throw new InvalidParameterError(
        `Escolha um efeito.\nUso: ${USAGE}\nExemplo: ${PREFIX}imagem sepia`,
      );
    }

    const normalizedOperation = operation.toLowerCase().replaceAll("-", "");
    const values = getOperationValues(normalizedOperation, parameters);

    await sendWaitReact();
    const inputPath = await downloadImage(webMessage);
    if (!inputPath) {
      throw new WarningError("Não consegui baixar a imagem enviada.");
    }

    try {
      const input = await readFile(inputPath);
      const image = sharp(input, {
        failOn: "error",
        limitInputPixels: 40_000_000,
      });
      const metadata = await image.metadata();
      const output = await makePipeline(input, normalizedOperation, values)
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();

      await sendImageFromBuffer(
        output,
        `✨ Efeito aplicado: ${normalizedOperation} (${metadata.width}×${metadata.height})`,
      );
      await sendSuccessReact();
    } catch (error) {
      errorLog(
        `[IMAGEM] Falha ao processar efeito "${normalizedOperation}": ${error?.stack || error?.message || String(error)}`,
      );

      if (error instanceof InvalidParameterError) {
        throw error;
      }

      throw new WarningError(
        "Não foi possível processar essa imagem. Verifique se o arquivo está íntegro e tente novamente.",
      );
    }
  },
};
