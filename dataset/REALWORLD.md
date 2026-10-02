# Real-world wording check

`realworld.jsonl` holds 107 hand-written messages (64 scams, 43 genuine) in the everyday wording people actually receive in India, in English, Hindi and Hinglish. They were written independently of the templates in `augment.mjs`, to catch rules that only fit template phrasing. They are not field data.

## Method
Each batch was written and scored before any rule changed, then the misses were used to make general fixes (structural rules and synonyms, never per-message patches), then the batch was added to this file.

## Results scored before tuning (the honest estimate)
| Batch | Engine | Scams never Safe | Clear scams rated Danger | Genuine rated Danger |
|---|---|---|---|---|
| 1 (36 scams, 25 genuine) | v0.2 | 33/36 | 11/31 | 0/25 |
| 2 (18 scams, 12 genuine) | v0.2 | 15/18 | 3/16 | 0/12 |
| 2 | v0.3 draft | 16/18 | 11/16 | 0/12 |
| 3 (10 scams, 6 genuine) | v0.3 | 8/10 | 6/9 | 0/6 |

## What changed in v0.3
- Structural rules K13 to K20: institution + threat + action (link, number, keypad, app, OTP); pay-to-receive; mistaken-credit refund; courier + criminal case; guaranteed returns + group or app; recruiter + per-task pay; police or court + case + payment; photo-shaming + loan or payment.
- A kinship word such as beta, papa or uncle only counts when it comes with money, urgency, secrecy or a new number.
- Genuine transaction alerts (masked account or consumer ID, no threat, no link, no payment ask) are rated Safe.
- Fixed a word-boundary bug that stopped "deactivated" and "disconnection" from matching.
- Wider vocabulary for threats (frozen, restricted, locked, cut off, kaat diya), keypad prompts (any digit), QR or PIN to receive or return money, and photo-shaming.

## Gate (CI)
`eval_realworld.mjs`: every scam not Safe, Danger recall at least 90%, zero genuine messages rated Danger, at least 90% of clearly genuine messages rated Safe. Current: 100%, 94.6%, 0, 100%.

## Known limits
A rule engine catches recurring structures but can miss scams written in vocabulary it has never seen. Three batch-3 scams still rate Be careful rather than Danger. JaanchLo remains a second opinion, not a guarantee.
