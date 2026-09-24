// tests/unit/context-semantic-source.test.ts
/**
 * Unit tests for the SemanticSource adapter.
 *
 * Covers:
 * 1. Successful fetch with populated semantic memories.
 * 2. Missing workspaceId handling.
 * 3. Missing supabase client handling.
 * 4. Engine throws – graceful error handling.
 * 5. Empty insight leads to success with no sections.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { SemanticSource } from '@/lib/ai/context/sources/semantic';
import type { ContextRequest } from '@/lib/ai/context/types';
import { MemoryRetrievalEngine } from '@/lib/ai/memory/retrieval';

// Mock the MemoryRetrievalEngine module
vi.mock('@/lib/ai/memory/retrieval');

const baseRequest: ContextRequest = {
  workspaceId: 'test-ws',
  messages: [],
  supabase: {} as any, // placeholder supabase client
};

describe('SemanticSource Adapter', () => {
  const source = new SemanticSource();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successful fetch with populated memories', async () => {
    const fakeMemories = [
      {
        id: 'mem1',
        workspaceId: 'test-ws',
        source: 'chat',
        memoryType: 'fact',
        importance: 3 as any,
        content: 'Important fact about the project.',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'mem2',
        workspaceId: 'test-ws',
        source: 'chat',
        memoryType: 'preference',
        importance: 2 as any,
        content: 'User prefers short captions.',
        createdAt: '2023-01-02T00:00:00Z',
      },
    ] as any;

    vi.spyOn(MemoryRetrievalEngine, 'querySemanticMemories').mockResolvedValue(fakeMemories);

    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(2);
    const sec = result.sections[0];
    expect(sec.priority).toBe(5); // ContextPriority.LOW = 5
    expect(sec.content).toBe('Important fact about the project.');
    expect(sec.metadata?.memoryType).toBe('fact');
  });

  it('missing workspaceId returns error and no sections', async () => {
    const req = { ...baseRequest, workspaceId: '' } as any;
    const result = await source.fetch(req);
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(0);
    expect(result.error).toMatch(/Missing workspaceId/);
  });

  it('missing supabase returns error and no sections', async () => {
    const req = { ...baseRequest, supabase: undefined } as any;
    const result = await source.fetch(req);
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(0);
    expect(result.error).toMatch(/Supabase client not provided/);
  });

  it('engine throws – adapter catches and reports failure', async () => {
    vi.spyOn(MemoryRetrievalEngine, 'querySemanticMemories').mockRejectedValue(new Error('boom'));
    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(0);
    expect(result.error).toMatch(/Failed to load semantic memories/);
  });

  it('empty memories lead to success with no sections', async () => {
    vi.spyOn(MemoryRetrievalEngine, 'querySemanticMemories').mockResolvedValue([]);
    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(0);
  });
});
