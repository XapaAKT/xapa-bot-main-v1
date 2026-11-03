/**
 * Serviços de processamento de imagens usando ffmpeg.
 *
 * @author Xapa
 */
import { exec } from "child_process";
import path from "node:path";
import { TEMP_DIR } from "../config.js";
import { getRandomNumber, removeFileIfExists } from "../utils/index.js";
import { errorLog } from "../utils/logger.js";

class Ffmpeg {
  constructor() {
    this.tempDir = TEMP_DIR;
  }

  async _executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          errorLog(`Command error: ${stderr}`);
          return reject(error);
        }
        resolve(stdout);
      });
    });
  }

  async _createTempFilePath(extension = "png") {
    return path.join(
      this.tempDir,
      `${getRandomNumber(10_000, 99_999)}.${extension}`,
    );
  }

  async applyBlur(inputPath, intensity = "7:5") {
    const outputPath = await this._createTempFilePath();
    const command = `ffmpeg -i ${inputPath} -vf boxblur=${intensity} ${outputPath}`;
    await this._executeCommand(command);
    return outputPath;
  }

  async convertToGrayscale(inputPath) {
    const outputPath = await this._createTempFilePath();
    const command = `ffmpeg -i ${inputPath} -vf format=gray ${outputPath}`;
    await this._executeCommand(command);
    return outputPath;
  }

  async mirrorImage(inputPath) {
    const outputPath = await this._createTempFilePath();
    const command = `ffmpeg -i ${inputPath} -vf hflip ${outputPath}`;
    await this._executeCommand(command);
    return outputPath;
  }

  async adjustContrast(inputPath, contrast = 1.2) {
    const outputPath = await this._createTempFilePath();
    const command = `ffmpeg -i ${inputPath} -vf eq=contrast=${contrast} ${outputPath}`;
    await this._executeCommand(command);
    return outputPath;
  }

  async applyPixelation(inputPath) {
    const outputPath = await this._createTempFilePath();
    const command = `ffmpeg -i ${inputPath} -vf 'scale=iw/6:ih/6, scale=iw*10:ih*10:flags=neighbor' ${outputPath}`;
    await this._executeCommand(command);
    return outputPath;
  }

  async convertStickerToImage(inputPath) {
    const outputPath = await this._createTempFilePath();
    const command = `ffmpeg -y -i "${inputPath}" "${outputPath}"`;
    await this._executeCommand(command);
    return outputPath;
  }

  async reduceVideoDuration(inputPath, seconds = 1) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error("A redução da duração deve ser maior que zero.");
    }

    const quotePath = (filePath) => `"${filePath.replaceAll('"', '\\"')}"`;
    const probeCommand =
      `ffprobe -v error -show_entries format=duration ` +
      `-of default=noprint_wrappers=1:nokey=1 ${quotePath(inputPath)}`;
    const durationOutput = await this._executeCommand(probeCommand);
    const duration = Number.parseFloat(durationOutput.trim());

    if (!Number.isFinite(duration) || duration <= seconds) {
      throw new Error("O vídeo precisa ser maior que o tempo a ser reduzido.");
    }

    const outputPath = await this._createTempFilePath("mp4");
    const targetDuration = (duration - seconds).toFixed(3);
    const command =
      `ffmpeg -y -i ${quotePath(inputPath)} -t ${targetDuration} ` +
      `-c:v libx264 -c:a aac -movflags +faststart ${quotePath(outputPath)}`;
    await this._executeCommand(command);
    return outputPath;
  }

  async getVideoDuration(inputPath) {
    const quotePath = (filePath) => `"${filePath.replaceAll('"', '\\"')}"`;
    const command =
      `ffprobe -v error -show_entries format=duration ` +
      `-of default=noprint_wrappers=1:nokey=1 ${quotePath(inputPath)}`;
    const durationOutput = await this._executeCommand(command);
    const duration = Number.parseFloat(durationOutput.trim());

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Não foi possível identificar a duração do vídeo.");
    }

    return duration;
  }

  async cleanup(filePath) {
    removeFileIfExists(filePath);
  }
}

export { Ffmpeg };
