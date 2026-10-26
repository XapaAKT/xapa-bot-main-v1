import fs from "node:fs/promises";
import path from "node:path";

export async function getProjectSize(directory) {
  let totalBytes = 0;
  const pendingDirectories = [directory];

  while (pendingDirectories.length > 0) {
    const currentDirectories = pendingDirectories.splice(0, 32);
    const directoryEntries = await Promise.all(
      currentDirectories.map((currentDirectory) =>
        fs.readdir(currentDirectory, { withFileTypes: true }),
      ),
    );
    const files = [];

    for (let index = 0; index < currentDirectories.length; index++) {
      for (const entry of directoryEntries[index]) {
        if (entry.name === ".git") {
          continue;
        }

        const entryPath = path.join(currentDirectories[index], entry.name);
        if (entry.isDirectory()) {
          pendingDirectories.push(entryPath);
        } else if (entry.isFile()) {
          files.push(entryPath);
        }
      }
    }

    const fileStats = await Promise.all(files.map((file) => fs.stat(file)));
    totalBytes += fileStats.reduce((sum, stats) => sum + stats.size, 0);
  }

  return totalBytes;
}
