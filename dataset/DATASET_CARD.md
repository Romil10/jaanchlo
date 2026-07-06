# JaanchLo Scam-Signal Dataset v0.2

An open, India-first labeled corpus of scam and benign messages for training and evaluating scam-detection systems, across English, Hindi, and Hinglish. Built for the JaanchLo public-good scam shield.

- **License:** CC-BY-4.0
- **Size:** 3,172 labeled examples
- **Languages:** English (1,588), Hinglish (952), Hindi/Devanagari (632)
- **Balance:** 70.5% scam / 29.5% benign
- **Splits:** train 2,482 · val 438 · golden 252 (held out by construction, see below)

## Schema (one JSON object per line)
`id, template, cat, lang, expected, golden, text, engine_verdict, engine_score, engine_family, engine_knockout, signals[]`

- `cat`: one of 8 scam families or `benign`.
- `expected`: authored severity floor for evaluation. `danger` = must be flagged Danger; `scam` = must not be rated Safe; `benign` = must not be flagged Danger. Authored from the template design, **independent of the engine**, so eval is not circular.
- `signals[]`: SREM signal codes the shipping engine detected (see rubric.json).

## Scam families and counts
| Family | Rows |
|---|---|
| digital_arrest | 336 |
| job_task (incl. prize/lottery) | 316 |
| investment_trading (incl. deepfake reels) | 296 |
| courier_parcel | 276 |
| upi_payment_fraud | 276 |
| official_phishing | 260 |
| impersonation_relationship | 256 |
| loan_app | 220 |
| benign (controls) | 936 |

## How it was built
Templated augmentation (`augment.mjs`, seeded, reproducible, zero external deps). Each scam family and the benign class has multiple hand-authored template strings in EN/HI/Hinglish. Templates are expanded with realistic placeholder pools (names, INR amounts, banks, couriers, cities, UPI handles, celebrities, shortlinks) plus randomized reference/case/account/OTP numbers, then deduplicated. Every generated row is auto-labeled with signals by the **shipping engine** (`engine.mjs`, extracted verbatim from jaanchlo_app.html) so the dataset's signal vocabulary can never drift from the product.

## Golden split integrity (no leakage)
The golden holdout is created **by construction**: a fixed subset of templates is tagged `golden:true` and those templates are excluded entirely from train/val. `test_dataset.mjs` verifies (1) no template appears in both golden and train/val, and (2) no golden text appears verbatim in train/val. Both pass.

## Evaluation of the current engine (see EVAL.md)
Non-circular: measured against authored `expected` tiers.
| Metric | Golden | Overall |
|---|---|---|
| Scam recall (never rated Safe) | 100.0% | 95.3% |
| High-severity recall (Danger) | 92.4% | 68.4% |
| Benign false-danger rate | 0.0% | 0.0% |
| Benign rated Safe | 100.0% | 94.6% |

Building this set materially improved the product: it exposed a UPI-handle normalization bug and large Hindi payment/content detection gaps that the earlier 37-case suite missed. Fixing them lifted overall scam recall from 80.4% to 95.3% with zero benign false alarms.

## Known limitations (honest)
- **Templated, not field-collected.** These are realistic synthetic variants grounded in patterns from public advisories (I4C, RBI, PIB, NITI Aayog) and reported cases, not messages harvested from real victims. Real-world phrasing is more varied; field data is the next step.
- **High-severity (Danger) recall is deliberately conservative** (68% overall): many real scams are correctly rated "Be Careful" rather than "Danger" until a payment or isolation signal is explicit. Scam recall (never-Safe) is the safety-critical metric and is the one held to 95%.
- Regional languages beyond Hindi (Tamil, Telugu, Bengali, Marathi) are not yet represented.
- Labels are engine-derived for `signals`; `expected` tiers are human-authored per template.

## Files
`dataset.jsonl` (full), `splits/{train,val,golden}.jsonl`, `rubric.json` (48 signals, weights, 10 knockouts, guards), `augment.mjs` (generator), `engine.mjs` (shared engine), `test_dataset.mjs` (integrity gate), `eval.mjs` (metrics gate), `EVAL.md`, `distribution_report.json`.

## Reproduce
```
node dataset/augment.mjs        # regenerate dataset + splits + distribution report
node dataset/test_dataset.mjs   # integrity gate (exits non-zero on failure)
node dataset/eval.mjs           # engine evaluation gate vs authored expectations
```
