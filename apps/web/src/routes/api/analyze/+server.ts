// POST /api/analyze — run the vision model on an UPLOADED catch photo and
// return the three factors: detection (boxes + CVEstimate), freshness, and
// contamination (by chosen harvest location). Used by the /analyze page.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { postDetect, estimateFromDetections, resolveFreshness } from '$agents/vision';
import { assessContamination } from '$agents/provenance';
import type { VesselCatchLog } from '$shared/types';

export const POST: RequestHandler = async ({ request }) => {
  const { imageB64, species, location } = await request.json();
  if (!imageB64 || typeof imageB64 !== 'string') {
    return json({ ok: false, error: 'No image provided.' }, { status: 400 });
  }

  // Factor 1 — detection. If the service is down or best.pt isn't loaded,
  // surface a clear, actionable message instead of a broken page.
  let detect;
  try {
    detect = await postDetect({ image_b64: imageB64 });
  } catch {
    return json(
      {
        ok: false,
        error:
          'Vision service not reachable or model not loaded. Start it with a trained best.pt: ' +
          'cd services/vision && MODEL_PATH=best.pt uvicorn app:app --port 8000',
      },
      { status: 503 }
    );
  }

  const est = estimateFromDetections(detect, { species });

  // A minimal pseudo-log carries the chosen location into the freshness (mock)
  // and contamination (real NOAA lookup) checks — no real catch log exists for
  // an ad-hoc upload.
  const pseudo = {
    id: 'upload',
    vesselName: 'Uploaded photo',
    vesselType: 'wild-catch',
    species: species ?? 'fish',
    estimatedLbs: 0,
    cvEstimate: est.estimate,
    location: location ?? '',
    loggedAt: '',
    pickupWindow: '',
  } as VesselCatchLog;

  return json({
    ok: true,
    width: detect.width,
    height: detect.height,
    detections: detect.detections,
    estimate: est.estimate,
    estimateNote: est.note,
    dominantSpecies: est.dominantSpecies,
    freshness: resolveFreshness(pseudo), // Factor 2 (simulated until an FFE model is wired)
    contamination: assessContamination(pseudo), // Factor 3 (real location→NOAA join)
  });
};
