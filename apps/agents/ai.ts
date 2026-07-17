// ai.ts — shared Workers AI text-generation helper
//
// Generates real LLM narrative for agent reason/rationale fields. The
// deterministic math and scoring logic in each agent is untouched — this
// only replaces the human-readable explanation layered on top of it.
//
// Falls back to the caller-supplied template text if the AI binding is
// missing, the call times out, or it errors — a live judged demo must
// never 500 because a model call hung.

// gemma-4-26b-a4b-it (the initial pick) is a reasoning model — it spends
// output tokens on an internal chain-of-thought before writing the actual
// answer, and was consistently taking 12+ seconds per call in production
// (on top of needing a much larger token budget just to get past the
// "thinking" phase). Too slow for a live judged demo. llama-3.1-8b-instruct
// itself is deprecated as of 5/30/2026 — using the still-current "-fast"
// variant instead: no reasoning overhead, low latency, still returns the
// same OpenAI-compatible chat completion shape.
const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const TIMEOUT_MS = 8000;
const DEFAULT_MAX_TOKENS = 250;

interface WorkersAIResult {
  response?: string;
  choices?: Array<{ message?: { content?: string | null }; finish_reason?: string }>;
}

export interface AIBinding {
  run(model: string, input: Record<string, unknown>): Promise<WorkersAIResult>;
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
        max_tokens: opts?.max_tokens ?? DEFAULT_MAX_TOKENS,
        temperature: opts?.temperature ?? 0.4,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI timeout')), TIMEOUT_MS)),
    ]);
    // Supports both the plain-text Workers AI shape (`response`) and the
    // OpenAI-compatible chat completion shape (`choices[].message.content`)
    // that reasoning models like gemma-4-26b-a4b-it return.
    const text = (result?.response ?? result?.choices?.[0]?.message?.content ?? '').trim();
    if (!text || text.length < 10) {
      console.warn('[AI] Empty/short response, using fallback', {
        finishReason: result?.choices?.[0]?.finish_reason,
      });
      return { text: fallback, source: 'fallback' };
    }
    return { text, source: 'ai' };
  } catch (err) {
    console.error('[AI] Generation failed, using fallback:', err instanceof Error ? err.message : err);
    return { text: fallback, source: 'fallback' };
  }
}
