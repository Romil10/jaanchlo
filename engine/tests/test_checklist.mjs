// 3.1 checklist hardening: property-based over all 256 answer combos + specific paths.
import { checklistVerdict } from "../../dataset/engine.mjs";
import { ok, done } from "./_t.mjs";
const QS=["q_auth","q_iso","q_threat","q_pay","q_prize","q_link","q_family","q_channel"];
const rank={safe:0,care:1,danger:2};
const combo=i=>Object.fromEntries(QS.map((q,b)=>[q,(i>>b)&1]));
ok(checklistVerdict(combo(0)).tier==="safe","all-no answers -> safe");
let mono=true, singleCare=true;
for(let i=0;i<256;i++){
  const base=checklistVerdict(combo(i)).tier;
  for(let b=0;b<8;b++){
    if((i>>b)&1) continue;
    const up=checklistVerdict(combo(i|(1<<b))).tier;
    if(rank[up]<rank[base]) mono=false;
  }
}
ok(mono,"monotone over all 256 combos: adding a yes never lowers the tier");
for(let b=0;b<8;b++){ if(checklistVerdict(combo(1<<b)).tier!=="care") singleCare=false; }
ok(singleCare,"any single yes -> care (never safe, never instant danger)");
const t=(a)=>checklistVerdict(Object.fromEntries(a.map(k=>[k,1]))).tier;
ok(t(["q_auth","q_iso"])==="danger","authority + isolation -> danger (digital-arrest branch)");
ok(t(["q_iso","q_pay"])==="danger","isolation + payment -> danger");
ok(t(["q_family","q_pay"])==="danger","family emergency + payment -> danger");
ok(t(["q_prize","q_pay"])==="danger","prize + payment -> danger");
ok(t(["q_link","q_pay"])==="danger","link/app + payment -> danger");
ok(t(["q_auth","q_threat","q_pay"])==="danger","authority + threat + payment -> danger");
ok(t(["q_channel"])==="care","unknown-number call alone -> care");
ok(t(["q_auth","q_channel"])==="care","authority + channel only (no isolation/pay) -> care not danger");
ok(t(["q_auth","q_threat","q_prize","q_channel"])==="danger","4+ yes answers -> danger");
// pure function: no network, no engine text needed (structural)
import fs from "fs";
const src=fs.readFileSync(new URL("../../dataset/engine.mjs",import.meta.url),"utf8");
const fn=src.match(/function checklistVerdict\(a\)\{[\s\S]*?\n\}/)[0];
ok(!/detect\(|fetch|http|SIGNALS/.test(fn),"checklistVerdict is pure rules (no detect/network/signal deps)");
done("checklist");
