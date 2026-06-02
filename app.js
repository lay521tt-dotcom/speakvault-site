const storageKey = "speakvault-listening-record-v1";

const fallbackItems = [
  {
    id: "meeting-delay-update",
    title: "A calm update when the timeline may slip",
    level: "B2",
    format: "workplace monologue",
    accent: "NZ/AU workplace",
    duration: "01:15",
    audioSrc: "",
    summary: "A short project update that explains a delay without sounding defensive.",
    tags: ["meeting", "status update", "timeline", "soft tone"],
    sentences: [
      {
        id: "s1",
        english: "I wanted to give a quick update on where things stand.",
        chinese: "我想快速说明一下目前的进展。",
        note: "A calm opening for a status update. “Where things stand” means the current situation.",
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
        note: "“Flagging early” sounds proactive and professional in NZ/AU workplace English.",
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

let currentItem;
let record = loadRecord();

function loadRecord() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveRecord() {
  localStorage.setItem(storageKey, JSON.stringify(record));
}

function itemRecord() {
  if (!currentItem) return {};
  record[currentItem.id] ||= { dictation: {}, savedExpressions: [], reflection: "" };
  return record[currentItem.id];
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function renderTags(tags) {
  const target = document.querySelector("[data-current-tags]");
  if (!target) return;
  target.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join("");
}

function renderCurrentItem(item) {
  currentItem = item;
  setText("[data-current-level]", item.level);
  setText("[data-current-duration]", item.duration);
  setText("[data-current-title]", item.title);
  setText("[data-current-summary]", item.summary);
  setText("[data-current-audio]", item.audioSrc ? "Recording attached" : "Attach your file later");
  setText("[data-shadowing-line]", item.shadowingLine);
  renderTags(item.tags || []);
  renderDictation(item);
  renderSubtitles(item);
  renderExpressions(item);
  renderVault();

  const reflection = document.querySelector("[data-reflection-input]");
  if (reflection) {
    reflection.value = itemRecord().reflection || "";
    reflection.addEventListener("input", () => {
      itemRecord().reflection = reflection.value;
      saveRecord();
    });
  }
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
          <textarea data-dictation-input="${sentence.id}" placeholder="Type what you hear before revealing the subtitle.">${saved[sentence.id] || ""}</textarea>
        </label>
      `,
    )
    .join("");

  target.querySelectorAll("[data-dictation-input]").forEach((input) => {
    input.addEventListener("input", () => {
      itemRecord().dictation[input.dataset.dictationInput] = input.value;
      saveRecord();
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
          <p class="subtitle-english">${sentence.english}</p>
          <p class="subtitle-chinese">${sentence.chinese}</p>
          <p class="subtitle-note">${sentence.note}</p>
        </details>
      `,
    )
    .join("");
}

function expressionSaved(text) {
  return itemRecord().savedExpressions.some((expression) => expression.text === text);
}

function toggleExpression(expression) {
  const saved = itemRecord().savedExpressions;
  if (expressionSaved(expression.text)) {
    itemRecord().savedExpressions = saved.filter((item) => item.text !== expression.text);
  } else {
    saved.push(expression);
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
          <span>${expression.tag}</span>
          <strong>${expression.text}</strong>
          <p>${expression.meaning}</p>
          <p>${expression.chinese}</p>
          <button type="button" data-expression="${expression.text}">
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

function renderVault() {
  const target = document.querySelector("[data-vault-list]");
  if (!target) return;
  const saved = itemRecord().savedExpressions;

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
          <span class="status saved">saved</span>
          <strong>${expression.text}</strong>
          <p>${expression.meaning}</p>
          <p>${expression.chinese}</p>
        </article>
      `,
    )
    .join("");
}

async function loadItems() {
  try {
    const response = await fetch("content/corpus.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Listening item file unavailable");
    return response.json();
  } catch {
    return fallbackItems;
  }
}

async function initWorkspace() {
  const items = await loadItems();
  renderCurrentItem(items[0]);
}

initWorkspace();
