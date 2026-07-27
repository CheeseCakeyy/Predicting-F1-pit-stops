export default function Home() {
  return (
    <main className="page page--overview">
      <header className="topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          S6E5 PROJECT
        </div>
        <div className="topbar__meta">Next-lap classification</div>
      </header>

      <section className="overview-hero">
        <div className="hero-copy">
          <p className="section-kicker">PITWALL AI</p>
          <h1>
            Predict the next
            <span> pit stop.</span>
          </h1>
          <p className="hero-lede">
            Lap-level strategy intelligence built from tyre, timing, position,
            and race-context data.
          </p>
        </div>
        <div className="tyre-visual" aria-hidden="true">
          <div className="tyre-visual__ring">
            <div className="tyre-visual__hub">PIT</div>
          </div>
          <span className="tyre-visual__label">BOX · BOX · BOX</span>
        </div>
      </section>

      <section className="goal-card panel">
        <div>
          <p className="section-kicker">PROJECT GOAL</p>
          <h2>Will this driver pit on the next lap?</h2>
        </div>
        <div className="metric-row">
          <Metric value="439,140" label="lap observations" tone="coral" />
          <Metric value="Binary" label="classification" tone="yellow" />
          <Metric value="ROC AUC" label="evaluation metric" tone="lavender" />
        </div>
      </section>

      <section className="overview-grid">
        <article className="panel approach-card">
          <p className="section-kicker">APPROACH</p>
          <div className="approach-track">
            {["Explore", "Engineer", "Validate", "Blend"].map((step, index) => (
              <div className="approach-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel model-card">
          <div>
            <p className="section-kicker">BEST MODEL</p>
            <h2>LightGBM + RealMLP</h2>
            <p>42.5% tree model · 57.5% neural model</p>
          </div>
          <div className="score-ring">
            <strong>0.95328</strong>
            <span>Public AUC</span>
          </div>
        </article>
      </section>

      <section className="workflow-strip panel" aria-label="Model workflow">
        <p className="section-kicker">FROM TELEMETRY TO PROBABILITY</p>
        <div className="workflow">
          {[
            "Lap state",
            "Features",
            "OOF models",
            "Blend",
            "Pit probability",
          ].map((item, index, items) => (
            <div className="workflow__item" key={item}>
              <span>{item}</span>
              {index < items.length - 1 && <b aria-hidden="true">→</b>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "coral" | "yellow" | "lavender";
}) {
  return (
    <div className={`metric metric--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
