"use client";

import { useEffect, useRef } from "react";

type ChartExperiment = {
  name: string;
  shortName: string;
  oof: number | null;
  privateScore: number;
  publicScore: number;
};

type ScoreKey = "oof" | "privateScore" | "publicScore";

const chartFloor = 0.89;
const chartCeiling = 0.96;
const gridScores = [0.96, 0.94, 0.92, 0.9, 0.89];
const series: Array<{
  key: ScoreKey;
  color: string;
  width: number;
}> = [
  { key: "oof", color: "#7b71ba", width: 2.2 },
  { key: "publicScore", color: "#607086", width: 2.2 },
  { key: "privateScore", color: "#f15a54", width: 3.6 },
];

function deltaLabel(current: number | null, previous: number | null) {
  if (current === null || previous === null) return "—";
  const delta = current - previous;
  if (Math.abs(delta) < 0.000005) return "±0.00000";
  return `${delta > 0 ? "+" : ""}${delta.toFixed(5)}`;
}

export function ExperimentScoreChart({
  experiments,
}: {
  experiments: ChartExperiment[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const plot = {
        left: 50,
        right: width - 20,
        top: 18,
        bottom: height - 52,
      };
      const plotWidth = plot.right - plot.left;
      const plotHeight = plot.bottom - plot.top;
      const xFor = (index: number) =>
        plot.left + (plotWidth * index) / (experiments.length - 1);
      const yFor = (score: number) =>
        plot.top +
        ((chartCeiling - score) / (chartCeiling - chartFloor)) * plotHeight;

      context.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.textAlign = "right";
      context.textBaseline = "middle";
      gridScores.forEach((score) => {
        const y = yFor(score);
        context.beginPath();
        context.setLineDash([4, 5]);
        context.strokeStyle = "rgba(16, 33, 63, 0.13)";
        context.lineWidth = 1;
        context.moveTo(plot.left, y);
        context.lineTo(plot.right, y);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = "rgba(16, 33, 63, 0.48)";
        context.fillText(score.toFixed(2), plot.left - 8, y);
      });

      series.forEach(({ key, color, width: lineWidth }) => {
        context.beginPath();
        let lineStarted = false;
        experiments.forEach((experiment, index) => {
          const score = experiment[key];
          if (score === null) return;
          const x = xFor(index);
          const y = yFor(score);
          if (!lineStarted) {
            context.moveTo(x, y);
            lineStarted = true;
          } else {
            context.lineTo(x, y);
          }
        });
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.stroke();

        experiments.forEach((experiment, index) => {
          const score = experiment[key];
          if (score === null) return;
          const x = xFor(index);
          const y = yFor(score);
          context.beginPath();
          context.arc(x, y, key === "privateScore" ? 4.8 : 3.7, 0, Math.PI * 2);
          context.fillStyle = "#fffdf8";
          context.fill();
          context.strokeStyle = color;
          context.lineWidth = key === "privateScore" ? 2.8 : 2;
          context.stroke();
        });
      });

      context.fillStyle = "#10213f";
      context.font = "700 10px system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "top";
      experiments.forEach((experiment, index) => {
        context.fillText(experiment.shortName, xFor(index), plot.bottom + 14);
      });
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [experiments]);

  return (
    <div className="experiment-line-chart">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Line chart comparing validation or OOF, private, and public ROC AUC across eight experiments. Private score is the primary highlighted series. The axis runs from 0.89 to 0.96."
      />
      <div className="experiment-line-chart__changes">
        {experiments.map((experiment, index) => {
          const previous = experiments[index - 1];
          return (
            <article key={experiment.name}>
              <strong>{experiment.shortName}</strong>
              {previous ? (
                <div>
                  <span className="is-public">
                    Public{" "}
                    {deltaLabel(experiment.publicScore, previous.publicScore)}
                  </span>
                  <span className="is-private">
                    Private{" "}
                    {deltaLabel(
                      experiment.privateScore,
                      previous.privateScore,
                    )}
                  </span>
                  <span className="is-oof">
                    OOF {deltaLabel(experiment.oof, previous.oof)}
                  </span>
                </div>
              ) : (
                <small>Starting point</small>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
