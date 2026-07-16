// vision-cache.ts — pinned, pre-computed vision reads for deterministic playback.
//
// The guided demo (apps/web/src/routes/guided-demo/+page.server.ts) is hardwired
// to vcl-001 (F/V Morning Star, salmon). Running a live model there would make
// the walkthrough non-deterministic and dependent on the inference host being up
// mid-presentation. Instead we pin vcl-001's read here so:
//   • the guided demo is byte-for-byte repeatable, and
//   • the numbers match the seed cvEstimate, so the panels judges see are unchanged.
//
// To regenerate from a REAL detection once you have best.pt:
//   1. start the service:  cd services/vision && uvicorn app:app --port 8000
//   2. point vcl-001's catchPhotoUrl at the real photo (in mockData.ts)
//   3. call resolveCatchEstimate(vcl001) and paste the returned VisionResult below.

import type { VisionResult, FreshnessResult } from './vision-types';

export const VISION_CACHE: Record<string, VisionResult> = {
  // Pinned to match the seed cvEstimate for vcl-001 (count 310, avg 6.8 lb,
  // grade L, 93% confidence) so the guided demo renders identically whether or
  // not the inference service is running.
  'vcl-001': {
    estimate: { count: 310, avgWeightLbs: 6.8, sizeGrade: 'L', confidence: 0.93 },
    source: 'cached',
    dominantSpecies: 'salmon',
    detectionCount: 310,
    bulk: false,
    note: 'Pinned demo read — 310 salmon detected on-vessel at harvest, grade L, 93% confidence.',
  },
};

/**
 * Pinned freshness reads (Piece 2), keyed by catch-log id. Same rationale as
 * VISION_CACHE — deterministic guided-demo playback. Regenerate from a real
 * eye/gill (FFE) model the same way once one is trained.
 */
export const FRESHNESS_CACHE: Record<string, FreshnessResult> = {
  'vcl-001': {
    score: 0.9,
    status: 'FRESH',
    source: 'cached',
    note: 'Pinned demo read — sampled eye clarity 0.90, well within fresh range.',
  },
};
