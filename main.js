import { generateSkill } from "./generator.js";

const raritySelect = document.querySelector("#rarity-select");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");
const stockButton = document.querySelector("#stock-button");

const resultCard = document.querySelector("#result-card");
const rarityBadge = document.querySelector("#rarity-badge");
const skillId = document.querySelector("#skill-id");
const conditionText = document.querySelector("#condition-text");
const skillText = document.querySelector("#skill-text");
const countText = document.querySelector("#count-text");

const stockList = document.querySelector("#stock-list");
const stockEmpty = document.querySelector("#stock-empty");
const stockCount = document.querySelector("#stock-count");
const clearStockButton = document.querySelector("#clear-stock-button");

const STORAGE_KEY = "dmp_skill2_ability_stock_v1";

let currentResult = null;
let stocks = loadStocks();

function loadStocks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("ストックの読み込みに失敗しました。", error);
    return [];
  }
}

function saveStocks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
  } catch (error) {
    console.warn("ストックの保存に失敗しました。", error);
  }
}

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
  countText.textContent = result.countText;

  copyButton.disabled = false;
  stockButton.disabled = false;
}

function buildCopyText(result) {
  return [
    `【${result.rarityLabel}】`,
    `条件：${result.condition.text}`,
    `能力：${result.skill.text}`,
    `使用回数：${result.countText}`
  ].join("\n");
}

function createStockRecord(result) {
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    savedAt: new Date().toISOString(),
    rarity: result.rarity,
    rarityLabel: result.rarityLabel,
    skillId: result.skill.id,
    condition: result.condition.text,
    skill: result.skill.text,
    countText: result.countText
  };
}

function renderStocks() {
  stockList.querySelectorAll(".stock-item").forEach((item) => item.remove());

  stockCount.textContent = String(stocks.length);
  stockEmpty.hidden = stocks.length > 0;
  clearStockButton.disabled = stocks.length === 0;

  stocks.forEach((stock, index) => {
    const item = document.createElement("article");
    item.className = `stock-item rarity-${stock.rarity}`;

    const number = document.createElement("div");
    number.className = "stock-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const content = document.createElement("div");
    content.className = "stock-content";

    const meta = document.createElement("div");
    meta.className = "stock-meta";

    const rarity = document.createElement("span");
    rarity.className = "stock-rarity";
    rarity.textContent = stock.rarityLabel;

    const id = document.createElement("span");
    id.className = "stock-skill-id";
    id.textContent = `#${stock.skillId}`;

    const count = document.createElement("span");
    count.className = "stock-count-text";
    count.textContent = stock.countText;

    meta.append(rarity, id, count);

    const condition = document.createElement("p");
    condition.className = "stock-condition";
    condition.textContent = `条件：${stock.condition}`;

    const skill = document.createElement("p");
    skill.className = "stock-skill";
    skill.textContent = stock.skill;

    content.append(meta, condition, skill);

    const deleteButton = document.createElement("button");
    deleteButton.className = "stock-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      stocks = stocks.filter((item) => item.uid !== stock.uid);
      saveStocks();
      renderStocks();
    });

    item.append(number, content, deleteButton);
    stockList.appendChild(item);
  });
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

stockButton.addEventListener("click", () => {
  if (!currentResult) return;

  stocks.push(createStockRecord(currentResult));
  saveStocks();
  renderStocks();

  stockButton.textContent = "ストックしました";
  setTimeout(() => {
    stockButton.textContent = "ストック";
  }, 1000);
});

clearStockButton.addEventListener("click", () => {
  if (stocks.length === 0) return;

  const ok = window.confirm("ストックした能力をすべて削除しますか？");
  if (!ok) return;

  stocks = [];
  saveStocks();
  renderStocks();
});

renderStocks();
