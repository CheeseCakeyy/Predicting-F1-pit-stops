import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app


ARTIFACT_DIR = Path(__file__).resolve().parents[1] / "artifacts"
SMOKE_TEST = json.loads(
    (ARTIFACT_DIR / "smoke_test.json").read_text(encoding="utf-8")
)


def api_payload() -> dict[str, str | int | float]:
    raw = SMOKE_TEST["input"]
    return {
        "driver": raw["Driver"],
        "compound": raw["Compound"],
        "race": raw["Race"],
        "pit_stop": raw["PitStop"],
        "lap_number": raw["LapNumber"],
        "stint": raw["Stint"],
        "tyre_life": raw["TyreLife"],
        "position": raw["Position"],
        "lap_time_seconds": raw["LapTime (s)"],
        "lap_time_delta": raw["LapTime_Delta"],
        "cumulative_degradation": raw["Cumulative_Degradation"],
        "race_progress": raw["RaceProgress"],
        "position_change": raw["Position_Change"],
    }


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_reports_loaded_model(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "model_loaded": True,
        "model_name": "baseline_lgbm",
        "artifact_version": 1,
    }


def test_prediction_matches_exported_smoke_test(client: TestClient):
    response = client.post("/api/v1/predict", json=api_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["probability"] == pytest.approx(
        SMOKE_TEST["expected"]["pit_next_lap_probability"],
        abs=SMOKE_TEST["absolute_tolerance"],
    )
    assert body["pit_next_lap"] is SMOKE_TEST["expected"]["pit_next_lap"]
    assert body["threshold"] == SMOKE_TEST["expected"]["decision_threshold"]
    assert body["model_name"] == "baseline_lgbm"
    assert body["artifact_version"] == 1


def test_unknown_category_is_rejected(client: TestClient):
    payload = api_payload()
    payload["compound"] = "ULTRASOFT"

    response = client.post("/api/v1/predict", json=payload)

    assert response.status_code == 422
    assert "Unknown Compound value" in response.json()["detail"]


def test_out_of_training_range_is_rejected(client: TestClient):
    payload = api_payload()
    payload["position"] = 21

    response = client.post("/api/v1/predict", json=payload)

    assert response.status_code == 422
    assert "Position must be between" in response.json()["detail"]


def test_missing_field_is_rejected(client: TestClient):
    payload = api_payload()
    del payload["lap_time_seconds"]

    response = client.post("/api/v1/predict", json=payload)

    assert response.status_code == 422

