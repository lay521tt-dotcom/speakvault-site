const storageKey = "speakvault-listening-record-v2";
const previousStorageKey = "speakvault-listening-record-v1";

const fallbackItems = [
  {
    id: "meeting-delay-update",
    title: "A calm update when the timeline may slip",
    level: "B2",
    format: "workplace monologue",
    accent: "NZ/AU workplace",
    duration: "01:15",
    sourceType: "original training material",
    audioSrc: "",
    summary: "A short project update that explains a delay without sounding defensive.",
    tags: ["meeting", "status update", "timeline", "soft tone"],
    sentences: [
      {
        id: "s1",
        english: "I wanted to give a quick update on where things stand.",
        chinese: "我想快速说明一下目前的进展。",
        note: 'A calm opening for a status update. "Where things stand" means the current situation.',
      },
      {
        id: "s2",
        english: "Most of the work is moving in the right direction, but one part may need a bit more time.",
        chinese: "大部分工作方向是对的，但其中一部分可能需要多一点时间。",
        note: "This softens the problem by placing it inside the wider progress.",
      },
      {
        id: "s3",
        english: "I do not want to overstate the issue, but I think it is worth flagging early.",
        chinese: "我不想把问题说得太严重，但我觉得值得早点提出来。",
        note: '"Flagging early" sounds proactive and professional in NZ/AU workplace English.',
      },
      {
        id: "s4",
        english: "If we adjust the timeline now, we can avoid rushing the final review later.",
        chinese: "如果我们现在调整时间线，就可以避免后面最终审核太赶。",
        note: "This frames the delay as risk management, not an excuse.",
      },
    ],
    expressions: [
      {
        text: "where things stand",
        meaning: "the current situation or current progress",
        chinese: "目前的情况 / 进展",
        tag: "status update",
      },
      {
        text: "worth flagging early",
        meaning: "important enough to mention before it becomes a bigger issue",
        chinese: "值得早点提出来",
        tag: "workplace nuance",
      },
      {
        text: "avoid rushing the final review",
        meaning: "prevent the final review from becoming hurried",
        chinese: "避免最终审核太赶",
        tag: "timeline",
      },
    ],
    shadowingLine: "I do not want to overstate the issue, but I think it is worth flagging early.",
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
    if (nextRecord?.items) return nextRecord;

    const oldRecord = JSON.parse(localStorage.getItem(previousStorageKey));
    if (oldRecord && typeof oldRecord === "object") {
      return { selectedItemId: "", items: oldRecord };
    }
  } catch {
    return { selectedItemId: "", items: {} };
  }

  return { selectedItemId: "", items: {} };
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

  setText("[data-current-level]", item.level);
  setText("[data-current-duration]", item.duration);
  setText("[data-current-title]", item.title);
  setText("[data-current-summary]", item.summary);
  setText("[data-shadowing-line]", item.shadowingLine);
  renderTags(item.tags);
  renderAudio(item);
  renderLibrary();
  renderStatusButtons();
  renderDictation(item);
  renderSubtitles(item);
  renderExpressions(item);
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

  target.innerHTML = items
    .map((item) => {
      const saved = itemRecord(item.id);
      const isActive = currentItem?.id === item.id;
      return `
        <article class="library-card ${isActive ? "is-current" : ""}">
          <div class="library-card-top">
            <span>${escapeHtml(item.level)}</span>
            <span>${escapeHtml(item.duration)}</span>
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
    saved.push({ ...expression, itemId: currentItem.id, itemTitle: currentItem.title });
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
    (saved.savedExpressions || []).map((expression) => ({
      ...expression,
      itemId,
      itemTitle: expression.itemTitle || sourceForItem(itemId)?.title || "Saved clip",
    })),
  );
}

function renderVault() {
  const target = document.querySelector("[data-vault-list]");
  if (!target) return;
  const saved = savedExpressionsAcrossLibrary();

  if (!saved.length) {
    target.innerHTML = `
      <article class="empty-vault">
        <strong>No saved expressions yet.</strong>
        <p>Use Expression mining to save phrases that deserve another shadowing pass.</p>
      </article>
    `;
    return;
  }

  target.innerHTML = saved
    .map(
      (expression) => `
        <article>
          <span class="status saved">${escapeHtml(expression.tag || "saved")}</span>
          <strong>${escapeHtml(expression.text)}</strong>
          <p>${escapeHtml(expression.meaning)}</p>
          <p>${escapeHtml(expression.chinese)}</p>
          <small>${escapeHtml(expression.itemTitle)}</small>
        </article>
      `,
    )
    .join("");
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
  const selected = sourceForItem(record.selectedItemId) || items[0];
  renderCurrentItem(selected);
}

initWorkspace();
