import { db, messages, summaries } from "db/src";
import { insertSummary } from "db/queries";
import { eq, desc, and } from "drizzle-orm";
import type { FormattedSummary } from "types/src/ai";
import { logger } from "../lib/logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SUMMARY_PROMPT = `Summarize the following conversation. Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "mainPoints": ["point 1", "point 2"],
  "decisions": ["decision 1"],
  "actionItems": ["item 1"],
  "unresolvedQuestions": ["question 1"],
  "participants": ["Name1", "Name2"],
  "language": "en"
}

Conversation to summarize:`;

export async function summarizeRoom(
  roomId: string,
  language: string,
  requestedBy: string | null,
): Promise<FormattedSummary> {
  // Fetch last 100 messages
  const recentMessages = await db.query.messages.findMany({
    where: and(eq(messages.roomId, roomId), eq(messages.isDeleted, false)),
    with: { sender: { columns: { name: true } } },
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    limit: 100,
  });

  if (recentMessages.length === 0) {
    return {
      content: "No messages to summarize.",
      language,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      citations: [],
    };
  }

  // Build conversation text
  const conversationText = recentMessages
    .reverse()
    .map((m) => `${m.sender?.name ?? "Unknown"}: ${m.content}`)
    .join("\n");

  const prompt = `${SUMMARY_PROMPT}\n\n${conversationText}\n\nLanguage for output: ${language}.${language !== "en" ? " Translate the output fields to " + language + "." : ""}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
    }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, "gemini_api_error");
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error("Gemini returned empty response");

  // Parse JSON from response (strip code fences if present)
  let parsed: Record<string, unknown>;
  try {
    const clean = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(clean) as Record<string, unknown>;
  } catch {
    logger.warn({ text: text.slice(0, 200) }, "gemini_parse_failed");
    // Fallback: return raw text as content
    parsed = {
      mainPoints: [],
      decisions: [],
      actionItems: [],
      unresolvedQuestions: [],
      participants: [],
      language,
    };
  }

  // Build citations from sampled messages
  const citations = recentMessages.slice(0, 10).map((m) => ({
    messageId: m.id,
    senderName: m.sender?.name ?? "Unknown",
    snippet: m.content?.slice(0, 200) ?? "",
  }));

  // Store in DB
  const content = JSON.stringify(parsed);
  await insertSummary({
    roomId,
    content,
    language,
    messageCount: recentMessages.length,
    createdBy: requestedBy,
  });

  logger.info({ roomId, messageCount: recentMessages.length }, "summary_generated");

  return {
    content,
    language,
    messageCount: recentMessages.length,
    createdAt: new Date().toISOString(),
    citations,
  };
}
