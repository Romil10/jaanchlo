// 2.5 explanation contract: <=5 reasons, 1930 on danger, no em dash, full EN/HI parity.
import { detect, SIGNALS } from "../../dataset/engine.mjs";
import { buildExplanation } from "../explain.mjs";
import { REASON, NEXT, TIER_LABEL } from "../explain_data.mjs";
import { ok, done } from "./_t.mjs";
const r=detect("CBI officer on Skype, do not tell family, pay refundable deposit, share OTP");
for(const lang of ["en","hi"]){
  const e=buildExplanation(r,lang);
  ok(e.tier==="danger","danger tier ("+lang+")");
  ok(e.reasons.length>0&&e.reasons.length<=5,`reasons 1..5 (${lang}, got ${e.reasons.length})`);
  ok(e.next_step.includes("1930"),`next step includes 1930 (${lang})`);
  ok(!JSON.stringify(e).includes("—"),`no em dash anywhere (${lang})`);
  ok(typeof e.tier_label==="string"&&e.tier_label.length>0,`tier label present (${lang})`);
}
// parity: every signal code has an EN and HI reason string
const codes=SIGNALS.map(s=>s[0]);
const missEn=codes.filter(c=>!REASON.en[c]), missHi=codes.filter(c=>!REASON.hi[c]);
ok(missEn.length===0,"REASON.en covers all "+codes.length+" signals (missing: "+(missEn.join(",")||"none")+")");
ok(missHi.length===0,"REASON.hi covers all "+codes.length+" signals (missing: "+(missHi.join(",")||"none")+")");
ok(["safe","care","danger"].every(t=>NEXT.en[t]&&NEXT.hi[t]&&TIER_LABEL.en[t]&&TIER_LABEL.hi[t]),"NEXT/TIER_LABEL cover all tiers in both languages");
const b=buildExplanation(detect("Beta kal ghar aa rahe ho na?"),"hi");
ok(b.tier!=="danger"&&b.next_step.length>0,"benign hi explanation well-formed");
done("explain");
