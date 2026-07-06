# JaanchLo Seed Corpus — Sources & Generation Method

## What this is
`seed_corpus.jsonl` is the Day-1 hand-built seed set (28 labeled examples) that anchors the taxonomy and SREM rubric. It is the calibration seed, NOT the training set. Day 2 expands it to ~3-5k via templated + synthetic augmentation across languages, tones, and channels, holding out a golden test set.

## Schema (one JSON object per line)
- id: stable string id
- category: one of the 8 taxonomy IDs or "benign"
- lang: en | hi | hinglish
- channel: sms | whatsapp | voice | video | ivr | app | instagram | telegram | marketplace | email
- text: the message or transcribed call snippet
- signals: list of SREM signal codes present (ground-truth labels for signal extractors)
- label: 1 = scam, 0 = benign
- note: annotator note / provenance

## Provenance of patterns (all from public reporting, paraphrased; no real victim PII)
- Digital arrest mechanics, isolation script, "refundable verification deposit": NITI Aayog "Digital Arrest: The Modern Day Cyber Scam" (2025); Frontline (Feb 2026); Supreme Court observations (2025-26).
- Courier/FedEx "parcel contains drugs" -> digital arrest bridge: BBC (May 2026), CyberPeace, Indian Express (Bengaluru cases), scamdekho.
- Electricity/PAN/bank phishing verbatim patterns and leetspeak: Economic Times, Truecaller, RTI Wiki (PAN-update 2026), ScamScan.
- UPI receive-QR / collect-request / return-money variants: RBI and I4C consumer advisories.
- Investment deepfake reels (Ambani/Tata/Sitharaman), "tax to withdraw": PIB Fact Check, RBI, Economic Times.
- YouTube-like / VIP prepaid task flow: KhelJa (Jun 2026) and I4C task-scam advisories.
- Loan-app harassment and morphed-photo extortion: I4C / RBI digital-lending guidance.
- Family emergency / voice clone / army-officer OLX QR: I4C advisories, reported cases.

## Honesty notes
- All example texts are paraphrased composites, not copied victim data.
- Hindi/Hinglish coverage is deliberately thin in the seed (1 hi, 10 hinglish) and is a Day-2 expansion priority; v0 ships EN + HI.
- One signal used in examples (content.morphed_media_threat) is a loan_app-specific extension of E5; fold into the rubric's E5 table in the next rubric revision.

## Verdict quick-map (from srem_rubric.md)
0-29 Safe (green) · 30-59 Be Careful (amber) · 60-100 Danger (red); knockouts K1-K5 force Danger; guards G1-G3 protect the benign class.
