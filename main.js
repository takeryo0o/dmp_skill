import { generateSkill } from "./generator.js";

const raritySelect = document.querySelector("#rarity-select");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");

const resultCard = document.querySelector("#result-card");
const rarityBadge = document.querySelector("#rarity-badge");
const skillId = document.querySelector("#skill-id");
const conditionText = document.querySelector("#condition-text");
const skillText = document.querySelector("#skill-text");
const countText = document.querySelector("#count-text");

let currentResult = null;

function renderResult(result) {
  currentResult = result;

  resultCard.classList.remove(
    "rarity-normal",
    "rarity-rare",
    "rarity-epic"
  );
  resultCard.classList.add(`rarity-${result.rarity}`);

  rarityBadge.textContent = result.rarityLabel;
  skillId.textContent = `#${result.skill.id}`;
  conditionText.textContent = result.condition.text;
  skillText.textContent = result.skill.text;

  countText.textContent =
    result.rarity === "epic"
      ? "ゲーム中 1回"
      : `ゲーム中 ${result.count}回`;

  copyButton.disabled = false;
}

function buildCopyText(result) {
  const count =
    result.rarity === "epic"
      ? "ゲーム中1回"
      : `ゲーム中${result.count}回`;

  return [
    `【${result.rarityLabel}】`,
    `条件：${result.condition.text}`,
    `能力：${result.skill.text}`,
    `使用回数：${count}`
  ].join("\n");
}

generateButton.addEventListener("click", () => {
  const result = generateSkill(raritySelect.value);
  renderResult(result);
});

copyButton.addEventListener("click", async () => {
  if (!currentResult) return;

  const text = buildCopyText(currentResult);

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "コピーしました";
    setTimeout(() => {
      copyButton.textContent = "結果をコピー";
    }, 1200);
  } catch {
    window.prompt("下の内容をコピーしてください。", text);
  }
});
