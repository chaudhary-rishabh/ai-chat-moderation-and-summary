import { logger } from "../../lib/logger";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const EMBED_URL = "https://api.deepseek.com/v1/embeddings";
const EMBED_MODEL = "deepseek-chat";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text?.trim()) throw new Error("Cannot embed empty text");

  const response = await fetch(EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });

  if (!response.ok) {
    logger.error({ status: response.status }, "embed_api_error");
    throw new Error(`Embed API returned ${response.status}`);
  }

  const json = (await response.json()) as { data: { embedding: number[] }[] };
  const embedding = json.data?.[0]?.embedding;

  if (!embedding?.length) {
    logger.error("embed_empty_response");
    throw new Error("Embed API returned empty embedding");
  }

  return embedding;
}
