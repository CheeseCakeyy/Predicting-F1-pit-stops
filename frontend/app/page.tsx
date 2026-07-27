import Link from "next/link";
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

export default function Home() {
  return (
    <main className="page landing-page">
      <header className="topbar landing-topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          PITWALL AI · S6E5
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
