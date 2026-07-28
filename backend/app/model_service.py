from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
from typing import Any


class ArtifactLoadError(RuntimeError):
    """Raised when model artifacts fail integrity or runtime checks."""


class PredictionInputError(ValueError):
    """Raised when a request violates the saved model contract."""


class ModelService:
    def __init__(self, artifact_dir: Path, *, num_threads: int = 1) -> None:
        self.artifact_dir = artifact_dir
        self.num_threads = num_threads
        self.metadata: dict[str, Any] | None = None
        self._booster: Any = None
        self._numpy: Any = None
        self.load_error: str | None = None

    @property
    def ready(self) -> bool:
        return self._booster is not None and self.metadata is not None

    @property
    def model_name(self) -> str | None:
        return self.metadata.get("model_name") if self.metadata else None

    @property
    def artifact_version(self) -> int | None:
        if not self.metadata:
            return None
        return int(self.metadata["artifact_version"])

    def load(self) -> None:
        self.metadata = None
        self._booster = None
        self._numpy = None
        self.load_error = None

        try:
            import lightgbm as lgb
            import numpy as np

            metadata = self._read_json("metadata.json")
            smoke_test = self._read_json("smoke_test.json")
            self._validate_metadata(metadata)

            model_path = self._safe_artifact_path(metadata["model_file"])
            model_bytes = model_path.read_bytes()
            actual_hash = hashlib.sha256(model_bytes).hexdigest()

            if len(model_bytes) != int(metadata["model_size_bytes"]):
                raise ArtifactLoadError("Model byte size does not match metadata")
            if actual_hash != metadata["model_sha256"]:
                raise ArtifactLoadError("Model checksum does not match metadata")

            booster = lgb.Booster(model_file=str(model_path))
            if booster.num_feature() != len(metadata["feature_order"]):
                raise ArtifactLoadError("Model feature count does not match metadata")
            if booster.feature_name() != metadata["model_feature_names"]:
                raise ArtifactLoadError("Model feature names do not match metadata")

            self.metadata = metadata
            self._booster = booster
            self._numpy = np
            self._verify_smoke_test(smoke_test)
        except Exception as exc:
            self.metadata = None
            self._booster = None
            self._numpy = None
            self.load_error = str(exc)
            if isinstance(exc, ArtifactLoadError):
                raise
            raise ArtifactLoadError(f"Unable to load model artifacts: {exc}") from exc

    def predict(self, raw_input: dict[str, str | int | float]) -> dict[str, Any]:
        if not self.ready or self.metadata is None:
            raise ArtifactLoadError("Prediction model is not loaded")

        encoded = self._encode(raw_input)
        probability = self._predict_encoded(encoded)
        threshold = float(self.metadata["decision_threshold"])

        return {
            "pit_next_lap": probability >= threshold,
            "probability": probability,
            "threshold": threshold,
            "model_name": str(self.metadata["model_name"]),
            "artifact_version": int(self.metadata["artifact_version"]),
        }

    def _read_json(self, filename: str) -> dict[str, Any]:
        path = self._safe_artifact_path(filename)
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ArtifactLoadError(f"Invalid {filename}: {exc}") from exc
        if not isinstance(value, dict):
            raise ArtifactLoadError(f"{filename} must contain a JSON object")
        return value

    def _safe_artifact_path(self, filename: str) -> Path:
        if Path(filename).name != filename:
            raise ArtifactLoadError("Artifact filename must not contain a path")

        artifact_root = self.artifact_dir.resolve()
        path = (artifact_root / filename).resolve()
        if path.parent != artifact_root:
            raise ArtifactLoadError("Artifact path escapes the artifact directory")
        if not path.is_file():
            raise ArtifactLoadError(f"Required artifact is missing: {filename}")
        return path

    @staticmethod
    def _validate_metadata(metadata: dict[str, Any]) -> None:
        required = {
            "artifact_version",
            "model_name",
            "model_format",
            "model_file",
            "model_sha256",
            "model_size_bytes",
            "feature_order",
            "model_feature_names",
            "numeric_features",
            "categorical_features",
            "categorical_mappings",
            "numeric_training_ranges",
            "unknown_category_policy",
            "decision_threshold",
            "best_iteration",
        }
        missing = sorted(required - metadata.keys())
        if missing:
            raise ArtifactLoadError(
                f"Metadata is missing required fields: {', '.join(missing)}"
            )
        if metadata["model_format"] != "lightgbm_text":
            raise ArtifactLoadError("Unsupported model format")
        if metadata["unknown_category_policy"] != "reject":
            raise ArtifactLoadError("Unsupported unknown-category policy")

        features = metadata["feature_order"]
        if not isinstance(features, list) or not features:
            raise ArtifactLoadError("feature_order must be a non-empty list")
        if len(features) != len(set(features)):
            raise ArtifactLoadError("feature_order contains duplicate names")

        numeric = set(metadata["numeric_features"])
        categorical = set(metadata["categorical_features"])
        if numeric & categorical or numeric | categorical != set(features):
            raise ArtifactLoadError("Feature groups do not match feature_order")
        if set(metadata["categorical_mappings"]) != categorical:
            raise ArtifactLoadError("Categorical mappings are incomplete")
        if set(metadata["numeric_training_ranges"]) != numeric:
            raise ArtifactLoadError("Numeric training ranges are incomplete")

    def _encode(
        self,
        raw_input: dict[str, str | int | float],
    ) -> list[float]:
        assert self.metadata is not None

        features = self.metadata["feature_order"]
        missing = [name for name in features if name not in raw_input]
        unexpected = [name for name in raw_input if name not in features]
        if missing or unexpected:
            problems = []
            if missing:
                problems.append(f"missing: {', '.join(missing)}")
            if unexpected:
                problems.append(f"unexpected: {', '.join(unexpected)}")
            raise PredictionInputError("; ".join(problems))

        categorical = self.metadata["categorical_mappings"]
        ranges = self.metadata["numeric_training_ranges"]
        encoded: list[float] = []

        for name in features:
            value = raw_input[name]
            if name in categorical:
                label = str(value)
                mapping = categorical[name]
                if label not in mapping:
                    raise PredictionInputError(
                        f"Unknown {name} value: {label!r}"
                    )
                encoded.append(float(mapping[label]))
                continue

            try:
                numeric_value = float(value)
            except (TypeError, ValueError) as exc:
                raise PredictionInputError(f"{name} must be numeric") from exc
            if not math.isfinite(numeric_value):
                raise PredictionInputError(f"{name} must be finite")

            limits = ranges[name]
            if numeric_value < limits["min"] or numeric_value > limits["max"]:
                raise PredictionInputError(
                    f"{name} must be between {limits['min']} and {limits['max']}"
                )
            encoded.append(numeric_value)

        return encoded

    def _predict_encoded(self, encoded: list[float]) -> float:
        assert self.metadata is not None
        assert self._numpy is not None
        values = self._numpy.asarray([encoded], dtype=self._numpy.float64)
        prediction = self._booster.predict(
            values,
            num_iteration=int(self.metadata["best_iteration"]),
            num_threads=self.num_threads,
        )
        probability = float(prediction[0])
        if not math.isfinite(probability) or not 0 <= probability <= 1:
            raise ArtifactLoadError("Model returned an invalid probability")
        return probability

    def _verify_smoke_test(self, smoke_test: dict[str, Any]) -> None:
        assert self.metadata is not None

        if smoke_test.get("artifact_version") != self.metadata["artifact_version"]:
            raise ArtifactLoadError("Smoke-test artifact version does not match")

        encoded = self._encode(smoke_test["input"])
        actual = self._predict_encoded(encoded)
        expected = float(smoke_test["expected"]["pit_next_lap_probability"])
        tolerance = float(smoke_test["absolute_tolerance"])
        if abs(actual - expected) > tolerance:
            raise ArtifactLoadError(
                "Smoke-test prediction does not match the saved expectation"
            )
