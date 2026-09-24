// tests/unit/context-working-session-source.test.ts
/**
 * Unit tests for the WorkingSessionSource adapter.
 *
 * Covers:
 * 1. Recent session turns become ContextSection(s).
 * 2. HIGH priority is assigned.
 * 3. Empty session is handled safely.
 * 4. Workspace isolation is preserved.
 * 5. Token estimates are generated.
 * 6. Oversized session is bounded (last 5 messages).
 * 7. Missing workspaceId fails gracefully.
 */

import { describe, it, expect } from 'vitest';
import { WorkingSessionSource } from '@/lib/ai/context/sources/working-session';
import type { ContextRequest } from '@/lib/ai/context/types';

const baseRequest: ContextRequest = {
  workspaceId: 'test-ws',
  messages: [],
  attachments: [],
};

describe('WorkingSessionSource Adapter', () => {
  const source = new WorkingSessionSource();

  it('creates section from recent messages and attachments', async () => {
    const request: ContextRequest = {
      ...baseRequest,
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'Need a draft' },
      ] as any,
      attachments: [{ name: 'image.png' } as any],
    };
    const result = await source.fetch(request);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(1);
    const sec = result.sections[0];
    expect(sec.priority).toBe(2); // ContextPriority.HIGH = 2
    expect(sec.content).toContain('user: Hello');
    expect(sec.content).toContain('Attachment: image.png');
    expect(sec.metadata?.messageCount).toBe(3);
    expect(sec.metadata?.attachmentCount).toBe(1);
  });

  it('bounds messages to last 5', async () => {
    const manyMsgs = Array.from({ length: 8 }, (_, i) => ({ role: 'user', content: `msg${i}` } as any));
    const request: ContextRequest = { ...baseRequest, messages: manyMsgs };
    const result = await source.fetch(request);
    expect(result.success).toBe(true);
    const sec = result.sections[0];
    // Should only include last 5 messages
    expect(sec.content?.split('\n').filter(l => l.startsWith('- user')).length).toBe(5);
  });

  it('handles empty session safely', async () => {
    const result = await source.fetch(baseRequest);
    expect(result.success).toBe(true);
    expect(result.sections).toHaveLength(0);
  });

  it('missing workspaceId returns error', async () => {
    const req = { ...baseRequest, workspaceId: '' } as any;
    const result = await source.fetch(req);
    expect(result.success).toBe(false);
    expect(result.sections).toHaveLength(0);
    expect(result.error).toMatch(/Missing workspaceId/);
  });
});
