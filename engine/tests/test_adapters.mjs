// 2.1 adapters produce schema-valid InputEvents; OCR/audio run offline via stubs.
import { fromText, fromImage, fromAudio, fromChecklist, CHECKLIST_SYNTH } from "../adapters.mjs";
import { validateInputEvent } from "../schema.mjs";
import { ok, done } from "./_t.mjs";
ok(validateInputEvent(fromText({text:"hello",lang:"en"})).ok,"text adapter valid");
const img=await fromImage(Buffer.from("fake"),async()=> "Dear Customer your account is blocked","en");
ok(validateInputEvent(img).ok&&img.channel==="image_ocr","image adapter valid via stub ocr");
const aud=await fromAudio(Buffer.from("fake"),async()=> "you are under digital arrest","hi");
ok(validateInputEvent(aud).ok&&aud.channel==="audio_transcript","audio adapter valid via stub transcriber");
let threw=false; try{ await fromImage(Buffer.from("x")); }catch(e){ threw=true; }
ok(threw,"image adapter requires injected ocrFn (no hidden network)");
const cl=fromChecklist({q_auth:1,q_iso:1,q_pay:1});
ok(validateInputEvent(cl).ok&&cl.answers&&cl.answers.q_auth===1,"checklist adapter valid + answers carried");
ok(Object.keys(CHECKLIST_SYNTH).length===8,"checklist has 8 question mappings");
ok(validateInputEvent({channel:"text",text:""}).ok===false,"empty text rejected");
ok(validateInputEvent({channel:"bogus",text:"x"}).ok===false,"bad channel rejected");
ok(validateInputEvent({channel:"text",text:"x".repeat(9000)}).ok===false,"oversize text rejected");
done("adapters");
