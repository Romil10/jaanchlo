// 2.2 extractor recall vs the hand-authored seed corpus (authored Day 1, independent of engine),
// plus zero knockouts on benign controls.
import fs from "fs";
import { detect, SIGNALS } from "../../dataset/engine.mjs";
import { ok, done } from "./_t.mjs";
const enumSet=new Set(SIGNALS.map(s=>s[0]));
const rows=fs.readFileSync(new URL("../../seed_corpus.jsonl",import.meta.url),"utf8").trim().split("\n").map(JSON.parse);
let asserted=0,hit=0; const unknown=new Set(), misses=[];
for(const r of rows.filter(x=>x.label===1)){
  const det=new Set(detect(r.text).codes);
  for(const s of r.signals){ if(!enumSet.has(s)){unknown.add(s);continue;} asserted++; if(det.has(s))hit++; else misses.push(s+" :: "+r.text.slice(0,50)); }
}
const recall=hit/Math.max(asserted,1);
console.log("  micro-recall on hand-authored signals:",(recall*100).toFixed(1)+"% ("+hit+"/"+asserted+"), unknown codes skipped:",[...unknown].join(",")||"none");
if(misses.length) console.log("  misses:\n   "+misses.slice(0,8).join("\n   "));
ok(recall>=0.9,"extractor micro-recall >= 90% on seed corpus (got "+(recall*100).toFixed(1)+"%)");
let benignKO=0;
for(const r of rows.filter(x=>x.label===0)){ if(detect(r.text).knockout) benignKO++; }
ok(benignKO===0,"zero knockouts fire on benign seed rows (got "+benignKO+")");
done("extractors");
