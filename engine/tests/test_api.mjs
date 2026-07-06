// 2.6 API contract: live server on ephemeral port, fetch, verify shapes + privacy static check.
import fs from "fs";
import { startServer } from "../server.mjs";
import { validateVerdict } from "../schema.mjs";
import { ok, done } from "./_t.mjs";
const {server,port}=await startServer(0);
const base=`http://127.0.0.1:${port}`;
const h=await (await fetch(base+"/health")).json();
ok(h.ok===true,"GET /health ok");
const r1=await fetch(base+"/check/text",{method:"POST",headers:{"content-type":"application/json"},
  body:JSON.stringify({text:"CBI officer: you are under digital arrest, do not tell family, pay refundable deposit",lang:"en"})});
const v1=await r1.json();
ok(r1.status===200&&v1.verdict==="danger","POST /check/text danger on digital-arrest script");
ok(validateVerdict({verdict:v1.verdict,score:v1.score,signals:v1.signals,reasons:v1.reasons,next_step:v1.next_step}).ok,"response passes verdict schema");
ok(v1.next_step.includes("1930"),"danger response carries 1930 next step");
const r2=await fetch(base+"/check/text",{method:"POST",headers:{"content-type":"application/json"},
  body:JSON.stringify({text:"OTP for your SBI login is 480912. Do NOT share with anyone, including bank staff."})});
const v2=await r2.json();
ok(v2.verdict==="safe","benign OTP delivery rated safe by API");
const r3=await fetch(base+"/check/text",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({})});
ok(r3.status===422,"missing text -> 422");
const r4=await fetch(base+"/check/text",{method:"POST",headers:{"content-type":"application/json"},body:"{bad json"});
ok(r4.status===400,"malformed json -> 400");
const r5=await fetch(base+"/checklist",{method:"POST",headers:{"content-type":"application/json"},
  body:JSON.stringify({answers:{q_auth:1,q_iso:1,q_pay:1},lang:"hi"})});
const v5=await r5.json();
ok(v5.verdict==="danger"&&v5.next_step.includes("1930"),"checklist triple -> danger with hi next step");
const r6=await fetch(base+"/nope",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});
ok(r6.status===404,"unknown route -> 404");
// privacy static check: server source performs no disk writes and no console logging of bodies
const src=fs.readFileSync(new URL("../server.mjs",import.meta.url),"utf8");
ok(!/appendFile|writeFile|createWriteStream/.test(src),"server has no disk-write calls (nothing persisted)");
ok(!/console\.log\([^)]*body/.test(src),"server never logs request bodies");
server.close();
done("api");
