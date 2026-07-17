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
const TIMEOUT_MS = 12000;

// gemma-4-26b-a4b-it is a reasoning model — it spends output tokens on an
// internal chain-of-thought (returned separately as `message.reasoning`)
// before it writes the actual answer to `message.content`. Too low a
// max_tokens budget means it gets cut off mid-thought with content: null
// (finish_reason "length") and never produces real output. 500+ gives it
// room to think AND answer for a 1-2 sentence response.
const DEFAULT_MAX_TOKENS = 500;

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
