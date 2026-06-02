# SpeakVault Product Requirements

## Product Shape

SpeakVault is a personal English study workspace for a Chinese-speaking working adult living in a New Zealand/Australia context. It is not a public course platform or a marketing landing page in v1.

The product helps the learner:

- turn Chinese thoughts into natural, speakable workplace English;
- listen to and shadow useful lines;
- understand cultural and pragmatic nuance;
- keep a personal phrase vault of expressions worth practising.

## Primary User

The first user is the product owner: a working adult and overseas Chinese speaker preparing for:

- workplace meetings and status updates;
- reporting, interviews, and job search conversations;
- cross-cultural communication;
- New Zealand and Australian work-life English.

## MVP Scope

V1 is a static, one-page study dashboard with:

- today's listening and speaking focus;
- curated scenario cards;
- a shadowing practice panel;
- a static phrase vault with practice status;
- culture or usage notes attached to corpus items.
- lightweight client-side scenario selection that updates the current focus, shadowing line, culture note, and vault phrases.

V1 does not include login, database sync, uploads, OpenAI calls, speech scoring, or persistent phrase saving.

## Practice Loop

The learning loop is:

1. Choose a scenario card.
2. Read the Chinese thought and workplace context.
3. Study the natural and polished English versions.
4. Use the audio slot when a recording is available.
5. Shadow the target line aloud.
6. Review the culture note and phrase pattern.
7. Keep useful lines in the static phrase vault.

## Corpus Schema

Corpus items are scenario cards. Each item should use this shape before materials are imported:

```json
{
  "id": "meeting-status-risk",
  "scenario": "Giving a careful status update",
  "context": "Weekly team meeting, project timeline may shift.",
  "chineseThought": "我想说明进度有点慢，但我不想显得不负责任。",
  "naturalEnglish": "I wanted to give a quick update and be upfront about one thing that may take a little longer.",
  "polishedEnglish": "I’d like to share where things stand and flag one timeline risk before it becomes an issue.",
  "cultureNote": "“Be upfront” sounds honest without sounding defensive.",
  "tags": ["meeting", "status update", "NZ/AU workplace"],
  "audioSrc": "",
  "vaultPhrases": [
    {
      "text": "flag one area that may need more time",
      "status": "ready",
      "note": "Use for calm status updates and timeline risks."
    }
  ]
}
```

## Content Principles

- Keep UI in English, with Chinese used for thoughts, contrast, and context.
- Prefer realistic workplace language over textbook phrasing.
- Keep culture notes short and close to the phrase they explain.
- Prioritise listening and speaking practice over reading volume.
- Make the product feel like a quiet study desk, not a SaaS landing page.
