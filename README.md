# Predicting F1 Pit Stops

This project predicts whether a Formula 1 driver will pit on the next lap using lap-level race, tyre, timing, degradation, and position data from the Kaggle Playground Series S6E5 competition.

The target variable is `PitNextLap`, making this a binary classification problem evaluated with AUC. The project includes exploratory analysis, baseline modeling, feature-engineering experiments, model blending, and generated Kaggle submissions.

## Project Goal

Predict whether a Formula 1 driver will pit on the next lap.

## Project Structure

```text
Predicting-F1-pit-stops/
|-- Data/
|   |-- train.csv
|   |-- test.csv
|   `-- sample_submission.csv
|-- Detailed EDA report/
|   |-- lap-by-lap-predicting-pit-stops-detailed-eda.ipynb
|   `-- README.md
|-- Experiments/
|   |-- lap-by-lap-s5e6-detailed-eda-baseline-lgbm.ipynb
|   |-- oof_blend_mlp_X_lgbm.ipynb
|   |-- pitstop_pred_xgb_groupkfold_oof.ipynb
|   |-- realmlp_stkf_fe.ipynb
|   `-- xgb_stratified_fe.ipynb
|-- backend/
|   |-- app/
|   |-- artifacts/
|   |-- tests/
|   `-- requirements.txt
|-- frontend/
|   |-- app/
|   |-- public/
|   `-- package.json
|-- Submissions/
|   |-- submission-baseline-lgbm-0.93576.csv
|   |-- submission_xgb_oof_groupkfolds - 0.94834.csv
|   |-- submission_xgb_stratified_fe - lb 0.95032.csv
|   |-- submission_realmlp_fe - lb-0.95259.csv
|   `-- submission_blend_lgbm_realmlp - lb - 0.95328.csv
`-- README.md
```

## Data

The training data contains 439,140 lap-level rows. Each row describes the current lap state for a driver, including:

- Driver identifier
- Tyre compound
- Race name
- Year
- Current pit-stop count
- Lap number
- Stint
- Tyre life
- Track position
- Lap time
- Lap-time delta
- Cumulative degradation
- Race progress
- Position change
- `PitNextLap` target

The `Data/` directory is ignored by Git because competition datasets can be large and should usually be downloaded locally from Kaggle instead of committed.

## Exploratory Analysis

The detailed EDA notebook studies target balance, feature distributions, train/test drift, pit timing, tyre-life behavior, compound effects, year effects, race-level variability, and basic modeling direction.

Main findings:

- `PitNextLap` is imbalanced at roughly an 80:20 non-pit to pit ratio.
- `TyreLife`, `LapNumber`, `Stint`, and `RaceProgress` are among the strongest raw predictors.
- `LapNumber` and `RaceProgress` are highly redundant.
- 2023 behaves anomalously, with a much lower pit rate than other years.
- Pre-Season Testing rows likely add noise because they do not follow normal race strategy.
- Train and test distributions are broadly aligned, so local validation should be meaningful.
- Race identity contains useful strategy signal because pit rates vary substantially by circuit.

See [Detailed EDA report/README.md](Detailed%20EDA%20report/README.md) for the full EDA summary.

## Modeling Approach

The notebooks explore several modeling strategies:

- LightGBM baseline
- XGBoost with stratified feature engineering
- XGBoost with GroupKFold out-of-fold validation
- RealMLP with feature engineering
- Out-of-fold blending between neural and tree-based models

The submission filenames indicate leaderboard-oriented iterations, moving from a LightGBM baseline around 0.93576 to stronger feature-engineered and blended submissions around 0.95+.

## Validation Strategy

The EDA suggests avoiding a naive random split because the dataset is lap-based and time-dependent. A year-aware, race-aware, or grouped validation strategy is more appropriate for estimating generalization.

Recommended validation ideas:

- Use year-based validation to test temporal robustness.
- Use race or driver grouping where leakage is a concern.
- Compare local AUC against leaderboard movement before trusting a split.
- Keep out-of-fold predictions for blending experiments.

## Feature Engineering Ideas

Promising feature areas from the EDA:

- Rolling change in `LapTime_Delta`
- Interactions between `TyreLife`, `LapNumber`, and `RaceProgress`
- Encoded `Race` and `Compound`
- Stint-level aggregates
- Driver-level and race-level historical pit tendencies
- Flags for anomalous years or session types

## How to Run

1. Download the Kaggle competition data.
2. Place `train.csv`, `test.csv`, and `sample_submission.csv` in `Predicting-F1-pit-stops/Data/`.
3. Open the notebooks in Jupyter or Kaggle.
4. Run the EDA notebook first to understand the data.
5. Run experiments from the `Experiments/` directory.
6. Save generated predictions in `Submissions/`.

## Prediction application

The interactive application uses two independently deployable services:

- The Vinext frontend in `frontend/`.
- The FastAPI prediction service in `backend/`.

The backend exposes `GET /health` and `POST /api/v1/predict`. It verifies the
native LightGBM model, metadata checksum, feature contract, and exported smoke
test during startup. The model is loaded once and inference is limited to one
CPU thread.

Run the backend from `backend/`:

```bash
python -m venv .venv
pip install -r requirements-dev.txt
python -m app
```

Run the frontend from `frontend/`:

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` for local frontend
integration. In deployment, replace it with the public HTTPS origin of the
FastAPI service.

## Dependencies

The notebooks use common data science and modeling packages:

- Python
- pandas
- NumPy
- Matplotlib
- Seaborn
- scikit-learn
- LightGBM
- XGBoost

Some experiments may require additional notebook-specific packages such as RealMLP.

## Experiment Scores

The competition metric was ROC AUC. Kaggle evaluated submissions on a hidden leaderboard split with 80% of the test data used for the private score and 20% used for the public score.

| Experiment / Submission | Related File | Validation / OOF ROC AUC | Private ROC AUC | Public ROC AUC | Notes |
|---|---|---:|---:|---:|---|
| LGBM + RealMLP blend | `submission_blend_lgbm_realmlp - lb - 0.95328.csv` | 0.953876 | 0.95369 | 0.95328 | Best saved submission; OOF blend used 42.5% LGBM and 57.5% RealMLP |
| RealMLP with feature engineering | `submission_realmlp_fe - lb-0.95259.csv` | 0.953105 | 0.95315 | 0.95259 | 6-fold StratifiedKFold OOF; mean fold AUC 0.953109 |
| LGBM with feature engineering | `submission_lgbm_fe.csv` | 0.952511 | 0.95256 | 0.95237 | OOF score loaded in the blend notebook |
| XGBoost with feature engineering | `submission_xgb_stratified_fe - lb 0.95032.csv` | 0.950752 | 0.95068 | 0.95032 | 5-fold StratifiedKFold OOF; mean fold AUC 0.950761 |
| XGBoost OOF GroupKFold | `submission_xgb_oof_groupkfolds - 0.94834.csv` | 0.929780 | 0.94878 | 0.94834 | 5-fold GroupKFold by race; mean fold AUC 0.929450 |
| Baseline EDA LightGBM notebook | `submission-baseline-lgbm-0.93576.csv` | 0.897540 | 0.93609 | 0.93576 | Year-holdout validation using 2025 as validation |
| Baseline LGBM submission | `submission.csv` | 0.895500 | 0.93609 | 0.93576 | Baseline predictions, LGBM; experiment notebook year-holdout validation |
| LGBM without early stopping | `submission (1).csv` | N/A | 0.93265 | 0.93249 | No validation score found in the checked notebooks |

The current best saved submission is:

```text
submission_blend_lgbm_realmlp - lb - 0.95328.csv
```

## Notes

This is a synthetic competition dataset, so real-world F1 assumptions should be treated carefully. The most reliable improvements are likely to come from validation discipline, session cleanup, robust encoding, rolling features, and model blending.
