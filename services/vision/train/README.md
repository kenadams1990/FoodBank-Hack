# Training the catch-detection model

Everything here follows the decisions from the team chat: **YOLOv12**,
**above-water** multi-fish datasets (never underwater), count-as-estimate,
and NMS tuned for dense/overlapping catches. Output is a `best.pt` that drops
straight into the vision service.

## 0. One rule that decides everything

**Above-water, bounding boxes, multiple fish per image.** A dumped tote / a
conveyor / a deck — the visual domain the dock camera actually sees. Do **not**
train on underwater footage (e.g. Salstraumen): wrong domain, the demo photo
will be out-of-distribution and detections will be garbage. Before committing to
any dataset, open its sample images and ask: *does this look like my demo photo?*

## 1. Get a dataset (pick one)

**Fastest — Roboflow Universe (one command, YOLO-ready, no conversion):**
Search Roboflow Universe for **"fish market"**, **"fish tray"**, or
**"fish conveyor"**. Pick one whose samples are clearly above-water, then use its
**Download → YOLOv8/YOLOv11** snippet (that format trains YOLOv12 fine):

```bash
pip install roboflow
```
```python
from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_KEY")
project = rf.workspace("WORKSPACE").project("PROJECT")   # from the dataset page
dataset = project.version(N).download("yolov8")          # ships its own data.yaml
```

**Known-good alternatives (academic, need a COCO→YOLO convert):**
- **DeepFish (market trays)** — https://www.nature.com/articles/s41597-022-01416-0 — above-water trays, has species + size. Convert its COCO/mask annotations to YOLO boxes (`ultralytics` ships `ultralytics.data.converter.convert_coco`).
- **AutoFish (conveyor, overlapping)** — https://arxiv.org/abs/2501.03767 — built around touching/occluding fish with occlusion labels; the best match for the single-layer belt.
- **Fishnet Open Images (deck, piled)** — https://arxiv.org/pdf/2106.09178 — real above-deck vessel cams, up to ~45 fish/frame; closest to a net dump, but large.

Point `data.yaml` at whatever you downloaded (Roboflow gives you the file; otherwise edit the template here).

## 2. Train

```bash
pip install ultralytics
python train.py --data data.yaml --epochs 100 --imgsz 640 --batch 16
# small GPU? drop --batch to 8 and --imgsz to 512
# yolov12s.pt not found in your ultralytics version? add: --model yolo11s.pt
```

The script bakes in augmentation for wet/glare/low-light robustness and prints
**mAP@50 / mAP@50-95** at the end — quote that as your accuracy number.

## 3. Drop it into the service

```bash
cp runs/detect/tidelift-catch/weights/best.pt ../best.pt
cd ..
pip install -r requirements.txt
MODEL_PATH=best.pt uvicorn app:app --port 8000
```

Set `VISION_SERVICE_URL=http://localhost:8000` for the web app, set a
`catchPhotoUrl` on a catch in `packages/shared/src/mockData.ts`, and `/intake`
flips that catch to a green **LIVE VISION** badge. `best.pt` is git-ignored —
never commit weights.

## 4. Honest scope (matches the pitch)

- **Count is an estimate.** Exact counting of a dumped pile is hard even for a
  good detector — the scale is the source of truth for weight. Say so.
- **Demo in-distribution.** Shoot the demo photo to look like your training data
  (a busy tote, not an extreme heap) so it lands.
- Dense piles undercount if NMS merges touching fish — the service already runs
  a higher `IOU_THRESHOLD` (0.6) at inference to counter that.
