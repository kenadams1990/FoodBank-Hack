"""
TideLift vision inference service.

Loads a trained YOLO model (best.pt) and exposes detection over HTTP so the
SvelteKit intake layer (apps/agents/vision.ts) can turn a catch photo into the
CVEstimate the agent pipeline consumes. Kept intentionally tiny — one model,
two endpoints.

Run:
    cd services/vision
    pip install -r requirements.txt
    MODEL_PATH=best.pt uvicorn app:app --host 0.0.0.0 --port 8000

Contract (must match apps/agents/vision-types.ts):
    POST /detect  { "image_url": "..." }  OR  { "image_b64": "..." }
      -> { "detections": [ { "class_name", "confidence", "bbox": [x, y, w, h] } ],
           "width": <px>, "height": <px> }
    GET  /health  -> { "status", "model_loaded", "model_path" }

bbox is [x, y, width, height] in pixels, top-left origin.
"""

import base64
import io
import os
from functools import lru_cache

import requests
from fastapi import FastAPI, HTTPException
from PIL import Image
from pydantic import BaseModel

MODEL_PATH = os.environ.get("MODEL_PATH", "best.pt")
CONF_THRESHOLD = float(os.environ.get("CONF_THRESHOLD", "0.25"))
# Higher IoU keeps close, overlapping boxes on dense/piled scenes so NMS doesn't
# merge touching fish into one and undercount. Tune per your trained model.
IOU_THRESHOLD = float(os.environ.get("IOU_THRESHOLD", "0.6"))
IMG_TIMEOUT_S = float(os.environ.get("IMG_TIMEOUT_S", "10"))

app = FastAPI(title="TideLift Vision", version="0.1.0")


@lru_cache(maxsize=1)
def get_model():
    """Load the YOLO model once, lazily. Raises if the weights are missing."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"model weights not found at {MODEL_PATH!r}. "
            "Drop your trained best.pt here (or set MODEL_PATH)."
        )
    from ultralytics import YOLO  # imported lazily so /health works without weights

    return YOLO(MODEL_PATH)


class DetectRequest(BaseModel):
    image_url: str | None = None
    image_b64: str | None = None


def _load_image(req: DetectRequest) -> Image.Image:
    if req.image_b64:
        raw = base64.b64decode(req.image_b64)
        return Image.open(io.BytesIO(raw)).convert("RGB")
    if req.image_url:
        resp = requests.get(req.image_url, timeout=IMG_TIMEOUT_S)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")
    raise HTTPException(status_code=400, detail="provide image_url or image_b64")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": os.path.exists(MODEL_PATH),
        "model_path": MODEL_PATH,
    }


@app.post("/detect")
def detect(req: DetectRequest):
    image = _load_image(req)
    width, height = image.size

    try:
        model = get_model()
    except FileNotFoundError as e:
        # No weights yet — tell the caller clearly so it falls back to the mock.
        raise HTTPException(status_code=503, detail=str(e))

    results = model.predict(image, conf=CONF_THRESHOLD, iou=IOU_THRESHOLD, verbose=False)
    result = results[0]
    names = result.names  # {class_id: class_name}

    detections = []
    for box in result.boxes:
        x1, y1, x2, y2 = (float(v) for v in box.xyxy[0].tolist())
        cls_id = int(box.cls[0].item())
        detections.append(
            {
                "class_name": names.get(cls_id, str(cls_id)),
                "confidence": round(float(box.conf[0].item()), 4),
                "bbox": [round(x1, 1), round(y1, 1), round(x2 - x1, 1), round(y2 - y1, 1)],
            }
        )

    return {"detections": detections, "width": width, "height": height}
