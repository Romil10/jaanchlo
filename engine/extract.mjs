// Extraction pipeline: jaanchlo_app.html is the single source of truth.
// Regenerates dataset/engine.mjs (detector) and engine/explain_data.mjs (verdict copy EN/HI).
import fs from "fs";
const _cands=["../app/jaanchlo_app.html","../jaanchlo_app.html"].map(p=>new URL(p,import.meta.url));
const _appUrl=_cands.find(u=>fs.existsSync(u));
if(!_appUrl) throw new Error("extract: cannot find jaanchlo_app.html in ../app/ or ../");
const html=fs.readFileSync(_appUrl,"utf8");
const g=(re,name)=>{const m=html.match(re); if(!m) throw new Error("extract: missing "+name); return m[0];};

// 1) detector module
const engineParts=[
 g(/const EVAL_W = \{[^\n]*\};/,"EVAL_W"),
 g(/const SIGNALS = \[[\s\S]*?\n\];/,"SIGNALS"),
 g(/const RE_MASKED_ACCT[\s\S]*?const RE_NAMED = [^\n]*\n/,"RE helpers"),
 g(/function norm\(t\)\{[\s\S]*?\}/,"norm"),
 g(/const FAMILY = \{[\s\S]*?\n\};/,"FAMILY"),
 g(/function classify\(codes\)\{[\s\S]*?\n\}/,"classify"),
 g(/function detect\(text\)\{[\s\S]*?return \{codes[\s\S]*?\};\n\}/,"detect"),
 g(/function checklistVerdict\(a\)\{[\s\S]*?\n\}/,"checklistVerdict")
];
fs.writeFileSync(new URL("../dataset/engine.mjs",import.meta.url),
 engineParts.join("\n\n")+"\n\nexport { detect, SIGNALS, EVAL_W, FAMILY, classify, norm, checklistVerdict };\n");

// 2) explanation data module
const explainParts=[
 g(/const REASON=\{en:\{[\s\S]*?\n\}\};/,"REASON.en"),
 g(/REASON\.hi=\{[\s\S]*?\n\};/,"REASON.hi"),
 g(/const NEXT=\{en:\{[\s\S]*?\}\};/,"NEXT"),
 g(/const TIER_LABEL=\{[^\n]*\};/,"TIER_LABEL"),
 g(/const EVAL_NAME=\{[^\n]*\};/,"EVAL_NAME")
];
fs.writeFileSync(new URL("./explain_data.mjs",import.meta.url),
 explainParts.join("\n\n")+"\n\nexport { REASON, NEXT, TIER_LABEL, EVAL_NAME };\n");
console.log("extracted: dataset/engine.mjs + engine/explain_data.mjs");
