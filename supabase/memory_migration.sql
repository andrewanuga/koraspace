-- ============================================================
-- Koraspace AI — Memory & Brand Intelligence Schema Upgrade
-- ============================================================

-- 1. Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Extend ai_persona for Rich Brand Intelligence
ALTER TABLE public.ai_persona
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS preferred_terms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS forbidden_terms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_pillars text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cta_preferences text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS brand_guidelines text[] DEFAULT '{}';

-- 3. Upgrade ai_message_memory for Semantic Retrieval (pgvector)
ALTER TABLE public.ai_message_memory
  ADD COLUMN IF NOT EXISTS memory_type text DEFAULT 'conversation'
    CHECK (memory_type IN ('conversation', 'brand_rule', 'preference', 'fact', 'decision')),
  ADD COLUMN IF NOT EXISTS importance int DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 4. Fast Cosine Similarity Vector Index
CREATE INDEX IF NOT EXISTS idx_ai_message_memory_embedding
  ON public.ai_message_memory
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. Semantic Memory Match RPC Function for pgvector search
CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_workspace_id uuid
)
RETURNS TABLE (
  id uuid,
  workspace_id uuid,
  content text,
  memory_type text,
  importance int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id AS workspace_id,
    m.content,
    m.memory_type,
    m.importance,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.ai_message_memory m
  WHERE m.user_id = filter_workspace_id
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
