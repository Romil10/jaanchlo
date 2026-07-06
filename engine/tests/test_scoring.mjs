// 2.4 table-driven: every knockout forces Danger; guards cap; weight math is exact.
import { detect, EVAL_W } from "../../dataset/engine.mjs";
import { ok, done } from "./_t.mjs";
const K=[
 ["K1","CBI officer says pay a refundable verification deposit now"],
 ["K2","Do not tell your family, stay on the Skype video call with the officer for verification"],
 ["K3","Please share the OTP you just received to confirm"],
 ["K4","Scan this QR code to receive your cashback payment"],
 ["K5","Pay Rs 5,000 now or we leak your morphed photo, transfer to this UPI"],
 ["K6","Beta I am in hospital emergency, paise bhejo abhi, kisi ko mat batana"],
 ["K7","You are under digital arrest, transfer money to clear your name"],
 ["K8","Congratulations you won the KBC lottery, pay registration fee to claim your prize"],
 ["K9","I am from SBI bank, install AnyDesk and share your screen to fix KYC"],
 ["K10","Hi dad this is my new number, I lost my phone, urgently transfer money to this UPI"]];
for(const [k,text] of K){ const r=detect(text); ok(r.knockout===k&&r.verdict==="danger",`${k} fires and forces danger (got ${r.knockout}/${r.verdict})`); }
// guards
const g2=detect("Dear Romil, Rs 2,340 debited from A/c XXXX3210 to BigBasket on 04-Jul.");
ok(g2.verdict!=="danger","G2: personalized bank alert never danger (got "+g2.verdict+")");
const g3=detect("Beta, thoda paise bhej dena is mahine, ghar ke kharche ke liye.");
ok(g3.verdict!=="danger","G3: plain family money ask capped below danger (got "+g3.verdict+")");
const floor=detect("Your electricity bill is pending, click bit.ly/pay-now to avoid disconnect tonight");
ok(floor.verdict!=="safe","floor: multi-signal scam text is never safe (got "+floor.verdict+")");
// exact weight math: craft text hitting exactly auth.bank (35, E1)
const m=detect("Contact your bank");
ok(m.per.E1===35&&m.score===Math.round(35*EVAL_W.E1),`weight math exact: E1=35 -> score ${Math.round(35*EVAL_W.E1)} (got ${m.score})`);
ok(m.verdict==="safe","single auth mention alone stays safe");
done("scoring");
