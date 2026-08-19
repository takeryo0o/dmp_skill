import { normalSkills } from "./normalSkills.js?v=20260819_1120";
import { rareSkills } from "./rareSkills.js?v=20260819_1120";
import { epicSkills } from "./epicSkills.js?v=20260819_1120";
import { generalQa, skillQa } from "./qadata.js?v=20260819_1120";

const generalQaList = document.querySelector("#general-qa-list");
const skillQaList = document.querySelector("#skill-qa-list");
const searchInput = document.querySelector("#qa-search");
const rarityFilter = document.querySelector("#qa-rarity-filter");
const statusFilter = document.querySelector("#qa-status-filter");
const resultCount = document.querySelector("#qa-result-count");

const skillQaMap = new Map(skillQa.map((entry) => [entry.skillId, entry.items]));
const allSkills = [
  ...normalSkills.map((skill) => ({ ...skill, rarity: "normal", rarityLabel: "NORMAL" })),
  ...rareSkills.map((skill) => ({ ...skill, rarity: "rare", rarityLabel: "RARE" })),
  ...epicSkills.map((skill) => ({ ...skill, rarity: "epic", rarityLabel: "EPIC" }))
];

function createQaItem(question, answer) {
  const details = document.createElement("details");
  details.className = "qa-item";
  const summary = document.createElement("summary");
  summary.textContent = question;
  const answerElement = document.createElement("div");
  answerElement.className = "qa-answer";
  answerElement.textContent = answer;
  details.append(summary, answerElement);
  return details;
}

function renderGeneralQa() {
  generalQaList.innerHTML = "";
  generalQa.forEach((item) => generalQaList.appendChild(createQaItem(item.question, item.answer)));
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
      ...qaItems.flatMap((item) => [item.question, item.answer])
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

    if (qaItems.length > 0) {
      const list = document.createElement("div");
      list.className = "qa-list compact";
      qaItems.forEach((item) => list.appendChild(createQaItem(item.question, item.answer)));
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

const params = new URLSearchParams(window.location.search);
const requestedId = params.get("id");
if (requestedId) {
  searchInput.value = requestedId.toUpperCase();
  statusFilter.value = "all";
}

renderGeneralQa();
renderSkillQa();
