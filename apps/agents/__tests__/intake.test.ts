// intake.test.ts — Unit tests for the vessel → pickup → dock intake agent
import { describe, it, expect } from 'vitest';
import { evaluateCatchLog, sortAtDock, SAFE_MAX_TEMP_C, mockCatchLogs } from '../intake';
import type { VesselCatchLog } from '@tidelift/shared';

const salmonLog = mockCatchLogs[0]; // vcl-001, 2100 lbs, confidence 0.93
const oysterLog = mockCatchLogs[2]; // vcl-003, 380 lbs, confidence 0.64

describe('evaluateCatchLog', () => {
  it('recommends pickup for a lot >= 500 lbs and cites the CV metrics in the reason', () => {
    const dispatch = evaluateCatchLog(salmonLog);
    expect(dispatch.recommend).toBe(true);
    expect(dispatch.coldTransportUnit).not.toBe('none');
    expect(dispatch.reason).toContain(String(salmonLog.cvEstimate.count));
    expect(dispatch.reason).toContain(salmonLog.cvEstimate.sizeGrade);
    expect(dispatch.reason).toContain(
      `${(salmonLog.cvEstimate.confidence * 100).toFixed(0)}%`
    );
  });

  it('does not recommend pickup for a lot under 500 lbs', () => {
    const dispatch = evaluateCatchLog(oysterLog);
    expect(dispatch.recommend).toBe(false);
    expect(dispatch.coldTransportUnit).toBe('none');
  });

  it('adds a dockside-verification note when CV confidence is below the floor (and lot clears the pickup minimum)', () => {
    // Low confidence alone isn't enough to exercise the note: the source only
    // appends it when the lot ALSO clears MIN_PICKUP_LBS (`lowConfidence && !tooSmall`).
    // mockCatchLogs[2] (oyster) is both low-confidence AND too small, so its
    // reason never reaches the note — use a synthetic low-confidence, large lot instead.
    const lowConfidenceLargeLot: VesselCatchLog = {
      ...salmonLog,
      id: 'vcl-test-lowconf',
      cvEstimate: { ...salmonLog.cvEstimate, confidence: 0.5 },
    };
    const dispatch = evaluateCatchLog(lowConfidenceLargeLot);
    expect(dispatch.recommend).toBe(true);
    expect(dispatch.reason.toLowerCase()).toContain('dockside');
  });

  it('does not add the low-confidence note when confidence clears the floor', () => {
    const dispatch = evaluateCatchLog(salmonLog);
    expect(salmonLog.cvEstimate.confidence).toBeGreaterThanOrEqual(0.7);
    expect(dispatch.reason.toLowerCase()).not.toContain('verify count at dockside');
  });
});

describe('sortAtDock', () => {
  it('produces ceil(lbs / 400) containers whose lbs sum to estimatedLbs', () => {
    const result = sortAtDock(salmonLog);
    expect(result.containers.length).toBe(Math.ceil(salmonLog.estimatedLbs / 400));
    const totalLbs = result.containers.reduce((s, c) => s + c.lbs, 0);
    expect(totalLbs).toBe(salmonLog.estimatedLbs);
  });

  it('tags every container with the catchLogId and species', () => {
    const result = sortAtDock(salmonLog);
    for (const container of result.containers) {
      expect(container.catchLogId).toBe(salmonLog.id);
      expect(container.species).toBe(salmonLog.species);
    }
  });

  it('is deterministic — repeated calls on the same log produce identical containers', () => {
    const first = sortAtDock(salmonLog);
    const second = sortAtDock(salmonLog);
    expect(second.containers.map((c) => c.tempC)).toEqual(first.containers.map((c) => c.tempC));
    expect(second.containers.map((c) => c.qaStatus)).toEqual(
      first.containers.map((c) => c.qaStatus)
    );
  });

  it('flags containers over SAFE_MAX_TEMP_C and passes containers at or under it', () => {
    const result = sortAtDock(salmonLog);
    for (const container of result.containers) {
      if (container.tempC > SAFE_MAX_TEMP_C) {
        expect(container.qaStatus).toBe('FLAG');
      } else {
        expect(container.qaStatus).toBe('PASS');
      }
    }
  });

  it('counts totalLbsAccepted from PASS bins only and flaggedCount from FLAG bins', () => {
    const result = sortAtDock(salmonLog);
    const expectedAccepted = result.containers
      .filter((c) => c.qaStatus === 'PASS')
      .reduce((s, c) => s + c.lbs, 0);
    const expectedFlagged = result.containers.filter((c) => c.qaStatus === 'FLAG').length;
    expect(result.totalLbsAccepted).toBe(expectedAccepted);
    expect(result.flaggedCount).toBe(expectedFlagged);
  });

  it('includes the human-in-the-loop tagline in the summary', () => {
    const result = sortAtDock(salmonLog);
    expect(result.summary).toContain('Agent recommends. You decide.');
  });

  it('gives each container a unique id matching BIN-<LOGID-UPPERCASED>-NN', () => {
    const result = sortAtDock(salmonLog);
    const ids = result.containers.map((c) => c.containerId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(new RegExp(`^BIN-${salmonLog.id.toUpperCase()}-\\d{2}$`));
    }
  });

  it('always produces at least one container, even for a small lot', () => {
    const result = sortAtDock(oysterLog);
    expect(result.containers.length).toBeGreaterThanOrEqual(1);
    const totalLbs = result.containers.reduce((s, c) => s + c.lbs, 0);
    expect(totalLbs).toBe(oysterLog.estimatedLbs);
  });
});
