# TideLift Vision Service

Tiny FastAPI service that runs a trained **YOLO** model on a catch photo and
returns detections. The SvelteKit intake layer (`apps/agents/vision.ts`) calls
it and maps the boxes into the `CVEstimate` the agent pipeline already consumes.

**Nothing here is required for the dashboard to run.** If this service is down
(or a catch has no photo), intake falls back to the seed CV estimate — the demo
never breaks. This service is what turns the flagship from *simulated* into a
*real read on a real fish*.

## Train the model (your GPU box)

```bash
pip install ultralytics
# data.yaml points at an ABOVE-WATER fish detection set with boxes + multiple
# fish per image (e.g. DeepFish market trays / AutoFish conveyor). Do NOT use
# underwater datasets — wrong visual domain for dockside sorting.
yolo detect train model=yolov12s.pt data=data.yaml epochs=100 imgsz=640
yolo detect val   model=runs/detect/train/weights/best.pt data=data.yaml   # -> mAP for the pitch
```

Copy the resulting `best.pt` into this folder (it is git-ignored — never commit weights).

## Run the service

```bash
cd services/vision
pip install -r requirements.txt
MODEL_PATH=best.pt uvicorn app:app --host 0.0.0.0 --port 8000
```

Point the web app at it (defaults to `http://localhost:8000`):

```bash
# apps/web/.env  (or the shell that runs `pnpm --filter web dev`)
VISION_SERVICE_URL=http://localhost:8000
```

## API

```
GET  /health   -> { status, model_loaded, model_path }

POST /detect   { "image_url": "https://..." }   or   { "image_b64": "<base64>" }
  -> {
       "detections": [ { "class_name": "salmon", "confidence": 0.91, "bbox": [x, y, w, h] } ],
       "width": 1920, "height": 1080
     }
```

`bbox` is `[x, y, width, height]` in pixels, top-left origin. This contract is
mirrored in `apps/agents/vision-types.ts` — change both together.

Tuning knobs (env): `CONF_THRESHOLD` (default 0.25), `IOU_THRESHOLD` (default
0.6 — kept high so NMS doesn't merge touching fish and undercount on dense piles).

## Wiring a real read into the demo

1. Set `catchPhotoUrl` on a catch log in `packages/shared/src/mockData.ts`.
2. With the service running, `/api/intake` will show a green **LIVE VISION**
   badge for that catch instead of **SIMULATED**.
3. For the guided demo (vcl-001), pin the read: run the service on the real
   photo, then paste the returned values into `apps/agents/vision-cache.ts` so
   the walkthrough stays deterministic.

## Not built (roadmap, honest to mention — do not claim)

Thermal-camera temperature, microbiological QA, histamine/chem sensing, and
heavy-metal-by-provenance are **not** implemented. Vision handles quantity /
size / species / visible-quality; the rest is sensor-fusion + lab + data-join
work on the roadmap.
