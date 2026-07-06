// Dataset integrity tests (stdlib Node). Exits non-zero on any failure = a real gate.
import fs from "fs";
const read=f=>fs.readFileSync(f,"utf8").trim().split("\n").filter(Boolean).map(l=>JSON.parse(l));
const all=read("dataset/dataset.jsonl");
const train=read("dataset/splits/train.jsonl");
const val=read("dataset/splits/val.jsonl");
const golden=read("dataset/splits/golden.jsonl");
const rubric=JSON.parse(fs.readFileSync("dataset/rubric.json","utf8"));
const rubricCodes=new Set(rubric.signals.map(s=>s.code));

let fails=0; const ok=(c,m)=>{console.log((c?"PASS":"FAIL")+"  "+m); if(!c)fails++;};
const norm=t=>t.toLowerCase().replace(/\s+/g," ").trim();

// 1. schema
const LANGS=new Set(["en","hi","hinglish"]), EXP=new Set(["danger","scam","benign"]);
let schemaOk=true;
for(const r of all){ if(!r.id||!r.cat||!LANGS.has(r.lang)||!EXP.has(r.expected)||!r.text||!Array.isArray(r.signals)) {schemaOk=false;break;} }
ok(schemaOk,"every row is schema-valid (id, cat, lang, expected, text, signals[])");

// 2. size
ok(all.length>=3000,`total >= 3000 (got ${all.length})`);

// 3. benign share
const benignShare=all.filter(r=>r.cat==="benign").length/all.length;
ok(benignShare>=0.25 && benignShare<=0.35,`benign share in [0.25,0.35] (got ${benignShare.toFixed(3)})`);

// 4. splits sum to total, no id overlap
const ids=new Set(); let dup=false;
for(const r of [...train,...val,...golden]){ if(ids.has(r.id))dup=true; ids.add(r.id); }
ok(!dup && (train.length+val.length+golden.length)===all.length,"splits partition the dataset with no duplicate ids");

// 5. golden templates fully held out (leakage by template)
const trainTpl=new Set([...train,...val].map(r=>r.template));
const goldenTpl=new Set(golden.map(r=>r.template));
const tplOverlap=[...goldenTpl].filter(t=>trainTpl.has(t));
ok(tplOverlap.length===0,`no template shared between golden and train/val (overlap: ${tplOverlap.join(",")||"none"})`);

// 6. leakage by text: no golden text appears verbatim in train/val
const trainTexts=new Set([...train,...val].map(r=>norm(r.text)));
const leaked=golden.filter(r=>trainTexts.has(norm(r.text))).length;
ok(leaked===0,`no golden text leaks into train/val (leaked: ${leaked})`);

// 7. rubric parity: every signal used exists in rubric
const used=new Set(); all.forEach(r=>r.signals.forEach(s=>used.add(s)));
const unknown=[...used].filter(s=>!rubricCodes.has(s));
ok(unknown.length===0,`all signals used exist in rubric.json (${used.size} used, unknown: ${unknown.join(",")||"none"})`);

// 8. language coverage
const langs=new Set(all.map(r=>r.lang));
ok(langs.has("en")&&langs.has("hi")&&langs.has("hinglish"),"all three languages present");
const hiShare=all.filter(r=>r.lang==="hi").length/all.length;
ok(hiShare>=0.08,`Hindi share >= 8% (got ${hiShare.toFixed(3)})`);

// 9. every scam family represented with >=150 rows
const fams=["digital_arrest","courier_parcel","official_phishing","upi_payment_fraud","investment_trading","job_task","loan_app","impersonation_relationship"];
const counts=Object.fromEntries(fams.map(f=>[f,all.filter(r=>r.cat===f).length]));
ok(fams.every(f=>counts[f]>=150),`each scam family has >= 150 rows (${JSON.stringify(counts)})`);

console.log(`\n${fails===0?"ALL TESTS PASSED":fails+" TEST(S) FAILED"}`);
process.exit(fails?1:0);
