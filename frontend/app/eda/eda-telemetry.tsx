"use client";

import { useEffect, useMemo, useState } from "react";

const sections = [
  ["target", "Target"],
  ["distributions", "Profiles"],
  ["feature-target", "Signals"],
  ["correlation", "Relations"],
  ["categorical", "Categories"],
  ["timing", "Timing"],
  ["degradation", "Degradation"],
  ["drift", "Drift"],
  ["races", "Races"],
  ["baseline", "Model"],
] as const;

export function EdaTelemetry() {
  const [active, setActive] = useState(0);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const nodes = sections
      .map(([id]) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = sections.findIndex(([id]) => id === visible.target.id);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.15, 0.4] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("eda-focus-mode", focusMode);
    return () => document.documentElement.classList.remove("eda-focus-mode");
  }, [focusMode]);

  const progress = useMemo(
    () => ((active + 1) / sections.length) * 100,
    [active],
  );

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(sections.length - 1, index));
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById(sections[next][0])?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <aside className="eda-telemetry" aria-label="EDA telemetry navigation">
      <header>
        <span>LIVE ANALYSIS</span>
        <i aria-hidden="true" />
      </header>

      <div className="eda-telemetry__current" aria-live="polite">
        <small>{String(active + 1).padStart(2, "0")} / 10</small>
        <strong>{sections[active][1]}</strong>
      </div>

      <div className="eda-telemetry__progress" aria-hidden="true">
        <i style={{ height: `${progress}%` }} />
      </div>

      <div className="eda-telemetry__dots">
        {sections.map(([id, label], index) => (
          <button
            type="button"
            className={index === active ? "is-active" : ""}
            onClick={() => goTo(index)}
            aria-label={`Go to ${label}`}
            aria-current={index === active ? "step" : undefined}
            key={id}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <div className="eda-telemetry__actions">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous analysis section"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === sections.length - 1}
          aria-label="Next analysis section"
        >
          ↓
        </button>
      </div>

      <button
        type="button"
        className={`eda-telemetry__focus${focusMode ? " is-active" : ""}`}
        onClick={() => setFocusMode((value) => !value)}
        aria-pressed={focusMode}
      >
        <span>Telemetry focus</span>
        <i />
      </button>
    </aside>
  );
}
