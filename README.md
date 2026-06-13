# Early Fire Detection Workspace

This repository is a dual-purpose workspace for early fire detection research and a website project.

- `computerVision/` — local object detection training workspace using Ultralytics YOLO.
- `website/frontend/` — Next.js frontend application.
- `website/backend/` — placeholder backend folder.

> Note: `computerVision/` is intentionally ignored by the root repository because it contains large local datasets, model weights, and runtime outputs.

## Project Scope

### Computer Vision Training

The `computerVision` workspace is configured to train a YOLO object detection model for early fire and smoke detection.

Key files:

- `computerVision/script.py` — training entrypoint that loads `yolo26n.pt` and runs `model.train(...)`.
- `computerVision/data.yaml` — dataset config with:
  - `path` pointing to the local `computerVision/data` directory
  - `train`, `val`, and `test` image folders
  - class names: `smoke`, `fire`
  - `nc: 2`
- `computerVision/requirements.txt` — Python dependencies including `ultralytics`, `torch`, `opencv-python`, and supporting libraries.

Current workflow:

1. Prepare datasets under `computerVision/data/train`, `computerVision/data/val`, and `computerVision/data/test`.
2. Place the model weight file `yolo26n.pt` in `computerVision/`.
3. Run `computerVision/script.py` to start training.

### Website Application

The website project is now located at `website/frontend/` and is built with Next.js.

Important files:

- `website/frontend/package.json`
- `website/frontend/app/page.tsx`
- `website/frontend/next.config.ts`

Run the frontend with:

```bash
cd website/frontend
npm install
npm run dev
```

The `website/backend/` folder is currently empty and ready for future backend services such as API endpoints, model inference, or deployment glue code.

## Notes

- The root repository ignores local-only files and training data in `computerVision/`.
- The repository currently contains the website frontend as the primary tracked application.
- The YOLO model training workspace is present locally and can be used for experimentation, but it is not intended to be shipped with the repository as-is.

## Suggested Improvements

- Add a `README.md` inside `computerVision/` describing how to prepare data and run training locally.
- Implement a backend in `website/backend/` for serving detection results or inference.
- Add inference/evaluation scripts to `computerVision/` to turn trained weights into usable predictions.
- Consider splitting the project into separate packages if the website and model training are intended to be developed independently.
