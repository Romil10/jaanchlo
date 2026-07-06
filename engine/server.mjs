// JaanchLo engine API. Zero dependencies, Node stdlib http only.
// Privacy contract: no request body is ever logged or written to disk (verified by static test).
import http from "http";
import { validateInputEvent } from "./schema.mjs";
import { fromText, fromChecklist } from "./adapters.mjs";
import { RuleEvaluator } from "./evaluator.mjs";
const evaluator=new RuleEvaluator();
const VERSION="0.2.0";
function json(res,code,obj){ res.writeHead(code,{"content-type":"application/json"}); res.end(JSON.stringify(obj)); }
function readBody(req,cap=64*1024){ return new Promise((ok,err)=>{ let n=0,chunks=[];
  req.on("data",c=>{ n+=c.length; if(n>cap){err(new Error("payload too large"));req.destroy();return;} chunks.push(c); });
  req.on("end",()=>ok(Buffer.concat(chunks).toString("utf8"))); req.on("error",err); }); }
async function handle(req,res){
  if(req.method==="GET"&&req.url==="/health") return json(res,200,{ok:true,version:VERSION});
  if(req.method!=="POST") return json(res,404,{error:"not found"});
  let body;
  try{ body=JSON.parse(await readBody(req)||"{}"); }catch(e){ return json(res,400,{error:"invalid json or payload too large"}); }
  let event;
  if(req.url==="/check/text"||req.url==="/check/image"||req.url==="/check/audio"){
    const channel=req.url==="/check/text"?"text":(req.url==="/check/image"?"image_ocr":"audio_transcript");
    event={...fromText({text:body.text,lang:body.lang||"auto"}),channel};
  } else if(req.url==="/checklist"){
    event=fromChecklist(body.answers||{},body.lang||"auto");
  } else return json(res,404,{error:"not found"});
  const v=validateInputEvent(event);
  if(!v.ok) return json(res,422,{error:"invalid input",details:v.errors});
  const r=evaluator.evaluate(event);
  return json(res,200,{verdict:r.verdict,score:r.score,family:r.family||null,knockout:r.knockout||null,
    signals:r.codes,per_evaluation:r.per,...r.explanation});
}
export function startServer(port=0){ return new Promise(ok=>{
  const server=http.createServer((q,s)=>{ handle(q,s).catch(()=>json(s,500,{error:"internal"})); });
  server.listen(port,"127.0.0.1",()=>ok({server,port:server.address().port}));});}
if(process.argv[1]&&process.argv[1].endsWith("server.mjs")){
  const p=Number(process.env.PORT||8787);
  startServer(p).then(({port})=>console.log("JaanchLo engine API on http://127.0.0.1:"+port));
}
