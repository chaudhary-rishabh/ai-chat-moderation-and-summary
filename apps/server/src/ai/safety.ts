import type { SafetyClassification } from "types/src/ai";
import { logger } from "../lib/logger";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const SAFETY_URL = "https://api.deepseek.com/v1/chat/completions";

const SAFETY_PROMPT = `You are a content safety classifier. Analyze the message and classify it.
Return ONLY a JSON object with this exact format:
{
  "flagType": "abuse" | "bullying" | "harassment" | "hate_speech" | "spam" | "self_harm" | "other" | "safe",
  "confidenceScore": <number 0.0-1.0>,
  "reasoning": "<one sentence explanation>",
  "offendingSpan": "<exact text that triggered the flag, or null if safe>"
}`;

export async function classifyMessage(content: string): Promise<SafetyClassification> {
  if (!content?.trim()) {
    return {
      flagType: "safe",
      confidenceScore: 0,
      reasoning: "Empty message",
      offendingSpan: null,
    };
  }

  const response = await fetch(SAFETY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-reasoner",
      messages: [
        { role: "system", content: SAFETY_PROMPT },
        { role: "user", content },
      ],
      temperature: 0,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, "safety_api_error");
    return {
      flagType: "safe",
      confidenceScore: 0,
      reasoning: `API error: ${response.status}`,
      offendingSpan: null,
    };
  }

  const json = (await response.json()) as { choices: { message: { content: string } }[] };
  const rawContent = json.choices?.[0]?.message?.content?.trim() ?? "";

  try {
    const parsed = JSON.parse(rawContent) as SafetyClassification;
    // Validate required fields
    if (typeof parsed.flagType === "string" && typeof parsed.confidenceScore === "number") {
      return parsed;
    }
  } catch {
    logger.warn({ rawContent }, "safety_parse_failed");
  }

  return {
    flagType: "safe",
    confidenceScore: 0,
    reasoning: "Failed to parse classifier output",
    offendingSpan: null,
  };
}
