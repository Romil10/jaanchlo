// The in-app #selftest table (app/jaanchlo_app.html TESTS) must agree with the extracted engine.
import fs from "fs";
import { detect } from "../../dataset/engine.mjs";
import { ok, done } from "./_t.mjs";
const html=fs.readFileSync(new URL("../../app/jaanchlo_app.html",import.meta.url),"utf8");
const src=html.match(/const TESTS=\[[\s\S]*?\n\];/)[0];
const TESTS=(new Function(src+"\nreturn TESTS;"))();
ok(TESTS.length>=30,"self-test table has at least 30 cases");
for(const [text,expect,tag] of TESTS){ const v=detect(text).verdict; ok(v===expect,`${tag}: expected ${expect}, got ${v}`); }
done("selftest");
