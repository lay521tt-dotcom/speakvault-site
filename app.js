const fallbackCorpus = [
  {
    id: "meeting-status-risk",
    shortTitle: "Meeting update",
    cultureNoteTitle: "Soft signals matter.",
    chineseThought: "我想说明进度有点慢，但我不想显得不负责任。",
    naturalEnglish: "I wanted to give a quick update and be upfront about one thing that may take a little longer.",
    polishedEnglish: "I’d like to share where things stand and flag one timeline risk before it becomes an issue.",
    cultureNote:
      "In NZ/AU workplace English, a phrase like “flag one area” can sound calmer than “point out a problem”. It keeps the tone collaborative while still being clear.",
    reflectionPrompt: "Did “flag one timeline risk” sound calm and practical, or too heavy?",
    audioLabel: "No file attached",
    vaultPhrases: [
      {
        text: "flag one area that may need more time",
        status: "ready",
        note: "Use for calm status updates and timeline risks.",
      },
      {
        text: "be upfront about one thing",
        status: "practising",
        note: "Use when you want to sound honest without sounding defensive.",
      },
    ],
  },
  {
    id: "interview-career-move",
    shortTitle: "Career story",
    cultureNoteTitle: "Appreciation first.",
    chineseThought: "我想说我想要更多成长空间，但不要听起来像在抱怨上一份工作。",
    naturalEnglish: "I’ve learned a lot in my current role, and I’m ready for a position with more room to grow.",
    polishedEnglish: "My current role has given me a strong foundation, and I’m looking for a broader challenge.",
    cultureNote:
      "Start with appreciation before naming the next step. It keeps the answer positive and avoids sounding like you are criticising the previous workplace.",
    reflectionPrompt: "Did “more room to grow” sound ambitious without sounding unhappy?",
    audioLabel: "No file attached",
    vaultPhrases: [
      {
        text: "ready for a position with more room to grow",
        status: "new",
        note: "Use in interviews when explaining motivation without sounding negative.",
      },
      {
        text: "given me a strong foundation",
        status: "practising",
        note: "Use when you want to acknowledge your current experience gracefully.",
      },
    ],
  },
  {
    id: "soft-disagreement",
    shortTitle: "Soft disagreement",
    cultureNoteTitle: "Disagree with a door open.",
    chineseThought: "我不太同意这个方案，但我想留有余地。",
    naturalEnglish: "I see the thinking behind it. I’m just wondering if there’s a lower-risk way to test it first.",
    polishedEnglish: "I understand the rationale. My only hesitation is whether we can validate it on a smaller scale first.",
    cultureNote:
      "“My only hesitation” makes disagreement specific and less confrontational. It leaves space for the other person’s idea while still naming your concern.",
    reflectionPrompt: "Did “my only hesitation” sound specific, or did it soften the point too much?",
    audioLabel: "No file attached",
    vaultPhrases: [
      {
        text: "I see the thinking behind it",
        status: "practising",
        note: "Use before a soft disagreement or alternative suggestion.",
      },
      {
        text: "My only hesitation is whether...",
        status: "new",
        note: "Use to name one concern without rejecting the whole idea.",
      },
    ],
  },
];

const statusClasses = new Set(["ready", "practising", "new"]);

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function renderVault(phrases) {
  const vaultList = document.querySelector("[data-vault-list]");
  if (!vaultList) return;

  vaultList.innerHTML = phrases
    .map((phrase) => {
      const status = statusClasses.has(phrase.status) ? phrase.status : "new";
      return `
        <article>
          <span class="status ${status}">${phrase.status}</span>
          <strong>${phrase.text}</strong>
          <p>${phrase.note}</p>
        </article>
      `;
    })
    .join("");
}

function applyScenario(scenario) {
  setText("[data-current-scenario]", scenario.shortTitle || scenario.scenario);
  setText("[data-current-chinese]", scenario.chineseThought);
  setText("[data-current-natural]", scenario.naturalEnglish);
  setText("[data-current-audio]", scenario.audioSrc ? "Recording attached" : scenario.audioLabel || "No file attached");
  setText("[data-current-note-title]", scenario.cultureNoteTitle || "Culture note");
  setText("[data-current-culture]", scenario.cultureNote);
  setText("[data-current-target]", scenario.polishedEnglish || scenario.naturalEnglish);
  setText("[data-current-reflection]", scenario.reflectionPrompt || "Does this line sound natural when you say it aloud?");
  renderVault(scenario.vaultPhrases || []);

  document.querySelectorAll("[data-scenario-id]").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.scenarioId === scenario.id);
  });
}

async function loadCorpus() {
  try {
    const response = await fetch("content/corpus.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Corpus file unavailable");
    return response.json();
  } catch {
    return fallbackCorpus;
  }
}

async function initWorkspace() {
  const corpus = await loadCorpus();
  const byId = new Map(corpus.map((scenario) => [scenario.id, scenario]));

  document.querySelectorAll("[data-scenario-id]").forEach((card) => {
    const selectCard = () => {
      const scenario = byId.get(card.dataset.scenarioId);
      if (scenario) applyScenario(scenario);
    };

    card.addEventListener("click", selectCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCard();
      }
    });
  });

  applyScenario(byId.get("meeting-status-risk") || corpus[0]);
}

initWorkspace();
