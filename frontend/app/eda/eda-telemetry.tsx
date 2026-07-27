"use client";

import { useEffect, useMemo, useState } from "react";

const sections = [
  ["eda-overview", "Overview"],
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
    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      setActive(getCurrentSectionIndex());
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("eda-focus-mode", focusMode);
    return () => document.documentElement.classList.remove("eda-focus-mode");
  }, [focusMode]);

  const progress = useMemo(
    () => (active / (sections.length - 1)) * 100,
    [active],
  );

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(sections.length - 1, index));
    const pageFrame = document.querySelector<HTMLElement>(".page-frame");
    if (pageFrame) pageFrame.scrollTop = 0;
    setActive(next);

    if (next === 0) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
      return;
    }

    const target = document.getElementById(sections[next][0]);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 104;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "auto",
    });
  };

  return (
    <aside className="eda-telemetry" aria-label="EDA telemetry navigation">
      <header>
        <span>LIVE ANALYSIS</span>
        <i aria-hidden="true" />
      </header>

      <div className="eda-telemetry__current" aria-live="polite">
        <small>
          {String(active).padStart(2, "0")} / {sections.length - 1}
        </small>
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
            <span>{String(index).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <div className="eda-telemetry__actions">
        <button
          type="button"
          onClick={() => goTo(Math.min(active, getCurrentSectionIndex()) - 1)}
          disabled={active === 0}
          aria-label="Previous analysis section"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => goTo(Math.max(active, getCurrentSectionIndex()) + 1)}
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

function getCurrentSectionIndex() {
  const activationLine = Math.min(150, window.innerHeight * 0.22);
  let current = 0;

  for (let index = 0; index < sections.length; index += 1) {
    const node = document.getElementById(sections[index][0]);
    if (!node) continue;
    if (node.getBoundingClientRect().top <= activationLine) current = index;
    else break;
  }

  const atPageEnd =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 4;

  return atPageEnd ? sections.length - 1 : current;
}
