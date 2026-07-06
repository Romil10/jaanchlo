// Pluggable evaluator interface. RuleEvaluator wraps the shipping detector.
// MockLLMEvaluator demonstrates the LLM contract deterministically (no network):
// any future LLM evaluator must return only known signal codes or be rejected.
import { detect, checklistVerdict } from "../dataset/engine.mjs";
import { SIGNAL_CODES } from "./schema.mjs";
import { buildExplanation } from "./explain.mjs";
export class RuleEvaluator{
  evaluate(inputEvent){
    const res=detect(inputEvent.text);
    if(inputEvent.channel==="checklist"&&inputEvent.answers){
      const cv=checklistVerdict(inputEvent.answers);
      if(cv.tier==="danger"){res.verdict="danger";res.score=Math.max(res.score,75);}
      else if(cv.tier==="care"&&res.verdict==="safe"){res.verdict="care";res.score=Math.max(res.score,30);}
      else if(cv.nYes===0){res.verdict="safe";res.score=Math.min(res.score,10);}
    }
    return {...res,explanation:buildExplanation(res,inputEvent.lang==="hi"?"hi":"en")};
  }
}
export class MockLLMEvaluator{
  constructor(fixtures){ this.fixtures=fixtures||new Map(); }
  evaluate(inputEvent){
    const codes=this.fixtures.get(inputEvent.text)||[];
    for(const c of codes) if(!SIGNAL_CODES.has(c)) throw new Error("MockLLMEvaluator: unknown signal "+c);
    return {codes,source:"mock_llm"};
  }
}
