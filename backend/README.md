# Pit-stop prediction backend

Small FastAPI wrapper for the production baseline LightGBM model.

## API

- `GET /health` reports whether the artifacts loaded and passed their smoke
  test.
- `POST /api/v1/predict` validates a raw lap state and returns the next-lap pit
  probability.
- `/docs` exposes FastAPI's interactive API documentation.

The process loads the model once at startup and limits numerical libraries and
LightGBM to one thread for low-resource deployment.

## Local setup

From this directory:

```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements-dev.txt
python -m app
```

Run tests with:

```bash
pytest
```

## Configuration

Provide these environment variables when needed:

- `CORS_ORIGINS`: comma-separated frontend origins.
- `MODEL_ARTIFACT_DIR`: artifact directory; defaults to `backend/artifacts`.
- `LOG_LEVEL`: application log level.
- `PORT`: HTTP port; defaults to `8000`.

The frontend reads `NEXT_PUBLIC_API_BASE_URL`. Use
`http://localhost:8000` locally and replace it with the deployed API origin in
the frontend hosting environment.

## Artifacts

The baseline notebook writes these production files to `backend/artifacts/`:

- `baseline_lgbm.txt` — native LightGBM booster
- `metadata.json` — ordered features, categorical mappings, versions, and
  checksum
- `smoke_test.json` — known request and expected probability

The application verifies all three before accepting prediction traffic.
