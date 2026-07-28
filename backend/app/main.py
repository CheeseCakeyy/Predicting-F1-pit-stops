from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .model_service import ArtifactLoadError, ModelService, PredictionInputError
from .schemas import HealthResponse, PredictionRequest, PredictionResponse


for variable in (
    "OMP_NUM_THREADS",
    "OPENBLAS_NUM_THREADS",
    "MKL_NUM_THREADS",
    "NUMEXPR_NUM_THREADS",
):
    os.environ.setdefault(variable, "1")

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

backend_root = Path(__file__).resolve().parents[1]
artifact_dir = Path(
    os.getenv("MODEL_ARTIFACT_DIR", str(backend_root / "artifacts"))
)
model_service = ModelService(artifact_dir=artifact_dir, num_threads=1)


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        model_service.load()
        logger.info(
            "Loaded %s artifact version %s",
            model_service.model_name,
            model_service.artifact_version,
        )
    except ArtifactLoadError:
        logger.exception("Model startup validation failed")
    yield


app = FastAPI(
    title="F1 Pit-stop Prediction API",
    description="CPU-efficient inference for the baseline LightGBM model.",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["system"],
)
def health(response: Response) -> HealthResponse:
    if not model_service.ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return HealthResponse(status="unhealthy", model_loaded=False)

    return HealthResponse(
        status="healthy",
        model_loaded=True,
        model_name=model_service.model_name,
        artifact_version=model_service.artifact_version,
    )


@app.post(
    "/api/v1/predict",
    response_model=PredictionResponse,
    tags=["prediction"],
)
def predict(payload: PredictionRequest) -> PredictionResponse:
    if not model_service.ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction model is unavailable",
        )

    try:
        result = model_service.predict(payload.to_artifact_input())
    except PredictionInputError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except ArtifactLoadError as exc:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction model is unavailable",
        ) from exc

    return PredictionResponse(**result)
