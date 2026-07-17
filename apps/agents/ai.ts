// ai.ts — shared Workers AI text-generation helper
//
// Generates real LLM narrative for agent reason/rationale fields. The
// deterministic math and scoring logic in each agent is untouched — this
// only replaces the human-readable explanation layered on top of it.
//
// Falls back to the caller-supplied template text if the AI binding is
// missing, the call times out, or it errors — a live judged demo must
// never 500 because a model call hung.

const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const TIMEOUT_MS = 8000;

export interface AIBinding {
  run(model: string, input: Record<string, unknown>): Promise<{ response?: string }>;
}

export type Narration = { text: string; source: 'ai' | 'fallback' };

export async function generateText(
  ai: AIBinding | undefined,
  systemPrompt: string,
  userPrompt: string,
  fallback: string,
  opts?: { max_tokens?: number; temperature?: number }
): Promise<Narration> {
  if (!ai) return { text: fallback, source: 'fallback' };

  try {
    const result = await Promise.race([
      ai.run(MODEL, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: opts?.max_tokens ?? 300,
        temperature: opts?.temperature ?? 0.4,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI timeout')), TIMEOUT_MS)),
    ]);
    const text = result?.response?.trim();
    if (!text || text.length < 10) return { text: fallback, source: 'fallback' };
    return { text, source: 'ai' };
  } catch {
    return { text: fallback, source: 'fallback' };
  }
}
