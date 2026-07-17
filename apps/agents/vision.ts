// vision.ts — the bridge between a trained YOLO model and the intake pipeline.
//
// The intake agent (intake.ts) consumes a CVEstimate { count, avgWeightLbs,
// sizeGrade, confidence } that today is hand-authored on each mockCatchLog.
// This module produces that SAME shape from a real detection so nothing
// downstream changes: evaluateCatchLog / sortAtDock keep working verbatim, and
// the confidence floor still routes low-confidence reads to a dockside re-check.
//
// Resolution order (resolveCatchEstimate):
//   1. Pinned cache  → deterministic demo playback (vision-cache.ts)
//   2. Live YOLO     → POST the catch photo to the inference service
//   3. Mock fallback → the seed cvEstimate, so a vision outage never breaks the demo
//
// Agent recommends. You decide — a real CV read is still a draft an operator approves.

import type {
  CVEstimate,
  VesselCatchLog,
  DockIntakeResult,
  SortedContainer,
} from '@tidelift/shared';
import type {
  DetectResponse,
  VisionDetection,
  VisionResult,
  VisionSource,
  FreshnessResult,
} from './vision-types';
import { VISION_CACHE, FRESHNESS_CACHE } from './vision-cache';

// ── Config ──────────────────────────────────────────────────────────────────
// Where the Python inference service (services/vision/app.py) is listening.
export const VISION_SERVICE_URL =
  (typeof process !== 'undefined' && process.env?.VISION_SERVICE_URL) || 'http://localhost:8000';
// Hard cap on a live inference call — past this we fall back to the mock so the
// dashboard never hangs waiting on the model host.
const VISION_TIMEOUT_MS = 4000;

// Bulk species can't be counted per-fish from a dumped pile — count is derived
// from weight instead. Detections are still used for size/species.
const BULK_SPECIES = new Set(['sardine', 'anchovy', 'herring', 'smelt']);

// Avg market weight (lbs) at size grade "M". Documented, deliberate defaults —
// not tuned against landed data yet. Unknown species fall back to FALLBACK_LBS.
const SPECIES_BASE_LBS: Record<string, number> = {
  salmon: 6.0,
  tuna: 60.0,
  cod: 8.0,
  halibut: 20.0,
  sardine: 0.2,
  anchovy: 0.05,
  herring: 0.4,
  mackerel: 1.2,
  trout: 2.0,
  'sea bass': 3.0,
  'sea bream': 1.5,
  'red mullet': 0.5,
  oyster: 0.12,
  shrimp: 0.03,
  fish: 1.0,
};
const FALLBACK_LBS = 1.0;

// Grade → weight multiplier applied on top of the species base weight.
const GRADE_WEIGHT_MULT: Record<CVEstimate['sizeGrade'], number> = {
  S: 0.5,
  M: 1.0,
  L: 1.7,
  XL: 2.6,
};

// Size grade from the median box's share of the frame. Rough by design: box
// pixel-size depends on camera distance, so without a reference scale this is
// an estimate — good enough to grade, not to certify. Documented on purpose.
const GRADE_AREA_BANDS: Array<{ maxFraction: number; grade: CVEstimate['sizeGrade'] }> = [
  { maxFraction: 0.015, grade: 'S' },
  { maxFraction: 0.05, grade: 'M' },
  { maxFraction: 0.12, grade: 'L' },
  { maxFraction: Infinity, grade: 'XL' },
];

// ── Pure mapping (no I/O) ─────────────────────────────────────────────────────

/**
 * Turn a detector response into the CVEstimate the pipeline consumes, plus
 * honest telemetry about how the numbers were derived. Pure and deterministic —
 * this is the unit-tested core.
 */
export function mapDetectionsToEstimate(resp: DetectResponse, log: VesselCatchLog): VisionResult {
  const { detections } = resp;
  const imgArea = Math.max(1, resp.width * resp.height);

  const dominantSpecies = modeClassName(detections);
  // Prefer a specific detected species; a single-class "fish" model (or no
  // detections) falls back to the log's known species for the weight lookup.
  const speciesForWeight =
    dominantSpecies && dominantSpecies !== 'fish' ? dominantSpecies : log.species;

  const grade: CVEstimate['sizeGrade'] = detections.length
    ? gradeFromAreaFraction(medianAreaFraction(detections, imgArea))
    : log.cvEstimate.sizeGrade;

  const avgWeightLbs = weightFor(speciesForWeight, grade);
  const bulk = BULK_SPECIES.has(speciesForWeight.toLowerCase());
  const confidence = detections.length ? round2(mean(detections.map((d) => d.confidence))) : 0.4;

  let count: number;
  let note: string;
  if (!detections.length) {
    count = weightDerivedCount(log.estimatedLbs, avgWeightLbs);
    note = `No boxes returned — count estimated from ${log.estimatedLbs} lbs ÷ ${avgWeightLbs} lb avg. Verify at dockside.`;
  } else if (bulk) {
    count = weightDerivedCount(log.estimatedLbs, avgWeightLbs);
    note = `Bulk species (${speciesForWeight}) — per-fish counting from a pile is infeasible; count derived from weight. ${detections.length} boxes used for size/species only.`;
  } else {
    count = detections.length;
    note = `${detections.length} ${speciesForWeight} detected; size grade ${grade} from median box area.`;
  }

  return {
    estimate: { count, avgWeightLbs, sizeGrade: grade, confidence },
    source: 'live',
    dominantSpecies,
    detectionCount: detections.length,
    bulk,
    note,
  };
}

// ── Live inference (network / fs) ─────────────────────────────────────────────

/** Low-level POST to the inference service. Throws on any non-200. */
export async function postDetect(body: Record<string, string>): Promise<DetectResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);
  try {
    const res = await fetch(`${VISION_SERVICE_URL}/detect`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`vision service responded ${res.status}`);
    return (await res.json()) as DetectResponse;
  } finally {
    clearTimeout(timer);
  }
}

/** Call the inference service on a catch photo and map the result. Throws on failure. */
export async function detectCatch(imageRef: string, log: VesselCatchLog): Promise<VisionResult> {
  const data = await postDetect(await buildDetectBody(imageRef));
  return mapDetectionsToEstimate(data, log);
}

/**
 * Map a detector response for a one-off UPLOADED photo (the Analyze page),
 * where there is no catch log and no lot weight. Counts per box (we're counting
 * the fish visible in this single image, not deriving from a total weight), and
 * takes species from the dominant detected class or an optional hint.
 */
export function estimateFromDetections(
  resp: DetectResponse,
  opts: { species?: string } = {}
): VisionResult {
  const { detections } = resp;
  const imgArea = Math.max(1, resp.width * resp.height);
  const dominantSpecies = modeClassName(detections);
  const speciesForWeight =
    dominantSpecies && dominantSpecies !== 'fish' ? dominantSpecies : opts.species ?? 'fish';
  const grade: CVEstimate['sizeGrade'] = detections.length
    ? gradeFromAreaFraction(medianAreaFraction(detections, imgArea))
    : 'M';
  const avgWeightLbs = weightFor(speciesForWeight, grade);
  const confidence = detections.length ? round2(mean(detections.map((d) => d.confidence))) : 0;

  return {
    estimate: { count: detections.length, avgWeightLbs, sizeGrade: grade, confidence },
    source: 'live',
    dominantSpecies,
    detectionCount: detections.length,
    bulk: false,
    note: `${detections.length} fish detected in the uploaded photo · grade ${grade} · ${speciesForWeight}`,
  };
}

// ── Resolution (what the app calls) ───────────────────────────────────────────

/**
 * Async resolver used by the live /api/intake route.
 * cache → live YOLO → mock, in that order. Never throws — a vision outage
 * degrades to the seed estimate rather than failing the request.
 */
export async function resolveCatchEstimate(log: VesselCatchLog): Promise<VisionResult> {
  const cached = VISION_CACHE[log.id];
  if (cached) return cached;

  if (log.catchPhotoUrl) {
    try {
      const live = await detectCatch(log.catchPhotoUrl, log);
      if (live.detectionCount > 0) return live;
    } catch {
      // Intentional: fall through to the mock. The demo must never break on a
      // model-service outage — the operator still sees a recommendation.
    }
  }
  return mockResult(log);
}

/**
 * Sync resolver for deterministic playback (the guided demo).
 * Only ever returns a pinned cache entry or the mock — never touches the
 * network — so the walkthrough judges see is byte-for-byte repeatable.
 */
export function resolveCachedEstimate(log: VesselCatchLog): VisionResult {
  return VISION_CACHE[log.id] ?? mockResult(log);
}

/** Wrap the log's hand-authored cvEstimate as a VisionResult. */
export function mockResult(log: VesselCatchLog, source: VisionSource = 'mock-fallback'): VisionResult {
  return {
    estimate: log.cvEstimate,
    source,
    dominantSpecies: log.species,
    detectionCount: 0,
    bulk: BULK_SPECIES.has(log.species.toLowerCase()),
    note:
      source === 'mock-fallback'
        ? 'Simulated read — no catch photo or vision service unavailable; using seed CV estimate.'
        : 'Pinned pre-computed read for deterministic demo playback.',
  };
}

// ── Freshness (Piece 2): eye/gill QA sampled at the sort ──────────────────────

// Below this score the sampled catch is flagged CHECK, which ORs a FLAG onto
// the dockside bins. Never removes a temperature FLAG — only adds one.
const FRESH_MIN = 0.6;
// Default score for the mock/no-model path — a plausible "fresh" read so the
// demo shows a green freshness. Swap for a real FFE eye/gill model output.
const MOCK_FRESH_SCORE = 0.82;

/**
 * Resolve a freshness read for a catch: pinned cache → mock. Sync and
 * network-free — a live FFE (eye/gill) classifier is the roadmap plug-in; when
 * one exists it drops in here exactly like detectCatch does for detection.
 */
export function resolveFreshness(log: VesselCatchLog): FreshnessResult {
  const cached = FRESHNESS_CACHE[log.id];
  if (cached) return cached;
  return {
    score: MOCK_FRESH_SCORE,
    status: MOCK_FRESH_SCORE >= FRESH_MIN ? 'FRESH' : 'CHECK',
    source: 'mock-fallback',
    note: 'Simulated freshness — no eye/gill model wired yet; showing a nominal fresh read.',
  };
}

/**
 * Attach the freshness read to a dock result: stamp each bin's freshnessScore,
 * and if the sample reads CHECK, OR a FLAG onto any PASS bin (temperature FLAGs
 * are preserved) with a reason note. Recomputes accepted lbs and flagged count.
 * Pure — returns a new result, leaving sortAtDock and its tests untouched.
 */
export function applyFreshnessToDock(
  dock: DockIntakeResult,
  freshness: FreshnessResult
): DockIntakeResult {
  const flagForFreshness = freshness.status === 'CHECK';
  const containers: SortedContainer[] = dock.containers.map((c) => {
    const qaStatus = flagForFreshness ? 'FLAG' : c.qaStatus;
    const reason =
      flagForFreshness && c.qaStatus === 'PASS'
        ? `${c.reason} · Freshness CHECK (score ${freshness.score.toFixed(2)}) — hold for operator inspection.`
        : c.reason;
    return { ...c, freshnessScore: freshness.score, qaStatus, reason };
  });

  return {
    ...dock,
    containers,
    totalLbsAccepted: containers
      .filter((c) => c.qaStatus === 'PASS')
      .reduce((s, c) => s + c.lbs, 0),
    flaggedCount: containers.filter((c) => c.qaStatus === 'FLAG').length,
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function buildDetectBody(ref: string): Promise<Record<string, string>> {
  if (/^https?:\/\//i.test(ref)) return { image_url: ref };
  // Local path → read + base64 (dynamic import keeps node:fs out of any client bundle).
  const { readFile } = await import('node:fs/promises');
  const buf = await readFile(ref);
  return { image_b64: buf.toString('base64') };
}

function weightDerivedCount(estimatedLbs: number, avgWeightLbs: number): number {
  return Math.max(1, Math.round(estimatedLbs / Math.max(0.01, avgWeightLbs)));
}

function weightFor(species: string, grade: CVEstimate['sizeGrade']): number {
  const base = SPECIES_BASE_LBS[species.toLowerCase()] ?? FALLBACK_LBS;
  return round2(base * GRADE_WEIGHT_MULT[grade]);
}

function gradeFromAreaFraction(fraction: number): CVEstimate['sizeGrade'] {
  return (GRADE_AREA_BANDS.find((b) => fraction < b.maxFraction) ?? GRADE_AREA_BANDS[GRADE_AREA_BANDS.length - 1]).grade;
}

function medianAreaFraction(detections: VisionDetection[], imgArea: number): number {
  const fractions = detections.map((d) => (d.bbox[2] * d.bbox[3]) / imgArea).sort((a, b) => a - b);
  const mid = Math.floor(fractions.length / 2);
  return fractions.length % 2 ? fractions[mid] : (fractions[mid - 1] + fractions[mid]) / 2;
}

function modeClassName(detections: VisionDetection[]): string | null {
  if (!detections.length) return null;
  const counts = new Map<string, number>();
  for (const d of detections) counts.set(d.className, (counts.get(d.className) ?? 0) + 1);
  let best: string | null = null;
  let bestN = -1;
  for (const [name, n] of counts) {
    if (n > bestN) {
      best = name;
      bestN = n;
    }
  }
  return best;
}

function mean(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
