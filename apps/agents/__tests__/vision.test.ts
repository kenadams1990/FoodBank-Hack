// vision.test.ts — unit tests for the YOLO → CVEstimate mapper and the
// resolver's fallback logic. Pure and network-free: no inference service is
// contacted, so these run identically in CI whether or not a model exists.
import { describe, it, expect } from 'vitest';
import {
  mapDetectionsToEstimate,
  resolveCachedEstimate,
  resolveCatchEstimate,
  mockResult,
  resolveFreshness,
  applyFreshnessToDock,
} from '../vision';
import type { DetectResponse, FreshnessResult } from '../vision-types';
import { mockCatchLogs, sortAtDock } from '../intake';
import type { VesselCatchLog } from '@tidelift/shared';

const salmonLog = mockCatchLogs[0]; // vcl-001 (has a pinned cache entry)
const sardineLog = mockCatchLogs[1]; // vcl-002, bulk species
const oysterLog = mockCatchLogs[2]; // vcl-003, no cache entry

function resp(detections: DetectResponse['detections']): DetectResponse {
  return { detections, width: 1000, height: 1000 };
}

describe('mapDetectionsToEstimate', () => {
  it('counts per-box for a non-bulk species and averages confidence', () => {
    const r = mapDetectionsToEstimate(
      resp([
        { className: 'salmon', confidence: 0.9, bbox: [0, 0, 100, 100] },
        { className: 'salmon', confidence: 0.8, bbox: [0, 0, 100, 100] },
        { className: 'salmon', confidence: 0.7, bbox: [0, 0, 100, 100] },
      ]),
      salmonLog
    );
    expect(r.estimate.count).toBe(3); // one per box
    expect(r.detectionCount).toBe(3);
    expect(r.bulk).toBe(false);
    expect(r.dominantSpecies).toBe('salmon');
    expect(r.estimate.confidence).toBeCloseTo(0.8, 5);
    expect(r.estimate.avgWeightLbs).toBeGreaterThan(0);
    expect(r.source).toBe('live');
  });

  it('grades size from median box area (large boxes → L/XL)', () => {
    const big = mapDetectionsToEstimate(
      resp([{ className: 'salmon', confidence: 0.9, bbox: [0, 0, 400, 400] }]), // 16% of frame
      salmonLog
    );
    const small = mapDetectionsToEstimate(
      resp([{ className: 'sardine', confidence: 0.9, bbox: [0, 0, 50, 50] }]), // 0.25% of frame
      salmonLog
    );
    expect(big.estimate.sizeGrade).toBe('XL');
    expect(small.estimate.sizeGrade).toBe('S');
  });

  it('derives count from weight for a bulk species instead of per-box', () => {
    const r = mapDetectionsToEstimate(
      resp([
        { className: 'sardine', confidence: 0.6, bbox: [0, 0, 20, 20] },
        { className: 'sardine', confidence: 0.6, bbox: [0, 0, 20, 20] },
      ]),
      sardineLog
    );
    expect(r.bulk).toBe(true);
    // Not just the 2 boxes — weight-derived from ~5600 lbs of tiny sardines.
    expect(r.estimate.count).toBeGreaterThan(2);
    expect(r.note.toLowerCase()).toContain('bulk');
  });

  it('falls back to weight-derived count + low confidence when no boxes return', () => {
    const r = mapDetectionsToEstimate(resp([]), salmonLog);
    expect(r.detectionCount).toBe(0);
    expect(r.estimate.count).toBeGreaterThan(0);
    expect(r.estimate.confidence).toBeLessThan(0.7); // trips the dockside-verify note downstream
    expect(r.note.toLowerCase()).toContain('dockside');
  });

  it('uses the log species for weight when the model is single-class ("fish")', () => {
    const generic = mapDetectionsToEstimate(
      resp([{ className: 'fish', confidence: 0.9, bbox: [0, 0, 100, 100] }]),
      salmonLog
    );
    // salmon (log.species) is heavier than a generic fish default → weight reflects it
    const genericOnUnknown = mapDetectionsToEstimate(
      resp([{ className: 'fish', confidence: 0.9, bbox: [0, 0, 100, 100] }]),
      { ...salmonLog, species: 'fish' } as VesselCatchLog
    );
    expect(generic.estimate.avgWeightLbs).toBeGreaterThan(genericOnUnknown.estimate.avgWeightLbs);
  });
});

describe('resolveCachedEstimate (sync, deterministic)', () => {
  it('returns the pinned cache entry for vcl-001 and matches the seed estimate', () => {
    const r = resolveCachedEstimate(salmonLog);
    expect(r.source).toBe('cached');
    expect(r.estimate).toEqual(salmonLog.cvEstimate); // demo renders identically
  });

  it('falls back to the mock for a log with no cache entry', () => {
    const r = resolveCachedEstimate(oysterLog);
    expect(r.source).toBe('mock-fallback');
    expect(r.estimate).toEqual(oysterLog.cvEstimate);
  });
});

describe('resolveCatchEstimate (async, no photo → no network)', () => {
  it('returns the mock fallback when there is no photo and no cache', async () => {
    const r = await resolveCatchEstimate(oysterLog);
    expect(r.source).toBe('mock-fallback');
    expect(r.estimate).toEqual(oysterLog.cvEstimate);
  });

  it('returns the pinned cache entry when one exists', async () => {
    const r = await resolveCatchEstimate(salmonLog);
    expect(r.source).toBe('cached');
  });
});

describe('mockResult', () => {
  it('wraps the seed estimate and flags bulk species correctly', () => {
    expect(mockResult(sardineLog).bulk).toBe(true);
    expect(mockResult(oysterLog).bulk).toBe(false);
  });
});

describe('resolveFreshness (Piece 2)', () => {
  it('returns the pinned cache entry for vcl-001', () => {
    const f = resolveFreshness(salmonLog);
    expect(f.source).toBe('cached');
    expect(f.status).toBe('FRESH');
  });

  it('falls back to a nominal fresh mock for uncached logs', () => {
    const f = resolveFreshness(oysterLog);
    expect(f.source).toBe('mock-fallback');
    expect(f.status).toBe('FRESH');
  });
});

describe('applyFreshnessToDock (Piece 2)', () => {
  const dock = sortAtDock(salmonLog);

  it('stamps freshnessScore on every bin without changing QA when FRESH', () => {
    const fresh: FreshnessResult = { score: 0.9, status: 'FRESH', source: 'cached', note: '' };
    const out = applyFreshnessToDock(dock, fresh);
    expect(out.containers.every((c) => c.freshnessScore === 0.9)).toBe(true);
    // QA unchanged vs the original temperature-only result
    expect(out.containers.map((c) => c.qaStatus)).toEqual(dock.containers.map((c) => c.qaStatus));
  });

  it('ORs a FLAG onto PASS bins when the sample reads CHECK (temp FLAGs preserved)', () => {
    const check: FreshnessResult = { score: 0.3, status: 'CHECK', source: 'cached', note: '' };
    const out = applyFreshnessToDock(dock, check);
    expect(out.containers.every((c) => c.qaStatus === 'FLAG')).toBe(true);
    expect(out.flaggedCount).toBe(out.containers.length);
    expect(out.totalLbsAccepted).toBe(0);
    // A previously-passing bin now cites the freshness reason
    const wasPass = dock.containers.find((c) => c.qaStatus === 'PASS');
    if (wasPass) {
      const now = out.containers.find((c) => c.containerId === wasPass.containerId)!;
      expect(now.reason.toLowerCase()).toContain('freshness');
    }
  });
});
