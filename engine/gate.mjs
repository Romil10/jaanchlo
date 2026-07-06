// JaanchLo CI gate: one command, hard exit on any failure.
// Order: re-extract from the app (single source) -> engine tests -> dataset integrity -> eval thresholds.
import { spawnSync } from "child_process";
const steps=[
 ["extract (app is source of truth)","node",["engine/extract.mjs"]],
 ["engine test suite","node",["engine/tests/run_all.mjs"]],
 ["dataset integrity","node",["dataset/test_dataset.mjs"]],
 ["evaluation thresholds","node",["dataset/eval.mjs"]]
];
let failed=null;
for(const [name,cmd,args] of steps){
  console.log("\n########## GATE STEP: "+name+" ##########");
  const r=spawnSync(cmd,args,{stdio:"inherit",cwd:new URL("..",import.meta.url).pathname});
  if(r.status!==0){ failed=name; break; }
}
console.log("\n=========================================");
console.log(failed?("CI GATE FAILED at: "+failed):"CI GATE PASSED: extract + engine suites + dataset integrity + eval thresholds all green");
process.exit(failed?1:0);
