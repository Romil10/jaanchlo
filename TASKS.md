# JaanchLo Build Task List (test-backed)

Every task names a concrete deliverable and the test that proves it works. "Proof" = an automated check I can run in the sandbox (pytest, a script asserting on outputs, a schema validator, an HTTP smoke test, a headless-browser check) that fails loudly if the thing is broken. Tests are written alongside code, not after.

Legend: [ ] todo · [x] done · (P#) phase · each task lists **Build** and **Proof**.

---

## Phase 0 · Foundations  [x]
- [x] 0.1 Taxonomy of 8 scam families + benign class. **Proof:** taxonomy.md present; a lint script asserts all 8 category IDs + benign are defined and every category has definition/skeleton/signals/next-step.
- [x] 0.2 SREM rubric v0.1. **Proof:** srem_rubric.md defines 5 evaluations, weights summing to 1.0, verdict thresholds, K1-K5, G1-G3.
- [x] 0.3 Seed corpus (28) + provenance. **Proof:** seed_corpus.jsonl parses as JSONL; every row schema-valid; every signal code referenced exists in the rubric.

## Phase 1 · Dataset v0
- [ ] 1.1 Freeze the canonical schema (`schema.py`: InputEvent, Signal enum, Example, Verdict). **Build:** pydantic models + a JSON Schema export. **Proof:** `pytest test_schema.py` — valid rows pass, malformed rows (bad lang, unknown signal, label not in {0,1}) raise; every signal code in the rubric is a member of the Signal enum (parity test).
- [ ] 1.2 Rubric-as-data (`rubric.yaml`) generated/derived from srem_rubric.md so code and doc cannot drift. **Proof:** `test_rubric_parity.py` asserts weights sum to 1.0, every signal has points 0-100, and the YAML signal set == Signal enum == rubric.md table (three-way parity).
- [ ] 1.3 Augmentation pipeline (`augment.py`): template + placeholder expansion (names, amounts in INR, UPI handles, phone prefixes, deadlines) and controlled LLM paraphrase across EN/HI/Hinglish + TA/TE/BN/MR stubs; preserves ground-truth signals per template. **Proof:** `test_augment.py` — generating from a template yields rows whose asserted signals match the template's declared signals; language tag matches detected script for HI/regional; no placeholder tokens leak into final text.
- [ ] 1.4 Generate dataset ≥ 3,000 examples; benign class ≥ 25%. **Build:** `dataset.jsonl` + `splits/{train,val,golden}.jsonl`. **Proof:** `test_dataset.py` — count ≥ 3000; every row schema-valid; category + label + lang distributions within target bands; benign ≥ 25%.
- [ ] 1.5 Leakage + dedup guard between golden and train. **Proof:** `test_leakage.py` — no exact or near-duplicate (normalized hash + high token-overlap) shared across golden and train; fails if any overlap.
- [ ] 1.6 Dataset card + publish to HuggingFace. **Build:** `DATASET_CARD.md`, upload script. **Proof:** card lint (required sections present: sources, licenses CC-BY-4.0, limitations, language breakdown); dry-run builds a valid `datasets`-loadable directory (loader smoke test) even if the actual push is deferred to when HF token is provided.

## Phase 2 · Engine core
- [ ] 2.1 Channel adapters -> InputEvent (`adapters/`: text, image_ocr, audio_transcript, checklist_answers). **Proof:** `test_adapters.py` — each adapter maps a raw fixture to a schema-valid InputEvent; OCR/audio adapters are dependency-injected so tests run with a stub transcriber (no network).
- [ ] 2.2 Deterministic signal extractors (`extractors.py`): regex/keyword/heuristic for UPI handles, intl prefixes, shortlinks, OTP/PIN asks, payment/authority/fear keyword families, in EN + romanized HI. **Proof:** `test_extractors.py` — golden-labeled seed rows: extractor precision/recall per signal ≥ agreed floor (recall ≥ 0.8 on high-weight signals); zero extraction on a benign control set for danger-only signals.
- [ ] 2.3 LLM evaluator (`evaluator.py`) per SREM dimension, behind an interface with a deterministic mock. **Proof:** `test_evaluator.py` — runs against the mock (no network) and returns per-dimension signal lists; a contract test asserts output shape and that unknown signals are rejected.
- [ ] 2.4 Composite scorer + verdict + knockouts/guards (`scoring.py`). **Proof:** `test_scoring.py` — table-driven cases: each knockout K1-K5 forces Danger; each guard G1-G3 caps/protects as specified; weight math matches rubric on hand-computed fixtures.
- [ ] 2.5 Explanation generator (`explain.py`): top-3 signals -> plain EN/HI sentences + category next-step + standing disclaimer. **Proof:** `test_explain.py` — output always includes verdict, ≤3 reasons, a next-step, the 1930 line for Danger, and contains no em dashes and no jargon terms from a banned-words list; HI output is non-empty when lang=hi.
- [ ] 2.6 FastAPI service (`app/api.py`) with /check/text, /check/image, /check/audio, /checklist, /health. **Proof:** `test_api.py` (FastAPI TestClient) — each endpoint returns 200 + schema-valid Verdict on fixtures; /health returns ok; malformed input returns 422; no submission is persisted (assert storage layer is never called).

## Phase 3 · Live-call checklist + evaluation hardening
- [ ] 3.1 Checklist flow (`checklist.py`): 4-6 branching questions per top scam family, pure-rules verdict, no network. **Proof:** `test_checklist.py` — the digital-arrest branch (impersonation + isolation + payment) yields Danger + hang-up/1930 script; a benign path yields Safe; runs with zero external calls.
- [ ] 3.2 End-to-end evaluation harness (`eval.py`) over the golden set -> metrics table (per-category detection, overall recall, false-danger, latency). **Proof:** `eval.py` writes `EVAL.md`; `test_eval_thresholds.py` asserts the ROADMAP acceptance targets are met and fails CI if any regressed.
- [ ] 3.3 Calibration pass: tune weights/thresholds in rubric.yaml to hit targets, re-run parity + eval. **Proof:** post-calibration `test_rubric_parity.py` still green AND `test_eval_thresholds.py` green (calibration cannot break the doc/code parity).

## Phase 4 · Fine-tune (conditional)
- [ ] 4.1 Training data prep from splits (instruction format: input -> signals+rationale). **Proof:** `test_finetune_data.py` — every training record well-formed; no golden leakage (reuses 1.5 guard).
- [ ] 4.2 LoRA fine-tune script + quantize (`train_lora.py`). **Proof:** a `--smoke` mode trains 1 step on 20 rows and asserts loss is finite and a checkpoint is written (proves the pipeline runs without a multi-hour job).
- [ ] 4.3 Benchmark fine-tune vs prompted baseline on golden. **Proof:** `bench.py` writes a comparison table; ship-gate test asserts we select whichever wins and record the decision in MODEL_CARD.md. Honest deferral allowed and logged.

## Phase 5 · App (PWA)
- [ ] 5.1 Next.js PWA scaffold, mobile-first, HI/EN toggle, installable manifest. **Proof:** `build` succeeds; `test_pwa_smoke` (Playwright headless) loads at 360px, asserts manifest + service worker registered.
- [ ] 5.2 Four flows wired to the API (check message, checklist, voice note, share-to-family via WhatsApp link). **Proof:** Playwright: pasting a seeded digital-arrest script renders a red DANGER verdict with reasons + 1930 button; the share button produces a valid wa.me link; checklist works with API stubbed.
- [ ] 5.3 Accessibility + elder-UX checks (font size, contrast, tap targets, 1930 always visible). **Proof:** automated axe-core run: 0 critical violations; test asserts base font ≥ 18px, verdict contrast ≥ 4.5:1, 1930 button present on every screen.
- [ ] 5.4 Privacy guarantee visible + true. **Proof:** test asserts no network call carries the submission to any analytics domain; README + UI state "no accounts, nothing stored," and a test confirms the backend has no persistence of inputs.

## Phase 6 · Ship + grant evidence
- [ ] 6.1 Repo hygiene: LICENSE files (dataset/model/code), READMEs with honest limitations, CONTRIBUTING. **Proof:** `test_repo_meta.py` — required files exist; README contains a "Limitations" and "This is a second opinion, not a guarantee" section; no em dashes.
- [ ] 6.2 CI (GitHub Actions): run all tests + eval thresholds on push. **Proof:** the workflow file exists and, run locally via `act` or a dry parse, invokes pytest + eval; a red eval fails the build.
- [ ] 6.3 Demo video script + recording checklist (2-3 min, shows a real digital-arrest script caught). **Proof:** `DEMO.md` present with a shot list that maps to working features; each shown feature has a passing test id next to it.
- [ ] 6.4 Sync everything to Google Drive "JaanchLo" folder + draft Sentient answers against the live form. **Proof:** Drive folder lists all artifacts; `GRANT_APPLICATION.md` answers every field with a link to the corresponding evidence artifact.

## Definition of Done (v0)
All Phase 1-6 tasks checked, `test_eval_thresholds.py` green against the acceptance table, PWA deployed and loading on a 360px viewport, three open components published (or publish-ready with dry-run proof), and the grant-evidence checklist complete.
