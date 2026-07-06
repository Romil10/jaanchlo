# Licensing

JaanchLo uses a component-appropriate license split so each open component carries the right terms.

| Component | Path | License | File |
|---|---|---|---|
| Code (engine, app, scripts) | `engine/`, `app/`, `dataset/*.mjs` | GNU AGPL-3.0 | `LICENSE` |
| Dataset | `dataset/dataset.jsonl`, `dataset/splits/`, `seed_corpus.jsonl` | CC-BY-4.0 | `dataset/LICENSE` |
| Model (roadmap, not yet shipped) | `model/` | Apache-2.0 | `model/LICENSE` |

- **Code is AGPL-3.0** so improvements to a public-good safety tool stay open, including when run as a network service.
- **The dataset is CC-BY-4.0** to maximize reuse by researchers and other builders; attribution keeps provenance clear.
- **The model will be Apache-2.0** so anyone can run and build on it with minimal friction.

Attribution for the dataset: "JaanchLo Scam-Signal Dataset (CC-BY-4.0)".
