# Pit-stop prediction backend

This directory will contain the prediction API and its deployable model
artifacts.

The baseline LightGBM notebook writes its production artifacts to
`backend/artifacts/`. Generate them by running the notebook through its
**Export backend artifacts** section.

Expected files:

- `baseline_lgbm.txt` — native LightGBM booster
- `metadata.json` — feature order, categorical mappings, model details, and
  integrity information
- `smoke_test.json` — one raw request and its expected probability

Do not use a pickled estimator for deployment. The native model and JSON
metadata are smaller, safer to load, and less tightly coupled to a specific
scikit-learn version.

