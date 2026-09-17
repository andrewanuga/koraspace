// tests/unit/context-performance-source.test.ts
/**
 * Unit tests for the PerformanceSource adapter.
 *
 * Covers:
 * 1. Successful fetch with populated PerformanceInsight.
 * 2. Missing workspaceId handling.
 * 3. Engine throws – graceful error handling.
 * 4. Correct ContextSection shape and MEDIUM priority.
 * 5. Empty/insufficient insight (no formatted content).
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { PerformanceSource } from '@/lib/ai/context/sources/performance';
import type { ContextRequest } from '@/lib/ai/context/types';
import { PerformanceMemoryEngine } from '@/lib/ai/memory/performance';

// Mock the PerformanceMemoryEngine module
vi.mock('@/lib/ai/memory/performance');

// No direct mockedEngine alias needed; we'll use vi.spyOn

const baseRequest: ContextRequest = {
  workspaceId: 'test-ws',
  messages: [],
};

describe('PerformanceSource Adapter', () => {
  const source = new PerformanceSource();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successful fetch with populated insight', async () => {
    const fakeInsight = {
      workspaceId: 'test-ws',
      platform: 'twitter',
      totalPostsAnalyzed: 30,
      avgEngagementRate: 12.5,
      topPerformingFormats: ['Educational Breakdown'],
      strongestHooks: ['Hook A', 'Hook B'],
      topCtaPatterns: ['CTA X'],
      bestPostingHoursUtc: [8, 12, 17],
      topPosts: [],
    } as any;
    vi.spyOn(PerformanceMemoryEngine, 'analyze').mockResolvedValue(fakeInsight);
    vi.spyOn(PerformanceMemoryEngine, 'formatPromptSection').mockReturnValue('Formatted performance section');

    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(1);
    const sec = result.sections[0];
    expect(sec.priority).toBe(4); // ContextPriority.MEDIUM = 4 as per enum
    expect(sec.content).toBe('Formatted performance section');
    expect(sec.metadata?.platform).toBe('twitter');
    expect(sec.metadata?.totalPostsAnalyzed).toBe(30);
    expect(sec.metadata?.bestPostingHoursUtc).toEqual([8, 12, 17]);
  });

  it('missing workspaceId returns error and no sections', async () => {
    const req = { ...baseRequest, workspaceId: '' } as any;
    const result = await source.fetch(req);
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(0);
    expect(result.error).toMatch(/Missing workspaceId/);
  });

  it('engine throws – adapter catches and reports failure', async () => {
    vi.spyOn(PerformanceMemoryEngine, 'analyze').mockRejectedValue(new Error('boom'));
    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(0);
    expect(result.error).toMatch(/Failed to load performance insight/);
  });

  it('empty insight leads to no sections but success', async () => {
    vi.spyOn(PerformanceMemoryEngine, 'analyze').mockResolvedValue(undefined);
    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(0);
  });

  it('empty formatted content is treated as no usable section', async () => {
    const fakeInsight = {
      workspaceId: 'test-ws',
      totalPostsAnalyzed: 0,
    } as any;
    vi.spyOn(PerformanceMemoryEngine, 'analyze').mockResolvedValue(fakeInsight);
    vi.spyOn(PerformanceMemoryEngine, 'formatPromptSection').mockReturnValue('');
    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(0);
  });
});
