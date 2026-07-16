// GET /api/intake — vessel catch logs with dispatch recommendation + dockside sort result.
//
// Each catch log's CVEstimate is resolved through the vision layer
// (cache → live YOLO → mock fallback) and fed into the SAME agent functions.
// If a catch has a photo and the inference service is up, dispatch runs on a
// real detection; otherwise it degrades to the seed estimate — the request
// never fails on a vision outage.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockCatchLogs, evaluateCatchLog, sortAtDock } from '$agents/intake';
import { resolveCatchEstimate, resolveFreshness, applyFreshnessToDock } from '$agents/vision';
import { attachContamination, assessContamination } from '$agents/provenance';

export const GET: RequestHandler = async () => {
  const intakes = await Promise.all(
    mockCatchLogs.map(async (log) => {
      // Piece 1 — real (or fallback) detection → CVEstimate into the pipeline.
      const vision = await resolveCatchEstimate(log);
      const visionLog = { ...log, cvEstimate: vision.estimate };
      const dispatch = evaluateCatchLog(visionLog);

      // Piece 2 — freshness read ORed into the dockside QA flags.
      const freshness = resolveFreshness(log);
      let dockResult = applyFreshnessToDock(sortAtDock(visionLog), freshness);
      // Piece 3 — provenance contamination flag for the lot.
      dockResult = attachContamination(dockResult, log);

      return {
        log: visionLog,
        dispatch,
        dockResult,
        vision: {
          source: vision.source,
          dominantSpecies: vision.dominantSpecies,
          detectionCount: vision.detectionCount,
          bulk: vision.bulk,
          note: vision.note,
        },
        freshness,
        contamination: assessContamination(log),
      };
    })
  );

  return json({ intakes });
};
