import { generateSkill } from "./generator.js?v=20260819_1455";

const raritySelect = document.querySelector("#rarity-select");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");
const stockButton = document.querySelector("#stock-button");
const batchGenerateButton = document.querySelector("#batch-generate-button");
const qaCurrentButton = document.querySelector("#qa-current-button");

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

// 自作モーダル
const appModal = document.querySelector("#app-modal");
const modalPanel = document.querySelector("#app-modal-panel");
const modalTitle = document.querySelector("#app-modal-title");
const modalMessage = document.querySelector("#app-modal-message");
const modalTextarea = document.querySelector("#app-modal-textarea");
const modalCancelButton = document.querySelector("#app-modal-cancel");
const modalConfirmButton = document.querySelector("#app-modal-confirm");
const modalCloseButton = document.querySelector("#app-modal-close");
const modalBackdrop = document.querySelector("#app-modal-backdrop");

const STORAGE_KEY = "dmp_skill2_ability_stock_v1";

let currentResult = null;
let stocks = loadStocks();

let modalResolver = null;
let modalCanCancel = true;
let modalLastFocused = null;

stockButton.disabled = true;


// =========================================================
// 自作モーダル
// =========================================================

function closeAppModal(result) {
  if (appModal.hidden) return;

  appModal.hidden = true;
  document.body.classList.remove("modal-open");

  modalPanel.classList.remove(
    "modal-tone-default",
    "modal-tone-accent",
    "modal-tone-warning",
    "modal-tone-danger"
  );

  modalTextarea.hidden = true;
  modalTextarea.value = "";

  if (modalLastFocused instanceof HTMLElement) {
    modalLastFocused.focus();
  }

  if (modalResolver) {
    const resolve = modalResolver;
    modalResolver = null;
    resolve(result);
  }
}

function showAppModal({
  title,
  message,
  confirmText = "OK",
  cancelText = "キャンセル",
  showCancel = true,
  tone = "default",
  textareaText = null
}) {
  if (modalResolver) {
    closeAppModal(false);
  }

  modalLastFocused = document.activeElement;
  modalCanCancel = showCancel;

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalConfirmButton.textContent = confirmText;
  modalCancelButton.textContent = cancelText;
  modalCancelButton.hidden = !showCancel;

  modalPanel.classList.add(`modal-tone-${tone}`);

  if (textareaText !== null) {
    modalTextarea.hidden = false;
    modalTextarea.value = textareaText;
  } else {
    modalTextarea.hidden = true;
    modalTextarea.value = "";
  }

  appModal.hidden = false;
  document.body.classList.add("modal-open");

  return new Promise((resolve) => {
    modalResolver = resolve;

    requestAnimationFrame(() => {
      if (textareaText !== null) {
        modalTextarea.focus();
        modalTextarea.select();
      } else {
        modalConfirmButton.focus();
      }
    });
  });
}

function showConfirm(options) {
  return showAppModal({
    ...options,
    showCancel: true
  });
}

function showMessage(options) {
  return showAppModal({
    ...options,
    showCancel: false
  });
}

modalConfirmButton.addEventListener("click", () => closeAppModal(true));
modalCancelButton.addEventListener("click", () => closeAppModal(false));
modalCloseButton.addEventListener("click", () => {
  if (modalCanCancel) closeAppModal(false);
});
modalBackdrop.addEventListener("click", () => {
  if (modalCanCancel) closeAppModal(false);
});

document.addEventListener("keydown", (event) => {
  if (appModal.hidden) return;

  if (event.key === "Escape" && modalCanCancel) {
    event.preventDefault();
    closeAppModal(false);
  }
});


// =========================================================
// ストック
// =========================================================

function loadStocks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeStock);
  } catch (error) {
    console.warn("ストックの読み込みに失敗しました。", error);
    return [];
  }
}

function normalizeStock(stock) {
  return {
    ...stock,
    usedCount: Number.isFinite(stock.usedCount) ? stock.usedCount : 0,
    maxUses:
      Number.isFinite(stock.maxUses)
        ? stock.maxUses
        : inferMaxUses(stock.countText)
  };
}

function inferMaxUses(countText) {
  if (!countText) return null;

  const gameCountMatch = countText.match(/ゲーム中\s*(\d+)回/);
  if (gameCountMatch) return Number(gameCountMatch[1]);

  const simpleCountMatch = countText.match(/^(\d+)回$/);
  if (simpleCountMatch) return Number(simpleCountMatch[1]);

  return null;
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

  qaCurrentButton.href = `./qa.html?id=${result.skill.id}`;
  qaCurrentButton.classList.remove("disabled");
  qaCurrentButton.setAttribute("aria-disabled", "false");
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
    countText: result.countText,
    maxUses: Number.isFinite(result.maxUses) ? result.maxUses : null,
    usedCount: 0
  };
}

function getUsageText(stock) {
  if (Number.isFinite(stock.maxUses)) {
    return `使用 ${stock.usedCount}/${stock.maxUses}`;
  }

  return `使用 ${stock.usedCount}回`;
}

function isUsageLimitReached(stock) {
  return Number.isFinite(stock.maxUses) && stock.usedCount >= stock.maxUses;
}

async function useSkill(stock) {
  if (isUsageLimitReached(stock)) return;

  const nextCount = stock.usedCount + 1;

  const usageMessage = Number.isFinite(stock.maxUses)
    ? `${stock.skillId} を使用しますか？\n\n使用回数：${stock.usedCount}/${stock.maxUses} → ${nextCount}/${stock.maxUses}`
    : `${stock.skillId} を使用しますか？\n\nこれまでの使用回数：${stock.usedCount}回`;

  const ok = await showConfirm({
    title: "能力を使用",
    message: usageMessage,
    confirmText: "使用する",
    cancelText: "キャンセル",
    tone: "accent"
  });

  if (!ok) return;

  stock.usedCount += 1;

  if (Number.isFinite(stock.maxUses)) {
    stock.usedCount = Math.min(stock.usedCount, stock.maxUses);
  }

  saveStocks();
  renderStocks();
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

    const usageArea = document.createElement("div");
    usageArea.className = "stock-usage-area";

    const usageText = document.createElement("strong");
    usageText.className = "stock-usage-text";
    usageText.textContent = getUsageText(stock);

    const useButton = document.createElement("button");
    useButton.className = "stock-use";
    useButton.type = "button";

    if (isUsageLimitReached(stock)) {
      useButton.textContent = "使用済み";
      useButton.disabled = true;
      item.classList.add("usage-complete");
    } else {
      useButton.textContent = "使用する";
      useButton.addEventListener("click", () => useSkill(stock));
    }

    const qaLink = document.createElement("a");
    qaLink.className = "stock-qa-link";
    qaLink.href = `./qa.html?id=${stock.skillId}`;
    qaLink.textContent = "Q&A";

    usageArea.append(usageText, useButton, qaLink);
    content.append(meta, condition, skill, usageArea);

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


// =========================================================
// ボタン処理
// =========================================================

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
    await showMessage({
      title: "コピーしてください",
      message: "自動コピーが利用できなかったため、下の内容を選択してコピーしてください。",
      confirmText: "閉じる",
      tone: "default",
      textareaText: text
    });
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

batchGenerateButton.addEventListener("click", async () => {
  const ok = await showConfirm({
    title: "一括生成",
    message:
      "現在のストックをすべて削除し、NORMAL・RARE・EPICを1つずつ生成してストックします。\n\n現在のストック内容は失われます。",
    confirmText: "生成する",
    cancelText: "キャンセル",
    tone: "warning"
  });

  if (!ok) return;

  const normalResult = generateSkill("normal");
  const rareResult = generateSkill("rare");
  const epicResult = generateSkill("epic");

  stocks = [
    createStockRecord(normalResult),
    createStockRecord(rareResult),
    createStockRecord(epicResult)
  ];

  saveStocks();
  renderStocks();

  batchGenerateButton.textContent = "生成しました！";
  setTimeout(() => {
    batchGenerateButton.textContent = "一括生成";
  }, 1200);
});

clearStockButton.addEventListener("click", async () => {
  if (stocks.length === 0) return;

  const ok = await showConfirm({
    title: "ストックを全削除",
    message: `ストックしている ${stocks.length} 件の能力をすべて削除します。\n\nこの操作は元に戻せません。`,
    confirmText: "すべて削除",
    cancelText: "キャンセル",
    tone: "danger"
  });

  if (!ok) return;

  stocks = [];
  saveStocks();
  renderStocks();
});

renderStocks();
