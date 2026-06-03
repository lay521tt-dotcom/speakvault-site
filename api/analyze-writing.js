const feedbackSchema = {
  type: "object",
  additionalProperties: false,
  required: ["naturalRewrite", "grammarCorrections", "phraseSuggestions", "practiceAdvice", "encouragement"],
  properties: {
    naturalRewrite: { type: "string" },
    grammarCorrections: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original", "correction", "explanationZh"],
        properties: {
          original: { type: "string" },
          correction: { type: "string" },
          explanationZh: { type: "string" },
        },
      },
    },
    phraseSuggestions: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phrase", "reasonZh", "example"],
        properties: {
          phrase: { type: "string" },
          reasonZh: { type: "string" },
          example: { type: "string" },
        },
      },
    },
    practiceAdvice: { type: "string" },
    encouragement: { type: "string" },
  },
};

function sendJson(response, statusCode, body) {
  response.status(statusCode).json(body);
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
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
  const apiKey = process.env.OPENAI_API_KEY;

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
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are SpeakVault's English coach for Chinese-speaking adult learners. Give concise, practical feedback for workplace English. Focus on grammar, wording, naturalness, reusable phrases, and next practice. Do not provide pronunciation scoring.",
          },
          {
            role: "user",
            content: `Analyze this listening practice record. Explain feedback in Chinese where useful, but keep corrected English examples in English.\n\n${inputText}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "speakvault_writing_feedback",
            strict: true,
            schema: feedbackSchema,
          },
        },
      }),
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      return sendJson(response, openaiResponse.status, { error: data.error?.message || "AI feedback failed." });
    }

    const outputText = extractOutputText(data);
    const feedback = JSON.parse(outputText);
    return sendJson(response, 200, { feedback });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "AI feedback is unavailable right now." });
  }
};
