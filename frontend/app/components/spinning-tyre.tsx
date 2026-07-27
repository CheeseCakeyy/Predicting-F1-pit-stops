"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function SpinningTyre({
  label,
  variant,
  boostKey = 0,
}: {
  label: string;
  variant: "overview" | "result";
  boostKey?: number;
}) {
  const [boosting, setBoosting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMounted = useRef(false);

  const boost = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBoosting(false);

    window.requestAnimationFrame(() => {
      setBoosting(true);
      timeoutRef.current = setTimeout(() => setBoosting(false), 1500);
    });
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    boost();
  }, [boost, boostKey]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <button
      type="button"
      className={`spinning-tyre spinning-tyre--${variant}${
        boosting ? " is-boosting" : ""
      }`}
      onClick={boost}
      aria-label={`${label}: accelerate tyre rotation`}
      title="Click to accelerate"
    >
      <span className="spinning-tyre__rotor" aria-hidden="true" />
      <span className="spinning-tyre__hub">{label}</span>
      <small aria-hidden="true">{boosting ? "PUSH" : "IDLE"}</small>
    </button>
  );
}
