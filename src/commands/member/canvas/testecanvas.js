

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DATABASE_DIR, PREFIX } from "../../../config.js";
import { WarningError } from "../../../errors/index.js";
import { getProfile, updateProfile } from "../../../database/profile.js";
import { getPlayer } from "../../../database/rpg.js";
import { getUserEconomy } from "../../../utils/economy.js";
import { getUserName } from "../../../utils/index.js";
import {
  createNativeFlowButton,
  sendNativeFlowButtons,
} from "../../../utils/interactive.js";

const COMMAND = "testecanvas";
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 560;
const MAX_DESCRIPTION_LENGTH = 80;
const BACKGROUNDS_DIR = path.join(DATABASE_DIR, "profile-backgrounds");

const FONT_STYLES = Object.freeze({
  moderna: {
    family: "'Inter', 'DejaVu Sans', 'Noto Sans', Arial, sans-serif",
    style: "normal",
    titleSpacing: 0.2,
  },
  elegante: {
    family: "'Noto Serif', 'DejaVu Serif', Georgia, serif",
    style: "normal",
    titleSpacing: 0.6,
  },
  gotica: {
    family: "'UnifrakturCook', 'Old English Text MT', 'Noto Serif', serif",
    style: "normal",
    titleSpacing: 1.2,
  },
  editorial: {
    family: "'Cormorant Garamond', 'Noto Serif', Georgia, serif",
    style: "italic",
    titleSpacing: 0.3,
  },
  arcana: {
    family: "'Cinzel Decorative', 'DejaVu Serif', 'Noto Serif', serif",
    style: "normal",
    titleSpacing: 1.8,
  },
  gamer: {
    family: "'Rajdhani', 'DejaVu Sans', 'Noto Sans', sans-serif",
    style: "normal",
    titleSpacing: 1.1,
  },
  retro: {
    family: "'DejaVu Sans Mono', 'Noto Sans Mono', 'Courier New', monospace",
    style: "normal",
    titleSpacing: 0.2,
  },
  divertida: {
    family: "'Trebuchet MS', 'DejaVu Sans', 'Noto Sans', sans-serif",
    style: "normal",
    titleSpacing: 0,
  },
  minimalista: {
    family: "'Inter', 'DejaVu Sans', 'Noto Sans', Arial, sans-serif",
    style: "normal",
    titleSpacing: 1.4,
  },
});

const THEMES = Object.freeze({
  neon: {
    start: "#090d1c",
    end: "#28205b",
    accent: "#5ee7ff",
    accentEnd: "#b48cff",
    line: "#d9d7ff",
    glow: "#6d5dfc",
    text: "#f7f5ff",
    muted: "#bcbad6",
  },
  oceano: {
    start: "#031522",
    end: "#0b4351",
    accent: "#4af3e8",
    accentEnd: "#3688ff",
    line: "#adfff8",
    glow: "#00c2c7",
    text: "#f1fffe",
    muted: "#a8d2d8",
  },
  sunset: {
    start: "#200c18",
    end: "#682b37",
    accent: "#ffc078",
    accentEnd: "#ff5577",
    line: "#ffe1c2",
    glow: "#fa537e",
    text: "#fff7f0",
    muted: "#e6b9bd",
  },
  matrix: {
    start: "#03120d",
    end: "#123d2a",
    accent: "#a8ffbe",
    accentEnd: "#22c985",
    line: "#bdfbd1",
    glow: "#24e58a",
    text: "#f0fff5",
    muted: "#acd3b8",
  },
  sangue: {
    start: "#10070d",
    end: "#3b0b1b",
    accent: "#ff3f60",
    accentEnd: "#8f123c",
    line: "#ff9aaa",
    glow: "#ed174c",
    text: "#fff2f4",
    muted: "#d5a4af",
  },
  obsidiana: {
    start: "#07080c",
    end: "#1b1d28",
    accent: "#e7d6a1",
    accentEnd: "#9387bc",
    line: "#dcd3b9",
    glow: "#8a7ba8",
    text: "#f6f1e8",
    muted: "#b6b0aa",
  },
  eclipse: {
    start: "#080617",
    end: "#2a1749",
    accent: "#d4b5ff",
    accentEnd: "#7550c9",
    line: "#e6d7ff",
    glow: "#8d58ff",
    text: "#fbf7ff",
    muted: "#c1b2db",
  },
  reliquia: {
    start: "#17120c",
    end: "#47351c",
    accent: "#f4d28b",
    accentEnd: "#b77a35",
    line: "#f8e5bc",
    glow: "#be8a3e",
    text: "#fff8e9",
    muted: "#d6c4a1",
  },
  abismo: {
    start: "#030912",
    end: "#10293a",
    accent: "#9cecff",
    accentEnd: "#416eac",
    line: "#c6f4ff",
    glow: "#2e9dd0",
    text: "#f2fbff",
    muted: "#a8c5d6",
  },
});

const EDITOR_FALLBACK = () =>
  [
    "🎛️ *EDITOR DO CANVAS*",
    "",
    `✏️ ${PREFIX}${COMMAND} desc <texto>`,
    `🔤 ${PREFIX}${COMMAND} fontes`,
    `🎨 ${PREFIX}${COMMAND} temas`,
    `🖼️ ${PREFIX}${COMMAND} fundo (marque ou responda a uma imagem)`,
    `🔄 ${PREFIX}${COMMAND}`,
  ].join("\n");

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(value, maxLength) {
  const text = Array.from(String(value ?? "").trim());

  if (text.length <= maxLength) {
    return text.join("");
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).join("")}…`;
}

function formatNumber(value) {
  const number = Number(value ?? 0);

  return (Number.isFinite(number) ? number : 0).toLocaleString("pt-BR");
}

function wrapText(value, maxChars, maxLines = 2) {
  const text = truncate(value, MAX_DESCRIPTION_LENGTH);

  if (!text) {
    return [];
  }

  const words = text.split(/\s+/).filter(Boolean);
  const allLines = [];
  let currentLine = "";

  for (const rawWord of words) {
    const word = truncate(rawWord, maxChars);
    const candidate = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (currentLine && candidate.length > maxChars) {
      allLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    allLines.push(currentLine);
  }

  if (allLines.length <= maxLines) {
    return allLines;
  }

  const visibleLines = allLines.slice(0, maxLines);
  const lastIndex = maxLines - 1;

  visibleLines[lastIndex] =
    `${truncate(visibleLines[lastIndex], maxChars - 1).replace(/…$/u, "")}…`;

  return visibleLines;
}

function getFontSize(value, baseSize, minSize = 22, idealLength = 12) {
  const length = Array.from(String(value ?? "")).length;

  if (length <= idealLength) {
    return baseSize;
  }

  return Math.max(
    minSize,
    Math.floor((baseSize * idealLength) / length),
  );
}

function isPathInside(directory, target) {
  const root = path.resolve(directory);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(root, resolvedTarget);

  return relative === "" ||
    (
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative)
    );
}

function getThemeDecorations(themeName, theme) {
  const common = `
    <g fill="${theme.accent}" opacity="0.42">
      <circle cx="92" cy="142" r="2" />
      <circle cx="372" cy="58" r="1.5" />
      <circle cx="706" cy="92" r="2" />
      <circle cx="934" cy="350" r="1.5" />
      <circle cx="44" cy="402" r="1.5" />
    </g>
    <g fill="none" stroke="${theme.line}" stroke-width="1" opacity="0.16">
      <path d="M22 218 C104 188 146 193 204 226" />
      <path d="M756 512 C820 473 890 479 978 438" />
      <path d="M705 24 C760 54 792 60 848 48" />
    </g>
  `;

  if (themeName === "oceano") {
    return `
      ${common}
      <g fill="none" stroke="${theme.accent}" stroke-linecap="round">
        <path d="M0 448 C112 408 185 492 302 454 S492 429 610 468 S824 495 1000 438"
          stroke-width="2.5" opacity="0.34" />
        <path d="M0 468 C122 430 185 514 318 474 S496 452 626 490 S842 514 1000 462"
          stroke-width="1" opacity="0.22" />
      </g>
      <g fill="${theme.line}" stroke="${theme.accent}" stroke-width="1" opacity="0.42">
        <circle cx="118" cy="330" r="8" fill-opacity="0.08" />
        <circle cx="145" cy="300" r="3" fill-opacity="0.12" />
        <circle cx="178" cy="364" r="5" fill-opacity="0.1" />
        <circle cx="386" cy="92" r="6" fill-opacity="0.08" />
        <circle cx="422" cy="70" r="2.5" fill-opacity="0.12" />
        <circle cx="927" cy="401" r="10" fill-opacity="0.07" />
        <circle cx="956" cy="371" r="4" fill-opacity="0.1" />
      </g>
      <g fill="${theme.accent}" opacity="0.3">
        <path d="M236 514 C236 501 248 494 248 484 C248 494 260 501 260 514 C260 526 236 526 236 514Z" />
        <path d="M770 184 C770 173 780 168 780 160 C780 168 790 173 790 184 C790 194 770 194 770 184Z" />
      </g>
    `;
  }

  if (themeName === "sangue") {
    return `
      ${common}
      <g fill="${theme.accentEnd}" opacity="0.78">
        <path d="M92 0 H116 V28 C116 42 110 49 104 61 C98 49 92 42 92 28Z" />
        <path d="M172 0 H184 V18 C184 28 181 34 178 42 C175 34 172 28 172 18Z" />
        <path d="M278 0 H314 V37 C314 53 305 62 296 78 C287 62 278 53 278 37Z" />
        <path d="M486 0 H502 V22 C502 34 498 40 494 50 C490 40 486 34 486 22Z" />
        <path d="M684 0 H706 V30 C706 43 701 51 695 63 C689 51 684 43 684 30Z" />
        <path d="M866 0 H908 V31 C908 48 897 59 887 76 C877 59 866 48 866 31Z" />
      </g>
      <g fill="${theme.accent}" opacity="0.72">
        <circle cx="104" cy="85" r="5" />
        <circle cx="296" cy="101" r="3.5" />
        <circle cx="494" cy="72" r="4" />
        <circle cx="695" cy="91" r="3" />
        <circle cx="887" cy="105" r="5" />
        <path d="M52 258 C52 246 63 240 63 230 C63 240 74 246 74 258 C74 269 52 269 52 258Z" />
        <path d="M918 292 C918 281 927 275 927 266 C927 275 936 281 936 292 C936 302 918 302 918 292Z" />
      </g>
      <g fill="none" stroke="${theme.line}" stroke-width="1" opacity="0.3">
        <path d="M22 116 C74 102 110 116 156 105" />
        <path d="M828 126 C884 111 925 126 978 110" />
      </g>
    `;
  }

  if (themeName === "eclipse") {
    return `
      ${common}
      <g transform="translate(846 150)" opacity="0.58">
        <circle r="142" fill="none" stroke="${theme.accent}" stroke-width="1" stroke-dasharray="2 12" />
        <circle r="134" fill="none" stroke="${theme.line}" stroke-width="0.8" stroke-opacity="0.38" />
        <circle r="58" fill="${theme.glow}" fill-opacity="0.18" />
        <circle cx="-10" cy="-7" r="40" fill="${theme.text}" fill-opacity="0.9" />
        <circle cx="8" cy="-15" r="40" fill="${theme.end}" />
        <g stroke="${theme.accent}" stroke-width="1.3" stroke-linecap="round" opacity="0.8">
          <path d="M0 -83 V-106 M0 83 V106 M-83 0 H-106 M83 0 H106" />
          <path d="M-59 -59 L-75 -75 M59 -59 L75 -75 M-59 59 L-75 75 M59 59 L75 75" />
        </g>
      </g>
      <g fill="${theme.line}" opacity="0.7">
        <path d="M632 104 l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />
        <path d="M746 238 l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
        <path d="M948 232 l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
      </g>
    `;
  }

  if (themeName === "neon") {
    return `
      ${common}
      <g fill="none" stroke="${theme.accent}" stroke-width="1.2" opacity="0.3">
        <path d="M0 318 L110 272 L205 310 L300 265" />
        <path d="M730 400 L816 360 L900 392 L1000 350" />
      </g>
      <g fill="${theme.accentEnd}" opacity="0.7">
        <circle cx="112" cy="272" r="3" />
        <circle cx="205" cy="310" r="3" />
        <circle cx="816" cy="360" r="3" />
        <circle cx="900" cy="392" r="3" />
      </g>
    `;
  }

  if (themeName === "matrix") {
    return `
      ${common}
      <g fill="${theme.accent}" opacity="0.35" font-family="monospace" font-size="12">
        <text x="24" y="214">10110</text>
        <text x="344" y="112">01001</text>
        <text x="930" y="324">11010</text>
        <text x="726" y="532">00101</text>
      </g>
      <g stroke="${theme.accentEnd}" stroke-width="1" opacity="0.3">
        <path d="M24 226 H126 M344 124 H430 M874 336 H976" />
      </g>
    `;
  }

  if (themeName === "sunset") {
    return `
      ${common}
      <circle cx="92" cy="452" r="52" fill="${theme.accent}" fill-opacity="0.08" />
      <path d="M0 448 C132 410 190 492 310 456 S510 438 630 476 S842 500 1000 452"
        fill="none" stroke="${theme.accent}" stroke-width="2" opacity="0.3" />
      <g stroke="${theme.accent}" stroke-width="1.5" opacity="0.35">
        <path d="M40 430 H148 M58 414 H132 M76 398 H116" />
      </g>
    `;
  }

  if (themeName === "obsidiana") {
    return `
      ${common}
      <g fill="none" stroke="${theme.accent}" opacity="0.35">
        <path d="M34 238 L88 180 L142 238 L88 296Z" />
        <path d="M858 370 L916 308 L974 370 L916 432Z" />
        <path d="M34 238 H142 M88 180 V296 M858 370 H974 M916 308 V432" />
      </g>
    `;
  }

  if (themeName === "reliquia") {
    return `
      ${common}
      <g fill="none" stroke="${theme.accent}" stroke-width="1.2" opacity="0.4">
        <path d="M26 166 H150 M850 166 H974" />
        <path d="M48 154 l14 -14 14 14-14 14Z M924 154 l14 -14 14 14-14 14Z" />
      </g>
      <g fill="${theme.line}" opacity="0.5">
        <circle cx="70" cy="190" r="2" />
        <circle cx="930" cy="190" r="2" />
      </g>
    `;
  }

  if (themeName === "abismo") {
    return `
      ${common}
      <g fill="none" stroke="${theme.accent}" opacity="0.28">
        <path d="M0 510 C120 460 190 530 308 486 S520 462 644 508 S858 544 1000 494"
          stroke-width="3" />
        <path d="M0 526 C120 476 190 546 308 502 S520 478 644 524 S858 560 1000 510"
          stroke-width="1" />
      </g>
      <g fill="${theme.line}" opacity="0.45">
        <circle cx="182" cy="116" r="2" />
        <circle cx="228" cy="88" r="1.5" />
        <circle cx="734" cy="106" r="2" />
        <circle cx="780" cy="76" r="1.5" />
      </g>
    `;
  }

  return common;
}

async function loadProfileBackground(profile) {
  if (!profile?.background) {
    return null;
  }

  if (!isPathInside(BACKGROUNDS_DIR, profile.background)) {
    console.warn(
      "[TESTE CANVAS] Caminho do fundo fora da pasta permitida; usando o tema padrão.",
    );

    return null;
  }

  try {
    return await fs.readFile(profile.background);
  } catch (error) {
    console.warn(
      `[TESTE CANVAS] Não foi possível abrir o fundo salvo: ${error.message}`,
    );

    return null;
  }
}

async function createProfileCanvas(
  name,
  profile = {},
  economy = {},
  player = {},
) {
  const safeName = escapeXml(truncate(name || "Usuário", 24));

  const descriptionLines = wrapText(
    profile.description,
    46,
    2,
  ).map(escapeXml);

  const fontConfig =
    FONT_STYLES[profile.font] || FONT_STYLES.moderna;

  const fontFamily = fontConfig.family;
  const fontStyle = fontConfig.style;
  const titleSpacing = fontConfig.titleSpacing;

  const theme = THEMES[profile.theme] || THEMES.obsidiana;
  const themeDecorations = getThemeDecorations(profile.theme, theme);

  const level = escapeXml(formatNumber(profile.level ?? 1));
  const xp = escapeXml(formatNumber(economy?.xp ?? profile.xp));
  const pokedolars = escapeXml(formatNumber(player?.coins));
  const coins = escapeXml(formatNumber(economy?.coins));

  const pokedolarsSize = getFontSize(pokedolars, 34, 22, 10);
  const xpSize = getFontSize(xp, 42, 25, 9);
  const coinsSize = getFontSize(coins, 30, 22, 14);

  const background = await loadProfileBackground(profile);

  const svg = `
    <svg
      width="${CANVAS_WIDTH}"
      height="${CANVAS_HEIGHT}"
      viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="backgroundGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stop-color="${theme.start}" />
          <stop offset="55%" stop-color="${theme.end}" />
          <stop offset="100%" stop-color="#03040a" />
        </linearGradient>

        <linearGradient
          id="accentGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0%" stop-color="${theme.accent}" />
          <stop offset="100%" stop-color="${theme.accentEnd}" />
        </linearGradient>

        <linearGradient
          id="metalGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stop-color="${theme.line}" stop-opacity="0.95" />
          <stop offset="50%" stop-color="${theme.accent}" stop-opacity="0.55" />
          <stop offset="100%" stop-color="${theme.accentEnd}" stop-opacity="0.9" />
        </linearGradient>

        <radialGradient id="sigilGlow">
          <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.32" />
          <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0" />
        </radialGradient>

        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020309" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#020309" stop-opacity="0.67" />
        </linearGradient>

        <pattern
          id="microGrid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="${theme.line}"
            stroke-opacity="0.055"
            stroke-width="0.7"
          />

          <circle
            cx="0"
            cy="0"
            r="1"
            fill="${theme.line}"
            fill-opacity="0.15"
          />
        </pattern>

        <clipPath id="canvasClip">
          <rect width="1000" height="560" rx="28" />
        </clipPath>
      </defs>

      <g clip-path="url(#canvasClip)">
        <rect
          width="1000"
          height="560"
          fill="url(#backgroundGradient)"
          opacity="${background ? "0.34" : "1"}"
        />

        <rect
          width="1000"
          height="560"
          fill="#020309"
          opacity="${background ? "0.22" : "0.08"}"
        />

        <rect
          width="1000"
          height="560"
          fill="url(#microGrid)"
        />

        <rect
          width="1000"
          height="560"
          fill="url(#shade)"
          opacity="${background ? "0.52" : "1"}"
        />

        <!-- Atmosfera específica do tema -->
        ${themeDecorations}

        <!-- Lumière ambiente e marcas gravadas -->
        <circle
          cx="843"
          cy="154"
          r="230"
          fill="url(#sigilGlow)"
        />

        <path
          d="M615 0 H1000 V218 C925 157 837 105 615 0Z"
          fill="${theme.accent}"
          opacity="0.035"
        />

        <path
          d="M0 448 C180 392 241 512 430 560 H0Z"
          fill="${theme.accentEnd}"
          opacity="0.055"
        />

        <path
          d="M595 0 L1000 0 L1000 6 L626 6Z"
          fill="url(#metalGradient)"
          opacity="0.8"
        />

        <!-- Moldura dupla, com cantos ornamentados -->
        <rect
          x="12"
          y="12"
          width="976"
          height="536"
          rx="24"
          fill="none"
          stroke="url(#metalGradient)"
          stroke-opacity="0.68"
          stroke-width="1.2"
        />

        <rect
          x="20"
          y="20"
          width="960"
          height="520"
          rx="19"
          fill="none"
          stroke="${theme.line}"
          stroke-opacity="0.20"
          stroke-width="0.8"
        />

        <path
          d="M40 83 V44 Q40 34 50 34 H100 M40 63 H79 M63 34 V52"
          fill="none"
          stroke="url(#metalGradient)"
          stroke-width="1.5"
        />

        <path
          d="M960 83 V44 Q960 34 950 34 H900 M960 63 H921 M937 34 V52"
          fill="none"
          stroke="url(#metalGradient)"
          stroke-width="1.5"
        />

        <path
          d="M40 477 V516 Q40 526 50 526 H100 M40 497 H79 M63 526 V508"
          fill="none"
          stroke="url(#metalGradient)"
          stroke-width="1.5"
        />

        <path
          d="M960 477 V516 Q960 526 950 526 H900 M960 497 H921 M937 526 V508"
          fill="none"
          stroke="url(#metalGradient)"
          stroke-width="1.5"
        />

        <path
          d="M105 34 H300 M700 34 H895 M105 526 H300 M700 526 H895"
          stroke="${theme.line}"
          stroke-opacity="0.22"
          stroke-width="0.8"
        />

        <!-- Sigilo geométrico decorativo à direita -->
        <g
          transform="translate(842 151)"
          fill="none"
          stroke="url(#metalGradient)"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle r="124" stroke-width="1.2" stroke-opacity="0.28" />

          <circle
            r="111"
            stroke-width="0.8"
            stroke-dasharray="2 7"
            stroke-opacity="0.65"
          />

          <circle r="94" stroke-width="1.1" stroke-opacity="0.48" />

          <circle
            r="83"
            stroke-width="0.7"
            stroke-dasharray="22 5 3 5"
            stroke-opacity="0.55"
          />

          <polygon
            points="0,-95 82,-29 51,77 -51,77 -82,-29"
            stroke-width="1.5"
            stroke-opacity="0.70"
          />

          <polygon
            points="0,95 82,29 51,-77 -51,-77 -82,29"
            stroke-width="1"
            stroke-opacity="0.42"
          />

          <path
            d="M0 -72 L18 -20 L72 0 L18 20 L0 72 L-18 20 L-72 0 L-18 -20 Z"
            stroke-width="1.3"
            stroke-opacity="0.72"
          />

          <path
            d="M0 -45 L12 -12 L45 0 L12 12 L0 45 L-12 12 L-45 0 L-12 -12 Z"
            stroke-width="0.8"
            stroke-opacity="0.42"
          />

          <path
            d="M-118 0 H-91 M91 0 H118 M0 -118 V-91 M0 91 V118"
            stroke-width="2"
          />

          <path
            d="M-87 -87 L-69 -69 M87 -87 L69 -69 M-87 87 L-69 69 M87 87 L69 69"
            stroke-width="1.3"
          />

          <circle
            r="7"
            fill="${theme.accent}"
            fill-opacity="0.75"
            stroke="none"
          />
        </g>

        <text
          x="842"
          y="177"
          text-anchor="middle"
          fill="${theme.text}"
          fill-opacity="0.12"
          font-size="100"
          font-family="'Noto Serif', Georgia, serif"
          font-style="italic"
        >X</text>

        <text
          x="842"
          y="288"
          text-anchor="middle"
          fill="${theme.line}"
          fill-opacity="0.58"
          font-size="10"
          letter-spacing="4"
        >SIGILLUM • XIC</text>

        <!-- Cabeçalho editorial -->
        <g font-family="${fontFamily}">
          <text
            x="64"
            y="54"
            fill="${theme.muted}"
            font-size="13"
            letter-spacing="4.3"
          >X I C   /   PROFILE ARCHIVE</text>

          <path
            d="M64 72 H146 M151 72 H162"
            stroke="url(#accentGradient)"
            stroke-width="2"
          />

          <circle cx="169" cy="72" r="2" fill="${theme.accent}" />

          <rect
            x="64"
            y="89"
            width="143"
            height="23"
            rx="11.5"
            fill="${theme.accent}"
            fill-opacity="0.09"
            stroke="${theme.accent}"
            stroke-opacity="0.38"
            stroke-width="0.8"
          />

          <circle cx="78" cy="100.5" r="3" fill="${theme.accent}" />

          <text
            x="89"
            y="104.5"
            fill="${theme.text}"
            font-size="10"
            letter-spacing="2.1"
          >IDENTIDADE DIGITAL</text>

          <text
            x="62"
            y="166"
            fill="#000000"
            fill-opacity="0.36"
            font-size="${getFontSize(safeName, 44, 26, 15)}"
            font-weight="700"
            letter-spacing="${titleSpacing}"
            transform="translate(2 3)"
          >${safeName}</text>

          <text
            x="62"
            y="163"
            fill="${theme.text}"
            font-size="${getFontSize(safeName, 44, 26, 15)}"
            font-weight="${profile.font === "gamer" || profile.font === "gotica" || profile.font === "arcana" ? 800 : 700}"
            font-style="${fontStyle}"
            letter-spacing="${titleSpacing}"
          >${safeName}</text>

          <path
            d="M64 184 H305"
            stroke="url(#accentGradient)"
            stroke-width="1.2"
          />

          <path
            d="M312 184 H328"
            stroke="${theme.line}"
            stroke-opacity="0.35"
            stroke-width="1"
          />

          <text
            x="64"
            y="210"
            fill="${theme.text}"
            fill-opacity="0.92"
            font-size="18"
          >${descriptionLines[0] || "Perfil em construção. Personalize sua identidade."}</text>

          <text
            x="64"
            y="235"
            fill="${theme.muted}"
            font-size="18"
          >${descriptionLines[1] || ""}</text>

          <!-- Blocos de atributos com bordas finas e detalhes de canto -->
          <g>
            <rect
              x="64"
              y="263"
              width="270"
              height="91"
              rx="15"
              fill="#03040a"
              fill-opacity="0.31"
              stroke="${theme.line}"
              stroke-opacity="0.27"
            />

            <path
              d="M80 263 H111 M64 279 V294 M318 338 V322 M287 354 H258"
              fill="none"
              stroke="${theme.accent}"
              stroke-opacity="0.8"
              stroke-width="1.5"
            />

            <circle cx="318" cy="278" r="2" fill="${theme.accent}" />

            <text
              x="86"
              y="290"
              fill="${theme.muted}"
              font-size="12"
              letter-spacing="2.8"
            >✦  NÍVEL</text>

            <text
              x="86"
              y="333"
              fill="${theme.text}"
              font-size="39"
              font-weight="700"
            >${level}</text>

            <path
              d="M254 306 L269 291 L284 306 L269 321 Z"
              fill="none"
              stroke="${theme.accent}"
              stroke-opacity="0.7"
            />

            <circle
              cx="269"
              cy="306"
              r="4"
              fill="${theme.accent}"
              fill-opacity="0.8"
            />

            <rect
              x="350"
              y="263"
              width="270"
              height="91"
              rx="15"
              fill="#03040a"
              fill-opacity="0.31"
              stroke="${theme.line}"
              stroke-opacity="0.27"
            />

            <path
              d="M366 263 H397 M350 279 V294 M604 338 V322 M573 354 H544"
              fill="none"
              stroke="${theme.accent}"
              stroke-opacity="0.8"
              stroke-width="1.5"
            />

            <circle cx="604" cy="278" r="2" fill="${theme.accent}" />

            <text
              x="372"
              y="290"
              fill="${theme.muted}"
              font-size="12"
              letter-spacing="2.8"
            >✧  EXPERIÊNCIA</text>

            <text
              x="372"
              y="333"
              fill="${theme.text}"
              font-size="${xpSize}"
              font-weight="700"
            >${xp}</text>

            <path
              d="M557 298 h38 M557 304 h27 M557 310 h33"
              stroke="${theme.line}"
              stroke-opacity="0.42"
              stroke-width="1.3"
            />

            <rect
              x="636"
              y="263"
              width="300"
              height="91"
              rx="15"
              fill="url(#accentGradient)"
              fill-opacity="0.96"
              stroke="${theme.line}"
              stroke-opacity="0.8"
            />

            <path
              d="M651 263 H682 M636 279 V294 M920 338 V322 M889 354 H860"
              fill="none"
              stroke="#ffffff"
              stroke-opacity="0.78"
              stroke-width="1.5"
            />

            <circle cx="920" cy="278" r="2" fill="#ffffff" />

            <text
              x="660"
              y="290"
              fill="#11131d"
              fill-opacity="0.88"
              font-size="12"
              font-weight="700"
              letter-spacing="2.5"
            >◈  POKÉDOLARES</text>

            <text
              x="660"
              y="333"
              fill="#ffffff"
              font-size="${pokedolarsSize}"
              font-weight="700"
            >${pokedolars}</text>

            <path
              d="M869 306 C869 299 879 299 879 306 C879 312 874 316 874 316 C874 316 869 312 869 306Z"
              fill="none"
              stroke="#ffffff"
              stroke-opacity="0.82"
              stroke-width="1.2"
            />
          </g>

          <!-- Faixa de saldo -->
          <rect
            x="64"
            y="375"
            width="872"
            height="74"
            rx="14"
            fill="#03040a"
            fill-opacity="0.36"
            stroke="${theme.line}"
            stroke-opacity="0.22"
          />

          <path
            d="M82 375 H116 M64 391 V405 M918 433 V419 M884 449 H850"
            fill="none"
            stroke="url(#metalGradient)"
            stroke-width="1.4"
          />

          <text
            x="87"
            y="402"
            fill="${theme.muted}"
            font-size="12"
            letter-spacing="3"
          >⛓  XIC COINS</text>

          <text
            x="87"
            y="434"
            fill="${theme.text}"
            font-size="${coinsSize}"
            font-weight="700"
          >${coins}</text>

          <path
            d="M435 388 V436"
            stroke="${theme.line}"
            stroke-opacity="0.2"
          />

          <text
            x="463"
            y="402"
            fill="${theme.muted}"
            font-size="11"
            letter-spacing="2.5"
          >ECONOMIA PESSOAL</text>

          <text
            x="463"
            y="423"
            fill="${theme.text}"
            fill-opacity="0.75"
            font-size="13"
          >Registro de saldo <tspan fill="${theme.accent}">/</tspan> perfil ativo</text>

          <text
            x="912"
            y="426"
            fill="${theme.accent}"
            font-size="11"
            text-anchor="end"
            letter-spacing="2"
          >XIC • 001</text>

          <!-- Rodapé com glifos e assinatura -->
          <path
            d="M64 470 H420 M580 470 H936"
            stroke="${theme.line}"
            stroke-opacity="0.28"
            stroke-width="0.8"
          />

          <path
            d="M483 470 l17 -5 l17 5 l-17 5 Z"
            fill="none"
            stroke="url(#metalGradient)"
            stroke-width="1.1"
          />

          <circle cx="500" cy="470" r="2" fill="${theme.accent}" />

          <text
            x="64"
            y="498"
            fill="${theme.muted}"
            font-size="12"
            letter-spacing="1.2"
          >ESTILO  /  ${escapeXml(profile.font || "moderna").toUpperCase()}   •   TEMA  /  ${escapeXml(profile.theme || "obsidiana").toUpperCase()}</text>

          <text
            x="936"
            y="498"
            fill="${theme.text}"
            fill-opacity="0.8"
            font-size="12"
            text-anchor="end"
            letter-spacing="2.3"
          >XAPA IN CHAINS</text>

          <text
            x="500"
            y="523"
            fill="${theme.muted}"
            fill-opacity="0.58"
            font-size="9"
            text-anchor="middle"
            letter-spacing="4"
          >S O L V E   E T   C O A G U L A</text>
        </g>
      </g>
    </svg>
  `;

  const overlay = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  const baseImage = background
    ? await sharp(background)
        .rotate()
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT, { fit: "cover" })
        .png()
        .toBuffer()
    : await sharp({
        create: {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          channels: 4,
          background: theme.start,
        },
      })
        .png()
        .toBuffer();

  return sharp(baseImage)
    .composite([{ input: overlay }])
    .png()
    .toBuffer();
}

function getEditorButtons() {
  return [
    createNativeFlowButton("quick_reply", {
      display_text: "✏️ Editar descrição",
      id: `${PREFIX}${COMMAND} desc`,
    }),
    createNativeFlowButton("quick_reply", {
      display_text: "🔤 Escolher fonte",
      id: `${PREFIX}${COMMAND} fontes`,
    }),
    createNativeFlowButton("quick_reply", {
      display_text: "🎨 Escolher tema",
      id: `${PREFIX}${COMMAND} temas`,
    }),
    createNativeFlowButton("quick_reply", {
      display_text: "🖼️ Trocar fundo",
      id: `${PREFIX}${COMMAND} fundo`,
    }),
    createNativeFlowButton("quick_reply", {
      display_text: "🔄 Atualizar preview",
      id: `${PREFIX}${COMMAND}`,
    }),
  ];
}

async function sendEditorMenu(socket, remoteJid, webMessage) {
  return sendNativeFlowButtons(
    socket,
    remoteJid,
    {
      text:
        "⛓️ *XIC // ARQUIVO DE IDENTIDADE*\n\n" +
        "Escolha os detalhes do seu cartão. Cada ajuste revela uma nova face do seu perfil.",
      footer: "𖤐 XAPA IN CHAINS • PROFILE ARCHIVE",
      buttons: getEditorButtons(),
    },
    { quoted: webMessage },
  );
}

async function sendOptionsMenu(socket, remoteJid, webMessage, type) {
  const isFont = type === "fontes";
  const options = Object.keys(isFont ? FONT_STYLES : THEMES);

  const title = isFont
    ? "𖤐 ESCOLHA SUA TIPOGRAFIA"
    : "✦ ESCOLHA SUA PALETA";

  const buttons = options.map((option) =>
    createNativeFlowButton("quick_reply", {
      display_text: option[0].toUpperCase() + option.slice(1),
      id: `${PREFIX}${COMMAND} ${isFont ? "fonte" : "tema"} ${option}`,
    }),
  );

  return sendNativeFlowButtons(
    socket,
    remoteJid,
    {
      text: `${title}\n\nToque em uma opção para aplicar no seu perfil.`,
      footer: "⛓ XIC • A estética também é identidade",
      buttons,
    },
    { quoted: webMessage },
  );
}

async function sendInteractiveOrText(
  sendInteractive,
  sendReply,
  fallbackText,
) {
  try {
    await sendInteractive();
  } catch (error) {
    console.warn(
      `[TESTE CANVAS] Botões interativos indisponíveis; usando menu textual: ${error?.message || error}`,
    );

    await sendReply(fallbackText);
  }
}

async function renderAndSendPreview({
  userLid,
  webMessage,
  sendImageFromBuffer,
}) {
  const profile = getProfile(userLid) || {};
  const name = getUserName(webMessage, userLid, "Usuário");
  const economy = getUserEconomy(userLid, name) || {};
  const player = getPlayer(userLid) || {};

  const canvas = await createProfileCanvas(
    name,
    profile,
    economy,
    player,
  );

  await sendImageFromBuffer(
    canvas,
    "⛓️ XIC BOT // Preview do perfil",
  );
}

export default {
  name: COMMAND,

  description:
    "Gera e personaliza um canvas de teste para o perfil do usuário.",

  commands: [COMMAND, "canvasperfil", "perfilcard"],

  usage:
    `${PREFIX}${COMMAND} | ` +
    `${PREFIX}${COMMAND} editar | ` +
    `${PREFIX}${COMMAND} desc <texto> | ` +
    `${PREFIX}${COMMAND} fonte <estilo> | ` +
    `${PREFIX}${COMMAND} tema <tema> | ` +
    `${PREFIX}${COMMAND} fundo (marque ou responda a uma imagem)`,

  /** @param {CommandHandleProps} props */
  handle: async ({
    userLid,
    webMessage,
    args = [],
    fullArgs = "",
    isImage,
    downloadImage,
    sendReply,
    sendImageFromBuffer,
    sendWaitReact,
    sendSuccessReact,
    socket,
    remoteJid,
  }) => {
    try {
      await sendWaitReact();

      const action = String(args[0] || "").toLowerCase();

      if (action === "editar" || action === "editor") {
        await sendInteractiveOrText(
          () => sendEditorMenu(socket, remoteJid, webMessage),
          sendReply,
          EDITOR_FALLBACK(),
        );

        return;
      }

      if (action === "fontes" || action === "temas") {
        const isFont = action === "fontes";

        const options = Object.keys(
          isFont ? FONT_STYLES : THEMES,
        );

        await sendInteractiveOrText(
          () => sendOptionsMenu(
            socket,
            remoteJid,
            webMessage,
            action,
          ),
          sendReply,
          `${isFont ? "🔤 FONTES" : "🎨 TEMAS"}\n\n${options
            .map(
              (option) =>
                `${PREFIX}${COMMAND} ${isFont ? "fonte" : "tema"} ${option}`,
            )
            .join("\n")}`,
        );

        return;
      }

      if (action === "desc" || action === "descricao") {
        const description = String(fullArgs || "")
          .replace(/^\S+\s*/i, "")
          .trim();

        if (!description) {
          await sendReply(
            `Use: ${PREFIX}${COMMAND} desc <sua descrição>`,
          );

          return;
        }

        await updateProfile(userLid, {
          description: truncate(
            description,
            MAX_DESCRIPTION_LENGTH,
          ),
        });

        await sendReply(
          "✅ Descrição do perfil atualizada. Gere um novo preview para conferir.",
        );

        await sendSuccessReact();
        return;
      }

      if (action === "fonte") {
        const font = String(args[1] || "").toLowerCase();

        if (!FONT_STYLES[font]) {
          await sendReply(
            `Fontes disponíveis: ${Object.keys(FONT_STYLES).join(", ")}.`,
          );

          return;
        }

        await updateProfile(userLid, { font });

        await sendReply(
          `✅ Fonte do perfil alterada para: ${font}.`,
        );

        await sendSuccessReact();
        return;
      }

      if (action === "tema") {
        const theme = String(args[1] || "").toLowerCase();

        if (!THEMES[theme]) {
          await sendReply(
            `Temas disponíveis: ${Object.keys(THEMES).join(", ")}.`,
          );

          return;
        }

        await updateProfile(userLid, { theme });

        await sendReply(
          `🎨 Tema alterado para ${theme}. Gerando preview...`,
        );

        await renderAndSendPreview({
          userLid,
          webMessage,
          sendImageFromBuffer,
        });

        await sendSuccessReact();
        return;
      }

      if (action === "fundo") {
        if (!isImage) {
          await sendReply(
            `Marque ou responda uma imagem.\nUso: ${PREFIX}${COMMAND} fundo`,
          );

          return;
        }

        const inputPath = await downloadImage(
          webMessage,
          `profile-${Date.now()}`,
        );

        if (!inputPath) {
          throw new Error(
            "Não foi possível baixar a imagem de fundo.",
          );
        }

        await fs.mkdir(BACKGROUNDS_DIR, {
          recursive: true,
        });

        const userFileName =
          `${encodeURIComponent(String(userLid))}.png`;

        const backgroundPath = path.join(
          BACKGROUNDS_DIR,
          userFileName,
        );

        await sharp(inputPath)
          .rotate()
          .resize(CANVAS_WIDTH, CANVAS_HEIGHT, {
            fit: "cover",
          })
          .png()
          .toFile(backgroundPath);

        await updateProfile(userLid, {
          background: backgroundPath,
        });

        await sendReply(
          "🖼️ Fundo do perfil salvo. Gere um novo preview para conferir.",
        );

        await sendSuccessReact();
        return;
      }

      await renderAndSendPreview({
        userLid,
        webMessage,
        sendImageFromBuffer,
      });

      await sendInteractiveOrText(
        () => sendEditorMenu(socket, remoteJid, webMessage),
        sendReply,
        EDITOR_FALLBACK(),
      );

      await sendSuccessReact();
    } catch (error) {
      console.error(
        "[TESTE CANVAS] Falha ao gerar ou atualizar o perfil:",
        error,
      );

      throw new WarningError(
        "Não foi possível gerar ou atualizar o canvas do perfil. Confira os dados e tente novamente.",
      );
    }
  },
};