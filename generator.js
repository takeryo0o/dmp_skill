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
    skills: epicSkills
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
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

// NORMAL / RARE の発動回数
// 1回 5% / 2回 10% / 3回 25% / 4回 30% / 5回 25% / 6回 5%
function randomActivationCount() {
  const table = [
    { value: 1, weight: 5 },
    { value: 2, weight: 10 },
    { value: 3, weight: 25 },
    { value: 4, weight: 30 },
    { value: 5, weight: 25 },
    { value: 6, weight: 5 }
  ];

  const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of table) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }

  return 4;
}

export function randomRarity() {
  const roll = Math.random() * 100;

  // NORMAL 75% / RARE 20% / EPIC 5%
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

  // EPICは旧ゲームの「能力＋専用条件」をセットで使用
  if (rarity === "epic") {
    const skill = randomItem(setting.skills);

    return {
      rarity,
      rarityLabel: setting.label,
      condition: {
        id: `EPIC-${skill.id}`,
        text: skill.condition
      },
      skill,
      count: null,
      countText: skill.countText
    };
  }

  // NORMAL / RARE は条件・能力・回数を別々に抽選
  const condition = randomItem(conditions);
  const skill = weightedRandom(setting.skills);
  const count = randomActivationCount();

  return {
    rarity,
    rarityLabel: setting.label,
    condition,
    skill,
    count,
    countText: `ゲーム中 ${count}回`
  };
}
