// Evaluate the shipping engine against the dataset. Non-circular: `expected` tiers are
// authored in the templates, not produced by the engine. Writes EVAL.md and gates on thresholds.
import fs from "fs";
import { detect } from "./engine.mjs";
const read=f=>fs.readFileSync(f,"utf8").trim().split("\n").filter(Boolean).map(l=>JSON.parse(l));

function metrics(rows){
  const scam=rows.filter(r=>r.expected==="danger"||r.expected==="scam");
  const danger=rows.filter(r=>r.expected==="danger");
  const benign=rows.filter(r=>r.expected==="benign");
  const v=r=>detect(r.text).verdict;
  const recallNotSafe=scam.filter(r=>v(r)!=="safe").length/Math.max(scam.length,1);
  const dangerRecall=danger.filter(r=>v(r)==="danger").length/Math.max(danger.length,1);
  const falseDanger=benign.filter(r=>v(r)==="danger").length/Math.max(benign.length,1);
  const benignSafe=benign.filter(r=>v(r)==="safe").length/Math.max(benign.length,1);
  return {n:rows.length,scam:scam.length,danger:danger.length,benign:benign.length,
    recallNotSafe,dangerRecall,falseDanger,benignSafe};
}
function perFamily(rows){
  const fams=[...new Set(rows.filter(r=>r.cat!=="benign").map(r=>r.cat))];
  return fams.map(f=>{const rr=rows.filter(r=>r.cat===f);const v=r=>detect(r.text).verdict;
    return {family:f,n:rr.length,notSafe:+(rr.filter(r=>v(r)!=="safe").length/rr.length).toFixed(3),
      danger:+(rr.filter(r=>v(r)==="danger").length/rr.length).toFixed(3)};});
}

const golden=read("dataset/splits/golden.jsonl");
const all=read("dataset/dataset.jsonl");
const g=metrics(golden), a=metrics(all);
const fam=perFamily(all);

// acceptance thresholds (from ROADMAP)
const gate=[
  ["Golden scam recall (not Safe) >= 0.95", g.recallNotSafe>=0.95, g.recallNotSafe],
  ["Golden danger recall (Danger) >= 0.90", g.dangerRecall>=0.90, g.dangerRecall],
  ["Golden benign false-danger <= 0.08", g.falseDanger<=0.08, g.falseDanger],
  ["Overall scam recall (not Safe) >= 0.95", a.recallNotSafe>=0.95, a.recallNotSafe],
  ["Overall benign false-danger <= 0.08", a.falseDanger<=0.08, a.falseDanger],
  ["Golden danger recall >= 0.95 (post-calibration)", g.dangerRecall>=0.95, g.dangerRecall],
  ["Overall danger recall >= 0.85 (post-calibration)", a.dangerRecall>=0.85, a.dangerRecall]
];
let fails=0;
const pct=x=>(x*100).toFixed(1)+"%";
let md=`# JaanchLo Engine Evaluation (auto-generated)\n\nEngine: jaanchlo_app.html (via engine.mjs). Dataset: ${all.length} rows, golden holdout: ${golden.length}.\n\n`;
md+=`## Headline metrics\n\n| Metric | Golden | Overall |\n|---|---|---|\n`;
md+=`| Scam recall (rated Danger or Be Careful, never Safe) | ${pct(g.recallNotSafe)} | ${pct(a.recallNotSafe)} |\n`;
md+=`| High-severity recall (danger-expected rated Danger) | ${pct(g.dangerRecall)} | ${pct(a.dangerRecall)} |\n`;
md+=`| Benign false-danger rate | ${pct(g.falseDanger)} | ${pct(a.falseDanger)} |\n`;
md+=`| Benign rated Safe | ${pct(g.benignSafe)} | ${pct(a.benignSafe)} |\n\n`;
md+=`## Per-family (overall)\n\n| Family | n | not-Safe | Danger |\n|---|---|---|---|\n`;
fam.forEach(f=>{md+=`| ${f.family} | ${f.n} | ${pct(f.notSafe)} | ${pct(f.danger)} |\n`;});
md+=`\n## Acceptance gate\n\n`;
gate.forEach(([label,passed,val])=>{ if(!passed)fails++; md+=`- ${passed?"PASS":"FAIL"}: ${label} (actual ${pct(val)})\n`; });
md+=`\n**${fails===0?"GATE PASSED":fails+" GATE CHECK(S) FAILED"}**\n`;
md+=`\n_Note: \`expected\` tiers are authored in the templates (augment.mjs), independent of engine output, so these numbers are not circular. "scam recall" is the key safety metric: a scam must never be rated Safe._\n`;
fs.writeFileSync("dataset/EVAL.md",md);
console.log(md);
process.exit(fails?1:0);
