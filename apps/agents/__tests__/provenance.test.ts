// provenance.test.ts — contamination-by-location lookup (Piece 3). Pure data
// join, no network. "Test the water, not the fish."
import { describe, it, expect } from 'vitest';
import { assessContamination, attachContamination } from '../provenance';
import { mockCatchLogs, sortAtDock } from '../intake';
import type { VesselCatchLog } from '@tidelift/shared';

const bodegaSalmon = mockCatchLogs[0]; // location 'Bodega Bay Harbor, CA'

describe('assessContamination', () => {
  it('matches a clean site by location string → LOW', () => {
    const a = assessContamination(bodegaSalmon);
    expect(a.risk).toBe('LOW');
    expect(a.matchedBy).toBe('location');
    expect(a.note).toContain('NOAA Mussel Watch');
  });

  it('prefers a coordinate match and flags a polluted site → ELEVATED', () => {
    const sfBay: VesselCatchLog = {
      ...bodegaSalmon,
      id: 'vcl-sfbay',
      location: 'somewhere unlabeled',
      coordinates: { lat: 37.8, lng: -122.3 }, // San Francisco Bay
    };
    const a = assessContamination(sfBay);
    expect(a.risk).toBe('ELEVATED');
    expect(a.matchedBy).toBe('coordinates');
    expect(a.site).toBe('San Francisco Bay');
  });

  it('defaults to a conservative ELEVATED when provenance is unknown', () => {
    const unknown: VesselCatchLog = {
      ...bodegaSalmon,
      id: 'vcl-unknown',
      location: 'Nowhere Harbor, ZZ',
      coordinates: undefined,
    };
    const a = assessContamination(unknown);
    expect(a.risk).toBe('ELEVATED');
    expect(a.matchedBy).toBe('none');
    expect(a.site).toBeNull();
    expect(a.note.toLowerCase()).toContain('lab');
  });
});

describe('attachContamination', () => {
  it('writes the lot-level risk + note onto the dock result', () => {
    const dock = sortAtDock(bodegaSalmon);
    const out = attachContamination(dock, bodegaSalmon);
    expect(out.contaminationRisk).toBe('LOW');
    expect(out.contaminationNote).toContain('Bodega Bay');
    // Non-destructive: containers untouched
    expect(out.containers).toEqual(dock.containers);
  });
});
