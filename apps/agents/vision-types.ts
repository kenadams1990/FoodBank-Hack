// vision-types.ts — types shared by the vision mapper, cache, and resolver.
// Kept in their own module so vision.ts (logic) and vision-cache.ts (data) can
// both import them without a circular dependency.

import type { CVEstimate } from '@tidelift/shared';

/**
 * One object-detection box as returned by the YOLO inference service.
 * bbox is [x, y, width, height] in pixels (top-left origin). This mirrors the
 * JSON contract in services/vision/app.py — keep the two in sync.
 */
export interface VisionDetection {
  className: string;
  confidence: number; // 0..1
  bbox: [number, number, number, number];
}

/** Raw response shape from `POST /detect` on the inference service. */
export interface DetectResponse {
  detections: VisionDetection[];
  width: number; // source image width, px
  height: number; // source image height, px
}

/**
 * Where the CVEstimate feeding the pipeline actually came from:
 *  - 'live'          → a real YOLO detection on the catch photo
 *  - 'cached'        → a pinned, pre-computed read (deterministic demo path)
 *  - 'mock-fallback' → hand-authored cvEstimate on the log (service down / no photo)
 */
export type VisionSource = 'live' | 'cached' | 'mock-fallback';

/**
 * The vision layer's output for one catch. `estimate` is the exact CVEstimate
 * shape the intake pipeline already consumes; the rest is telemetry the
 * dashboard can surface (source badge, honesty about count method, etc.) and
 * is never required by evaluateCatchLog / sortAtDock.
 */
export interface VisionResult {
  estimate: CVEstimate;
  source: VisionSource;
  /** Dominant detected species, or null for a single-class ('fish') model / no detections. */
  dominantSpecies: string | null;
  /** Number of raw boxes the detector returned (0 on the mock/empty path). */
  detectionCount: number;
  /**
   * true when count was derived from weight instead of per-fish boxes —
   * bulk species (sardine/anchovy/…) can't be individually counted from a
   * dumped pile, so count = estimatedLbs / avgWeightLbs. Kept honest in the note.
   */
  bulk: boolean;
  /** Human-readable one-liner explaining how this estimate was produced. */
  note: string;
}

/**
 * Eye/gill freshness read for a catch (Piece 2). Sampled at the single-layer
 * sort, not per-fish on the pile. `score` is 0..1; `status` is CHECK below the
 * freshness floor, which ORs a FLAG onto the dockside bins (never clears a
 * temperature FLAG).
 */
export interface FreshnessResult {
  score: number; // 0..1
  status: 'FRESH' | 'CHECK';
  source: VisionSource;
  note: string;
}

