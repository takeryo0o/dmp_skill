const diceButton = document.querySelector("#dice-button");
const coinButton = document.querySelector("#coin-button");

const modal = document.querySelector("#random-modal");
const modalPanel = document.querySelector("#random-modal-panel");
const modalBackdrop = document.querySelector("#random-modal-backdrop");
const modalClose = document.querySelector("#random-modal-close");
const modalOk = document.querySelector("#random-modal-ok");
const modalAgain = document.querySelector("#random-modal-again");
const modalIcon = document.querySelector("#random-modal-icon");
const modalLabel = document.querySelector("#random-modal-label");
const modalTitle = document.querySelector("#random-modal-title");
const modalResult = document.querySelector("#random-modal-result");
const modalSubtext = document.querySelector("#random-modal-subtext");

let currentMode = null;
let lastFocused = null;

/**
 * 0 ～ maxExclusive-1 の整数を均等に返す。
 * Math.random() ではなく Web Crypto API を使用。
 */
function randomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive integer.");
  }

  const range = 0x100000000; // 2^32
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % maxExclusive;
}

function rollDice() {
  return randomInt(6) + 1;
}

function tossCoin() {
  return randomInt(2) === 0 ? "表" : "裏";
}

function setModeClass(mode) {
  modalPanel.classList.remove("random-mode-dice", "random-mode-coin");
  modalPanel.classList.add(`random-mode-${mode}`);
}

function renderResult(mode) {
  currentMode = mode;
  setModeClass(mode);

  if (mode === "dice") {
    const value = rollDice();

    modalIcon.textContent = "⚄";
    modalLabel.textContent = "1D6 RESULT";
    modalTitle.textContent = "サイコロの結果";
    modalResult.textContent = String(value);
    modalSubtext.textContent = `1D6 → ${value}`;
    modalAgain.textContent = "もう一度振る";
  } else {
    const value = tossCoin();

    modalIcon.textContent = "●";
    modalLabel.textContent = "COIN TOSS";
    modalTitle.textContent = "コイントスの結果";
    modalResult.textContent = value;
    modalSubtext.textContent = value === "表" ? "HEADS" : "TAILS";
    modalAgain.textContent = "もう一度投げる";
  }
}

function openModal(mode) {
  lastFocused = document.activeElement;
  renderResult(mode);

  modal.hidden = false;
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    modalAgain.focus();
  });
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastFocused instanceof HTMLElement) {
    lastFocused.focus();
  }
}

diceButton.addEventListener("click", () => openModal("dice"));
coinButton.addEventListener("click", () => openModal("coin"));

modalAgain.addEventListener("click", () => {
  if (currentMode) renderResult(currentMode);
});

modalOk.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (modal.hidden) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeModal();
  }
});
