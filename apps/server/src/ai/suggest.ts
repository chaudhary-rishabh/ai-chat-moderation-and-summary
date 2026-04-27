import { logger } from "../lib/logger";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const SUGGEST_URL = "https://api.deepseek.com/v1/chat/completions";

export async function generateSuggestions(
  _roomId: string,
  currentInput: string,
  recentMessages?: Array<{ senderName: string; content: string }>,
): Promise<string[]> {
  if (!currentInput.trim()) return [];

  const historyBlock =
    recentMessages?.length
      ? recentMessages
          .slice(-10)
          .map((m) => `${m.senderName}: ${m.content}`)
          .join("\n")
      : "No recent messages.";

  const response = await fetch(SUGGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a smart reply suggester. Given recent conversation history and a partial user input, suggest exactly 3 natural ways to complete the message. Return ONLY a JSON array of 3 strings. Example: ["sounds good to me", "let me check and get back to you", "I'll be there"]. Do NOT include any other text.`,
        },
        {
          role: "user",
          content: `Recent messages:\n${historyBlock}\n\nPartial input: "${currentInput}"\n\n3 suggestions:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, "suggest_api_error");
    return [];
  }

  const json = (await response.json()) as { choices: { message: { content: string } }[] };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";

  try {
    const parsed = JSON.parse(text) as string[];
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
      return parsed.slice(0, 3);
    }
  } catch {
    // If JSON parse fails, split by newlines and clean
    const lines = text
      .split("\n")
      .map((s) => s.replace(/^\d+\.\s*/, "").replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
    if (lines.length > 0) return lines.slice(0, 3);
  }

  return [];
}
