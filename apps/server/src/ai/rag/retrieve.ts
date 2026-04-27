import { generateEmbedding } from "./embed";
import { vectorSearch, bm25Search, getMessagesByIds } from "db/queries";
import type { RetrievedChunk } from "types/src/ai";
import { logger } from "../../lib/logger";

const RRF_K = 60;
const TOP_K = 8;

interface SearchResult {
  message_id: string;
  score: number;
}

export async function hybridSearch(
  query: string,
  _userId: string,
  roomId?: string,
): Promise<RetrievedChunk[]> {
  // 1. Generate query embedding
  const queryVector = await generateEmbedding(query);

  // 2. Run vector and BM25 searches in parallel
  const [vectorResults, bm25Results] = await Promise.all([
    vectorSearch(queryVector, 20, roomId),
    bm25Search(query, 20, roomId),
  ]);

  // 3. RRF merge
  const scores = new Map<string, number>();

  (vectorResults as unknown as SearchResult[]).forEach((row, rank) => {
    scores.set(row.message_id, 1 / (RRF_K + rank + 1));
  });

  (bm25Results as unknown as SearchResult[]).forEach((row, rank) => {
    const existing = scores.get(row.message_id) ?? 0;
    scores.set(row.message_id, existing + 1 / (RRF_K + rank + 1));
  });

  // 4. Sort by RRF score, deduplicate, take top 8
  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_K);

  if (ranked.length === 0) return [];

  // 5. Fetch full messages
  const messageIds = ranked.map(([id]) => id);
  const fullMessages = await getMessagesByIds(messageIds);

  // 6. Map to RetrievedChunk
  const chunkMap = new Map<string, RetrievedChunk>();
  for (const [id, score] of ranked) {
    const msg = fullMessages.find((m) => m.id === id);
    if (msg?.content) {
      chunkMap.set(id, {
        messageId: msg.id,
        content: msg.content,
        senderName: msg.sender?.name ?? "Unknown",
        createdAt: msg.createdAt.toISOString(),
        score,
      });
    }
  }

  logger.info(
    { query: query.slice(0, 80), resultCount: chunkMap.size },
    "hybrid_search_complete",
  );

  return ranked
    .map(([id]) => chunkMap.get(id))
    .filter(Boolean) as RetrievedChunk[];
}
