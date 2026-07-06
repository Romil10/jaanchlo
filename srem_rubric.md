# SREM Rubric v0.1 (Scam Risk Evaluation Model)

The scam-specific sibling of Veriscore's IREM. Five evaluations, each scored 0-100 from weighted signals, combined into one composite and mapped to a three-tier verdict. Designed so a plain-language explanation falls out of the signals themselves.

## The five evaluations

### E1 · Authority Impersonation (weight 0.25)
Does the message/call claim an authority it is unlikely to be?
| Signal code | Description | Points |
|---|---|---|
| auth.police | Claims police/CBI/ED/NCB/customs/cyber cell | 60 |
| auth.judge | Claims judge/court/warrant/hearing | 60 |
| auth.courier | Claims FedEx/DHL/DTDC/BlueDart about an intercepted parcel | 45 |
| auth.bank | Claims bank/RBI action needed | 35 |
| auth.utility | Claims electricity/telecom/TRAI disconnection | 35 |
| auth.govt | Claims income tax/Aadhaar/UIDAI/PAN authority | 40 |
| auth.celebrity | Celebrity/known figure endorsing returns | 45 |
| auth.family_clone | Claims to be family/friend from a new or unknown number | 50 |

### E2 · Fear and Urgency Pressure (weight 0.25)
Is the person being rushed, isolated, or frightened out of verification?
| Signal code | Description | Points |
|---|---|---|
| fear.arrest_threat | Threat of arrest/case/jail | 55 |
| fear.isolation | "Do not tell family/lawyer/anyone", stay on camera | 65 |
| fear.deadline | Act tonight / within hours / offer expires | 30 |
| fear.account_block | Account/SIM/PAN/power will be blocked or cut | 35 |
| fear.legal_case | Case registered, money laundering, narcotics FIR | 45 |
| fear.emergency_urgency | Medical/police emergency of a loved one, send now | 45 |
| fear.shame_threat | Threat to circulate photos/expose to contacts | 60 |
| fear.sunk_cost_pressure | "Complete remaining tasks or lose your deposits" | 35 |

### E3 · Payment Red Flags (weight 0.25)
Is money being moved in a way legitimate actors never require?
| Signal code | Description | Points |
|---|---|---|
| pay.deposit_refundable | "Refundable" verification deposit / RBI escrow / bail bond | 65 |
| pay.tax_fee_unlock | Fee/tax to unlock your own money or winnings | 60 |
| pay.upi_individual | Payment to a personal UPI handle for an official service | 45 |
| pay.qr_to_receive | QR scan or PIN entry "to receive" money | 60 |
| pay.collect_request | Unexpected UPI collect request | 40 |
| pay.refund_return_ask | "Sent by mistake, return it" without bank confirmation | 40 |
| pay.small_payout_lure | Small real payouts preceding a deposit ask | 45 |
| pay.prepaid_task_deposit | Deposit required to access tasks/job/earnings | 55 |
| pay.fee_advance | Advance fee for loan/job/prize | 50 |
| pay.gift_card_crypto | Gift cards/crypto demanded | 55 |
| pay.screen_share | Screen-share or remote-access app requested | 60 |

### E4 · Channel and Identity Signals (weight 0.15)
Does the medium itself break how real institutions communicate?
| Signal code | Description | Points |
|---|---|---|
| chan.intl_number | +92/+84/+855 or odd prefixes for "Indian authority" | 45 |
| chan.video_call_official | Official proceeding conducted over WhatsApp/Skype video | 55 |
| chan.ivr_press1 | Robocall "press 1" routing to an agent | 35 |
| chan.app_switch | Pushed to download Skype/Zoom/"police app"/APK | 45 |
| chan.apk_download | App shared as APK or off-store link | 50 |
| chan.shortlink | Shortened/lookalike URL for sensitive action | 40 |
| chan.spoofed_sender | Sender ID mimicking official (ITDEPT etc.) but content fails E5 | 35 |
| chan.new_number_known_photo | Known person's photo on a brand-new number | 50 |
| chan.group_invite | Pushed into Telegram/WhatsApp earnings group | 35 |
| chan.personal_number_official | Official business conducted from a 10-digit personal number | 40 |

### E5 · Content Authenticity (weight 0.10)
Does the content itself look manufactured?
| Signal code | Description | Points |
|---|---|---|
| content.deepfake_media | Celebrity/official video with AV mismatch cues, investment pitch | 55 |
| content.voice_clone | Voice call suspected cloned (crying, muffled, refuses callback) | 50 |
| content.doctored_doc | Warrant/notice/ID image with real personal data | 50 |
| content.fake_screenshot | Payment-success screenshot instead of bank confirmation | 45 |
| content.typos_leetspeak | P0wer, b!II, misspellings evading filters | 30 |
| content.generic_greeting | "Dear customer", no name/consumer ID/masked account | 25 |
| content.otp_request | Any request to share OTP/PIN/CVV | 65 |
| content.too_good_returns | Guaranteed daily/weekly profit claims | 45 |

## Scoring

1. Per evaluation: sum matched signal points, cap at 100.
2. Composite = 0.25·E1 + 0.25·E2 + 0.25·E3 + 0.15·E4 + 0.10·E5.
3. Category prior: if the signal pattern matches a taxonomy category skeleton (2+ distinctive signals), add +10 and attach that category's explanation and next-step script.

## Verdict mapping

| Composite | Verdict | Color |
|---|---|---|
| 0-29 | Safe (सुरक्षित लग रहा है) | Green |
| 30-59 | Be Careful (सावधान रहें) | Amber |
| 60-100 | Danger (खतरा) | Red |

**Knockout rules (force Danger regardless of composite):**
- K1: any authority signal + pay.deposit_refundable or pay.tax_fee_unlock
- K2: fear.isolation + chan.video_call_official (digital arrest pattern)
- K3: content.otp_request from any unsolicited contact
- K4: pay.qr_to_receive in a receiving context
- K5: fear.shame_threat + any payment demand

**False-positive guards (protect benign class):**
- G1: Danger requires signals from at least 2 different evaluations (knockouts exempt).
- G2: presence of personalization (name, consumer ID, masked account) + official sender + no link/callback demand caps verdict at Be Careful unless a knockout fires.
- G3: family money requests with no new-number/voice-clone/isolation signals cap at Be Careful with a "verify by calling their saved number" tip.

## Output contract (every verdict)
1. Verdict tier + color.
2. Top 3 matched signals translated to plain language ("They claim to be police. Real police never video-call arrests.").
3. Category next-step script (from taxonomy).
4. Standing disclaimer: JaanchLo is a second opinion, not a guarantee. When unsure, verify independently and call 1930 for financial fraud.

## Explanation tone rules
Write for a worried 65-year-old, not an analyst: short sentences, no jargon, never blame the user, always give one concrete next action, and always in the user's chosen language (EN/HI at v0).
