# JaanchLo Scam Taxonomy v0.1

India-specific taxonomy of the eight scam families JaanchLo detects, plus benign controls. Each category lists: definition, primary channels, the script skeleton (how it actually unfolds), distinctive signals, and the next-step script shown to the user on a Danger verdict.

Sources: I4C/1930 advisories, RBI and PIB Fact Check warnings, NITI Aayog "Digital Arrest: The Modern Day Cyber Scam" (2025), Supreme Court observations (2025-26), and reported cases in BBC, Indian Express, Economic Times, Frontline, CyberPeace, Truecaller (see sources_and_generation.md). Category IDs are stable; do not renumber.

---

## 01 · digital_arrest (डिजिटल अरेस्ट)
**Definition:** Impersonation of police/CBI/ED/NCB/customs/judges over voice or video call. Victim is accused of a crime, shown fake warrants or IDs, placed under "digital arrest" (stay on camera, do not leave, do not tell anyone), and coerced into transferring money as a refundable "verification deposit", "RBI escrow", or "bail bond".
**Channels:** voice call, then WhatsApp/Skype video call.
**Script skeleton:** unsolicited call or IVR → accusation (case registered, money laundering, parcel with drugs) → transfer to "senior officer" in uniform on video, mock police-station backdrop → fake warrant with victim's real Aadhaar/name → isolation ("do not inform family or lawyer, this is confidential national security matter") → hours of surveillance → transfer to "secure government account", promised refund after verification → repeat until funds exhausted.
**Distinctive signals:** auth.police, auth.judge, fear.arrest_threat, fear.isolation, chan.video_call_official, pay.deposit_refundable, content.doctored_doc.
**Key fact for explanations:** "Digital arrest" does not exist in Indian law. No agency arrests anyone over a phone or video call. (Rajasthan HC, Jan 2026; NITI Aayog 2025.)
**Next-step script:** Hang up now. Police never arrest over video calls. Do not transfer anything. Call 1930 and tell a family member immediately.

## 02 · courier_parcel (कूरियर पार्सल)
**Definition:** Fake FedEx/DHL/DTDC/BlueDart call claiming a parcel in the victim's name (to Taiwan/Iraq/Thailand/Cambodia) was intercepted with drugs, fake passports, or SIM cards. Bridges directly into digital_arrest.
**Channels:** IVR voice call ("press 1"), then video call.
**Script skeleton:** robocall "your FedEx package has been blocked, press 1" → agent recites victim's name and Aadhaar → parcel contains MDMA/passports/SIM cards, case in Andheri/Mumbai narcotics → call "transferred" to NCB/cyber cell → digital_arrest flow.
**Distinctive signals:** auth.courier, auth.police, fear.legal_case, chan.ivr_press1, chan.intl_number, chan.app_switch (download Skype/Zoom), pay.deposit_refundable.
**Key fact:** FedEx has publicly confirmed it never calls about parcels containing contraband and has no affiliation with law enforcement.
**Next-step script:** Hang up. Courier companies never call about drugs in parcels. Check tracking only on the official courier website. Call 1930 if you shared anything.

## 03 · official_phishing (सरकारी/बैंक फ़िशिंग)
**Definition:** SMS/WhatsApp impersonating a bank, electricity board, income tax, TRAI, or Aadhaar authority. Threatens account block, power disconnection "tonight", PAN deactivation, or SIM suspension unless the user clicks a link, calls a number, or updates KYC.
**Channels:** SMS, WhatsApp, email; often personal 10-digit numbers or spoofed sender IDs (ITDEPT, INCOMETX).
**Script skeleton:** generic-greeting message with urgency and deadline → shortlink to cloned portal or a "helpline" number → OTP/PAN/Aadhaar/card details harvested, or screen-share app installed → account drained.
**Distinctive signals:** auth.bank, auth.utility, auth.govt, fear.account_block, fear.deadline, chan.shortlink, chan.spoofed_sender, content.generic_greeting, content.typos_leetspeak, content.otp_request, pay.screen_share.
**Key fact:** Genuine utility/bank messages carry your name, consumer ID, or masked account number and never demand action via a personal mobile number or shortlink.
**Next-step script:** Do not click or call. Open your bank's or electricity board's official app yourself and check there. Real notices always show your consumer ID.

## 04 · upi_payment_fraud (UPI धोखाधड़ी)
**Definition:** Fraud abusing UPI mechanics and payment confusion: "money sent by mistake, please return", QR codes sent "to receive money" (scanning pays instead), fake cashback/refund links, collect-request spam, and fake payment screenshots to sellers.
**Channels:** UPI apps, WhatsApp, marketplace chats.
**Script skeleton (main variants):** (a) fake "wrong transfer" SMS then emotional call demanding return of money never sent; (b) buyer on OLX-type site sends QR "scan to receive payment"; (c) cashback/KYC link opens a collect request the victim approves; (d) seller shown a doctored payment-success screenshot.
**Distinctive signals:** pay.qr_to_receive, pay.collect_request, pay.refund_return_ask, content.fake_screenshot, fear.deadline (offer expires), chan.shortlink.
**Key fact:** You never need to scan a QR or enter a PIN to RECEIVE money. PIN and QR are only for paying.
**Next-step script:** Stop. Receiving money never needs a QR scan or PIN. Verify your actual bank balance in your own app, not from screenshots or callers.

## 05 · investment_trading (निवेश घोटाला)
**Definition:** Fake trading/crypto platforms marketed via deepfake celebrity reels (Ambani, Tata, Sitharaman), WhatsApp/Telegram "tips" groups seeded with shills, and polished fake apps. Small withdrawals are honored to build trust; large balances are then frozen behind "tax" or "low credit score" fees.
**Channels:** Instagram/Facebook ads, WhatsApp/Telegram groups, sideloaded APKs.
**Script skeleton:** deepfake reel or group invite → "guaranteed 5-10% daily" claims, profit screenshots → small deposit, quick payout honored → pressure to invest big → dashboard shows huge profit → withdrawal blocked pending "statutory tax"/"brokerage fee" → app and group vanish.
**Distinctive signals:** auth.celebrity, content.deepfake_media, content.too_good_returns, pay.small_payout_lure, pay.tax_fee_unlock, chan.apk_download, chan.group_invite.
**Key fact:** SEBI-registered entities never promise fixed daily returns; PIB and RBI have repeatedly flagged celebrity investment reels as deepfakes.
**Next-step script:** Do not deposit more. Real regulators never charge a fee to release your own money. Check the entity on SEBI's registry. Report the ad and call 1930.

## 06 · job_task (नौकरी/टास्क घोटाला)
**Definition:** Work-from-home "task" scams: paid to like YouTube videos or rate hotels, small real payouts first, then escalating "VIP prepaid tasks" requiring deposits that are never returned. Also fake HR asking for registration/training fees.
**Channels:** WhatsApp/Telegram cold messages, fake job portals.
**Script skeleton:** "I am from a digital marketing company, earn Rs 50 per like, Rs 2000-5000 daily from home" → 2-3 tasks paid genuinely (Rs 150-200) → moved to Telegram group full of shills posting earnings → "VIP prepaid task": deposit 5,000 get 7,000 → deposits escalate → "your score is low, pay tax to withdraw" → blocked.
**Distinctive signals:** pay.small_payout_lure, pay.prepaid_task_deposit, pay.tax_fee_unlock, content.too_good_returns, chan.group_invite, fear.sunk_cost_pressure.
**Key fact:** No legitimate employer pays you to like videos, and none asks for deposits to release your salary or earnings.
**Next-step script:** Stop paying. The earlier payouts were the bait. Block and report the number, keep screenshots, file at cybercrime.gov.in and call 1930.

## 07 · loan_app (लोन ऐप वसूली)
**Definition:** Predatory instant-loan apps that harvest contacts and photos, then extort: abusive recovery calls, threats to message the victim's contacts, and circulation of morphed/obscene photos. Also advance "processing fee" frauds for loans that never arrive.
**Channels:** sideloaded or short-lived Play Store apps, WhatsApp threats.
**Script skeleton:** instant loan with contacts/gallery permissions → repayment demanded at extreme interest within days → abuse and threats ("we will send your morphed photo to every contact") → payments extracted repeatedly; or upfront "processing fee" then no loan.
**Distinctive signals:** fear.shame_threat, content.morphed_media_threat, pay.fee_advance, chan.apk_download, fear.deadline.
**Key fact:** RBI-regulated lenders never collect via threats or demand fees on personal UPI handles; morphed-photo extortion is a crime to report, not a debt to pay.
**Next-step script:** Do not pay. Revoke the app's permissions and uninstall. Save the threats as evidence, report at cybercrime.gov.in and 1930. You will not be shamed; you are the victim here.

## 08 · impersonation_relationship (रिश्ते की आड़ में)
**Definition:** Impersonation of people the victim trusts: "son/daughter in emergency" calls (increasingly AI voice clones), WhatsApp accounts with a relative's photo asking for urgent money, fake army officers buying vehicles on OLX, long-con romance investment ("pig butchering").
**Channels:** voice calls, WhatsApp with stolen display pictures, marketplace chats, dating apps.
**Script skeleton (variants):** (a) "Beta hospital/police station mein hoon, abhi paise bhejo, kisi ko mat batana" with a cloned or crying voice; (b) new number + relative's photo: "phone kho gaya, is number pe transfer karo"; (c) "Army officer, posted in border area, CRPF canteen" buys scooter sight-unseen, sends QR "for advance"; (d) online romance leading to a "profitable platform".
**Distinctive signals:** auth.family_clone, content.voice_clone, fear.emergency_urgency, fear.isolation, pay.upi_individual, pay.qr_to_receive, chan.new_number_known_photo.
**Key fact:** A real emergency survives one verification call. Always call the person's original saved number before sending anything.
**Next-step script:** Pause. Call the family member's own saved number right now to verify. Real emergencies allow one phone call. Never send money to a new number, even with a familiar photo.

## 00 · benign (safe control class)
**Definition:** Genuine messages that superficially resemble scams and MUST NOT trigger Danger: real bank OTP and KYC reminders (with masked account, official sender ID, no links or branch-visit instructions), genuine electricity bills with consumer ID, real delivery notifications, EMI reminders from registered lenders, family requests for money that are verifiable, government advisories.
**Purpose:** false-positive control. A shield that cries wolf gets uninstalled. Target: under 5-10% false-danger on this class.
