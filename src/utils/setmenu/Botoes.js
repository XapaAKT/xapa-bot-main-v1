import { PREFIX } from "../../config.js";

export function getMenuButtons(prefix = PREFIX) {
  return [
    { id: `${prefix}mmenu`, text: "👤 Membro" },
    { id: `${prefix}amenu`, text: "♠️ Admin" },
    { id: `${prefix}omenu`, text: "🦇 Dono" },
  ];
}

export function getNativeMenuButtons(buttons) {
  return buttons.map(({ id, text }) => ({
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
      display_text: text,
      id,
    }),
  }));
}
