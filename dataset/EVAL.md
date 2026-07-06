# JaanchLo Engine Evaluation (auto-generated)

Engine: jaanchlo_app.html (via engine.mjs). Dataset: 3172 rows, golden holdout: 252.

## Headline metrics

| Metric | Golden | Overall |
|---|---|---|
| Scam recall (rated Danger or Be Careful, never Safe) | 100.0% | 100.0% |
| High-severity recall (danger-expected rated Danger) | 100.0% | 92.9% |
| Benign false-danger rate | 0.0% | 0.0% |
| Benign rated Safe | 100.0% | 88.9% |

## Per-family (overall)

| Family | n | not-Safe | Danger |
|---|---|---|---|
| digital_arrest | 336 | 100.0% | 100.0% |
| courier_parcel | 276 | 100.0% | 29.7% |
| upi_payment_fraud | 276 | 100.0% | 68.8% |
| investment_trading | 296 | 100.0% | 12.2% |
| job_task | 316 | 100.0% | 11.4% |
| impersonation_relationship | 256 | 100.0% | 100.0% |
| official_phishing | 260 | 100.0% | 29.6% |
| loan_app | 220 | 100.0% | 44.1% |

## Acceptance gate

- PASS: Golden scam recall (not Safe) >= 0.95 (actual 100.0%)
- PASS: Golden danger recall (Danger) >= 0.90 (actual 100.0%)
- PASS: Golden benign false-danger <= 0.08 (actual 0.0%)
- PASS: Overall scam recall (not Safe) >= 0.95 (actual 100.0%)
- PASS: Overall benign false-danger <= 0.08 (actual 0.0%)
- PASS: Golden danger recall >= 0.95 (post-calibration) (actual 100.0%)
- PASS: Overall danger recall >= 0.85 (post-calibration) (actual 92.9%)

**GATE PASSED**

_Note: `expected` tiers are authored in the templates (augment.mjs), independent of engine output, so these numbers are not circular. "scam recall" is the key safety metric: a scam must never be rated Safe._
