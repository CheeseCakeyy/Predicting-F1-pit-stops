import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exploratory Data Analysis",
};

const findings = [
  {
    number: "01",
    title: "Target balance",
    value: "80 / 20",
    detail: "Stay out versus pit next lap",
    tone: "coral",
  },
  {
    number: "02",
    title: "Pit window",
    value: "10–20",
    detail: "Common tyre-age window in laps",
    tone: "yellow",
  },
  {
    number: "03",
    title: "Strongest signal",
    value: "0.27",
    detail: "TyreLife and LapNumber correlation",
    tone: "lavender",
  },
];

export default function EdaPage() {
  return (
    <main className="page">
      <header className="topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          NOTEBOOK STORY
        </div>
        <div className="topbar__meta">439,140 lap observations</div>
      </header>

      <section className="page-heading">
        <p className="section-kicker">EXPLORATORY DATA ANALYSIS</p>
        <h1>What makes a lap look pit-bound?</h1>
        <p>
          A structured view of pit timing, tyre behaviour, feature signal, and
          the anomalies that shaped the modeling strategy.
        </p>
      </section>

      <section className="finding-grid">
        {findings.map((finding) => (
          <article
            className={`panel finding-card finding-card--${finding.tone}`}
            key={finding.number}
          >
            <span className="finding-card__number">{finding.number}</span>
            <p>{finding.title}</p>
            <strong>{finding.value}</strong>
            <small>{finding.detail}</small>
          </article>
        ))}
      </section>

      <section className="eda-shell-grid">
        <article className="panel chart-placeholder">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">PIT WINDOW</p>
              <h2>Tyre age at the decision point</h2>
            </div>
            <span className="badge">Chart module next</span>
          </div>
          <div className="placeholder-chart" aria-hidden="true">
            {[18, 28, 51, 74, 88, 72, 61, 46, 34, 23, 16, 9].map(
              (height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ),
            )}
          </div>
        </article>

        <aside className="panel insight-card">
          <p className="section-kicker">DATA WARNING</p>
          <strong>2023 anomaly</strong>
          <span className="insight-card__metric">0.96%</span>
          <p>
            Pit rate is dramatically below other seasons and needs isolation
            before training.
          </p>
        </aside>
      </section>

      <section className="panel next-build">
        <p className="section-kicker">NEXT BUILD SLICE</p>
        <h2>Notebook findings become reusable chart components.</h2>
        <p>
          Target balance, pit timing, compound behavior, feature ranking,
          drift, and race-level variability will plug into this shell.
        </p>
      </section>
    </main>
  );
}
