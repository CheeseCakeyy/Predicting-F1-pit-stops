import Link from "next/link";
import { ExperimentScoreChart } from "./components/experiment-score-chart";
import { SpinningTyre } from "./components/spinning-tyre";

const proof = [
  ["439,140", "Lap observations"],
  ["26", "Race contexts"],
  ["13", "Model features"],
  ["0.95328", "Public ROC AUC"],
];

const valueCards = [
  {
    number: "01",
    eyebrow: "READ THE RACE",
    title: "Every lap becomes a strategy signal.",
    copy: "Tyre age, race progress, stint, position and timing context are assembled into one lap-level view.",
    tone: "coral",
  },
  {
    number: "02",
    eyebrow: "FIND THE WINDOW",
    title: "Patterns become pit-stop pressure.",
    copy: "Exploratory analysis reveals the windows, circuit effects and synthetic-data anomalies that shape the prediction.",
    tone: "yellow",
  },
  {
    number: "03",
    eyebrow: "MAKE THE CALL",
    title: "A probability arrives before the next lap.",
    copy: "The final blend ranks the chance of a stop so the result reads like a pit-wall decision, not a black-box score.",
    tone: "lavender",
  },
];

type Experiment = {
  name: string;
  shortName: string;
  file: string;
  oof: number | null;
  privateScore: number;
  publicScore: number;
  notes: string;
};

const experiments: Experiment[] = [
  {
    name: "LGBM + RealMLP blend",
    shortName: "Blend",
    file: "submission_blend_lgbm_realmlp - lb - 0.95328.csv",
    oof: 0.953876,
    privateScore: 0.95369,
    publicScore: 0.95328,
    notes:
      "Best saved submission; OOF blend used 42.5% LGBM and 57.5% RealMLP.",
  },
  {
    name: "RealMLP with feature engineering",
    shortName: "RealMLP FE",
    file: "submission_realmlp_fe - lb-0.95259.csv",
    oof: 0.953105,
    privateScore: 0.95315,
    publicScore: 0.95259,
    notes: "6-fold StratifiedKFold OOF; mean fold AUC 0.953109.",
  },
  {
    name: "LGBM with feature engineering",
    shortName: "LGBM FE",
    file: "submission_lgbm_fe.csv",
    oof: 0.952511,
    privateScore: 0.95256,
    publicScore: 0.95237,
    notes: "OOF score loaded in the blend notebook.",
  },
  {
    name: "XGBoost with feature engineering",
    shortName: "XGB FE",
    file: "submission_xgb_stratified_fe - lb 0.95032.csv",
    oof: 0.950752,
    privateScore: 0.95068,
    publicScore: 0.95032,
    notes: "5-fold StratifiedKFold OOF; mean fold AUC 0.950761.",
  },
  {
    name: "XGBoost OOF GroupKFold",
    shortName: "XGB Group",
    file: "submission_xgb_oof_groupkfolds - 0.94834.csv",
    oof: 0.92978,
    privateScore: 0.94878,
    publicScore: 0.94834,
    notes: "5-fold GroupKFold by race; mean fold AUC 0.929450.",
  },
  {
    name: "Baseline EDA LightGBM notebook",
    shortName: "EDA LGBM",
    file: "submission-baseline-lgbm-0.93576.csv",
    oof: 0.89754,
    privateScore: 0.93609,
    publicScore: 0.93576,
    notes: "Year-holdout validation using 2025 as validation.",
  },
  {
    name: "Baseline LGBM submission",
    shortName: "Baseline",
    file: "submission.csv",
    oof: 0.8955,
    privateScore: 0.93609,
    publicScore: 0.93576,
    notes: "Baseline predictions; experiment notebook year-holdout validation.",
  },
  {
    name: "LGBM without early stopping",
    shortName: "No ES",
    file: "submission (1).csv",
    oof: null,
    privateScore: 0.93265,
    publicScore: 0.93249,
    notes: "No validation score found in the checked notebooks.",
  },
];

const experimentProgression = [...experiments].reverse();

export default function Home() {
  return (
    <main className="page landing-page">
      <header className="topbar landing-topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          BOX BOX BOX · S6E5
        </div>
        <div className="landing-topbar__links">
          <a href="#approach">How it works</a>
          <Link href="/eda">EDA notebook</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <div className="landing-pill">
            <span>LIVE PROJECT</span>
            Next-lap classification
          </div>
          <p className="section-kicker">F1 STRATEGY INTELLIGENCE</p>
          <h1>
            Predict the next
            <em> pit stop.</em>
            <span> Before the radio call.</span>
          </h1>
          <p className="landing-hero__lede">
            A lap-level machine-learning project that turns tyre, timing,
            position and race context into an actionable pit probability.
          </p>
          <div className="landing-actions">
            <Link className="landing-button landing-button--primary" href="/model-lab">
              Try the model demo
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="landing-button landing-button--secondary" href="/eda">
              Explore the analysis
            </Link>
          </div>
          <div className="landing-hero__note">
            <span>01</span>
            Built from the full notebook workflow—not a generic dashboard.
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-telemetry landing-telemetry--lap">
            <span>CURRENT LAP</span>
            <strong>31 / 78</strong>
            <small>Monaco · 2025</small>
          </div>
          <div className="landing-telemetry landing-telemetry--probability">
            <span>PIT PROBABILITY</span>
            <strong>78%</strong>
            <small>Prepare the crew</small>
          </div>
          <div className="tyre-visual landing-tyre">
            <SpinningTyre label="PIT" variant="overview" />
            <span className="tyre-visual__label">CLICK · TO · PUSH</span>
          </div>
          <div className="landing-telemetry landing-telemetry--tyres">
            <span>TYRE LIFE</span>
            <strong>18 laps</strong>
            <small>Inside pit window</small>
          </div>
        </div>
      </section>

      <section className="landing-proof" aria-label="Project proof points">
        <p>BUILT ON REAL PROJECT OUTPUTS</p>
        <div>
          {proof.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-story" id="approach">
        <header className="landing-section-heading">
          <div>
            <p className="section-kicker">THE STRATEGY LOOP</p>
            <h2>From race state to pit-wall decision.</h2>
          </div>
          <p>
            The project follows the same question a race engineer asks every
            lap: what has changed, and is it enough to stop?
          </p>
        </header>

        <div className="landing-value-grid">
          {valueCards.map((card) => (
            <article
              className={`landing-value-card landing-value-card--${card.tone}`}
              key={card.number}
            >
              <span>{card.number}</span>
              <p>{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <div />
              <small>{card.copy}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-model">
        <div className="landing-model__copy">
          <p className="section-kicker">THE BEST MODEL</p>
          <h2>Two models. One sharper strategy call.</h2>
          <p>
            LightGBM + RealMLP combine nonlinear race context with a different
            decision boundary. Their out-of-fold blend delivers the strongest
            saved submission.
          </p>
          <Link href="/model-lab">
            Open the interactive model lab <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="landing-model__score">
          <header>
            <span>PUBLIC ROC AUC</span>
            <i>BEST SAVED</i>
          </header>
          <strong>0.95328</strong>
          <div className="landing-blend">
            <div>
              <span>LightGBM</span>
              <b>42.5%</b>
              <i><em style={{ width: "42.5%" }} /></i>
            </div>
            <div>
              <span>RealMLP</span>
              <b>57.5%</b>
              <i><em style={{ width: "57.5%" }} /></i>
            </div>
          </div>
        </div>

        <article className="landing-deployment-note">
          <div>
            <span>DEPLOYMENT DECISION</span>
            <strong>Best score ≠ deployed model</strong>
          </div>
          <p>
            The production API serves the baseline LightGBM rather than the
            higher-scoring LightGBM + RealMLP blend. Loading and running both
            models would exceed the available backend memory and compute
            budget, putting the server process at risk of a crash. Without
            those infrastructure constraints, the clear deployment choice
            would be the two-model blend.
          </p>
        </article>
      </section>

      <section className="landing-experiments" id="experiments">
        <header className="landing-section-heading landing-experiments__heading">
          <div>
            <p className="section-kicker">EXPERIMENT SCORECARD</p>
            <h2>Every run moved the strategy forward.</h2>
            <div className="landing-metric-note">
              <span>COMPETITION METRIC</span>
              <strong>ROC AUC</strong>
              <small>Higher is better</small>
            </div>
          </div>
          <p>
            Eight saved experiments show how stronger validation, feature
            engineering and model diversity lifted the leaderboard result.
          </p>
        </header>

        <div className="experiment-chart-card">
          <div className="experiment-chart-card__header">
            <div>
              <h3>Score progression</h3>
              <p>Ordered from the earliest saved run to the winning blend.</p>
            </div>
            <div className="experiment-legend" aria-label="Chart legend">
              <span><i className="is-oof" />OOF / validation</span>
              <span><i className="is-public" />Public</span>
              <span><i className="is-private" />Private</span>
            </div>
          </div>

          <div
            className="experiment-chart-scroll"
          >
            <ExperimentScoreChart experiments={experimentProgression} />
          </div>
          <p className="experiment-chart-card__note">
            Lines use a focused 0.89–0.96 axis. The private leaderboard is the
            primary score and receives the strongest visual emphasis.
          </p>
        </div>

        <div className="experiment-table-card">
          <div className="experiment-table-scroll">
            <table className="experiment-table">
              <caption className="sr-only">
                Complete experiment and submission score comparison
              </caption>
              <thead>
                <tr>
                  <th scope="col">Experiment / Submission</th>
                  <th scope="col">Related file</th>
                  <th scope="col">Validation / OOF</th>
                  <th scope="col">Public</th>
                  <th scope="col">Private</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((experiment, index) => (
                  <tr className={index === 0 ? "is-best" : ""} key={experiment.name}>
                    <th scope="row">
                      {index === 0 && <span>BEST</span>}
                      {experiment.name}
                    </th>
                    <td><code>{experiment.file}</code></td>
                    <td>{experiment.oof?.toFixed(6) ?? "N/A"}</td>
                    <td><strong>{experiment.publicScore.toFixed(5)}</strong></td>
                    <td><strong>{experiment.privateScore.toFixed(5)}</strong></td>
                    <td>{experiment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="landing-workflow" aria-label="Model workflow">
        <header>
          <p className="section-kicker">HOW THE SIGNAL MOVES</p>
          <span>Five stages · one next-lap probability</span>
        </header>
        <div>
          {["Lap state", "Feature engineering", "OOF models", "Blend", "Pit probability"].map(
            (item, index) => (
              <article key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
                {index < 4 && <i aria-hidden="true">→</i>}
              </article>
            ),
          )}
        </div>
      </section>

      <section className="landing-final">
        <div>
          <p className="section-kicker">READY ON THE PIT WALL</p>
          <h2>See the decision form, lap by lap.</h2>
        </div>
        <div>
          <Link className="landing-button landing-button--light" href="/model-lab">
            Run a scenario <span aria-hidden="true">→</span>
          </Link>
          <Link className="landing-final__text-link" href="/eda">
            Read the detailed EDA
          </Link>
        </div>
      </section>
    </main>
  );
}
