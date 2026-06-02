# SpeakVault Product Requirements

## Product Shape

SpeakVault is not a general language learning platform. It is a personal system for turning intensive listening into speakable workplace English.

The product helps the learner:

- practise one listening item deeply instead of browsing endless content;
- write dictation sentence by sentence before seeing subtitles;
- reveal English subtitles and Chinese explanations only when ready;
- mine missed words, chunks, sentences, and cultural signals;
- save useful expressions into a personal phrase vault;
- shadow selected lines until they become speakable.

## Primary User

The first user is the product owner: a Chinese-speaking working adult in a New Zealand/Australia context who wants better listening and speaking for:

- workplace meetings and status updates;
- reporting, interviews, and job search conversations;
- cross-cultural communication;
- real work-life English, not textbook English.

## MVP Scope

V1 is a static, one-page intensive listening workspace with:

- a small listening library of original training items;
- an audio slot that becomes a native audio player when `audioSrc` is present;
- sentence-level dictation textareas;
- local browser saving for selected clip, dictation notes, practice status, reflection, and phrase vault choices;
- hidden sentence subtitles using expandable cards;
- English subtitle, Chinese explanation, and listening note per sentence;
- expression mining cards with save-to-vault buttons;
- phrase vault populated from saved expressions across the listening library;
- a shadowing target line and reflection area.

V1 does not include login, database sync, uploads, OpenAI calls, speech scoring, waveform editing, cloud libraries, or content licensing workflow.

## Practice Loop

The learning loop is:

1. First listen without subtitles.
2. Pause sentence by sentence and type what was heard.
3. Reveal each subtitle only after dictation.
4. Compare English, Chinese explanation, and listening note.
5. Save useful expressions to the phrase vault.
6. Shadow the target line aloud.
7. Record reflection on what still feels hard to say.

## Listening Item Schema

Listening items should use this shape before materials are imported:

```json
{
  "id": "meeting-delay-update",
  "title": "A calm update when the timeline may slip",
  "level": "B2",
  "format": "workplace monologue",
  "accent": "NZ/AU workplace",
  "duration": "01:15",
  "sourceType": "original training material",
  "audioSrc": "assets/audio/meeting-delay-update.mp3",
  "summary": "A short project update that explains a delay without sounding defensive.",
  "tags": ["meeting", "status update", "timeline", "soft tone"],
  "sentences": [
    {
      "id": "s1",
      "english": "I wanted to give a quick update on where things stand.",
      "chinese": "我想快速说明一下目前的进展。",
      "note": "A calm opening for a status update."
    }
  ],
  "expressions": [
    {
      "text": "where things stand",
      "meaning": "the current situation or current progress",
      "chinese": "目前的情况 / 进展",
      "tag": "status update"
    }
  ],
  "shadowingLine": "I do not want to overstate the issue, but I think it is worth flagging early."
}
```

## Content Principles

- Use user-owned or original training material first; external material requires clear rights boundaries.
- Add personal audio by placing files in `assets/audio/` and setting `audioSrc` on the related corpus item.
- Keep UI in English, with Chinese used for thoughts, explanations, and contrast.
- Treat subtitles as a checking tool, not the first thing the learner sees.
- Save only expressions worth reusing or shadowing, not every unknown word.
- Keep the visual mood calm and Morandi-inspired, led by dusty blush and supported by warm grey, fog blue, dusty mauve, and soft purple.
