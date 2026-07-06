import { spawnSync } from "child_process";
const tests=["test_adapters.mjs","test_scoring.mjs","test_explain.mjs","test_extractors.mjs","test_checklist.mjs","test_api.mjs"];
let fails=0;
for(const t of tests){
  console.log("\n===== "+t+" =====");
  const r=spawnSync("node",[new URL("./"+t,import.meta.url).pathname],{stdio:"inherit"});
  if(r.status!==0)fails++;
}
console.log("\n"+(fails===0?"ENGINE TEST SUITE: ALL GREEN":fails+" TEST FILE(S) FAILED"));
process.exit(fails?1:0);
