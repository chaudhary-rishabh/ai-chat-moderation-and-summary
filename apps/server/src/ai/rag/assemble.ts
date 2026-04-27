import type { RetrievedChunk, AssembledContext, AiMessage } from "types/src/ai";

const SYSTEM_PERSONA = `You are an AI assistant with access to the user's chat history.
Use the retrieved context below to answer the user's question accurately.
If the context does not contain relevant information, say so honestly.
Never make up information that is not in the context.

When citing information from the context, reference the source message in your response.`;

export function assembleContext(
  query: string,
  retrievedMessages: RetrievedChunk[],
  sessionHistory: AiMessage[],
): AssembledContext {
  // Build retrieved context block
  const contextBlock =
    retrievedMessages.length > 0
      ? retrievedMessages
          .map(
            (chunk) =>
              `[Source: ${chunk.senderName} at ${new Date(chunk.createdAt).toISOString()}]: ${chunk.content}`,
          )
          .join("\n\n")
      : "No relevant chat history found.";

  const systemPrompt = `${SYSTEM_PERSONA}

--- RETRIEVED CONTEXT ---
${contextBlock}
--- END CONTEXT ---`;

  // Build messages array: session history + current query
  const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  // Include recent session history (last 10 exchanges)
  const recentHistory = sessionHistory.slice(-20);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current query
  messages.push({ role: "user", content: query });

  // Build citations
  const citations = retrievedMessages.map((chunk) => ({
    messageId: chunk.messageId,
    senderName: chunk.senderName,
    snippet: chunk.content.slice(0, 200),
  }));

  return { systemPrompt, messages, citations };
}
