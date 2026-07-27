# Lap-by-Lap Predicting F1 Pit Stops: Detailed EDA

> "Box, box, box." The three words every F1 driver waits for.

This notebook presents a detailed exploratory data analysis for the Kaggle Playground Series S6E5 competition. The task is to predict whether a Formula 1 driver will pit on the next lap using lap-level race, tyre, timing, and position data.

## Dataset

| Item | Value |
|---|---|
| Train size | 439,140 rows |
| Target | `PitNextLap` |
| Metric | AUC |
| Problem type | Binary classification |
| Feature groups | Driver, compound, race, year, stint, tyre life, timing, degradation, race progress, position |

## EDA Structure

| # | Section | Key Question |
|---|---|---|
| 1 | Target distribution | How imbalanced is the dataset? |
| 2 | Basic overview | Are there missing values or schema issues? |
| 3 | Feature distributions | Do train and test look similar? |
| 4 | Feature vs target | Which features separate pit and non-pit laps? |
| 5 | Correlation analysis | What correlates most with `PitNextLap`? |
| 6 | Categorical analysis | How do compound and year affect pit rate? |
| 7 | Pit timing | When do pit stops happen? |
| 8 | Degradation analysis | Does tyre degradation predict stops cleanly? |
| 9 | Train/test drift | Will validation likely reflect leaderboard behavior? |
| 10 | Race-level pit rates | Which circuits are pit-heavy or pit-light? |
| 11 | Baseline modeling | How does a LightGBM baseline perform after EDA? |

## Key EDA Findings

### 1. Class Imbalance

The target is imbalanced with an approximate 80:20 split between non-pit and pit laps. This is manageable for AUC because the model mainly needs to rank pit laps above non-pit laps. Mild class weighting is likely enough; aggressive resampling is not required as a first step.

### 2. Strongest Predictors

| Feature | Pearson r | Interpretation |
|---|---:|---|
| `TyreLife` | 0.27 | Older tyres are more likely to be followed by a pit stop |
| `LapNumber` | 0.27 | Later laps are more likely to be near pit windows |
| `Stint` | 0.20 | Higher stints often indicate later strategy phases |
| `RaceProgress` | 0.19 | Further race progress increases pit probability |
| `Cumulative_Degradation` | -0.17 | Higher degradation signal appears with a negative sign |
| `LapTime_Delta` | ~0.00 | Raw delta has little linear signal |

`RaceProgress` and `LapNumber` are highly correlated at about 0.96, so they carry near-identical information. Interaction features and rolling features are likely more useful than relying on all raw timing columns independently.

### 3. Counterintuitive Compound Behavior

| Compound | Pit Rate |
|---|---:|
| HARD | 32.8% |
| SOFT | 19.3% |
| INTERMEDIATE | 15.2% |
| MEDIUM | 10.1% |
| WET | 2.5% |

Hard tyres have the highest pit rate, while soft tyres are lower than expected. This does not match typical real-world F1 intuition and is likely influenced by the synthetic competition data. The model should learn from the dataset directly instead of relying too heavily on domain assumptions.

### 4. The 2023 Anomaly

Year 2023 has a pit rate of roughly 0.96%, while other years are closer to 28-30%. This is a severe anomaly and could distort model training if handled blindly.

Action: investigate 2023 in both train and test before final modeling. If 2023 is train-only or behaves unlike the target distribution expected at inference time, consider dropping or isolating it.

### 5. Pit Timing Patterns

- Pit stops are spread broadly from laps 5-55, suggesting mixed one-stop and two-stop strategies.
- Most stops occur in the first 70% of race progress.
- Many drivers pit with 10-20 laps on the tyre.
- Stops become rare after roughly 30 laps on a tyre.
- Tyre-life distributions at pit time overlap heavily across compounds, so compound alone is not enough to determine stint length.

### 6. Degradation Signal Is Inverted

`LapTime_Delta` is negative across all tyre-life bins, with the most negative values on fresh tyres. This suggests the feature is encoded relative to a reference pace rather than as a simple lap-over-lap degradation measure.

Action: use rolling rate-of-change features for `LapTime_Delta` instead of trusting the raw value as a direct degradation proxy.

### 7. Low Train/Test Drift

Numeric feature means are broadly aligned between train and test. The largest drift observed is around 5%, with most features much lower. This suggests local validation should be a reasonable proxy for leaderboard performance.

### 8. Pre-Season Testing Noise

Pre-Season Testing appears in the data with many rows and a meaningful pit rate. Testing sessions do not follow the same strategic pit-stop logic as races, so they can add noise.

Action: remove Pre-Season Testing rows before training race-strategy models.

### 9. Race-Level Variability

| Highest Pit Rate | Pit Rate | Lowest Pit Rate | Pit Rate |
|---|---:|---|---:|
| Chinese GP | 38.9% | Mexico City GP | 9.1% |
| Monaco GP | 35.7% | Miami GP | 10.4% |
| Spanish GP | 32.0% | Italian GP | 13.2% |

Race identity carries useful strategy signal. A label-encoded or target-encoded `Race` feature could improve model performance.

## Action Items Before Modeling

| Priority | Action |
|---|---|
| High | Remove Pre-Season Testing rows |
| High | Investigate and possibly isolate or remove anomalous 2023 rows |
| High | Use a time-aware or year-based validation split instead of a random split |
| Medium | Encode `Compound` and `Race`, with target encoding worth testing |
| Medium | Add rolling and interaction features around tyre life, lap number, and lap-time delta |
| Low | Skip train/test drift correction unless later experiments show a problem |

## Notebook Contents

The notebook covers:

- Data loading and schema checks
- Target distribution
- Numeric feature distributions
- Feature-vs-target plots
- Correlation heatmap
- Compound, year, and race-level pit rates
- Pit timing and tyre-life analysis
- Degradation behavior
- Train/test drift checks
- Baseline LightGBM modeling
- Final prediction and submission generation

## Tech Stack

- Python
- pandas
- NumPy
- Matplotlib
- Seaborn
- LightGBM
- Kaggle notebooks

## Summary

The dataset is clean, structured, and mostly stable between train and test. The main modeling risks are the anomalous 2023 rows, Pre-Season Testing noise, redundant time-progress features, and misleading real-world assumptions caused by the synthetic nature of the competition data.
