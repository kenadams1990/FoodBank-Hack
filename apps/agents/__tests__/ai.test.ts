// ai.test.ts — Unit tests for the shared Workers AI narration helper
import { describe, it, expect } from 'vitest';
import { generateText, type AIBinding } from '../ai';

describe('generateText', () => {
  it('returns the fallback with source "fallback" when no AI binding is given', async () => {
    const result = await generateText(undefined, 'system', 'user', 'fallback text');
    expect(result).toEqual({ text: 'fallback text', source: 'fallback' });
  });

  it('returns the fallback when the AI binding throws', async () => {
    const throwingAI: AIBinding = {
      run: async () => {
        throw new Error('model unavailable');
      },
    };
    const result = await generateText(throwingAI, 'system', 'user', 'fallback text');
    expect(result).toEqual({ text: 'fallback text', source: 'fallback' });
  });

  it('returns the fallback when the AI binding returns an empty response', async () => {
    const emptyAI: AIBinding = { run: async () => ({ response: '  ' }) };
    const result = await generateText(emptyAI, 'system', 'user', 'fallback text');
    expect(result).toEqual({ text: 'fallback text', source: 'fallback' });
  });

  it('returns the real model text with source "ai" on success', async () => {
    const workingAI: AIBinding = {
      run: async () => ({ response: 'This lot scored high due to urgency and demand match.' }),
    };
    const result = await generateText(workingAI, 'system', 'user', 'fallback text');
    expect(result).toEqual({
      text: 'This lot scored high due to urgency and demand match.',
      source: 'ai',
    });
  });
});
