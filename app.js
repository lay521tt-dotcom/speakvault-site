const storageKey = "speakvault-listening-record-v3";
const previousStorageKeys = ["speakvault-listening-record-v2", "speakvault-listening-record-v1"];
const accessCodeKey = "speakvault-access-code";

const fallbackItems = [
  {
    id: "meeting-delay-update",
    title: "A calm update when the timeline may slip",
    category: "Meeting",
    difficulty: "B2",
    level: "B2",
    format: "workplace monologue",
    accent: "NZ/AU workplace",
    duration: "01:15",
    sourceType: "original training material",
    audioSrc: "",
    summary: "A short project update that explains a delay without sounding defensive.",
    practiceFocus: "Softening bad news and proposing a timeline adjustment.",
    tags: ["meeting", "status update", "timeline", "soft tone"],
    sentences: [
      {
        id: "s1",
        english: "I wanted to give a quick update on where things stand.",
        chinese: "我想快速说明一下目前的进展。",
        note: '"Where things stand" means the current situation.',
      },
      {
        id: "s2",
        english: "Most of the work is moving in the right direction, but one part may need a bit more time.",
        chinese: "大部分工作方向是对的，但其中一部分可能需要多一点时间。",
        note: "This softens the problem by placing it inside wider progress.",
      },
    ],
    expressions: [
      {
        text: "where things stand",
        meaning: "the current situation or current progress",
        chinese: "目前的情况 / 进展",
        tag: "status update",
      },
    ],
    shadowingLine: "I wanted to give a quick update on where things stand.",
  },
];

const statusLabels = {
  "not-started": "Not started",
  dictating: "Dictating",
  checked: "Checked",
  shadowed: "Shadowed",
};

let items = [];
let currentItem;
let record = loadRecord();

function loadRecord() {
  try {
    const nextRecord = JSON.parse(localStorage.getItem(storageKey));
    if (nextRecord?.items) return normalizeRecord(nextRecord);

    for (const key of previousStorageKeys) {
      const oldRecord = JSON.parse(localStorage.getItem(key));
      if (oldRecord && typeof oldRecord === "object") {
        return normalizeRecord({ selectedItemId: oldRecord.selectedItemId || "", items: oldRecord.items || oldRecord });
      }
    }
  } catch {
    return normalizeRecord({});
  }

  return normalizeRecord({});
}

function normalizeRecord(value) {
  return {
    selectedItemId: value.selectedItemId || "",
    filters: {
      category: value.filters?.category || "all",
      difficulty: value.filters?.difficulty || "all",
      vault: value.filters?.vault || "all",
    },
    items: value.items || {},
  };
}

function saveRecord() {
  localStorage.setItem(storageKey, JSON.stringify(record));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function itemRecord(itemId = currentItem?.id) {
  if (!itemId) return {};
  record.items ||= {};
  record.items[itemId] ||= {
    dictation: {},
    savedExpressions: [],
    reflection: "",
    status: "not-started",
    aiFeedback: null,
  };
  record.items[itemId].dictation ||= {};
  record.items[itemId].savedExpressions ||= [];
  record.items[itemId].reflection ||= "";
  record.items[itemId].status ||= "not-started";
  return record.items[itemId];
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function sourceForItem(itemId) {
  return items.find((item) => item.id === itemId);
}

function uniqueValues(key) {
  return [...new Set(items.map((item) => item[key] || item.level).filter(Boolean))].sort();
}

function filteredItems() {
  return items.filter((item) => {
    const categoryMatch = record.filters.category === "all" || item.category === record.filters.category;
    const difficultyMatch = record.filters.difficulty === "all" || (item.difficulty || item.level) === record.filters.difficulty;
    return categoryMatch && difficultyMatch;
  });
}

function renderSelectOptions(selector, values, allLabel, currentValue) {
  const select = document.querySelector(selector);
  if (!select) return;
  select.innerHTML = [`<option value="all">${escapeHtml(allLabel)}</option>`]
    .concat(values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");
  select.value = values.includes(currentValue) ? currentValue : "all";
}

function setupFilters() {
  renderSelectOptions("[data-category-filter]", uniqueValues("category"), "All scenarios", record.filters.category);
  renderSelectOptions("[data-difficulty-filter]", uniqueValues("difficulty"), "All levels", record.filters.difficulty);

  const categoryFilter = document.querySelector("[data-category-filter]");
  const difficultyFilter = document.querySelector("[data-difficulty-filter]");
  const resetFilters = document.querySelector("[data-reset-filters]");

  if (categoryFilter) {
    categoryFilter.onchange = () => {
      record.filters.category = categoryFilter.value;
      saveRecord();
      renderLibrary();
    };
  }

  if (difficultyFilter) {
    difficultyFilter.onchange = () => {
      record.filters.difficulty = difficultyFilter.value;
      saveRecord();
      renderLibrary();
    };
  }

  if (resetFilters) {
    resetFilters.onclick = () => {
      record.filters.category = "all";
      record.filters.difficulty = "all";
      setupFilters();
      renderLibrary();
      saveRecord();
    };
  }
}

function renderTags(tags) {
  const target = document.querySelector("[data-current-tags]");
  if (!target) return;
  target.innerHTML = (tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function renderAudio(item) {
  const target = document.querySelector("[data-audio-slot]");
  if (!target) return;

  if (item.audioSrc) {
    target.classList.add("has-audio");
    target.innerHTML = `
      <span>Audio</span>
      <audio controls preload="metadata" src="${escapeHtml(item.audioSrc)}"></audio>
    `;
    return;
  }

  target.classList.remove("has-audio");
  target.innerHTML = `
    <span>Audio slot</span>
    <span data-current-audio>Attach your file later</span>
  `;
}

function renderStatusButtons() {
  const currentStatus = itemRecord().status;
  document.querySelectorAll("[data-status-button]").forEach((button) => {
    const isCurrent = button.dataset.statusButton === currentStatus;
    button.classList.toggle("is-active", isCurrent);
    button.setAttribute("aria-pressed", String(isCurrent));
    button.onclick = () => {
      itemRecord().status = button.dataset.statusButton;
      saveRecord();
      renderStatusButtons();
      renderLibrary();
    };
  });
}

function renderCurrentItem(item) {
  currentItem = item;
  record.selectedItemId = item.id;
  saveRecord();

  setText("[data-current-level]", item.difficulty || item.level);
  setText("[data-current-duration]", item.duration);
  setText("[data-current-title]", item.title);
  setText("[data-current-summary]", item.summary);
  setText("[data-current-focus]", item.practiceFocus || item.format || "");
  setText("[data-shadowing-line]", item.shadowingLine);
  renderTags([item.category, item.format, ...(item.tags || [])].filter(Boolean));
  renderAudio(item);
  renderLibrary();
  renderStatusButtons();
  renderDictation(item);
  renderSubtitles(item);
  renderExpressions(item);
  renderAiFeedback();
  renderVault();

  const reflection = document.querySelector("[data-reflection-input]");
  if (reflection) {
    reflection.value = itemRecord().reflection || "";
    reflection.oninput = () => {
      itemRecord().reflection = reflection.value;
      saveRecord();
    };
  }
}

function renderLibrary() {
  const target = document.querySelector("[data-library-list]");
  if (!target) return;
  const visibleItems = filteredItems();

  if (!visibleItems.length) {
    target.innerHTML = `
      <article class="empty-vault">
        <strong>No clips match these filters.</strong>
        <p>Reset the library filters to see every listening item.</p>
      </article>
    `;
    return;
  }

  target.innerHTML = visibleItems
    .map((item) => {
      const saved = itemRecord(item.id);
      const isActive = currentItem?.id === item.id;
      return `
        <article class="library-card ${isActive ? "is-current" : ""}">
          <div class="library-card-top">
            <span>${escapeHtml(item.category)}</span>
            <span>${escapeHtml(item.difficulty || item.level)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <div class="meta-row">
            ${(item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="library-card-bottom">
            <span class="status saved">${escapeHtml(statusLabels[saved.status] || statusLabels["not-started"])}</span>
            <button type="button" data-select-item="${escapeHtml(item.id)}">
              ${isActive ? "Current clip" : "Study this"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  target.querySelectorAll("[data-select-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = sourceForItem(button.dataset.selectItem);
      if (selected) renderCurrentItem(selected);
    });
  });
}

function renderDictation(item) {
  const target = document.querySelector("[data-dictation-list]");
  if (!target) return;
  const saved = itemRecord().dictation || {};

  target.innerHTML = item.sentences
    .map(
      (sentence, index) => `
        <label class="dictation-card">
          <span>Sentence ${index + 1}</span>
          <textarea data-dictation-input="${escapeHtml(sentence.id)}" placeholder="Type what you hear before revealing the subtitle.">${escapeHtml(saved[sentence.id] || "")}</textarea>
        </label>
      `,
    )
    .join("");

  target.querySelectorAll("[data-dictation-input]").forEach((input) => {
    input.addEventListener("input", () => {
      itemRecord().dictation[input.dataset.dictationInput] = input.value;
      if (itemRecord().status === "not-started") itemRecord().status = "dictating";
      saveRecord();
      renderStatusButtons();
      renderLibrary();
    });
  });
}

function renderSubtitles(item) {
  const target = document.querySelector("[data-subtitle-list]");
  if (!target) return;

  target.innerHTML = item.sentences
    .map(
      (sentence, index) => `
        <details class="subtitle-card">
          <summary>Reveal sentence ${index + 1}</summary>
          <p class="subtitle-english">${escapeHtml(sentence.english)}</p>
          <p class="subtitle-chinese">${escapeHtml(sentence.chinese)}</p>
          <p class="subtitle-note">${escapeHtml(sentence.note)}</p>
        </details>
      `,
    )
    .join("");

  target.querySelectorAll("details").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (details.open && ["not-started", "dictating"].includes(itemRecord().status)) {
        itemRecord().status = "checked";
        saveRecord();
        renderStatusButtons();
        renderLibrary();
      }
    });
  });
}

function expressionSaved(text) {
  return itemRecord().savedExpressions.some((expression) => expression.text === text);
}

function toggleExpression(expression) {
  const saved = itemRecord().savedExpressions;
  if (expressionSaved(expression.text)) {
    itemRecord().savedExpressions = saved.filter((item) => item.text !== expression.text);
  } else {
    saved.push({
      ...expression,
      itemId: currentItem.id,
      itemTitle: currentItem.title,
      category: currentItem.category,
    });
  }
  saveRecord();
  renderExpressions(currentItem);
  renderVault();
}

function renderExpressions(item) {
  const target = document.querySelector("[data-expression-list]");
  if (!target) return;

  target.innerHTML = item.expressions
    .map((expression) => {
      const isSaved = expressionSaved(expression.text);
      return `
        <article class="expression-card">
          <span>${escapeHtml(expression.tag)}</span>
          <strong>${escapeHtml(expression.text)}</strong>
          <p>${escapeHtml(expression.meaning)}</p>
          <p>${escapeHtml(expression.chinese)}</p>
          <button type="button" data-expression="${escapeHtml(expression.text)}">
            ${isSaved ? "Saved to vault" : "Save to vault"}
          </button>
        </article>
      `;
    })
    .join("");

  target.querySelectorAll("[data-expression]").forEach((button) => {
    const expression = item.expressions.find((entry) => entry.text === button.dataset.expression);
    button.addEventListener("click", () => toggleExpression(expression));
  });
}

function savedExpressionsAcrossLibrary() {
  return Object.entries(record.items || {}).flatMap(([itemId, saved]) =>
    (saved.savedExpressions || []).map((expression) => {
      const source = sourceForItem(itemId);
      return {
        ...expression,
        itemId,
        itemTitle: expression.itemTitle || source?.title || "Saved clip",
        category: expression.category || source?.category || "Uncategorised",
      };
    }),
  );
}

function renderVaultFilters(saved) {
  const target = document.querySelector("[data-vault-filter]");
  if (!target) return;
  const categories = [...new Set(saved.map((expression) => expression.category).filter(Boolean))].sort();
  target.innerHTML = [`<option value="all">All saved phrases</option>`]
    .concat(categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`))
    .join("");
  target.value = categories.includes(record.filters.vault) ? record.filters.vault : "all";
  target.onchange = () => {
    record.filters.vault = target.value;
    saveRecord();
    renderVault();
  };
}

function renderVault() {
  const target = document.querySelector("[data-vault-list]");
  if (!target) return;
  const saved = savedExpressionsAcrossLibrary();
  renderVaultFilters(saved);
  const visibleSaved =
    record.filters.vault === "all" ? saved : saved.filter((expression) => expression.category === record.filters.vault);

  if (!visibleSaved.length) {
    target.innerHTML = `
      <article class="empty-vault">
        <strong>No saved expressions yet.</strong>
        <p>Use Expression mining to save phrases that deserve another shadowing pass.</p>
      </article>
    `;
    return;
  }

  target.innerHTML = visibleSaved
    .map(
      (expression) => `
        <article>
          <span class="status saved">${escapeHtml(expression.category)}</span>
          <strong>${escapeHtml(expression.text)}</strong>
          <p>${escapeHtml(expression.meaning)}</p>
          <p>${escapeHtml(expression.chinese)}</p>
          <small>${escapeHtml(expression.itemTitle)} · ${escapeHtml(expression.tag || "saved")}</small>
        </article>
      `,
    )
    .join("");
}

function renderAiFeedback() {
  const target = document.querySelector("[data-ai-feedback]");
  if (!target) return;
  const feedback = itemRecord().aiFeedback;

  if (!feedback) {
    target.innerHTML = `
      <article class="empty-vault">
        <strong>No AI feedback yet.</strong>
        <p>Write a dictation or reflection, then analyze the current practice.</p>
      </article>
    `;
    return;
  }

  target.innerHTML = `
    <article class="ai-feedback-card">
      <span class="status saved">Natural rewrite</span>
      <p>${escapeHtml(feedback.naturalRewrite)}</p>
    </article>
    <article class="ai-feedback-card">
      <span class="status saved">Grammar and wording</span>
      ${(feedback.grammarCorrections || [])
        .map(
          (item) => `
            <div class="feedback-row">
              <strong>${escapeHtml(item.correction)}</strong>
              <p>${escapeHtml(item.explanationZh)}</p>
              ${item.original ? `<small>Original: ${escapeHtml(item.original)}</small>` : ""}
            </div>
          `,
        )
        .join("")}
    </article>
    <article class="ai-feedback-card">
      <span class="status saved">Phrase suggestions</span>
      ${(feedback.phraseSuggestions || [])
        .map(
          (item) => `
            <div class="feedback-row">
              <strong>${escapeHtml(item.phrase)}</strong>
              <p>${escapeHtml(item.reasonZh)}</p>
              <small>${escapeHtml(item.example)}</small>
            </div>
          `,
        )
        .join("")}
    </article>
    <article class="ai-feedback-card">
      <span class="status saved">Next practice</span>
      <p>${escapeHtml(feedback.practiceAdvice)}</p>
      <small>${escapeHtml(feedback.encouragement)}</small>
    </article>
  `;
}

function currentPracticePayload() {
  const saved = itemRecord();
  return {
    item: {
      id: currentItem.id,
      title: currentItem.title,
      category: currentItem.category,
      difficulty: currentItem.difficulty || currentItem.level,
      summary: currentItem.summary,
      practiceFocus: currentItem.practiceFocus,
      targetLine: currentItem.shadowingLine,
      sentences: currentItem.sentences.map((sentence, index) => ({
        index: index + 1,
        english: sentence.english,
        chinese: sentence.chinese,
      })),
    },
    dictation: saved.dictation || {},
    reflection: saved.reflection || "",
    savedExpressions: saved.savedExpressions || [],
  };
}

async function readJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: "AI feedback is only available after the Vercel API is deployed." };
  }
}

function bindAiControls() {
  const codeInput = document.querySelector("[data-access-code-input]");
  const button = document.querySelector("[data-ai-analyze]");
  const status = document.querySelector("[data-ai-status]");

  if (codeInput) {
    codeInput.value = localStorage.getItem(accessCodeKey) || "";
    codeInput.oninput = () => localStorage.setItem(accessCodeKey, codeInput.value);
  }

  if (!button || !status) return;

  button.onclick = async () => {
    const accessCode = codeInput?.value.trim() || "";
    if (!accessCode) {
      status.textContent = "Enter the shared access code first.";
      return;
    }

    button.disabled = true;
    status.textContent = "Analyzing your current practice...";

    try {
      const response = await fetch("/api/analyze-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode, practice: currentPracticePayload() }),
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.error || "AI feedback is unavailable.");
      itemRecord().aiFeedback = data.feedback;
      saveRecord();
      renderAiFeedback();
      status.textContent = "Feedback saved locally with this listening item.";
    } catch (error) {
      status.textContent = error.message || "AI feedback is unavailable right now.";
    } finally {
      button.disabled = false;
    }
  };
}

async function loadItems() {
  try {
    const response = await fetch("content/corpus.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Listening item file unavailable");
    const loadedItems = await response.json();
    return Array.isArray(loadedItems) && loadedItems.length ? loadedItems : fallbackItems;
  } catch {
    return fallbackItems;
  }
}

async function initWorkspace() {
  items = await loadItems();
  setupFilters();
  bindAiControls();
  const selected = sourceForItem(record.selectedItemId) || items[0];
  renderCurrentItem(selected);
}

initWorkspace();
