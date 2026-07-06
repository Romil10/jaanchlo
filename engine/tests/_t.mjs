let fails=0,count=0;
export const ok=(c,m)=>{count++;console.log((c?"PASS":"FAIL")+"  "+m);if(!c)fails++;};
export const done=name=>{console.log(`[${name}] ${count-fails}/${count} passed`);process.exit(fails?1:0);};
