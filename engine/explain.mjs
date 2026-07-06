// Plain-language explanation builder. Mirrors the app's renderVerdict logic exactly.
import { SIGNALS, FAMILY } from "../dataset/engine.mjs";
import { REASON, NEXT, TIER_LABEL } from "./explain_data.mjs";
const PTS=Object.fromEntries(SIGNALS.map(s=>[s[0],s[2]]));
export function buildExplanation(res,lang){
  const L=(lang==="hi")?"hi":"en";
  const reasons=res.codes.slice().sort((a,b)=>(PTS[b]||0)-(PTS[a]||0)).slice(0,5)
    .map(c=>REASON[L][c]).filter(Boolean);
  return {
    tier:res.verdict,
    tier_label:TIER_LABEL[L][res.verdict],
    score:res.score,
    family:res.family||null,
    family_label:res.family?FAMILY[res.family][L]:null,
    knockout:res.knockout||null,
    per_evaluation:res.per,
    signals:res.codes,
    reasons,
    next_step:NEXT[L][res.verdict],
    disclaimer:L==="hi"
      ?"JaanchLo एक दूसरी राय है, गारंटी नहीं। संदेह हो तो पैसे न दें, 1930 पर कॉल करें।"
      :"JaanchLo is a second opinion, not a guarantee. When unsure, do not pay, and call 1930."
  };
}
