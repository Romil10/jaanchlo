# Phase 2 Results: Engine Module + CI Gate (6 Jul 2026)

Phase 2 packaged the JaanchLo engine as a standalone, tested, servable module. Zero external dependencies (the sandbox has no pip/npm), Node stdlib only, so every test actually runs.

## Architecture: the app stays the single source of truth
`engine/extract.mjs` regenerates `dataset/engine.mjs` (detector) and `engine/explain_data.mjs` (all EN/HI verdict copy) directly from `jaanchlo_app.html`. Code and copy cannot drift from the shipped product; the CI gate re-extracts on every run.

## Modules
| File | What it is |
|---|---|
| schema.mjs | InputEvent/Verdict validation; signal enum loaded from rubric.json |
| adapters.mjs | text / image_ocr / audio_transcript / checklist -> canonical InputEvent; OCR and transcription are dependency-injected (tests run offline; production does OCR on-device) |
| evaluator.mjs | Pluggable evaluator interface: RuleEvaluator (wraps shipping detector) + MockLLMEvaluator (deterministic; rejects unknown signal codes, the contract any future LLM evaluator must obey) |
| explain.mjs | Explanation builder mirroring the app: tier, score, family, per-evaluation bars, top-5 reasons, next step, disclaimer, EN/HI |
| server.mjs | Zero-dep HTTP API: POST /check/text, /check/image, /check/audio, /checklist, GET /health. Privacy contract: no body logging, no disk writes (statically verified by test) |
| gate.mjs | One-command CI gate: extract -> engine tests -> dataset integrity -> eval thresholds |
| .github/workflows/ci.yml | Same gate wired for GitHub Actions at repo setup |

## Test results (all green)
| Suite | Checks | Result |
|---|---|---|
| test_adapters | 9 | PASS |
| test_scoring (K1-K10 table-driven, guards, exact weight math) | 15 | PASS |
| test_explain (contract + full 48-signal EN/HI parity + no em dashes) | 14 | PASS |
| test_extractors (recall vs hand-authored seed corpus) | 2 (81.7% micro-recall, floor 70%; 0 knockouts on benign) | PASS |
| test_api (live server, 200/400/422/404, privacy static checks) | 11 | PASS |
| Dataset integrity | 10 | PASS |
| Eval thresholds | 5 | PASS |

CI gate: **PASSED** (extract + 51 engine checks + 10 dataset checks + 5 eval thresholds).

## Honest notes
- Three seed-corpus signal codes are not in the engine enum (chan.spoofed_sender, fear.sunk_cost_pressure alias, content.voice_clone). Known gap, listed by the test output; voice-clone detection needs audio-side work (roadmap), the other two are naming aliases to reconcile in the next rubric revision.
- Extractor misses logged by the test (e.g., video-call proximity on two seed rows) are tracked for Phase 3 calibration; the eval gate thresholds are the binding quality bar.
- /check/image and /check/audio accept extracted text per the adapter contract; server-side OCR/transcription is intentionally absent (privacy: extraction happens on-device).

## Run it
```
node engine/gate.mjs        # full CI gate
node engine/server.mjs      # start the API (PORT env, default 8787)
node engine/tests/run_all.mjs
```
