import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { it } from "node:test";
import { clearOldGeneratedWebpFiles } from "../commands/owner/limpar-cache.js";

it("removes only old generated root WebP files", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "limpar-cache-"));

  try {
    const oldGeneratedPath = path.join(directory, "xapa_123_456.webp");
    const recentGeneratedPath = path.join(directory, "xapa_123_789.webp");
    const unrelatedWebpPath = path.join(directory, "ban1.webp");
    const nestedDirectory = path.join(directory, "nested");
    const nestedGeneratedPath = path.join(nestedDirectory, "xapa_123_999.webp");
    const oldContent = "unused sticker";
    const cutoff = Date.now() - 15 * 60 * 1000;

    await fs.mkdir(nestedDirectory);
    await Promise.all([
      fs.writeFile(oldGeneratedPath, oldContent),
      fs.writeFile(recentGeneratedPath, "in use"),
      fs.writeFile(unrelatedWebpPath, "keep"),
      fs.writeFile(nestedGeneratedPath, "keep"),
    ]);
    const oldDate = new Date(cutoff - 1000);
    await fs.utimes(oldGeneratedPath, oldDate, oldDate);
    await fs.utimes(unrelatedWebpPath, oldDate, oldDate);
    await fs.utimes(nestedGeneratedPath, oldDate, oldDate);

    const result = await clearOldGeneratedWebpFiles(directory, cutoff);

    assert.deepStrictEqual(result, {
      filesRemoved: 1,
      bytesFreed: Buffer.byteLength(oldContent),
    });
    await assert.rejects(fs.access(oldGeneratedPath));
    await Promise.all([
      fs.access(recentGeneratedPath),
      fs.access(unrelatedWebpPath),
      fs.access(nestedGeneratedPath),
    ]);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
