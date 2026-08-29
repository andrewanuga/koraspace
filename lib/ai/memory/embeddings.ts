/**
 * Vector Embedding & Semantic Similarity Service
 *
 * Generates and compares semantic vector embeddings:
 * - Compatible with OpenRouter / OpenAI embeddings endpoints
 * - Supports configurable vector dimensions (default 768 / 1536)
 * - Includes robust fallback cosine similarity and keyword relevance for offline/dev
 */

import { isConfigured } from "../openrouter";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_EMBEDDING_MODEL = process.env.OPENROUTER_EMBEDDING_MODEL || "text-embedding-3-small";

export class EmbeddingService {
  /**
   * Generates a vector embedding for a given text.
   */
  public static async generateEmbedding(text: string): Promise<number[] | undefined> {
    if (!text || text.trim().length === 0) return undefined;
    if (!isConfigured() || !process.env.OPENROUTER_API_KEY) return undefined;

    try {
      const res = await fetch(`${OPENROUTER_BASE}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://koraspace.ai",
          "X-Title": "Koraspace AI",
        },
        body: JSON.stringify({
          model: DEFAULT_EMBEDDING_MODEL,
          input: text.slice(0, 8000),
        }),
      });

      if (!res.ok) {
        console.warn(`[EmbeddingService] OpenRouter embeddings error (${res.status}):`, await res.text());
        return undefined;
      }

      const json = await res.json();
      return json.data?.[0]?.embedding;
    } catch (err) {
      console.warn("[EmbeddingService] Failed to generate embedding:", err);
      return undefined;
    }
  }

  /**
   * Calculates cosine similarity between two vector embeddings.
   */
  public static cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fast lexical keyword relevance score for filtering and ranking when embeddings are unavailable.
   */
  public static lexicalSimilarity(query: string, target: string): number {
    const qWords = Array.from(
      new Set(
        query
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 2)
      )
    );
    const tWords = Array.from(
      new Set(
        target
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 2)
      )
    );

    if (qWords.length === 0 || tWords.length === 0) return 0;

    const tLower = target.toLowerCase();
    const qLower = query.toLowerCase();

    let matchesQ = 0;
    for (const q of qWords) {
      if (tLower.includes(q) || (q.endsWith("s") && tLower.includes(q.slice(0, -1)))) {
        matchesQ++;
      }
    }

    let matchesT = 0;
    for (const t of tWords) {
      if (qLower.includes(t) || (t.endsWith("s") && qLower.includes(t.slice(0, -1)))) {
        matchesT++;
      }
    }

    // Bidirectional containment similarity
    return Math.max(matchesQ / qWords.length, matchesT / tWords.length);
  }
}
