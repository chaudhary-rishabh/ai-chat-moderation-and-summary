import { z } from "zod";

// ─── Safety classification ──────────────────────────────────────────────────────

export interface SafetyClassification {
  flagType: "abuse" | "bullying" | "harassment" | "hate_speech" | "spam" | "self_harm" | "other" | "safe";
  confidenceScore: number;
  reasoning: string;
  offendingSpan: string | null;
}

// ─── Summary ────────────────────────────────────────────────────────────────────

export const SummaryOutputSchema = z.object({
  mainPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  participants: z.array(z.string()),
  language: z.string(),
});

export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

export interface FormattedSummary {
  content: string;
  language: string;
  messageCount: number;
  createdAt: string;
  citations: Array<{ messageId: string; senderName: string; snippet: string }>;
}

// ─── AI Session ─────────────────────────────────────────────────────────────────

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export const ChatSessionPayload = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(8000),
});

export type ChatSessionPayload = z.infer<typeof ChatSessionPayload>;

// ─── Suggestions ────────────────────────────────────────────────────────────────

export const SuggestPayload = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  history: z.array(z.object({
    senderName: z.string(),
    content: z.string(),
  })).optional(),
});

export type SuggestPayload = z.infer<typeof SuggestPayload>;

// ─── RAG context ────────────────────────────────────────────────────────────────

export interface RetrievedChunk {
  messageId: string;
  content: string;
  senderName: string;
  createdAt: string;
  score: number;
}

export interface AssembledContext {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  citations: Array<{ messageId: string; senderName: string; snippet: string }>;
}
