import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Model Demo",
};

const lapState = [
  ["Driver", "VER"],
  ["Race", "Monaco GP"],
  ["Lap", "31 / 78"],
  ["Tyre compound", "HARD"],
  ["Tyre life", "18 laps"],
  ["Stint", "2"],
  ["Position", "P3"],
  ["Race progress", "39.7%"],
];

export default function ModelLabPage() {
  return (
    <main className="page">
      <header className="topbar">
        <div className="eyebrow">
          <span className="status-dot" />
          LIGHTGBM + REALMLP BLEND
        </div>
        <div className="topbar__meta">0.95328 Public AUC</div>
      </header>

      <section className="page-heading">
        <p className="section-kicker">BEST MODEL DEMO</p>
        <h1>Ask the pit wall.</h1>
        <p>
          Explore how a current lap state becomes a next-lap pit probability.
        </p>
      </section>

      <section className="lab-grid">
        <article className="panel lap-state-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">CURRENT LAP STATE</p>
              <h2>Illustrative scenario</h2>
            </div>
            <span className="badge badge--soft">Preset 01</span>
          </div>
          <dl>
            {lapState.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <button className="primary-button" type="button" disabled>
            Run prediction
            <span>Coming next</span>
          </button>
        </article>

        <article className="panel result-shell">
          <div className="result-shell__content">
            <p className="section-kicker">PREDICTION PREVIEW</p>
            <h2>Pit next lap</h2>
            <div className="probability-ring">
              <strong>78%</strong>
              <span>Illustrative</span>
            </div>
            <div className="recommendation">
              <span>Recommended call</span>
              <strong>BOX THIS LAP</strong>
            </div>
          </div>
          <div className="result-tyre" aria-hidden="true">
            <span>PIT</span>
          </div>
        </article>
      </section>

      <section className="lab-footer-grid">
        <article className="panel contribution-card">
          <p className="section-kicker">MODEL CONTRIBUTION</p>
          <Contribution label="LightGBM" value="42.5%" width="42.5%" />
          <Contribution label="RealMLP" value="57.5%" width="57.5%" />
        </article>
        <article className="panel demo-note">
          <p className="section-kicker">DEMO STATUS</p>
          <h2>Shell ready for interaction.</h2>
          <p>
            Inputs and results are intentionally static until the scenario
            layer and verified inference pipeline are connected.
          </p>
        </article>
      </section>
    </main>
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
