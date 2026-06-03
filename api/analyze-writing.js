function sendJson(response, statusCode, body) {
  response.status(statusCode).json(body);
}

function extractOutputText(data) {
  return (data.content || [])
    .filter((content) => content.type === "text")
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function parseFeedback(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Claude returned feedback in an unexpected format.");
    return JSON.parse(match[0]);
  }
}

function compactPractice(practice) {
  return {
    item: practice?.item || {},
    dictation: practice?.dictation || {},
    reflection: practice?.reflection || "",
    savedExpressions: (practice?.savedExpressions || []).slice(0, 12),
  };
}

function requestBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Only POST requests are supported." });
  }

  const expectedAccessCode = process.env.SPEAKVAULT_ACCESS_CODE;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!expectedAccessCode || !apiKey) {
    return sendJson(response, 503, { error: "AI feedback is not configured yet." });
  }

  const { accessCode, practice } = requestBody(request);
  if (accessCode !== expectedAccessCode) {
    return sendJson(response, 401, { error: "The shared access code is incorrect." });
  }

  const compacted = compactPractice(practice);
  const inputText = JSON.stringify(compacted);
  if (inputText.length > 18000) {
    return sendJson(response, 413, { error: "This practice record is too long to analyze at once." });
  }

  try {
    const anthropicResponse = await fetch(process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": process.env.ANTHROPIC_VERSION || "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 1600,
        system:
          "You are SpeakVault's English coach for Chinese-speaking adult learners. Give concise, practical feedback for workplace English. Focus on grammar, wording, naturalness, reusable phrases, and next practice. Do not provide pronunciation scoring. Return only valid JSON.",
        messages: [
          {
            role: "user",
            content: `Analyze this listening practice record. Explain feedback in Chinese where useful, but keep corrected English examples in English.

Return exactly this JSON shape:
{
  "naturalRewrite": "string",
  "grammarCorrections": [
    { "original": "string", "correction": "string", "explanationZh": "string" }
  ],
  "phraseSuggestions": [
    { "phrase": "string", "reasonZh": "string", "example": "string" }
  ],
  "practiceAdvice": "string",
  "encouragement": "string"
}

Practice record:
${inputText}`,
          },
        ],
      }),
    });

    const data = await anthropicResponse.json();
    if (!anthropicResponse.ok) {
      return sendJson(response, anthropicResponse.status, { error: data.error?.message || "AI feedback failed." });
    }

    const outputText = extractOutputText(data);
    const feedback = parseFeedback(outputText);
    return sendJson(response, 200, { feedback });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "AI feedback is unavailable right now." });
  }
};
