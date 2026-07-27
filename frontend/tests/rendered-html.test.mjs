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
  assert.match(html, /439,140/);
  assert.match(html, /LightGBM \+ RealMLP/);
  assert.match(html, /0\.95328/);
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
  assert.doesNotMatch(eda, /\/eda\/\d{2}-[^"]+\.png/);
  assert.match(eda, /0\.89754/);
  assert.match(model, /Best Model Demo/);
  assert.match(model, /Ask the pit wall/);
  assert.match(model, /Frontend simulation/);
  assert.match(model, /Common pit window/);
  assert.match(model, /Run illustrative prediction/);
  assert.match(model, /WHY THIS RESULT/);
});

test("keeps product styling and metadata free of starter references", async () => {
  const [layout, styles, packageJson, modelLab] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/interactive-model-lab.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(layout, /PitWall AI/);
  assert.match(layout, /<AppShell>\{children\}<\/AppShell>/);
  assert.match(styles, /--navy:\s*#10213f/i);
  assert.match(styles, /@media \(max-width:\s*760px\)/);
  assert.match(modelLab, /calculateIllustrativePrediction/);
  assert.match(modelLab, /2023 triggers the dataset anomaly warning/);
  assert.match(modelLab, /not the trained model API/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
