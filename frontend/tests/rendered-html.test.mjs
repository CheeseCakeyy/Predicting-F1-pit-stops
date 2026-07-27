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

  assert.match(eda, /Exploratory Data Analysis/);
  assert.match(eda, /What makes a lap look pit-bound/);
  assert.match(eda, /2023 anomaly/);
  assert.match(model, /Best Model Demo/);
  assert.match(model, /Ask the pit wall/);
  assert.match(model, /Demo Status|DEMO STATUS/);
});

test("keeps product styling and metadata free of starter references", async () => {
  const [layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /PitWall AI/);
  assert.match(layout, /<AppShell>\{children\}<\/AppShell>/);
  assert.match(styles, /--navy:\s*#10213f/i);
  assert.match(styles, /@media \(max-width:\s*760px\)/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
