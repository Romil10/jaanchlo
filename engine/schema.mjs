// Canonical InputEvent / Verdict schema validation (stdlib only).
import fs from "fs";
const rubric=JSON.parse(fs.readFileSync(new URL("../dataset/rubric.json",import.meta.url),"utf8"));
export const SIGNAL_CODES=new Set(rubric.signals.map(s=>s.code));
export const RUBRIC=rubric;
const CHANNELS=new Set(["text","image_ocr","audio_transcript","checklist"]);
const LANGS=new Set(["en","hi","hinglish","auto"]);
export function validateInputEvent(e){
  const errors=[];
  if(!e||typeof e!=="object") return {ok:false,errors:["not an object"]};
  if(!CHANNELS.has(e.channel)) errors.push("channel must be one of "+[...CHANNELS].join("|"));
  if(typeof e.text!=="string"||!e.text.trim()) errors.push("text must be a non-empty string");
  if(e.text&&e.text.length>8000) errors.push("text too long (max 8000 chars)");
  if(e.lang!==undefined&&!LANGS.has(e.lang)) errors.push("lang must be one of "+[...LANGS].join("|"));
  return {ok:errors.length===0,errors};
}
export function validateVerdict(v){
  const errors=[];
  if(!["safe","care","danger"].includes(v.verdict)) errors.push("bad verdict tier");
  if(typeof v.score!=="number"||v.score<0||v.score>100) errors.push("score out of range");
  if(!Array.isArray(v.signals)) errors.push("signals must be array");
  else for(const s of v.signals) if(!SIGNAL_CODES.has(s)) errors.push("unknown signal "+s);
  if(!Array.isArray(v.reasons)) errors.push("reasons must be array");
  if(v.reasons&&v.reasons.length>5) errors.push("more than 5 reasons");
  if(typeof v.next_step!=="string"||!v.next_step) errors.push("missing next_step");
  return {ok:errors.length===0,errors};
}
