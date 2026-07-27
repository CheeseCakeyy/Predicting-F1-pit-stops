"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Overview", shortLabel: "01", icon: "◉" },
  { href: "/eda", label: "EDA", shortLabel: "02", icon: "▥" },
  { href: "/model-lab", label: "Model Lab", shortLabel: "03", icon: "⚗" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <Link className="brand-mark" href="/" aria-label="PitWall AI home">
          <span>P</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                className={`nav-link${active ? " nav-link--active" : ""}`}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-link__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <small>{item.shortLabel}</small>
              </Link>
            );
          })}
        </nav>

        <div className="side-nav__footer">
          <span>ML</span>
          <span>F1</span>
        </div>
      </aside>

      <div className="page-frame">
        <div className="track-line track-line--one" aria-hidden="true" />
        <div className="track-line track-line--two" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
