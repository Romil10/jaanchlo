# JaanchLo (जांच लो: "check it first")

[![CI](https://github.com/Romil10/jaanchlo/actions/workflows/ci.yml/badge.svg)](https://github.com/Romil10/jaanchlo/actions/workflows/ci.yml)
[![code: AGPL-3.0](https://img.shields.io/badge/code-AGPL--3.0-blue.svg)](LICENSE)
[![dataset: CC-BY-4.0](https://img.shields.io/badge/dataset-CC--BY--4.0-green.svg)](dataset/LICENSE)

**Try it in your browser:** https://jaanchlo.regnor.systems (no install, no account, runs on your device)

A free, open-source scam shield for Indian elders and their families. Paste a message, upload a screenshot, or answer a few questions, and get a plain verdict in your own language: what it is, why it is suspicious, and exactly what to do next.

> JaanchLo is a second opinion, not a guarantee. When unsure, do not pay, and call the national cyber-fraud helpline **1930**.

## Why this exists
Digital-arrest scams alone took an estimated **Rs 1,935 crore** from Indians in 2024 (123,672 cases); total cybercrime losses hit **Rs 22,845 crore**, and victims are disproportionately elderly. The everyday defense today is awareness posters and a helpline. Existing open-source scam detectors are hackathon-grade, English-first, cloud-dependent, and blind to India-specific patterns like digital arrest, UPI tricks, and deepfake investment reels. JaanchLo is built for exactly that gap.

## What it does
The **SREM engine** (Scam Risk Evaluation Model) scores a message across five dimensions (Authority, Fear, Payment, Channel, Content) over 48 signals, applies 12 hard "knockout" rules and false-alarm guards, then returns one of three elder-simple verdicts with plain-language reasons:

- 🟢 **Safe** · 🟠 **Be Careful** · 🔴 **Danger**

It recognizes 8 India-specific scam families: digital arrest, courier/parcel, bank & official phishing, UPI payment fraud, investment/deepfake reels, job/task/prize, loan-app extortion, and family impersonation. English, Hindi, and Hinglish. Four ways in: check a message, a live-call checklist ("am I being scammed now?"), a screenshot (on-device OCR), and a voice-note transcript.

## Quick start
```bash
# Run the full CI gate (extract + engine tests + dataset integrity + eval thresholds)
node engine/gate.mjs

# Start the local API (no dependencies, Node stdlib only)
node engine/server.mjs         # POST /check/text | /check/image | /check/audio | /checklist ; GET /health

# Regenerate + evaluate the dataset
node dataset/augment.mjs && node dataset/test_dataset.mjs && node dataset/eval.mjs
```
The app (`app/jaanchlo_app.html`) is a single self-contained file; open it in any browser. Append `#selftest` to run the in-app test suite.

## How good is it (measured, not claimed)
Evaluated against a 3,172-row labeled dataset with a 252-row golden holdout that shares no templates with training. Metrics use severity tiers **authored in the templates, independent of the engine** (not circular):

| Metric | Golden | Overall |
|---|---|---|
| Scam recall (never rated Safe) | 100% | 100% |
| High-severity recall (rated Danger) | 100% | 92.9% |
| Benign false-danger rate | 0.0% | 0.0% |

The false-danger rate is the metric we guard hardest: a shield that cries wolf gets uninstalled.

## Repository layout
```
app/            self-contained PWA (SREM engine in the browser, on-device OCR, EN/HI)
engine/         standalone engine module: schema, adapters, evaluator, explain, HTTP server, tests, CI gate
dataset/        rubric.json, generator, 3,172-row dataset + splits, integrity + eval gates, DATASET_CARD
taxonomy.md     the 8 scam families, signals, and next-step scripts
srem_rubric.md  the SREM scoring model
ROADMAP.md      phases and acceptance metrics
```
The app is the single source of truth: `engine/extract.mjs` regenerates the engine module and all verdict copy from `app/jaanchlo_app.html`, so code and product cannot drift. The CI gate re-extracts on every run.

## Open components (three, all here)
1. **Dataset** (`dataset/`, CC-BY-4.0): An India-first scam-message corpus in EN/HI/Hinglish; nothing like it exists publicly.
2. **Engine** (`engine/` + `app/`, AGPL-3.0): The SREM detector, adapters, API, and tests.
3. **Rubric** (`dataset/rubric.json`): the transparent, inspectable scoring model.

A fine-tuned open model is on the roadmap (`model/`, Apache-2.0) and not yet shipped.

## Honest limitations
- The dataset is **templated augmentation** grounded in public advisories (I4C, RBI, PIB, NITI Aayog) and reported cases, not messages harvested from real victims. Field data is the next step.
- Detection is heuristic + rubric today; an LLM evaluator and fine-tuned model are the next phase.
- Voice-clone and sender-ID-spoofing detection need audio and message metadata respectively, and are out of scope for text-only analysis (roadmap).
- Regional languages beyond Hindi (Tamil, Telugu, Bengali, Marathi) are not yet covered.
- This tool does not block, intercept, or report scams for you. It gives you a fast, explainable second opinion.

## Privacy
No account. Nothing you paste is stored or sent to any server: the app runs on your device, and the reference API neither logs request bodies nor writes them to disk (verified by test).

## Licenses
See `LICENSES.md`. Code AGPL-3.0, dataset CC-BY-4.0, model (when shipped) Apache-2.0.

## Contributing
See `CONTRIBUTING.md`. The bar for any change: `node engine/gate.mjs` stays green.

## Acknowledgements
Built in Bengaluru. Verdict methodology derives from the IREM engine behind Veriscore (Regnor). Detection approach informed by Andrej Karpathy's public writing on LLM-native systems and by India's public cyber-fraud advisories.
