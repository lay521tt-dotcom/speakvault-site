# SpeakVault Product Requirements

## Product Shape

SpeakVault is a shareable English study workspace for intensive listening, corpus collection, phrase mining, and AI-assisted writing feedback.

The product solves three problems:

- paper notebooks are hard to search, reuse, and connect to source material;
- general English apps are not shaped around personal dictation records and phrase mining;
- learners need targeted feedback on wording, grammar, and natural workplace English after practice.

The first version stays quiet and tool-like: open the page, choose a listening item, write dictation, reveal subtitles, save expressions, reflect, and ask AI for text feedback.

## Primary Users

The first user is the product owner: a Chinese-speaking working adult in a New Zealand/Australia context who wants better listening and speaking for workplace and daily life.

The shareable V1 can also be used by family and friends, but it does not include accounts, cloud sync, or shared user profiles.

## V1 Scope

V1 includes:

- a scenario-first listening library with at least 20 original training items;
- scenario and difficulty filters for the library;
- audio slots that become native audio players when `audioSrc` is present;
- sentence-level dictation textareas;
- local browser saving for selected clip, dictation notes, practice status, reflection, phrase vault choices, and AI feedback;
- hidden sentence subtitles with English, Chinese explanation, and usage/culture note;
- expression mining cards with save-to-vault buttons;
- phrase vault populated from saved expressions across the library, with scenario filtering;
- a shadowing target line and reflection area;
- a Vercel serverless API for Claude writing feedback, protected by a shared access code.

V1 does not include login, database sync, uploads, speech scoring, pronunciation correction, realtime voice, user management, or content licensing workflow.

## Practice Loop

1. Choose a listening item from the scenario-based library.
2. Listen without subtitles.
3. Pause sentence by sentence and type dictation.
4. Reveal subtitles only when ready.
5. Compare English, Chinese explanation, and note.
6. Save reusable expressions to the phrase vault.
7. Write a reflection or shadowing note.
8. Ask AI for text feedback on grammar, wording, naturalness, phrases, and next practice.

## Listening Item Schema

Listening items use this shape:

```json
{
  "id": "meeting-delay-update",
  "title": "A calm update when the timeline may slip",
  "category": "Meeting",
  "difficulty": "B2",
  "level": "B2",
  "format": "workplace monologue",
  "accent": "NZ/AU workplace",
  "duration": "01:15",
  "sourceType": "original training material",
  "audioSrc": "assets/audio/meeting-delay-update.mp3",
  "summary": "A short project update that explains a delay without sounding defensive.",
  "practiceFocus": "Softening bad news and proposing a timeline adjustment.",
  "tags": ["meeting", "status update", "timeline", "soft tone"],
  "sentences": [
    {
      "id": "s1",
      "english": "I wanted to give a quick update on where things stand.",
      "chinese": "我想快速说明一下目前的进展。",
      "note": "\"Where things stand\" means the current situation."
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

## AI Feedback Contract

The frontend calls `POST /api/analyze-writing` with:

- `accessCode`: the shared family/friends access code;
- `practice`: current item metadata, dictation notes, reflection, target line, and saved expressions.

The API returns structured feedback:

- `naturalRewrite`
- `grammarCorrections`
- `phraseSuggestions`
- `practiceAdvice`
- `encouragement`

The Anthropic API key and shared access code must only live in Vercel environment variables. They must never be shipped to the browser.

## Content Principles

- Use user-owned or original training material first; external material requires clear rights boundaries.
- Organise corpus by scenario first: Meeting, Interview, Presentation, NZ/AU Life, Cross-cultural.
- Add personal audio by placing files in `assets/audio/` and setting `audioSrc` on the related corpus item.
- Keep UI in English, with Chinese used for thoughts, explanations, and contrast.
- Treat subtitles as a checking tool, not the first thing the learner sees.
- Save only expressions worth reusing or shadowing, not every unknown word.
- Keep the visual mood calm and Morandi-inspired, led by dusty blush and supported by warm grey, fog blue, dusty mauve, and soft purple.
