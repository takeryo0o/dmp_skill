import { conditions } from "./conditions.js";
import { normalSkills } from "./normalSkills.js";
import { rareSkills } from "./rareSkills.js";
import { epicSkills } from "./epicSkills.js";

const raritySettings = {
  normal: {
    label: "NORMAL",
    skills: normalSkills,
    countMin: 1,
    countMax: 6
  },
  rare: {
    label: "RARE",
    skills: rareSkills,
    countMin: 1,
    countMax: 6
  },
  epic: {
    label: "EPIC",
    skills: epicSkills,
    countMin: 1,
    countMax: 1
  }
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= item.weight ?? 1;
    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

export function randomRarity() {
  const roll = Math.random() * 100;

  // 初期値：NORMAL 75% / RARE 20% / EPIC 5%
  if (roll < 75) return "normal";
  if (roll < 95) return "rare";
  return "epic";
}

export function generateSkill(requestedRarity = "random") {
  const rarity =
    requestedRarity === "random" ? randomRarity() : requestedRarity;

  const setting = raritySettings[rarity];

  if (!setting) {
    throw new Error(`未対応のレアリティです: ${rarity}`);
  }

  const condition = randomItem(conditions);
  const skill =
    rarity === "epic"
      ? randomItem(setting.skills)
      : weightedRandom(setting.skills);

  const count = randomInt(setting.countMin, setting.countMax);

  return {
    rarity,
    rarityLabel: setting.label,
    condition,
    skill,
    count
  };
}
