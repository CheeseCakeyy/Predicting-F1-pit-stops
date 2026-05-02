# 🏎️ lap-by-lap | Predicting F1 Pit Stops | Detailed EDA

> *"Box, box, box."* — The three words every F1 driver waits for.

This notebook presents a detailed Exploratory Data Analysis for the **Kaggle Playground Series S6E5** competition — predicting whether an F1 driver will pit on the next lap, using lap-level telemetry and tyre data.

---

## 📁 Dataset
| | |
|---|---|
| **Train size** | 439,140 rows |
| **Test size** | TBD |
| **Target** | `PitNextLap` (binary) |
| **Metric** | AUC |
| **Features** | 15 (tyre, timing, positional) |

---

## 📊 EDA Structure

| # | Section | Key Question |
|---|---|---|
| 1 | Target Distribution | How imbalanced is the dataset? |
| 2 | Missing Values | Are there nulls in train or test? |
| 3 | Feature Distributions | Do train and test look the same? |
| 4 | Feature vs Target | Which features separate pit from no-pit? |
| 5 | Correlation Analysis | What correlates most with `PitNextLap`? |
| 6 | Categorical Analysis | How do compound and year affect pit rate? |
| 7 | Pit Timing | When exactly do pit stops happen? |
| 8 | Degradation Analysis | Does tyre degradation predict pit stops? |
| 9 | Train/Test Drift | Will CV scores reflect leaderboard? |
| 10 | Race-Level Pit Rates | Which circuits are pit-heavy? |

---

## 🔍 Key EDA Findings

### 1. Class Imbalance
The dataset has an approximate **80:20 split** between non-pit and pit laps. This is manageable for AUC — the model only needs to rank pit laps above non-pit laps. A mild `scale_pos_weight=4` is sufficient; no aggressive resampling needed.

---

### 2. Strongest Predictors
| Feature | Pearson r | Interpretation |
|---|---|---|
| `TyreLife` | +0.27 | Older tyres → more likely to pit |
| `LapNumber` | +0.27 | Later in race → more likely to pit |
| `Stint` | +0.20 | Higher stint → likely a later stop |
| `RaceProgress` | +0.19 | Further into race → more likely to pit |
| `Cumulative_Degradation` | -0.17 | Higher degradation signals pit |
| `LapTime_Delta` | ~0.00 | No meaningful linear signal |

> ⚠️ `LapNumber` and `RaceProgress` are correlated at **0.96** — they carry near-identical information. Interaction terms will be more valuable than using these raw features independently.

---

### 3. Counterintuitive Compound Behavior
| Compound | Pit Rate |
|---|---|
| 🔴 HARD | 32.8% |
| 🟡 SOFT | 19.3% |
| 🔵 INTERMEDIATE | 15.2% |
| ⚪ MEDIUM | 10.1% |
| 💧 WET | 2.5% |

Hard tyres having the **highest pit rate** (vs Softs being lowest) defies real-world F1 logic and is likely a **synthetic data artifact**. Do not apply domain assumptions blindly — let the model learn directly from the data.

---

### 4. 🚨 The 2023 Anomaly
Year 2023 has a pit rate of only **~0.96%** vs **~28–30%** for all other years. This is a severe labelling or data collection issue. Almost all 2023 laps are labelled as non-pit, which will silently distort any model trained on it.

**Action:** Investigate 2023 presence in train vs test. If it only appears in train, **drop it entirely**.

---

### 5. Pit Timing Patterns
- Pit stops are spread broadly from **laps 5–55** — a mix of 1-stop and 2-stop strategies coexist
- Most stops occur in the **first 70% of race progress**
- Majority of drivers pit with **10–20 laps on the tyre** — stops become rare beyond 30 laps
- Tyre life distributions at pit time **heavily overlap across compounds** — compound alone is not a clean predictor of stint length

---

### 6. Degradation Signal is Inverted
`LapTime_Delta` is **negative across all TyreLife bins**, most negative on fresh tyres (-7.4s at 0–5 laps). This feature encodes pace relative to a reference, not lap-over-lap degradation. Traditional degradation intuition does not apply directly — **rolling rate-of-change** of `LapTime_Delta` will be more informative than the raw value.

---

### 7. No Train/Test Drift ✅
All features show **under 6% mean drift** between train and test (most under 1%). Local CV scores will be a reliable proxy for leaderboard performance. No distribution shift corrections needed.

---

### 8. 🚨 Pre-Season Testing in the Dataset
Pre-Season Testing appears as a "race" with **22,492 rows** and a 14.6% pit rate. Testing sessions have no strategic pit logic — teams pit freely for tyre programmes. This adds noise that doesn't reflect race behavior.

**Action:** Drop all Pre-Season Testing rows before training.

---

### 9. Race-Level Variability
| Highest Pit Rate | | Lowest Pit Rate | |
|---|---|---|---|
| Chinese GP | 38.9% | Mexico City GP | 9.1% |
| Monaco GP | 35.7% | Miami GP | 10.4% |
| Spanish GP | 32.0% | Italian GP | 13.2% |

High-pit circuits tend to be safety car prone (Chinese GP) or high-degradation. Low-pit circuits favour one-stop strategies. `Race` as a target-encoded feature could add meaningful signal.

---

## ✅ Action Items Before Modeling

| Priority | Action |
|---|---|
| 🔴 High | Investigate and likely **drop 2023 data** |
| 🔴 High | **Remove Pre-Season Testing** rows |
| 🔴 High | Use **year-based train/val split** — never random |
| 🟡 Medium | Encode `Compound` and `Race` (target encoding recommended) |
| 🟡 Medium | Fix `Cumulative_Degradation` plot (both classes same color) |
| 🟢 Low | No drift correction needed — all features safe to use as-is |

---

## 🛠️ Tech Stack
![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![Pandas](https://img.shields.io/badge/Pandas-2.0-lightblue?logo=pandas)
![Seaborn](https://img.shields.io/badge/Seaborn-0.13-teal)
![LightGBM](https://img.shields.io/badge/LightGBM-Baseline-green)
![Kaggle](https://img.shields.io/badge/Kaggle-PGS6E5-20BEFF?logo=kaggle)

---

## 📬 Author
Made with 🏁 for the Kaggle Playground Series S6E5

*The dataset is clean, well-structured, and free of missing values. The main risks going into modeling are the 2023 anomaly, the presence of testing data, and over-reliance on domain assumptions that this synthetic dataset does not honour.*
