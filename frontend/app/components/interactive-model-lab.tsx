"use client";

import { useState } from "react";
import { SpinningTyre } from "./spinning-tyre";

type LapState = {
  driver: string;
  race: string;
  compound: string;
  pitStop: number;
  lapNumber: number;
  stint: number;
  tyreLife: number;
  position: number;
  lapTimeSeconds: number;
  lapTimeDelta: number;
  cumulativeDegradation: number;
  raceProgressPercent: number;
  positionChange: number;
};

type PredictionResult = {
  pit_next_lap: boolean;
  probability: number;
  threshold: number;
  model_name: string;
  artifact_version: number;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

const drivers = ["VER", "NOR", "LEC", "ALO", "HAM", "RUS"];
const races = [
  "Monaco Grand Prix",
  "Chinese Grand Prix",
  "Spanish Grand Prix",
  "British Grand Prix",
  "Italian Grand Prix",
  "Miami Grand Prix",
  "Mexico City Grand Prix",
];

const presets: Record<string, LapState> = {
  pitWindow: {
    driver: "VER",
    race: "Monaco Grand Prix",
    compound: "HARD",
    pitStop: 0,
    lapNumber: 31,
    stint: 2,
    tyreLife: 18,
    position: 3,
    lapTimeSeconds: 75.095,
    lapTimeDelta: 0.84,
    cumulativeDegradation: -12.4,
    raceProgressPercent: 39.7,
    positionChange: 0,
  },
  freshTyres: {
    driver: "NOR",
    race: "British Grand Prix",
    compound: "MEDIUM",
    pitStop: 0,
    lapNumber: 12,
    stint: 1,
    tyreLife: 4,
    position: 4,
    lapTimeSeconds: 89.42,
    lapTimeDelta: -0.42,
    cumulativeDegradation: -2.1,
    raceProgressPercent: 23.1,
    positionChange: 1,
  },
  lateRace: {
    driver: "LEC",
    race: "Chinese Grand Prix",
    compound: "SOFT",
    pitStop: 0,
    lapNumber: 48,
    stint: 3,
    tyreLife: 22,
    position: 5,
    lapTimeSeconds: 98.31,
    lapTimeDelta: 1.18,
    cumulativeDegradation: 8.9,
    raceProgressPercent: 85.7,
    positionChange: -1,
  },
  currentStop: {
    driver: "ALO",
    race: "Spanish Grand Prix",
    compound: "HARD",
    pitStop: 1,
    lapNumber: 29,
    stint: 2,
    tyreLife: 17,
    position: 7,
    lapTimeSeconds: 92.64,
    lapTimeDelta: 0.71,
    cumulativeDegradation: -18.7,
    raceProgressPercent: 43.9,
    positionChange: -3,
  },
};

function inputContext(state: LapState) {
  return [
    `${state.tyreLife}-lap ${state.compound.toLowerCase()} tyre stint.`,
    `Lap ${state.lapNumber} at ${state.raceProgressPercent.toFixed(1)}% race progress.`,
    `${state.lapTimeDelta >= 0 ? "+" : ""}${state.lapTimeDelta.toFixed(2)}s lap delta with ${state.positionChange >= 0 ? "+" : ""}${state.positionChange} position change.`,
  ];
}

export function InteractiveModelLab() {
  const [activePreset, setActivePreset] = useState("pitWindow");
  const [draft, setDraft] = useState<LapState>(presets.pitWindow);
  const [submitted, setSubmitted] = useState<LapState>(presets.pitWindow);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [requestState, setRequestState] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [tyreBoost, setTyreBoost] = useState(0);

  const update = <Key extends keyof LapState>(key: Key, value: LapState[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const loadPreset = (name: string) => {
    setActivePreset(name);
    setDraft(presets[name]);
    setResult(null);
    setRequestState("idle");
    setError("");
  };

  const runPrediction = async () => {
    setRequestState("loading");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver: draft.driver,
          compound: draft.compound,
          race: draft.race,
          pit_stop: draft.pitStop,
          lap_number: draft.lapNumber,
          stint: draft.stint,
          tyre_life: draft.tyreLife,
          position: draft.position,
          lap_time_seconds: draft.lapTimeSeconds,
          lap_time_delta: draft.lapTimeDelta,
          cumulative_degradation: draft.cumulativeDegradation,
          race_progress: draft.raceProgressPercent / 100,
          position_change: draft.positionChange,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(body?.detail ?? `Prediction failed (${response.status})`);
      }

      const prediction = (await response.json()) as PredictionResult;
      setResult(prediction);
      setSubmitted(draft);
      setRequestState("idle");
      setTyreBoost((value) => value + 1);
    } catch (requestError) {
      setResult(null);
      setRequestState("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The prediction service could not be reached.",
      );
    }
  };

  const probability = Math.round((result?.probability ?? 0) * 100);
  const decision = result
    ? result.pit_next_lap
      ? "PIT NEXT LAP"
      : "STAY OUT"
    : "READY";
  const recommendation = result
    ? result.pit_next_lap
      ? "PREPARE THE CREW"
      : "KEEP PUSHING"
    : "RUN A SCENARIO";

  return (
    <main className="page page--model-lab">
      <header className="topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          LIGHTGBM BASELINE
        </div>
        <div className="topbar__meta">0.89754 validation AUC</div>
      </header>

      <section className="page-heading page-heading--compact">
        <p className="section-kicker">LIVE MODEL DEMO</p>
        <h1>Ask the pit wall.</h1>
        <p>
          Send a complete lap state to the deployed baseline model and receive
          its next-lap pit probability.
        </p>
      </section>

      <div className="demo-disclaimer demo-disclaimer--live" role="note">
        <strong>Trained model API</strong>
        <span>
          Predictions come from the production LightGBM artifact, not frontend
          heuristic scoring.
        </span>
      </div>

      <div className="preset-tabs" aria-label="Prediction scenarios">
        {[
          ["pitWindow", "Common pit window"],
          ["freshTyres", "Fresh tyres"],
          ["lateRace", "Late race"],
          ["currentStop", "Current stop"],
        ].map(([value, label]) => (
          <button
            className={activePreset === value ? "is-active" : ""}
            key={value}
            type="button"
            onClick={() => loadPreset(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="lab-grid lab-grid--interactive">
        <form
          className="panel lap-state-card lap-state-form"
          onSubmit={(event) => {
            event.preventDefault();
            void runPrediction();
          }}
        >
          <div className="panel-heading">
            <div>
              <p className="section-kicker">CURRENT LAP STATE</p>
              <h2>Edit the scenario</h2>
            </div>
            <span className="badge badge--soft">13 features</span>
          </div>

          <div className="form-grid">
            <Field label="Driver">
              <select
                value={draft.driver}
                onChange={(event) => update("driver", event.target.value)}
              >
                {drivers.map((driver) => (
                  <option key={driver}>{driver}</option>
                ))}
              </select>
            </Field>

            <Field label="Race">
              <select
                value={draft.race}
                onChange={(event) => update("race", event.target.value)}
              >
                {races.map((race) => (
                  <option key={race}>{race}</option>
                ))}
              </select>
            </Field>

            <Field label="Compound">
              <select
                value={draft.compound}
                onChange={(event) => update("compound", event.target.value)}
              >
                {["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"].map(
                  (compound) => (
                    <option key={compound}>{compound}</option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Pit stop on current lap">
              <select
                value={draft.pitStop}
                onChange={(event) =>
                  update("pitStop", Number(event.target.value))
                }
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </Field>

            <NumberField
              label="Lap number"
              value={draft.lapNumber}
              min={1}
              max={78}
              onChange={(value) => update("lapNumber", value)}
            />
            <NumberField
              label="Stint"
              value={draft.stint}
              min={1}
              max={8}
              onChange={(value) => update("stint", value)}
            />
            <NumberField
              label="Tyre life"
              value={draft.tyreLife}
              min={1}
              max={77}
              suffix="laps"
              onChange={(value) => update("tyreLife", value)}
            />
            <NumberField
              label="Position"
              value={draft.position}
              min={1}
              max={20}
              prefix="P"
              onChange={(value) => update("position", value)}
            />
            <NumberField
              label="Lap time"
              value={draft.lapTimeSeconds}
              min={67.694}
              max={2507.607}
              step={0.001}
              suffix="s"
              onChange={(value) => update("lapTimeSeconds", value)}
            />
            <NumberField
              label="Lap-time delta"
              value={draft.lapTimeDelta}
              min={-2403.895}
              max={2423.932}
              step={0.001}
              suffix="s"
              onChange={(value) => update("lapTimeDelta", value)}
            />
            <NumberField
              label="Cumulative degradation"
              value={draft.cumulativeDegradation}
              min={-274.564}
              max={2412.026}
              step={0.001}
              suffix="s"
              onChange={(value) => update("cumulativeDegradation", value)}
            />
            <NumberField
              label="Position change"
              value={draft.positionChange}
              min={-18}
              max={18}
              onChange={(value) => update("positionChange", value)}
            />
          </div>

          <label className="range-field">
            <span>
              Race progress
              <strong>{draft.raceProgressPercent.toFixed(1)}%</strong>
            </span>
            <input
              type="range"
              min="1.3"
              max="100"
              step="0.1"
              value={draft.raceProgressPercent}
              onChange={(event) =>
                update("raceProgressPercent", Number(event.target.value))
              }
            />
          </label>

          {requestState === "error" && (
            <p className="prediction-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button primary-button--active"
            type="submit"
            disabled={requestState === "loading"}
          >
            {requestState === "loading"
              ? "Running model…"
              : "Run model prediction"}
            <span>→</span>
          </button>
        </form>

        <article
          className={`panel result-shell result-shell--${result?.pit_next_lap ? "pit" : "stay"}`}
          aria-live="polite"
          aria-busy={requestState === "loading"}
        >
          <div className="result-shell__content">
            <p className="section-kicker">PREDICTION RESULT</p>
            <h2>{decision}</h2>
            <div
              className="probability-ring"
              style={{
                background: `radial-gradient(circle, var(--paper) 0 58%, transparent 59%), conic-gradient(var(--coral) 0 ${probability}%, rgba(16, 33, 63, 0.1) ${probability}% 100%)`,
              }}
            >
              <strong>{result ? `${probability}%` : "—"}</strong>
              <span>model probability</span>
            </div>
            <div className="recommendation">
              <span>Recommended call</span>
              <strong>{recommendation}</strong>
            </div>
          </div>
          <SpinningTyre
            label={result?.pit_next_lap ? "PIT" : "OUT"}
            variant="result"
            boostKey={tyreBoost}
          />
        </article>
      </section>

      <section className="lab-footer-grid lab-footer-grid--interactive">
        <article className="panel contribution-card">
          <p className="section-kicker">DEPLOYED MODEL</p>
          <Contribution label="LightGBM baseline" value="100%" width="100%" />
          <small>Selected for the constrained CPU and memory budget.</small>
        </article>
        <article className="panel explanation-card">
          <p className="section-kicker">INPUT CONTEXT</p>
          <div className="reason-list">
            {inputContext(submitted).map((context, index) => (
              <div key={context}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{context}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="panel model-score-card">
          <p className="section-kicker">VALIDATION SCORE</p>
          <strong>0.89754</strong>
          <span>Time-aware ROC AUC</span>
          <small>2025 holdout score for the deployed baseline.</small>
        </article>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="number-control">
        {prefix && <span>{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix && <span>{suffix}</span>}
      </div>
    </Field>
  );
}

function Contribution({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="contribution">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="contribution__track">
        <span style={{ width }} />
      </div>
    </div>
  );
}
