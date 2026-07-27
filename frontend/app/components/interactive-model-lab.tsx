"use client";

import { useMemo, useState } from "react";

type LapState = {
  driver: string;
  race: string;
  year: number;
  lap: number;
  totalLaps: number;
  compound: string;
  tyreLife: number;
  stint: number;
  position: number;
  lapDelta: number;
  raceProgress: number;
};

const presets: Record<string, LapState> = {
  pitWindow: {
    driver: "VER",
    race: "Monaco GP",
    year: 2025,
    lap: 31,
    totalLaps: 78,
    compound: "HARD",
    tyreLife: 18,
    stint: 2,
    position: 3,
    lapDelta: 0.84,
    raceProgress: 39.7,
  },
  freshTyres: {
    driver: "NOR",
    race: "British GP",
    year: 2025,
    lap: 12,
    totalLaps: 52,
    compound: "MEDIUM",
    tyreLife: 4,
    stint: 1,
    position: 4,
    lapDelta: -0.42,
    raceProgress: 23.1,
  },
  lateRace: {
    driver: "LEC",
    race: "Chinese GP",
    year: 2024,
    lap: 48,
    totalLaps: 56,
    compound: "SOFT",
    tyreLife: 22,
    stint: 3,
    position: 5,
    lapDelta: 1.18,
    raceProgress: 85.7,
  },
  anomaly: {
    driver: "ALO",
    race: "Spanish GP",
    year: 2023,
    lap: 29,
    totalLaps: 66,
    compound: "HARD",
    tyreLife: 17,
    stint: 2,
    position: 7,
    lapDelta: 0.71,
    raceProgress: 43.9,
  },
};

function calculateIllustrativePrediction(state: LapState) {
  let score = 0.08;
  const reasons: string[] = [];

  if (state.tyreLife >= 10 && state.tyreLife <= 20) {
    score += 0.34;
    reasons.push("Tyre age sits inside the common 10-20 lap pit window.");
  } else if (state.tyreLife > 20) {
    score += Math.min(0.42, 0.24 + (state.tyreLife - 20) * 0.015);
    reasons.push("Older tyres increase the illustrative stop pressure.");
  } else {
    score += Math.max(0, state.tyreLife - 4) * 0.018;
    reasons.push("Fresh tyre age lowers immediate stop pressure.");
  }

  if (state.raceProgress >= 28 && state.raceProgress <= 70) {
    score += 0.13;
    reasons.push("Race progress is inside the dataset's busy strategy phase.");
  } else if (state.raceProgress > 78) {
    score -= 0.05;
    reasons.push("Late-race stops are less frequent in the observed data.");
  }

  if (state.stint >= 2) {
    score += Math.min(0.12, state.stint * 0.035);
    reasons.push("Higher stint context raises the estimated probability.");
  }

  if (state.lapDelta > 0.4) {
    score += Math.min(0.12, state.lapDelta * 0.07);
    reasons.push("A positive lap-time delta adds supporting pressure.");
  }

  const compoundAdjustment: Record<string, number> = {
    HARD: 0.07,
    SOFT: 0.04,
    INTERMEDIATE: 0.02,
    MEDIUM: -0.01,
    WET: -0.05,
  };
  score += compoundAdjustment[state.compound] ?? 0;

  const raceAdjustment: Record<string, number> = {
    "Chinese GP": 0.08,
    "Monaco GP": 0.06,
    "Spanish GP": 0.04,
    "Italian GP": -0.03,
    "Miami GP": -0.04,
    "Mexico City GP": -0.05,
  };
  score += raceAdjustment[state.race] ?? 0;

  if (state.year === 2023) {
    score *= 0.16;
    reasons.unshift("2023 triggers the dataset anomaly warning.");
  }

  const probability = Math.round(Math.min(0.94, Math.max(0.03, score)) * 100);
  return {
    probability,
    decision: probability >= 50 ? "PIT NEXT LAP" : "STAY OUT",
    call: probability >= 65 ? "BOX THIS LAP" : probability >= 50 ? "PREPARE THE CREW" : "STAY OUT",
    confidence: probability >= 70 || probability <= 25 ? "High" : "Moderate",
    reasons: reasons.slice(0, 3),
  };
}

export function InteractiveModelLab() {
  const [activePreset, setActivePreset] = useState("pitWindow");
  const [draft, setDraft] = useState<LapState>(presets.pitWindow);
  const [submitted, setSubmitted] = useState<LapState>(presets.pitWindow);
  const result = useMemo(
    () => calculateIllustrativePrediction(submitted),
    [submitted],
  );

  const update = <Key extends keyof LapState>(key: Key, value: LapState[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const loadPreset = (name: string) => {
    const next = presets[name];
    setActivePreset(name);
    setDraft(next);
    setSubmitted(next);
  };

  return (
    <main className="page page--model-lab">
      <header className="topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          LIGHTGBM + REALMLP BLEND
        </div>
        <div className="topbar__meta">0.95328 Public AUC</div>
      </header>

      <section className="page-heading page-heading--compact">
        <p className="section-kicker">BEST MODEL DEMO</p>
        <h1>Ask the pit wall.</h1>
        <p>
          Adjust the current lap state and explore an illustrative next-lap
          decision.
        </p>
      </section>

      <div className="demo-disclaimer" role="note">
        <strong>Frontend simulation</strong>
        <span>
          This uses transparent heuristic scoring, not the trained model API.
        </span>
      </div>

      <div className="preset-tabs" aria-label="Demo scenarios">
        {[
          ["pitWindow", "Common pit window"],
          ["freshTyres", "Fresh tyres"],
          ["lateRace", "Late race"],
          ["anomaly", "2023 anomaly"],
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
            setSubmitted(draft);
          }}
        >
          <div className="panel-heading">
            <div>
              <p className="section-kicker">CURRENT LAP STATE</p>
              <h2>Edit the scenario</h2>
            </div>
            <span className="badge badge--soft">Illustrative</span>
          </div>

          <div className="form-grid">
            <Field label="Driver">
              <select
                value={draft.driver}
                onChange={(event) => update("driver", event.target.value)}
              >
                {["VER", "NOR", "LEC", "ALO", "HAM", "RUS"].map((driver) => (
                  <option key={driver}>{driver}</option>
                ))}
              </select>
            </Field>

            <Field label="Race">
              <select
                value={draft.race}
                onChange={(event) => update("race", event.target.value)}
              >
                {[
                  "Monaco GP",
                  "Chinese GP",
                  "Spanish GP",
                  "British GP",
                  "Italian GP",
                  "Miami GP",
                  "Mexico City GP",
                ].map((race) => (
                  <option key={race}>{race}</option>
                ))}
              </select>
            </Field>

            <Field label="Year">
              <select
                value={draft.year}
                onChange={(event) => update("year", Number(event.target.value))}
              >
                {[2022, 2023, 2024, 2025].map((year) => (
                  <option key={year}>{year}</option>
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

            <NumberField
              label="Lap"
              value={draft.lap}
              min={1}
              max={draft.totalLaps}
              onChange={(value) => update("lap", value)}
            />
            <NumberField
              label="Total laps"
              value={draft.totalLaps}
              min={20}
              max={90}
              onChange={(value) => update("totalLaps", value)}
            />
            <NumberField
              label="Tyre life"
              value={draft.tyreLife}
              min={0}
              max={55}
              suffix="laps"
              onChange={(value) => update("tyreLife", value)}
            />
            <NumberField
              label="Stint"
              value={draft.stint}
              min={1}
              max={5}
              onChange={(value) => update("stint", value)}
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
              label="Lap-time delta"
              value={draft.lapDelta}
              min={-3}
              max={5}
              step={0.01}
              suffix="s"
              onChange={(value) => update("lapDelta", value)}
            />
          </div>

          <label className="range-field">
            <span>
              Race progress
              <strong>{draft.raceProgress.toFixed(1)}%</strong>
            </span>
            <input
              type="range"
              min="1"
              max="100"
              step="0.1"
              value={draft.raceProgress}
              onChange={(event) =>
                update("raceProgress", Number(event.target.value))
              }
            />
          </label>

          <button className="primary-button primary-button--active" type="submit">
            Run illustrative prediction
            <span>→</span>
          </button>
        </form>

        <article
          className={`panel result-shell result-shell--${result.probability >= 50 ? "pit" : "stay"}`}
          aria-live="polite"
        >
          <div className="result-shell__content">
            <p className="section-kicker">PREDICTION RESULT</p>
            <h2>{result.decision}</h2>
            <div
              className="probability-ring"
              style={{
                background: `radial-gradient(circle, var(--paper) 0 58%, transparent 59%), conic-gradient(var(--coral) 0 ${result.probability}%, rgba(16, 33, 63, 0.1) ${result.probability}% 100%)`,
              }}
            >
              <strong>{result.probability}%</strong>
              <span>{result.confidence} confidence</span>
            </div>
            <div className="recommendation">
              <span>Recommended call</span>
              <strong>{result.call}</strong>
            </div>
          </div>
          <div className="result-tyre" aria-hidden="true">
            <span>{result.probability >= 50 ? "PIT" : "OUT"}</span>
          </div>
        </article>
      </section>

      <section className="lab-footer-grid lab-footer-grid--interactive">
        <article className="panel contribution-card">
          <p className="section-kicker">MODEL CONTRIBUTION</p>
          <Contribution label="LightGBM" value="42.5%" width="42.5%" />
          <Contribution label="RealMLP" value="57.5%" width="57.5%" />
          <small>Weights from the best saved OOF blend.</small>
        </article>
        <article className="panel explanation-card">
          <p className="section-kicker">WHY THIS RESULT?</p>
          <div className="reason-list">
            {result.reasons.map((reason, index) => (
              <div key={reason}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{reason}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="panel model-score-card">
          <p className="section-kicker">BEST SAVED SUBMISSION</p>
          <strong>0.95328</strong>
          <span>Public ROC AUC</span>
          <small>Blend performance, not this frontend simulation.</small>
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
