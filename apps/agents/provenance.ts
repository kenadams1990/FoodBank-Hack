// provenance.ts — contamination flag by catch location (Piece 3).
//
// NOT computer vision. Heavy metals can't be seen in a photo — they're a
// property of the source water. So we match the catch's harvest location
// (coordinates if present, else the location string) against a contamination
// reference (provenance-data.ts, informed by NOAA Mussel Watch / CA OEHHA) and
// flag the lot. Clean water → LOW, no per-fish chem panel needed. Known-polluted
// water → ELEVATED/HIGH, route the lot for lab heavy-metal screening.
//
// Agent recommends. You decide — the operator confirms the disposition.

import type { VesselCatchLog, DockIntakeResult } from '@tidelift/shared';
import { PROVENANCE_SITES, type ContaminationRisk, type ProvenanceSite } from './provenance-data';

const SOURCE_CITATION = 'NOAA Mussel Watch / CA OEHHA';
// Max great-circle-ish distance (degrees) for a coordinate match before we
// fall back to string matching. ~0.5° ≈ 55 km — generous, this is a demo join.
const MATCH_MAX_DEG = 0.5;

export interface ContaminationAssessment {
  risk: ContaminationRisk;
  note: string;
  site: string | null; // matched site name, or null when unmatched
  matchedBy: 'coordinates' | 'location' | 'none';
}

/**
 * Assess source-water contamination risk for a catch. Prefers a coordinate
 * match, falls back to keyword-matching the location string, and defaults to a
 * conservative ELEVATED ("no record — screen it") when nothing matches.
 */
export function assessContamination(log: VesselCatchLog): ContaminationAssessment {
  if (log.coordinates) {
    const near = nearestSite(log.coordinates.lat, log.coordinates.lng);
    if (near) {
      return {
        risk: near.risk,
        note: `${near.name}: ${near.risk} heavy-metal risk (${SOURCE_CITATION} — ${near.note})`,
        site: near.name,
        matchedBy: 'coordinates',
      };
    }
  }

  const byString = matchByLocation(log.location);
  if (byString) {
    return {
      risk: byString.risk,
      note: `${byString.name}: ${byString.risk} heavy-metal risk (${SOURCE_CITATION} — ${byString.note})`,
      site: byString.name,
      matchedBy: 'location',
    };
  }

  // Conservative default — unknown provenance is not "clean", it's unverified.
  return {
    risk: 'ELEVATED',
    note: `No provenance record for "${log.location}" (${SOURCE_CITATION}) — route lot for lab heavy-metal screening before processing.`,
    site: null,
    matchedBy: 'none',
  };
}

/** Attach the assessment to a dock result (lot-level — same water for the catch). */
export function attachContamination(
  dock: DockIntakeResult,
  log: VesselCatchLog
): DockIntakeResult {
  const assessment = assessContamination(log);
  return { ...dock, contaminationRisk: assessment.risk, contaminationNote: assessment.note };
}

// ── helpers ───────────────────────────────────────────────────────────────────

function nearestSite(lat: number, lng: number): ProvenanceSite | null {
  let best: ProvenanceSite | null = null;
  let bestDeg = Infinity;
  for (const site of PROVENANCE_SITES) {
    const d = Math.hypot(site.lat - lat, site.lng - lng);
    if (d < bestDeg) {
      bestDeg = d;
      best = site;
    }
  }
  return bestDeg <= MATCH_MAX_DEG ? best : null;
}

function matchByLocation(location: string): ProvenanceSite | null {
  const hay = location.toLowerCase();
  return PROVENANCE_SITES.find((s) => s.keywords.some((k) => hay.includes(k))) ?? null;
}
