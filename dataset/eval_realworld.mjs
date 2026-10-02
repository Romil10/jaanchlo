// Held-out realistic test set (dataset/realworld.jsonl). Authored independently of the
// templates in augment.mjs, in everyday wording, to catch rules that only fit template phrasing.
// These are hand-written examples, not field data. Gates (see bottom) are part of the CI gate.
import fs from "fs";
import { detect } from "./engine.mjs";
const rows=fs.readFileSync(new URL("./realworld.jsonl",import.meta.url),"utf8").trim().split("\n").map(l=>JSON.parse(l));
const scams=rows.filter(r=>r.label==="scam"), benign=rows.filter(r=>r.label==="benign");
const fails=[];
let scamNotSafe=0, dangerHit=0, dangerExp=0, benignDanger=0, benignSafeHit=0, benignSafeExp=0;
for(const r of rows){
  const v=detect(r.text).verdict; r.got=v;
  if(r.label==="scam"){
    if(v!=="safe") scamNotSafe++; else fails.push(r);
    if(r.expect==="danger"){ dangerExp++; if(v==="danger") dangerHit++; else if(v!=="safe") fails.push(r); }
  } else {
    if(v==="danger"){ benignDanger++; fails.push(r); }
    if(r.expect==="safe"){ benignSafeExp++; if(v==="safe") benignSafeHit++; else if(v!=="danger") fails.push(r); }
  }
}
const m={scamRecallNotSafe:scamNotSafe/scams.length, dangerRecall:dangerHit/dangerExp, benignFalseDanger:benignDanger/benign.length, benignSafeRate:benignSafeHit/benignSafeExp};
const pct=x=>(100*x).toFixed(1)+"%";
console.log(`Real-world set: ${scams.length} scams, ${benign.length} benign`);
for(const [k,v] of Object.entries(m)) console.log(`  ${k}: ${pct(v)}`);
if(process.argv.includes("--show")) for(const r of fails) console.log(`  MISS ${r.id} expected ${r.expect} got ${r.got}: ${r.text.slice(0,90)}`);
const gates=[
  ["Real-world scam recall (not Safe) >= 1.00", m.scamRecallNotSafe>=1.0],
  ["Real-world danger recall >= 0.90", m.dangerRecall>=0.90],
  ["Real-world benign false-danger = 0", m.benignFalseDanger===0],
  ["Real-world clearly-benign rated Safe >= 0.90", m.benignSafeRate>=0.90]
];
let bad=0; for(const [n,ok] of gates){ console.log((ok?"PASS ":"FAIL ")+n); if(!ok) bad++; }
if(!process.argv.includes("--report")) process.exit(bad?1:0);
