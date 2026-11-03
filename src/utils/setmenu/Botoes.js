import { PREFIX } from "../../config.js";

export function getMenuButtons(prefix = PREFIX, includeCategoryMenus = false) {
  const buttons = [
    { id: `${prefix}mmenu`, text: "👤 Membro" },
    { id: `${prefix}amenu`, text: "♠️ Admin" },
    { id: `${prefix}omenu`, text: "🦇 Dono" },
  ];

  if (includeCategoryMenus) {
    buttons.splice(1, 0,
      { id: `${prefix}economia-menu`, text: "💰 Economia" },
      { id: `${prefix}pokemon-menu`, text: "🎮 Pokémon" },
      { id: `${prefix}rpg-menu`, text: "⚔️ RPG" },
    );
  }

  return buttons;
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
