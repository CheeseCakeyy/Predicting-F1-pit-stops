from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        allow_inf_nan=False,
    )

    driver: str = Field(min_length=1, examples=["VER"])
    compound: str = Field(min_length=1, examples=["HARD"])
    race: str = Field(min_length=1, examples=["Monaco Grand Prix"])
    pit_stop: int = Field(ge=0, le=1, examples=[0])
    lap_number: int = Field(ge=1, examples=[31])
    stint: int = Field(ge=1, examples=[2])
    tyre_life: float = Field(ge=0, examples=[18])
    position: int = Field(ge=1, examples=[3])
    lap_time_seconds: float = Field(gt=0, examples=[75.095])
    lap_time_delta: float = Field(examples=[0.84])
    cumulative_degradation: float = Field(examples=[4.2])
    race_progress: float = Field(gt=0, le=1, examples=[0.397])
    position_change: float = Field(examples=[-1])

    def to_artifact_input(self) -> dict[str, str | int | float]:
        return {
            "Driver": self.driver,
            "Compound": self.compound,
            "Race": self.race,
            "PitStop": self.pit_stop,
            "LapNumber": self.lap_number,
            "Stint": self.stint,
            "TyreLife": self.tyre_life,
            "Position": self.position,
            "LapTime (s)": self.lap_time_seconds,
            "LapTime_Delta": self.lap_time_delta,
            "Cumulative_Degradation": self.cumulative_degradation,
            "RaceProgress": self.race_progress,
            "Position_Change": self.position_change,
        }


class PredictionResponse(BaseModel):
    pit_next_lap: bool
    probability: float = Field(ge=0, le=1)
    threshold: float = Field(ge=0, le=1)
    model_name: str
    artifact_version: int


class HealthResponse(BaseModel):
    status: Literal["healthy", "unhealthy"]
    model_loaded: bool
    model_name: str | None = None
    artifact_version: int | None = None

