"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import data from "./notebook-data.json";

type ChartStyle = CSSProperties & Record<`--${string}`, string | number>;

export function TargetDistributionChart() {
  const [stayOut, pit] = data.target;
  return (
    <ChartShell
      title="PitNextLap distribution"
      caption="Exact counts and proportions from notebook cell 11"
    >
      <div className="native-target">
        <div
          className="native-target__donut"
          style={{ "--pit-rate": `${pit.rate}%` } as ChartStyle}
          aria-label={`${pit.rate.toFixed(2)} percent pit next lap`}
        >
          <span>{pit.rate.toFixed(1)}%</span>
          <small>pit next lap</small>
        </div>
        <div className="native-target__bars">
          {[stayOut, pit].map((item) => (
            <div key={item.class}>
              <header>
                <span>{item.label}</span>
                <strong>{item.count.toLocaleString("en-US")}</strong>
              </header>
              <i>
                <b style={{ width: `${item.rate}%` }} />
              </i>
              <small>Class {item.class} · {item.rate.toFixed(2)}%</small>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}

export function NumericProfileChart() {
  const [selected, setSelected] = useState("TyreLife");
  const active =
    data.numericProfiles.find((item) => item.feature === selected) ??
    data.numericProfiles[0];

  return (
    <ChartShell
      title="Train vs test statistical profiles"
      caption="Mean ± standard deviation from the notebook output; each feature uses its own scale"
      wide
    >
      <div className="profile-legend">
        <span><i className="is-train" />Train</span>
        <span><i className="is-test" />Test</span>
        <small>Dot = mean · band = ±1 standard deviation</small>
      </div>
      <div className="profile-focus" aria-live="polite">
        <div>
          <span>ACTIVE CHANNEL</span>
          <strong>{active.feature}</strong>
        </div>
        <dl>
          <div><dt>Train μ</dt><dd>{formatNumber(active.trainMean)}</dd></div>
          <div><dt>Test μ</dt><dd>{formatNumber(active.testMean)}</dd></div>
          <div><dt>Mean drift</dt><dd>{formatSigned(active.drift)}%</dd></div>
        </dl>
      </div>
      <div className="profile-grid">
        {data.numericProfiles.map((item) => {
          const low = Math.min(
            item.trainMean - item.trainStd,
            item.testMean - item.testStd,
          );
          const high = Math.max(
            item.trainMean + item.trainStd,
            item.testMean + item.testStd,
          );
          const range = high - low || 1;
          const position = (value: number) => ((value - low) / range) * 100;
          return (
            <button
              type="button"
              className={`profile-card${selected === item.feature ? " is-selected" : ""}`}
              onClick={() => setSelected(item.feature)}
              aria-pressed={selected === item.feature}
              key={item.feature}
            >
              <header>
                <strong>{item.feature}</strong>
                <span className={Math.abs(item.drift) >= 5 ? "is-alert" : ""}>
                  {formatSigned(item.drift)}% drift
                </span>
              </header>
              <div className="profile-track">
                <i
                  className="profile-band is-train"
                  style={{
                    "--left": `${position(item.trainMean - item.trainStd)}%`,
                    "--width": `${(item.trainStd * 2 / range) * 100}%`,
                    "--dot": `${position(item.trainMean)}%`,
                  } as ChartStyle}
                />
                <i
                  className="profile-band is-test"
                  style={{
                    "--left": `${position(item.testMean - item.testStd)}%`,
                    "--width": `${(item.testStd * 2 / range) * 100}%`,
                    "--dot": `${position(item.testMean)}%`,
                  } as ChartStyle}
                />
              </div>
              <footer>
                <span>{formatNumber(item.trainMean)} ± {formatNumber(item.trainStd)}</span>
                <span>{formatNumber(item.testMean)} ± {formatNumber(item.testStd)}</span>
              </footer>
            </button>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function FeatureTargetChart() {
  return (
    <ChartShell
      title="Feature signal toward PitNextLap"
      caption="Exact Pearson correlation values printed by notebook cell 20"
      wide
    >
      <DivergingBars
        rows={data.targetCorrelations.map(({ feature, value }) => ({
          label: feature,
          value,
        }))}
        max={0.3}
        value={(number) => formatSigned(number, 3)}
      />
    </ChartShell>
  );
}

export function CorrelationChart() {
  return (
    <ChartShell
      title="Relationship map"
      caption="Strong relationships and target correlations retained by the notebook"
      wide
    >
      <div className="relationship-map">
        {data.relationshipHighlights.map((item) => {
          const strength = Math.min(Math.abs(item.value), 1);
          return (
            <article
              className={item.value < 0 ? "is-negative" : ""}
              key={`${item.x}-${item.y}`}
              style={{ "--strength": strength } as ChartStyle}
            >
              <span>{item.x}</span>
              <i>↔</i>
              <span>{item.y}</span>
              <strong>{formatSigned(item.value, item.value > 0.5 ? 2 : 3)}</strong>
            </article>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function CategoricalRatesChart() {
  return (
    <ChartShell
      title="Categorical pit rates"
      caption="Exact group means from notebook cell 23"
      wide
    >
      <div className="categorical-charts">
        <SimpleBars
          title="Compound"
          rows={data.compoundRates}
          max={0.35}
          accent="coral"
        />
        <SimpleBars
          title="Season"
          rows={data.yearRates}
          max={0.35}
          accent="lavender"
        />
      </div>
    </ChartShell>
  );
}

export function PitTimingChart() {
  return (
    <ChartShell
      title="Observed pit windows"
      caption="Ranges stated in the notebook analysis; histogram bin arrays were not serialized"
      wide
      inferred
    >
      <div className="window-grid">
        {data.pitWindows.map((window) => (
          <article key={window.label}>
            <header>
              <strong>{window.label}</strong>
              <span>{window.start}–{window.end}</span>
            </header>
            <div className="window-track">
              <i
                style={{
                  "--left": `${(window.start / window.max) * 100}%`,
                  "--width": `${((window.end - window.start) / window.max) * 100}%`,
                } as ChartStyle}
              />
            </div>
            <footer><span>0</span><small>{window.note}</small><span>{window.max}</span></footer>
          </article>
        ))}
      </div>
    </ChartShell>
  );
}

export function DegradationChart() {
  const max = Math.max(...data.degradation.map((item) => Math.abs(item.value)));
  return (
    <ChartShell
      title="LapTime_Delta by tyre-life bin"
      caption="Exact grouped means printed by notebook cell 29"
      wide
    >
      <div className="vertical-bars">
        {data.degradation.map((item) => {
          const height = `${(Math.abs(item.value) / max) * 100}%`;
          return (
            <div key={item.bin} style={{ "--bar-height": height } as ChartStyle}>
              <strong>{item.value.toFixed(2)}s</strong>
              <i />
              <span>{item.bin}</span>
            </div>
          );
        })}
      </div>
      <div className="native-axis-label">Tyre life in laps</div>
    </ChartShell>
  );
}

export function DriftChart() {
  return (
    <ChartShell
      title="Train vs test mean drift"
      caption="Exact percentage difference from notebook cell 32"
    >
      <DivergingBars
        rows={data.drift.map(({ feature, value }) => ({ label: feature, value }))}
        max={5.5}
        value={(number) => `${formatSigned(number, 2)}%`}
        alert={5}
      />
    </ChartShell>
  );
}

export function RaceRatesChart() {
  const [selected, setSelected] = useState(data.raceRates[0].label);
  const active =
    data.raceRates.find((race) => race.label === selected) ?? data.raceRates[0];
  const estimatedEvents = Math.round(active.value * active.count);

  return (
    <ChartShell
      title="Pit rate by race"
      caption="Exact top and bottom ten rows printed by notebook cell 35"
      wide
    >
      <div className="race-selection" aria-live="polite">
        <div>
          <span>SELECTED CIRCUIT</span>
          <strong>{active.label}</strong>
        </div>
        <div><small>Pit rate</small><b>{(active.value * 100).toFixed(1)}%</b></div>
        <div><small>Observed laps</small><b>{active.count.toLocaleString("en-US")}</b></div>
        <div><small>Approx. positives</small><b>{estimatedEvents.toLocaleString("en-US")}</b></div>
      </div>
      <div className="race-rate-columns">
        <SimpleBars
          title="Highest rates"
          rows={data.raceRates.slice(0, 10)}
          max={0.4}
          accent="coral"
          showCount
          selected={selected}
          onSelect={setSelected}
        />
        <SimpleBars
          title="Lowest rates"
          rows={data.raceRates.slice(10)}
          max={0.4}
          accent="mint"
          showCount
          selected={selected}
          onSelect={setSelected}
        />
      </div>
    </ChartShell>
  );
}

export function FeatureImportanceChart() {
  return (
    <ChartShell
      title="LightGBM feature importance"
      caption="Exact top ten split-importance values from notebook cell 53"
      wide
    >
      <SimpleBars
        rows={data.featureImportance.map(({ feature, value }) => ({
          label: feature,
          value,
        }))}
        max={850}
        accent="coral"
        raw
      />
    </ChartShell>
  );
}

function ChartShell({
  title,
  caption,
  children,
  wide = false,
  inferred = false,
}: {
  title: string;
  caption: string;
  children: ReactNode;
  wide?: boolean;
  inferred?: boolean;
}) {
  return (
    <figure className={`native-chart${wide ? " native-chart--wide" : ""}`}>
      <header className="native-chart__header">
        <div>
          <span>{inferred ? "Notebook-derived" : "Exact notebook data"}</span>
          <h3>{title}</h3>
        </div>
        <small>HTML · CSS</small>
      </header>
      <div className="native-chart__canvas">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function DivergingBars({
  rows,
  max,
  value,
  alert,
}: {
  rows: { label: string; value: number }[];
  max: number;
  value: (number: number) => string;
  alert?: number;
}) {
  return (
    <div className="diverging-bars">
      {rows.map((row) => (
        <div className="diverging-row" key={row.label}>
          <span>{row.label}</span>
          <div>
            <i className="diverging-zero" />
            <b
              className={`${row.value < 0 ? "is-negative" : "is-positive"}${
                alert && Math.abs(row.value) >= alert ? " is-alert" : ""
              }`}
              style={{
                "--size": `${Math.min(Math.abs(row.value) / max, 1) * 50}%`,
              } as ChartStyle}
            />
          </div>
          <strong>{value(row.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function SimpleBars({
  rows,
  max,
  title,
  accent,
  showCount = false,
  raw = false,
  selected,
  onSelect,
}: {
  rows: { label: string; value: number; count?: number }[];
  max: number;
  title?: string;
  accent: "coral" | "lavender" | "mint";
  showCount?: boolean;
  raw?: boolean;
  selected?: string;
  onSelect?: (label: string) => void;
}) {
  return (
    <div className={`simple-bars simple-bars--${accent}`}>
      {title && <h4>{title}</h4>}
      {rows.map((row) => {
        const content = (
          <>
          <header>
            <span>{row.label}</span>
            <strong>{raw ? row.value : `${(row.value * 100).toFixed(1)}%`}</strong>
          </header>
          <i><b style={{ width: `${Math.min(row.value / max, 1) * 100}%` }} /></i>
          {showCount && <small>{row.count?.toLocaleString("en-US")} laps</small>}
          </>
        );

        return onSelect ? (
          <button
            type="button"
            className={selected === row.label ? "is-selected" : ""}
            onClick={() => onSelect(row.label)}
            aria-pressed={selected === row.label}
            key={row.label}
          >
            {content}
          </button>
        ) : (
          <div key={row.label}>{content}</div>
        );
      })}
    </div>
  );
}

function formatSigned(value: number, digits = 2) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function formatNumber(value: number) {
  const magnitude = Math.abs(value);
  if (magnitude >= 10) return value.toFixed(2);
  if (magnitude >= 1) return value.toFixed(3);
  return value.toFixed(4);
}
