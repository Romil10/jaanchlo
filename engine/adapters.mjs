// Channel adapters -> canonical InputEvent. OCR/transcription are dependency-injected
// so tests run offline; in production the app does OCR on-device (privacy by design).
export function fromText({text,lang="auto"}){ return {channel:"text",text:String(text||""),lang}; }
export async function fromImage(imageInput,ocrFn,lang="auto"){
  if(typeof ocrFn!=="function") throw new Error("fromImage requires an injected ocrFn");
  const text=await ocrFn(imageInput);
  return {channel:"image_ocr",text:String(text||""),lang};
}
export async function fromAudio(audioInput,transcribeFn,lang="auto"){
  if(typeof transcribeFn!=="function") throw new Error("fromAudio requires an injected transcribeFn");
  const text=await transcribeFn(audioInput);
  return {channel:"audio_transcript",text:String(text||""),lang};
}
// Mirrors the app's checklist synthetic mapping (v0.2) so API and app verdicts agree.
export const CHECKLIST_SYNTH={
  q_auth:"caller claims police officer cbi bank",
  q_iso:"do not tell your family stay on camera skype video call with officer",
  q_threat:"you will be arrested case registered account blocked",
  q_pay:"transfer money refundable verification deposit share otp",
  q_prize:"congratulations you won lottery prize guaranteed daily earning",
  q_link:"download this app from the link install apk",
  q_family:"beta emergency hospital paise bhejo urgent",
  q_channel:"sudden video call from unknown international number"};
export function fromChecklist(answers,lang="auto"){
  const parts=Object.keys(CHECKLIST_SYNTH).filter(k=>answers&&answers[k]===1).map(k=>CHECKLIST_SYNTH[k]);
  return {channel:"checklist",text:parts.join(". ")||"(no yes answers)",lang,answers:answers||{}};
}
