import { hybridSearch } from "./rag/retrieve";
import { assembleContext } from "./rag/assemble";
import { getOrCreateSession, appendMessage, getSessionMessages, updateTokenCount } from "db/queries";
import type { AiMessage } from "types/src/ai";
import type { Response } from "express";
import { logger } from "../lib/logger";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const CHAT_URL = "https://api.deepseek.com/v1/chat/completions";

export async function handleDirectChat(
  userId: string,
  userMessage: string,
  sessionId?: string,
): Promise<{ response: string; citations: Array<{ messageId: string; senderName: string; snippet: string }>; sessionId: string }> {
  // 1. Get or create session
  const session = await getOrCreateSession(userId);
  const history = (await getSessionMessages(session.id))?.messages ?? [];

  // 2. Hybrid search for relevant context
  const retrieved = await hybridSearch(userMessage, userId);

  // 3. Assemble context
  const assembled = assembleContext(userMessage, retrieved, history as AiMessage[]);

  // 4. Call DeepSeek R1
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-reasoner",
      messages: assembled.messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, "direct_chat_api_error");
    throw new Error(`DeepSeek API returned ${response.status}`);
  }

  const json = (await response.json()) as { choices: { message: { content: string } }[]; usage?: { total_tokens?: number } };
  const replyText = json.choices?.[0]?.message?.content?.trim() ?? "Sorry, I couldn't generate a response.";

  // 5. Save messages to session
  const now = new Date().toISOString();
  await appendMessage(session.id, { role: "user", content: userMessage, timestamp: now });
  await appendMessage(session.id, { role: "assistant", content: replyText, timestamp: now });

  // 6. Update token count
  const tokens = json.usage?.total_tokens ?? 0;
  if (tokens > 0) await updateTokenCount(session.id, tokens);

  logger.info({ userId, sessionId: session.id, tokens }, "direct_chat_complete");

  return {
    response: replyText,
    citations: assembled.citations,
    sessionId: session.id,
  };
}

export async function streamDirectChat(
  userId: string,
  userMessage: string,
  sessionId: string | undefined,
  res: Response,
): Promise<void> {
  // 1. Get or create session
  const session = await getOrCreateSession(userId);
  const history = (await getSessionMessages(session.id))?.messages ?? [];

  // 2. Hybrid search
  const retrieved = await hybridSearch(userMessage, userId);

  // 3. Assemble context
  const assembled = assembleContext(userMessage, retrieved, history as AiMessage[]);

  // 4. Stream from DeepSeek R1 with streaming
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-reasoner",
      messages: assembled.messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    res.write(`data: ${JSON.stringify({ error: "API error" })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const decoder = new TextDecoder();
  let fullReply = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[];
          };
          const chunk = parsed.choices?.[0]?.delta?.content ?? "";
          if (chunk) {
            fullReply += chunk;
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          }
        } catch {
          // Skip unparseable chunks
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "stream_read_error");
  }

  // Send citations and done signal
  res.write(
    `data: ${JSON.stringify({
      citations: assembled.citations,
      sessionId: session.id,
    })}\n\n`,
  );
  res.write("data: [DONE]\n\n");
  res.end();

  // Save messages
  const now = new Date().toISOString();
  await appendMessage(session.id, { role: "user", content: userMessage, timestamp: now });
  await appendMessage(session.id, { role: "assistant", content: fullReply, timestamp: now });

  logger.info({ userId, sessionId: session.id, replyLength: fullReply.length }, "stream_chat_complete");
}
