import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the PitWall overview shell", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>PitWall AI<\/title>/i);
  assert.match(html, /Predict the next/);
  assert.match(html, /Before the radio call/);
  assert.match(html, /Try the model demo/);
  assert.match(html, /From race state to pit-wall decision/);
  assert.match(html, /Run a scenario/);
  assert.match(html, /439,140/);
  assert.match(html, /LightGBM \+ RealMLP/);
  assert.match(html, /0\.95328/);
  assert.match(html, /EXPERIMENT SCORECARD/);
  assert.match(html, /COMPETITION METRIC/);
  assert.match(html, /ROC AUC/);
  assert.match(html, /Higher is better/);
  assert.match(html, /Score progression/);
  assert.match(html, /Line chart comparing validation or OOF/);
  assert.match(html, /private leaderboard is the primary score/i);
  assert.match(html, /Best score .* deployed model/);
  assert.match(html, /available backend memory and compute budget/);
  assert.match(html, /clear deployment choice[\s\S]*two-model blend/);
  assert.match(
    html,
    /<th scope="col">Public<\/th><th scope="col">Private<\/th>/,
  );
  assert.match(html, /LGBM without early stopping/);
  assert.match(html, /submission_xgb_oof_groupkfolds - 0\.94834\.csv/);
  assert.match(html, /0\.953876/);
  assert.match(html, /0\.93249/);
  assert.match(html, /PIT: accelerate tyre rotation/);
  assert.match(html, /Click to accelerate/);
  assert.match(html, /href="\/eda"/);
  assert.match(html, /href="\/model-lab"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("server-renders the EDA and model lab routes", async () => {
  const [edaResponse, modelResponse] = await Promise.all([
    render("/eda"),
    render("/model-lab"),
  ]);

  assert.equal(edaResponse.status, 200);
  assert.equal(modelResponse.status, 200);

  const [eda, model] = await Promise.all([
    edaResponse.text(),
    modelResponse.text(),
  ]);

  assert.match(eda, /DETAILED EXPLORATORY DATA ANALYSIS/);
  assert.match(eda, /Lap-by-lap, from raw data to a baseline/);
  assert.match(eda, /CATEGORICAL ANALYSIS/);
  assert.match(eda, /Chinese Grand Prix/);
  assert.match(eda, /NOTEBOOK CONCLUSION/);
  assert.match(eda, /Train vs test statistical profiles/);
  assert.match(eda, /Observed pit windows/);
  assert.match(eda, /LightGBM feature importance/);
  assert.match(eda, /Exact notebook data/);
  assert.match(eda, /LIVE ANALYSIS/);
  assert.match(eda, /id="eda-overview"/);
  assert.match(eda, /Go to Overview/);
  assert.match(eda, /Telemetry focus/);
  assert.match(eda, /SELECTED CIRCUIT/);
  assert.match(eda, /ACTIVE CHANNEL/);
  assert.doesNotMatch(eda, /\/eda\/\d{2}-[^"]+\.png/);
  assert.match(eda, /0\.89754/);
  assert.match(model, /Baseline Model Demo/);
  assert.match(model, /Ask the pit wall/);
  assert.match(model, /Trained model API/);
  assert.match(model, /Common pit window/);
  assert.match(model, /Run model prediction/);
  assert.match(model, /INPUT CONTEXT/);
});

test("keeps product styling and metadata free of starter references", async () => {
  const [layout, styles, packageJson, modelLab, appShell, telemetry, spinningTyre] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/interactive-model-lab.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/components/app-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/eda/eda-telemetry.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/spinning-tyre.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /PitWall AI/);
  assert.match(layout, /<AppShell>\{children\}<\/AppShell>/);
  assert.match(styles, /--navy:\s*#10213f/i);
  assert.match(styles, /@media \(max-width:\s*760px\)/);
  assert.match(styles, /\.page-frame[\s\S]*?overflow:\s*clip/);
  assert.match(appShell, /frameRef\.current\.scrollTop = 0/);
  assert.match(appShell, /window\.scrollTo\(\{ top: 0, left: 0/);
  assert.match(telemetry, /getBoundingClientRect\(\)\.top \+ window\.scrollY - 104/);
  assert.doesNotMatch(telemetry, /scrollIntoView/);
  assert.doesNotMatch(telemetry, /IntersectionObserver/);
  assert.match(telemetry, /getCurrentSectionIndex/);
  assert.match(telemetry, /requestAnimationFrame/);
  assert.match(telemetry, /window\.innerHeight \* 0\.22/);
  assert.match(telemetry, /behavior: "auto"/);
  assert.doesNotMatch(telemetry, /behavior: reducedMotion \? "auto" : "smooth"/);
  assert.match(telemetry, /String\(active\)\.padStart\(2, "0"\)/);
  assert.match(telemetry, /String\(index\)\.padStart\(2, "0"\)/);
  assert.match(telemetry, /sections\.length - 1/);
  assert.match(modelLab, /NEXT_PUBLIC_API_BASE_URL/);
  assert.match(modelLab, /\/api\/v1\/predict/);
  assert.match(modelLab, /cumulative_degradation/);
  assert.match(modelLab, /position_change/);
  assert.match(modelLab, /production LightGBM artifact/);
  assert.doesNotMatch(modelLab, /calculateIllustrativePrediction/);
  assert.match(modelLab, /setTyreBoost\(\(value\) => value \+ 1\)/);
  assert.match(spinningTyre, /setTimeout\(\(\) => setBoosting\(false\), 1500\)/);
  assert.match(spinningTyre, /spinning-tyre__rotor/);
  assert.match(styles, /@keyframes tyre-idle-spin/);
  assert.match(styles, /animation-duration:\s*0\.38s/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
