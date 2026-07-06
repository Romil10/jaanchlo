# JaanchLo ROADMAP

**Mission:** A free, open-source scam shield for Indian elders and their families. Paste, forward, or describe anything suspicious and get a plain verdict in your own language, why it is suspicious, and exactly what to do next.

**North star:** an elder in Bengaluru, mid "digital arrest" call, opens JaanchLo on a cheap Android phone, answers four questions in Hindi, sees DANGER in red, hangs up, and calls 1930. Everything below serves that moment.

## Guiding constraints (non-negotiable)
1. Open: dataset (CC-BY-4.0), model (Apache-2.0), engine/app (AGPL-3.0) are public. At least one essential open component is the Sentient grant qualifier; we ship three.
2. Private by design: no accounts, no storage of user submissions, self-hostable, on-device as the v1 target.
3. Elder-first: three-tier verdicts (Safe / Be Careful / Danger), plain language, EN + HI at v0, 1930 one tap away.
4. Honest metrics: every claim traces to the golden test set. False-danger rate is a first-class metric; a shield that cries wolf gets uninstalled.
5. Derived from production: verdict methodology adapts Veriscore's IREM into SREM. Regnor opens the engine, not the business.

## Phases

### Phase 0 · Foundations [DONE 5 Jul 2026]
Taxonomy (8 India-specific scam families + benign class), SREM rubric v0.1 (5 evaluations, weighted signals, knockouts K1-K5, guards G1-G3), seed corpus (28 labeled EN/HI/Hinglish examples), provenance doc.

### Phase 1 · Dataset v0
Expand seed to 3,000+ labeled examples via templated + LLM augmentation across language (EN/HI/Hinglish + regional stubs), channel, tone, and amounts. Hold out a golden test set (~250) that never touches training. Publish to HuggingFace with a dataset card.
**Exit:** dataset public on HF; schema-valid; leakage-checked; distribution report published.

### Phase 2 · Engine core
Canonical InputEvent schema with per-channel adapters (text, screenshot OCR, audio transcript, checklist). Deterministic signal extractors (regex/keyword/heuristic) + LLM evaluation per SREM dimension + composite scoring + verdict + plain-language explanations in EN/HI. FastAPI service with /check/text, /check/image, /check/audio, /checklist.
**Exit:** engine passes unit + fixture tests; golden-set eval runs end to end from CLI.

### Phase 3 · Live-call checklist + evaluation hardening
"Am I being scammed right now?" guided flow (pure rules, works offline, instant). Calibrate weights against golden set; tune false-danger on benign controls.
**Exit:** acceptance metrics met (see Success metrics); eval table published.

### Phase 4 · Fine-tune (conditional ship)
LoRA fine-tune of a small open model (Qwen2.5-7B or Llama-3.x-8B class) for signal classification + rationale. Quantize. Ships only if it beats the prompted baseline on the golden set; otherwise ship baseline and log the fine-tune as ongoing work.
**Exit:** model card with honest benchmark table on HF (or documented deferral).

### Phase 5 · App (PWA)
Mobile-first PWA: four flows (check message, live-call checklist, check voice note, share-to-family), verdict UI with reasons, HI/EN toggle, 1930 button everywhere, zero login, zero submission storage.
**Exit:** deployed at a public URL; smoke, accessibility, and performance tests green on a 360px viewport.

### Phase 6 · Ship + grant evidence
Public repo (org account, licenses, honest README with limitations), CI running tests + eval on push, 2-3 min demo video, Drive sync of all artifacts, Sentient application drafted against the live form with every evidence link.
**Exit:** grant-evidence checklist 100% complete.

## Post-v0 (not in this build)
WhatsApp bot (Meta API), on-device Android (quantized, llama.cpp/MediaPipe), regional languages (TA/TE/BN/MR full support), voice-first IVR line, deepfake/voice-clone detection module, community report-a-scam loop feeding the dataset, distribution partnerships (senior-citizen orgs, RWAs, banks' customer-education teams).

## Success metrics (v0 acceptance)
| Metric | Target |
|---|---|
| Detection at Danger, digital_arrest + courier_parcel (golden) | ≥ 90% |
| Overall scam recall at Danger or Be Careful (golden) | ≥ 85% |
| False-danger rate on benign controls | ≤ 8% |
| Text-flow verdict latency, p95 | < 10 s |
| Checklist flow | works fully offline, < 1 s |
| Full flow usable in Hindi | yes |
| Runs in browser on a low-end Android (360px) | yes |

## Working agreement
Build and test in the Hyperagent sandbox (code must run to be tested). Google Drive folder "JaanchLo" is the synced source of truth for documents, data snapshots, and evidence; the git repo becomes canonical for code at Phase 6. If any phase slips, slip the schedule, never the honesty of the artifacts.
