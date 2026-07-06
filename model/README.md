# JaanchLo Model (roadmap)

This directory is reserved for the fine-tuned open model (Apache-2.0): a small, quantized LLM that classifies scam signals and produces plain-language rationales on-device.

**Status: not yet shipped.** The current engine is heuristic + rubric (see `../engine/`), which is what the published evaluation numbers reflect. The model ships only if it beats the prompted/rule baseline on the golden set; the benchmark comparison will be published here as `MODEL_CARD.md`.
