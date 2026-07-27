import type { Metadata } from "next";
import {
  CategoricalRatesChart,
  CorrelationChart,
  DegradationChart,
  DriftChart,
  FeatureImportanceChart,
  FeatureTargetChart,
  NumericProfileChart,
  PitTimingChart,
  RaceRatesChart,
  TargetDistributionChart,
} from "./native-eda-charts";
import { EdaTelemetry } from "./eda-telemetry";

export const metadata: Metadata = {
  title: "Detailed EDA Notebook",
  description:
    "A web-native walkthrough of the project's lap-by-lap pit-stop EDA notebook.",
};

const sections = [
  ["target", "Target"],
  ["distributions", "Distributions"],
  ["feature-target", "Feature vs target"],
  ["correlation", "Correlation"],
  ["categorical", "Categorical"],
  ["timing", "Pit timing"],
  ["degradation", "Degradation"],
  ["drift", "Drift"],
  ["races", "Race rates"],
  ["baseline", "Baseline"],
];

const drift = [
  ["TyreLife", "+0.02%"],
  ["LapNumber", "-0.24%"],
  ["Position", "-0.27%"],
  ["LapTime (s)", "+0.04%"],
  ["LapTime_Delta", "+5.10%"],
  ["Cumulative_Degradation", "-0.50%"],
  ["RaceProgress", "-0.29%"],
  ["Position_Change", "+5.18%"],
  ["Stint", "-0.27%"],
];

const raceRates = [
  ["Chinese Grand Prix", "38.9%", "high"],
  ["Monaco Grand Prix", "35.7%", "high"],
  ["Spanish Grand Prix", "32.0%", "high"],
  ["Italian Grand Prix", "13.2%", "low"],
  ["Miami Grand Prix", "10.4%", "low"],
  ["Mexico City Grand Prix", "9.1%", "low"],
];

export default function EdaPage() {
  return (
    <main className="page notebook-page">
      <header className="topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          ORIGINAL NOTEBOOK · WEB REPORT
        </div>
        <div className="topbar__meta">S6E5 · Lap-by-lap analysis</div>
      </header>

      <section className="notebook-hero">
        <div>
          <p className="section-kicker">DETAILED EXPLORATORY DATA ANALYSIS</p>
          <h1>Lap-by-lap, from raw data to a baseline.</h1>
          <p>
            A native web translation of the project notebook—rebuilt from its
            recorded aggregates, model outputs, section order, and conclusions.
          </p>
        </div>
        <aside className="notebook-hero__quote">
          <span>01</span>
          <blockquote>“Box, box, box.”</blockquote>
          <p>The three words every F1 driver waits for.</p>
        </aside>
      </section>

      <section className="dataset-ledger" aria-label="Dataset overview">
        <LedgerMetric value="439,140" label="Train rows" />
        <LedgerMetric value="188,165" label="Test rows" />
        <LedgerMetric value="16 / 15" label="Train / test columns" />
        <LedgerMetric value="0" label="Missing values" />
        <LedgerMetric value="53.6 MB" label="Training memory" />
      </section>

      <nav className="notebook-toc" aria-label="EDA sections">
        <span>Notebook index</span>
        <div>
          {sections.map(([href, label], index) => (
            <a href={`#${href}`} key={href}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <EdaTelemetry />

      <NotebookSection
        id="target"
        number="01"
        eyebrow="TARGET DISTRIBUTION"
        title="One in five laps is followed by a pit stop."
        copy="The notebook begins with the target itself. PitNextLap is imbalanced, but not severely enough to demand aggressive resampling—especially because ROC AUC measures ranking quality."
      >
        <div className="notebook-split notebook-split--figure">
          <TargetDistributionChart />
          <aside className="notebook-facts">
            <Fact value="351,759" label="Stay out · class 0" tone="navy" />
            <Fact value="87,381" label="Pit next lap · class 1" tone="coral" />
            <Fact value="19.90%" label="Positive target rate" tone="yellow" />
            <p>
              Notebook conclusion: approximately an 8:2 split between negative
              and positive labels.
            </p>
          </aside>
        </div>
      </NotebookSection>

      <NotebookSection
        id="distributions"
        number="02"
        eyebrow="NUMERIC FEATURE DISTRIBUTIONS"
        title="Train and test overlap across the feature space."
        copy="The notebook compares nine shared numeric features. The native profiles below use its exact train and test means and standard deviations to show their overlap without relying on a raster image."
      >
        <NumericProfileChart />
        <div className="notebook-callout notebook-callout--mint">
          <strong>Main observation</strong>
          <p>
            Train and test distributions heavily overlap for most features.
            Local validation should therefore be a useful leaderboard proxy.
          </p>
        </div>
      </NotebookSection>

      <NotebookSection
        id="feature-target"
        number="03"
        eyebrow="FEATURE VS TARGET"
        title="The separation appears in tyre life and race timing."
        copy="The notebook's class overlays point to tyre life and race timing. Because their histogram bins were not saved in the notebook JSON, the native chart uses the exact printed target correlations as a reproducible signal summary."
      >
        <FeatureTargetChart />
        <div className="notebook-insight-grid">
          <Insight index="A" title="TyreLife">
            Clear target separation makes tyre age one of the first raw
            variables worth testing.
          </Insight>
          <Insight index="B" title="LapNumber">
            Later race laps carry more pit-stop likelihood, although timing
            features overlap.
          </Insight>
          <Insight index="C" title="RaceProgress">
            Strategy phases emerge more clearly than they do in raw
            LapTime_Delta.
          </Insight>
        </div>
      </NotebookSection>

      <NotebookSection
        id="correlation"
        number="04"
        eyebrow="CORRELATION HEATMAP"
        title="Strong signal, redundancy, and one inverted feature."
        copy="The relationship map preserves the notebook's most consequential feature-to-feature and feature-to-target values in a responsive, readable form."
      >
        <CorrelationChart />
        <div className="correlation-ledger">
          <Correlation value="+0.27" label="TyreLife" />
          <Correlation value="+0.27" label="LapNumber" />
          <Correlation value="+0.20" label="Stint" />
          <Correlation value="+0.19" label="RaceProgress" />
          <Correlation value="-0.17" label="Cumulative_Degradation" negative />
          <Correlation value="-0.005" label="LapTime_Delta" muted />
        </div>
        <div className="notebook-callout notebook-callout--lavender">
          <strong>Redundancy warning</strong>
          <p>
            LapNumber and RaceProgress correlate at 0.96; TyreLife and
            LapNumber at 0.65. Interaction features may be more useful than
            carrying every raw timing signal independently.
          </p>
        </div>
      </NotebookSection>

      <NotebookSection
        id="categorical"
        number="05"
        eyebrow="CATEGORICAL ANALYSIS"
        title="The compound ordering defies real-world intuition."
        copy="The notebook analyses pit rate by compound and year. These exact group means are now rendered as native bars, keeping the 2023 anomaly visible without the old Matplotlib panel."
      >
        <CategoricalRatesChart />
        <div className="compound-ledger">
          <span><i className="compound-dot compound-dot--hard" />HARD <b>32.8%</b></span>
          <span><i className="compound-dot compound-dot--soft" />SOFT <b>19.3%</b></span>
          <span><i className="compound-dot compound-dot--intermediate" />INTERMEDIATE <b>15.2%</b></span>
          <span><i className="compound-dot compound-dot--medium" />MEDIUM <b>10.1%</b></span>
          <span><i className="compound-dot compound-dot--wet" />WET <b>2.5%</b></span>
        </div>
        <div className="notebook-callout notebook-callout--coral">
          <strong>Notebook warning</strong>
          <p>
            HARD has the highest pit rate—not SOFT. This synthetic dataset does
            not fully honour domain logic, so assumptions must not override the
            observed data.
          </p>
        </div>
      </NotebookSection>

      <NotebookSection
        id="timing"
        number="06"
        eyebrow="PIT TIMING"
        title="There is no single universal pit window."
        copy="The notebook answers when stops happen by race lap, race progress, tyre age, and compound. Its raw histogram bins were not serialized, so this native view clearly labels the observed ranges as notebook-derived rather than exact bin counts."
      >
        <PitTimingChart />
        <div className="timing-findings">
          <Insight index="01" title="LapNumber">
            Stops spread broadly across laps 5-55, consistent with mixed
            one-stop and two-stop strategies.
          </Insight>
          <Insight index="02" title="RaceProgress">
            Activity peaks around 0.35-0.60 and tapers sharply after 0.70.
          </Insight>
          <Insight index="03" title="TyreLife">
            The strongest concentration is 10-20 laps; stops become rare after
            30 laps.
          </Insight>
          <Insight index="04" title="By compound">
            Tyre-life distributions overlap heavily, so compound alone does
            not determine stint length.
          </Insight>
        </div>
      </NotebookSection>

      <NotebookSection
        id="degradation"
        number="07"
        eyebrow="DEGRADATION ANALYSIS"
        title="LapTime_Delta is inverted, not useless."
        copy="The notebook bins tyre age and prints the average LapTime_Delta for every interval. Those exact grouped means drive the native chart below."
      >
        <DegradationChart />
        <div className="degradation-sequence">
          {[
            ["0-5", "-7.41s"],
            ["5-10", "-3.52s"],
            ["10-15", "-2.93s"],
            ["15-20", "-2.69s"],
            ["20-25", "-2.58s"],
            ["25-30", "-2.18s"],
            ["30-35", "-1.56s"],
            ["35-40", "-1.44s"],
          ].map(([bin, value]) => (
            <span key={bin}>
              <small>{bin} laps</small>
              <strong>{value}</strong>
            </span>
          ))}
        </div>
        <div className="notebook-callout notebook-callout--yellow">
          <strong>Feature-engineering direction</strong>
          <p>
            The raw delta is relative to a reference pace. Rolling
            rate-of-change should be more useful than interpreting it as direct
            lap-over-lap tyre degradation.
          </p>
        </div>
      </NotebookSection>

      <NotebookSection
        id="drift"
        number="08"
        eyebrow="TRAIN / TEST DRIFT"
        title="Only two features move by roughly five percent."
        copy="The notebook computes mean differences feature by feature. Every numeric feature remains under ten percent drift, and most stay below half a percent."
      >
        <div className="notebook-split notebook-split--drift">
          <DriftChart />
          <div className="drift-table">
            <div><span>Feature</span><span>Mean difference</span></div>
            {drift.map(([feature, difference]) => (
              <div className={difference.includes("5.") ? "is-emphasis" : ""} key={feature}>
                <strong>{feature}</strong>
                <b>{difference}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="notebook-callout notebook-callout--mint">
          <strong>Decision</strong>
          <p>
            No drift correction was required. Position_Change reaches 5.18%
            and LapTime_Delta 5.10%; all other mean differences are below 0.5%.
          </p>
        </div>
      </NotebookSection>

      <NotebookSection
        id="races"
        number="09"
        eyebrow="RACE-LEVEL PIT RATE"
        title="Circuit identity carries real strategy signal."
        copy="The notebook ranks every race by observed PitNextLap rate. Its printed top and bottom ten rows are recreated below, including Pre-Season Testing."
      >
        <RaceRatesChart />
        <div className="race-extremes">
          {raceRates.map(([race, rate, group]) => (
            <div className={`race-extreme race-extreme--${group}`} key={race}>
              <span>{group === "high" ? "Highest" : "Lowest"}</span>
              <strong>{race}</strong>
              <b>{rate}</b>
            </div>
          ))}
        </div>
        <p className="notebook-footnote">
          Recommendation from the notebook: encode Race because circuit-level
          pit rates vary substantially. Remove Pre-Season Testing because its
          stops do not follow race-strategy logic.
        </p>
      </NotebookSection>

      <NotebookSection
        id="baseline"
        number="10"
        eyebrow="BASELINE LIGHTGBM"
        title="EDA decisions flow into a time-aware baseline."
        copy="The notebook closes by encoding Driver, Compound, and Race; holding out 2025; training LightGBM; evaluating AUC; inspecting feature importance; and writing a submission."
      >
        <div className="baseline-flow">
          <FlowStep number="01" title="Encode">
            Driver · Compound · Race
          </FlowStep>
          <FlowStep number="02" title="Train">
            346,246 rows · 2022-2024
          </FlowStep>
          <FlowStep number="03" title="Validate">
            92,894 rows · 2025
          </FlowStep>
          <FlowStep number="04" title="Score">
            ROC AUC · year-aware
          </FlowStep>
        </div>

        <div className="baseline-scoreboard">
          <Fact value="0.89754" label="Validation AUC" tone="coral" />
          <Fact value="227" label="Best iteration" tone="yellow" />
          <Fact value="0.284" label="Validation positive rate" tone="lavender" />
          <Fact value="13" label="Model features" tone="navy" />
        </div>

        <FeatureImportanceChart />

        <div className="submission-summary">
          <div>
            <span>Submission rows</span>
            <strong>188,165</strong>
          </div>
          <div>
            <span>Prediction mean</span>
            <strong>0.3037</strong>
          </div>
          <div>
            <span>Prediction std</span>
            <strong>0.3469</strong>
          </div>
          <div>
            <span>Prediction range</span>
            <strong>0.0002-0.9931</strong>
          </div>
        </div>
      </NotebookSection>

      <section className="notebook-summary panel">
        <p className="section-kicker">NOTEBOOK CONCLUSION</p>
        <h2>The data is clean. The assumptions are the risky part.</h2>
        <div>
          <SummaryItem priority="High">Remove Pre-Season Testing rows</SummaryItem>
          <SummaryItem priority="High">Use a year-based validation split</SummaryItem>
          <SummaryItem priority="Medium">Encode Compound and Race</SummaryItem>
          <SummaryItem priority="Medium">Engineer rolling degradation signals</SummaryItem>
          <SummaryItem priority="Low">Skip drift correction</SummaryItem>
        </div>
      </section>
    </main>
  );
}

function LedgerMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function NotebookSection({
  id,
  number,
  eyebrow,
  title,
  copy,
  children,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="notebook-section" id={id}>
      <header className="notebook-section__header">
        <span>{number}</span>
        <div>
          <p className="section-kicker">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
      </header>
      <div className="notebook-section__body">{children}</div>
    </section>
  );
}

function Fact({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className={`notebook-fact notebook-fact--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Insight({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="notebook-insight">
      <span>{index}</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </article>
  );
}

function Correlation({
  value,
  label,
  negative = false,
  muted = false,
}: {
  value: string;
  label: string;
  negative?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={negative ? "is-negative" : muted ? "is-muted" : ""}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FlowStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span>{number}</span>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function SummaryItem({
  priority,
  children,
}: {
  priority: string;
  children: React.ReactNode;
}) {
  return (
    <span>
      <b>{priority}</b>
      {children}
    </span>
  );
}
