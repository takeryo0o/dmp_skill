import { normalSkills } from "./normalSkills.js";
import { rareSkills } from "./rareSkills.js";
import { epicSkills } from "./epicSkills.js";
import { generalQa, skillQa } from "./qadata.js";

const generalQaList = document.querySelector("#general-qa-list");
const skillQaList = document.querySelector("#skill-qa-list");
const searchInput = document.querySelector("#qa-search");
const rarityFilter = document.querySelector("#qa-rarity-filter");
const statusFilter = document.querySelector("#qa-status-filter");
const resultCount = document.querySelector("#qa-result-count");

// 単独IDと複数IDの両方に対応。
// 同じIDに複数のQ&Aエントリがあっても、上書きせずすべて追加する。
const skillQaMap = new Map();

skillQa.forEach((entry) => {
  const ids = entry.skillIds ?? [entry.skillId];

  ids.filter(Boolean).forEach((id) => {
    const currentItems = skillQaMap.get(id) ?? [];

    const taggedItems = entry.items.map((item) => ({
      ...item,
      relatedSkillIds: ids.length > 1 ? ids : []
    }));

    skillQaMap.set(id, [...currentItems, ...taggedItems]);
  });
});

const allSkills = [
  ...normalSkills.map((skill) => ({
    ...skill,
    rarity: "normal",
    rarityLabel: "NORMAL"
  })),
  ...rareSkills.map((skill) => ({
    ...skill,
    rarity: "rare",
    rarityLabel: "RARE"
  })),
  ...epicSkills.map((skill) => ({
    ...skill,
    rarity: "epic",
    rarityLabel: "EPIC"
  }))
];

function createQaItem(item) {
  const details = document.createElement("details");
  details.className = "qa-item";

  const summary = document.createElement("summary");
  summary.textContent = item.question;

  const answerElement = document.createElement("div");
  answerElement.className = "qa-answer";

  if (item.relatedSkillIds?.length > 1) {
    const related = document.createElement("div");
    related.className = "qa-related-ids";
    related.textContent = `関連能力：${item.relatedSkillIds.join(" / ")}`;
    related.style.marginBottom = "8px";
    related.style.fontSize = "0.78rem";
    related.style.opacity = "0.72";
    answerElement.appendChild(related);
  }

  const answerText = document.createElement("div");
  answerText.textContent = item.answer;
  answerElement.appendChild(answerText);

  details.append(summary, answerElement);
  return details;
}

function renderGeneralQa() {
  generalQaList.innerHTML = "";

  generalQa.forEach((item) => {
    generalQaList.appendChild(createQaItem(item));
  });
}

function matchesFilters(skill) {
  const query = searchInput.value.trim().toLowerCase();
  const rarity = rarityFilter.value;
  const status = statusFilter.value;
  const qaItems = skillQaMap.get(skill.id) ?? [];
  const hasQa = qaItems.length > 0;

  if (rarity !== "all" && skill.rarity !== rarity) return false;
  if (status === "registered" && !hasQa) return false;
  if (status === "unregistered" && hasQa) return false;

  if (query) {
    const searchable = [
      skill.id,
      skill.text,
      skill.condition ?? "",
      skill.countText ?? "",
      ...qaItems.flatMap((item) => [
        item.question,
        item.answer,
        ...(item.relatedSkillIds ?? [])
      ])
    ].join(" ").toLowerCase();

    if (!searchable.includes(query)) return false;
  }

  return true;
}

function renderSkillQa() {
  const filtered = allSkills.filter(matchesFilters);
  skillQaList.innerHTML = "";
  resultCount.textContent = `${filtered.length}件`;

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "qa-empty";
    empty.textContent = "条件に一致するQ&Aはありません。";
    skillQaList.appendChild(empty);
    return;
  }

  filtered.forEach((skill) => {
    const qaItems = skillQaMap.get(skill.id) ?? [];

    const card = document.createElement("article");
    card.className = `skill-qa-card rarity-${skill.rarity}`;

    const header = document.createElement("div");
    header.className = "skill-qa-header";

    const badge = document.createElement("span");
    badge.className = "skill-qa-badge";
    badge.textContent = skill.rarityLabel;

    const id = document.createElement("strong");
    id.className = "skill-qa-id";
    id.textContent = skill.id;

    const status = document.createElement("span");
    status.className = qaItems.length ? "qa-status registered" : "qa-status";
    status.textContent = qaItems.length ? `${qaItems.length}件のQ&A` : "Q&A未登録";

    header.append(badge, id, status);

    const text = document.createElement("p");
    text.className = "skill-qa-text";
    text.textContent = skill.text;

    card.append(header, text);

    if (skill.condition || skill.countText) {
      const meta = document.createElement("p");
      meta.className = "qa-unregistered-note";
      meta.textContent = [
        skill.condition ? `条件：${skill.condition}` : "",
        skill.countText ? `使用：${skill.countText}` : ""
      ].filter(Boolean).join(" / ");
      card.appendChild(meta);
    }

    if (qaItems.length > 0) {
      const list = document.createElement("div");
      list.className = "qa-list compact";

      qaItems.forEach((item) => {
        list.appendChild(createQaItem(item));
      });

      card.appendChild(list);
    } else {
      const note = document.createElement("p");
      note.className = "qa-unregistered-note";
      note.textContent = "この能力の個別Q&Aはまだ登録されていません。";
      card.appendChild(note);
    }

    skillQaList.appendChild(card);
  });
}

[searchInput, rarityFilter, statusFilter].forEach((element) => {
  element.addEventListener("input", renderSkillQa);
  element.addEventListener("change", renderSkillQa);
});

// qa.html?id=E031 のように開くと、その能力を自動検索する。
const params = new URLSearchParams(window.location.search);
const initialId = params.get("id");

if (initialId) {
  searchInput.value = initialId.toUpperCase();
  statusFilter.value = "all";
}

renderGeneralQa();
renderSkillQa();
