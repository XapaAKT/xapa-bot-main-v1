import sharp from "sharp";

const DEFAULT_BACKGROUND = "#ffffff";

function normalizeBackground(value = DEFAULT_BACKGROUND) {
  const color = String(value).trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^[a-z]{3,20}$/i.test(color)) return color;
  throw new Error("A cor do fundo deve ser um nome CSS ou hexadecimal, como #ffffff.");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text, maxChars = 18) {
  return String(text)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) =>
      word.length > maxChars
        ? word.match(new RegExp(`.{1,${maxChars}}`, "g")) || [word]
        : [word],
    )
    .reduce((lines, word) => {
      const current = lines.at(-1) || "";
      if (current && `${current} ${word}`.length <= maxChars) {
        lines[lines.length - 1] = `${current} ${word}`;
      } else {
        lines.push(word);
      }
      return lines;
    }, [])
    .slice(0, 9);
}

export function parseTextCanvasArgs(args = []) {
  const values = [...args];
  let background = DEFAULT_BACKGROUND;

  if (values.length >= 2 && ["fundo", "--fundo"].includes(values.at(-2).toLowerCase())) {
    background = normalizeBackground(values.pop());
    values.pop();
  }

  const text = values.join(" ").trim();
  if (!text) throw new Error("Informe o texto que será transformado.");

  return { text, background };
}

export async function createTextCanvas(
  text,
  { background = DEFAULT_BACKGROUND, bratStyle = false } = {},
) {
  const safeBackground = normalizeBackground(background);
  const lines = wrapText(text, bratStyle ? 18 : 24);
  const fontSize = Math.max(
    bratStyle ? 54 : 42,
    Math.min(bratStyle ? 92 : 72, Math.floor(700 / Math.max(lines.length, 1))),
  );
  const startY = 500 - ((lines.length - 1) * fontSize * 0.58);
  const textSvg = lines
    .map(
      (line, index) =>
        `<text x="500" y="${startY + index * fontSize * 1.16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${bratStyle ? 900 : 700}">${escapeXml(line)}</text>`,
    )
    .join("");

  const svg = `
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${safeBackground}"/>
      <g transform="${bratStyle ? "rotate(-4 500 500)" : ""}" fill="#111">${textSvg}</g>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
