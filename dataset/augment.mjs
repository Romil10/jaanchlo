// JaanchLo dataset augmentation pipeline (stdlib Node, no deps).
// Templated + placeholder expansion across EN/HI/Hinglish. Every row is auto-labeled
// by the SHIPPING engine (engine.mjs) so dataset signals never drift from the product.
// Golden split is held out BY CONSTRUCTION: templates tagged golden:true never enter train/val.
import { detect } from "./engine.mjs";
import fs from "fs";

// ---- seeded RNG (reproducible) ----
let _s = 1337;
const rnd = () => (_s = (_s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = a => a[Math.floor(rnd() * a.length)];
const many = (a, n) => Array.from({length:n}, () => pick(a));

// ---- placeholder pools ----
const P = {
  name:["Romil","Priya","Anil","Sunita","Rakesh","Meena","Vikram","Lakshmi","Arjun","Fatima","Deepak","Kavya","Suresh","Anita","Rohan","Neha","Manoj","Pooja","Sanjay","Divya","Harish","Ritu","Amit","Geeta","Farhan","Sneha","Ganesh","Rekha","Imran","Nisha"],
  amt:["5,000","9,999","25,000","49,000","1,20,000","2,50,000","15,00,000","8,000","40,000","3,999","1,999","4,999","12,500","67,000","3,45,000","7,200","18,900","95,000","2,999","55,555","1,08,000","6,750","30,000","4,20,000"],
  bank:["SBI","HDFC","ICICI","Axis","PNB","Kotak","Bank of Baroda","Canara Bank","Union Bank","Yes Bank"],
  courier:["FedEx","DHL","DTDC","BlueDart","Delhivery"],
  dest:["Taiwan","Iraq","Thailand","Cambodia","Vietnam","Myanmar"],
  city:["Mumbai","Delhi","Andheri","Bengaluru","Pune","Hyderabad","Chennai","Kolkata"],
  celeb:["Ratan Tata","Mukesh Ambani","Nirmala Sitharaman","Gautam Adani","Anand Mahindra"],
  short:["bit.ly/verify-kyc","tinyurl.com/pan-update","rb.gy/sbi-safe","cutt.ly/power-bill","is.gd/re-kyc","bit.ly/acct-safe","tinyurl.com/sim-kyc"],
  upi:["rahul@okaxis","secure@ybl","refund@paytm","officer@oksbi","help12@ybl","support@okhdfc","clear@okicici"],
  agency:["CBI","Cyber Cell","Narcotics Control Bureau","Enforcement Directorate","Customs Department","Mumbai Crime Branch"],
  app:["Skype","Zoom","AnyDesk","TeamViewer","QuickSupport"],
  pct:["8","10","5","12","15","7","20"]
};
const digits = n => Array.from({length:n},()=>Math.floor(rnd()*10)).join("");
const fill = s => s
  .replace(/{name}/g,()=>pick(P.name)).replace(/{amt}/g,()=>pick(P.amt))
  .replace(/{bank}/g,()=>pick(P.bank)).replace(/{courier}/g,()=>pick(P.courier))
  .replace(/{dest}/g,()=>pick(P.dest)).replace(/{city}/g,()=>pick(P.city))
  .replace(/{celeb}/g,()=>pick(P.celeb)).replace(/{short}/g,()=>pick(P.short))
  .replace(/{upi}/g,()=>pick(P.upi)).replace(/{agency}/g,()=>pick(P.agency))
  .replace(/{app}/g,()=>pick(P.app)).replace(/{pct}/g,()=>pick(P.pct))
  .replace(/{otp}/g,()=>digits(4)).replace(/{ref}/g,()=>digits(6))
  .replace(/{acct}/g,()=>digits(4)).replace(/{phone}/g,()=>"9"+digits(9))
  .replace(/{intl}/g,()=>pick(["+92 30","+84 55","+855 96","+62 81"])+digits(6));

// expected: "danger" = must be Danger; "scam" = must not be Safe; "benign" = must not be Danger
// Each template: {id, cat, expected, golden?, langs:{en:[...],hi:[...],hinglish:[...]}}
const T = [
 // ---------- digital_arrest ----------
 {id:"da1",cat:"digital_arrest",expected:"danger",langs:{
   en:["This is Officer from {agency}, {city}. A money laundering case is registered against your Aadhaar. Stay on this {app} video call and do not tell your family. Transfer a refundable verification deposit of Rs {amt}.",
       "You are under digital arrest. Do not disconnect the video call, do not inform anyone. Pay Rs {amt} to the RBI escrow account for clearance, it is fully refundable."],
   hinglish:["Main {agency} se bol raha hoon. Aapke naam pe {city} me case darj hua hai. {app} video call band mat karo, kisi ko mat batao. Rs {amt} refundable deposit government account me transfer karo.",
       "Aap digital arrest me hain. Camera band mat karna, parivar ko mat batana. Verification ke liye Rs {amt} bhejo, baad me refund ho jayega."],
   hi:["मैं {agency} से बोल रहा हूँ। आपके आधार पर मनी लॉन्ड्रिंग का केस दर्ज है। वीडियो कॉल बंद मत कीजिए, किसी को मत बताइए। जाँच के लिए {amt} रुपये सरकारी खाते में भेजिए, बाद में वापस मिल जाएगा।"]}},
 {id:"da2",cat:"digital_arrest",expected:"danger",golden:true,langs:{
   en:["Madam, {agency} here. Your bank account is linked to a terrorist funding case. This is a confidential national security matter, tell no one. Keep your camera on and transfer Rs {amt} as a security deposit for your bail.",
       "A non-bailable warrant is issued in your name. Join the {app} call now, stay on the line, and pay Rs {amt} refundable to avoid arrest tonight."],
   hinglish:["Madam {agency} se. Aapka account terror funding case se juda hai. Ye confidential matter hai, kisi ko mat batao. Camera on rakho aur Rs {amt} bail security bhejo.",
       "Aapke naam non-bailable warrant hai. Abhi {app} call join karo, line pe raho, aur aaj raat arrest se bachne ke liye Rs {amt} refundable bhejo."]}},

 // ---------- courier_parcel ----------
 {id:"cp1",cat:"courier_parcel",expected:"scam",langs:{
   en:["Your {courier} package has been blocked. Press 1 to speak to a customer care officer.",
       "This is {courier}. A parcel booked in your name to {dest} is on hold at {city} customs. Press 1 for details."],
   hinglish:["Aapka {courier} parcel block ho gaya hai. Officer se baat karne ke liye 1 dabaye.",
       "{courier} se, aapke naam ka parcel {dest} ja raha tha jo {city} customs me ruka hai. Details ke liye 1 dabaye."]}},
 {id:"cp2",cat:"courier_parcel",expected:"danger",golden:true,langs:{
   en:["Calling from {courier}. Your parcel to {dest} contains MDMA and fake passports. I am transferring you to the {agency}. Download {app}, you are under digital arrest, do not tell anyone, transfer Rs {amt} to clear your name.",
       "{courier} alert: illegal SIM cards found in your parcel. {agency} officer on {app} video will verify you. Stay on the call and pay Rs {amt} refundable."],
   hinglish:["{courier} se, aapke parcel me drugs aur fake passport mile hain, {agency} ko transfer kar raha hoon. {app} download karo, aap digital arrest me ho, kisi ko mat batao, Rs {amt} transfer karo naam clear karne ke liye."]}},

 // ---------- official_phishing ----------
 {id:"op1",cat:"official_phishing",expected:"scam",langs:{
   en:["Dear Customer, your {bank} account will be blocked today. Update your KYC immediately: {short}",
       "Dear User, your electricity power will be disconnected tonight as bill was not update. Immediately contact 82404{otp}",
       "ITDEPT: Your PAN will be deactivated within 24 hours unless Aadhaar is linked. Verify: {short}"],
   hinglish:["Dear Customer, aapka {bank} account aaj block ho jayega. Turant KYC update karein: {short}",
       "Aapka SIM card 2 ghante me band ho jayega, illegal complaint hai. KYC update karein: {short}"]}},
 {id:"op2",cat:"official_phishing",expected:"danger",langs:{
   en:["Sir your {bank} KYC is pending. Install {app} from this link and share the code, I will update your KYC for you.",
       "To re-verify your account, tell me the OTP that came on your phone right now."],
   hinglish:["Sir aapki {bank} KYC pending hai. Is link se {app} install karo aur code batao, main aapki KYC update kar dunga."]}},

 // ---------- upi_payment_fraud ----------
 {id:"upi1",cat:"upi_payment_fraud",expected:"danger",langs:{
   en:["To receive your Rs {amt} cashback, scan this QR code and enter your UPI PIN to confirm.",
       "Claim your prize: scan the QR to receive Rs {amt}, then enter PIN."],
   hinglish:["Rs {amt} cashback paane ke liye ye QR scan karo aur UPI PIN daalo.",
       "Inaam paane ke liye QR scan karke PIN enter karo, Rs {amt} milega."]}},
 {id:"upi2",cat:"upi_payment_fraud",expected:"scam",golden:true,langs:{
   en:["Bhaiya, Rs {amt} was sent to your number by mistake, please return it to {upi}, very urgent.",
       "Wrong transfer of Rs {amt} to your account, kindly send it back to {upi} immediately."],
   hinglish:["Galti se aapke number pe Rs {amt} chala gaya, please {upi} pe wapas bhej do, bahut urgent hai."]}},

 // ---------- investment_trading ----------
 {id:"inv1",cat:"investment_trading",expected:"scam",langs:{
   en:["Watch {celeb} reveal the AI trading app that pays {pct}% daily, guaranteed. Download the app now.",
       "Join our VIP Telegram group. {celeb} recommends this platform, {pct}% daily return, risk-free."],
   hinglish:["{celeb} ka video dekho, ye AI trading app rozana {pct}% deta hai, guaranteed. App abhi download karo.",
       "VIP telegram group join karo, {celeb} recommend karte hain, {pct}% daily return."]}},
 {id:"inv2",cat:"investment_trading",expected:"danger",golden:true,langs:{
   en:["Your trading balance is Rs 12,00,000. To withdraw, first pay {pct}% statutory tax of Rs {amt}. {celeb}-backed platform, guaranteed.",
       "Deposit Rs {amt} in USDT with our {celeb} fund and double your money in 7 days, then pay a small fee to unlock withdrawal."],
   hinglish:["Aapka profit Rs 12,00,000 hua. Withdraw ke liye pehle Rs {amt} tax jama karo. {celeb} backed platform, guaranteed return."]}},

 // ---------- job_task ----------
 {id:"job1",cat:"job_task",expected:"scam",langs:{
   en:["Hello, I am from a digital marketing company. Like and subscribe our YouTube videos, get Rs 50 per like, earn Rs {amt} daily from home.",
       "Part time job: rate hotels and earn Rs {amt} daily from home, no investment."],
   hinglish:["Namaste, digital marketing company se. YouTube video like karo, Rs 50 per like, ghar baithe Rs {amt} daily kamao."]}},
 {id:"job2",cat:"job_task",expected:"scam",langs:{
   en:["You completed 3 tasks. VIP prepaid task: deposit Rs {amt} and get 40% more back. Your score is low so complete remaining tasks first.",
       "Congratulations, you are selected. Pay Rs 1,999 registration fee to activate your work-from-home account."],
   hinglish:["Aapne 3 task pure kiye. VIP prepaid task: Rs {amt} jama karo, 40% zyada milega. Score low hai isliye baaki task pure karo."]}},
 {id:"job3",cat:"job_task",expected:"danger",golden:true,langs:{
   en:["KBC Lottery: Congratulations {name}! You won Rs 25,00,000 in the lucky draw. To claim, pay Rs {amt} refundable registration fee to {upi}.",
       "You have won a jackpot of Rs {amt} in KBC. Pay processing fee to release your prize now."],
   hinglish:["KBC Lottery: Badhai ho {name}! Aapne 25 lakh ka lucky draw jeeta. Prize paane ke liye Rs {amt} registration fee {upi} pe jama karo."]}},

 // ---------- loan_app ----------
 {id:"loan1",cat:"loan_app",expected:"danger",langs:{
   en:["You took a loan. Pay Rs {amt} today or we will send your morphed photo to all your contacts.",
       "Repay Rs {amt} now or your obscene photo will be shared with your family and contacts."],
   hinglish:["Aapne loan liya tha, aaj hi Rs {amt} bhro warna aapki morphed photo saare contacts ko bhej denge."]}},
 {id:"loan2",cat:"loan_app",expected:"scam",langs:{
   en:["Congratulations! Your instant loan of Rs {amt} is approved. Pay Rs 1,999 processing fee to {upi} to release funds.",
       "Loan approved. Activation fee of Rs {amt} required in advance to disburse."],
   hinglish:["Badhai! Aapka Rs {amt} ka loan approve. Funds release ke liye Rs 1,999 processing fee {upi} pe bhejo."]}},

 // ---------- impersonation_relationship ----------
 {id:"imp1",cat:"impersonation_relationship",expected:"danger",langs:{
   en:["Beta, I am at the hospital, met with an accident, send Rs {amt} to this number now and do not tell mummy.",
       "Papa this is my new number, I lost my phone. I urgently need to pay a fee, please transfer Rs {amt} to {upi}, don't tell anyone."],
   hinglish:["Beta main hospital me hoon, accident ho gaya, abhi Rs {amt} is number pe bhej do, mummy ko mat batana."]}},
 {id:"imp2",cat:"impersonation_relationship",expected:"scam",golden:true,langs:{
   en:["Hi {name}, this is your uncle from a new number. Please send Rs {amt} to {upi}, I will return it tomorrow.",
       "I am an Army officer at the border, cannot meet, I will send advance for your scooter, scan this QR to receive Rs {amt}."],
   hinglish:["Hi {name}, main tumhara uncle, naya number hai. Rs {amt} {upi} pe bhej do, kal wapas kar dunga."]}},

 // ---------- benign (must not be Danger; ideally Safe) ----------
 {id:"b1",cat:"benign",expected:"benign",langs:{
   en:["Dear {name}, Rs {amt} debited from A/c XXXX{otp} on 04-Jul UPI to BigBasket. Not you? Call the number on your card.",
       "Dear {name}, Rs {amt} credited to A/c XXXX{otp}. Available balance updated. {bank}."],
   hinglish:["Dear {name}, A/c XXXX{otp} se Rs {amt} debit hua BigBasket ko. Aap nahi? Card ke peeche wale number pe call karein."]}},
 {id:"b2",cat:"benign",expected:"benign",langs:{
   en:["Your electricity bill for consumer no 4102{otp} is Rs {amt}, due 12-Jul. Pay via the {bank} app or official portal. Ignore if already paid.",
       "Water bill for consumer id 88{otp} is Rs {amt}, due next week. Pay at your official board portal."],
   hinglish:["Aapka bijli bill consumer no 4102{otp} ka Rs {amt} hai, 12-Jul tak. Official app se pay karein."]}},
 {id:"b3",cat:"benign",expected:"benign",langs:{
   en:["OTP for your {bank} login is {otp}. Do NOT share with anyone, including bank staff.",
       "Your one time password is {otp}. Never share it with anyone."],
   hinglish:["Aapka {bank} login OTP {otp} hai. Kisi ko na bataye, bank staff ko bhi nahi."]}},
 {id:"b4",cat:"benign",expected:"benign",golden:true,langs:{
   en:["Beta, kal ghar aa rahe ho na? Thoda paneer le aana.",
       "Hi {name}, dinner at 8 tonight? Let me know.",
       "Reminder: appointment with Dr. Rao tomorrow 11:30 AM at Apollo Clinic. Reply YES to confirm."],
   hinglish:["{name}, shaam ko chai pe aa jao. Ghar pe hi hoon."]}},
 {id:"b5",cat:"benign",expected:"benign",langs:{
   en:["Your Amazon order will be delivered today. Share OTP {otp} with the delivery agent at your door.",
       "Your Swiggy order from Meghana Foods has been delivered. Rate your delivery partner.",
       "PNR 45128{otp}: train 12627 confirmed, coach B4 seat 32. Departure 06:10 from KSR Bengaluru."],
   hinglish:["Aapka Amazon order aaj deliver hoga, courier ko OTP {otp} batayein delivery ke waqt."]}},
 {id:"b6",cat:"benign",expected:"benign",golden:true,langs:{
   en:["EMI of Rs {amt} for your {bank} loan is due on 10-Jul. Please maintain balance in A/c XXXX{otp}.",
       "Dear {name}, your KYC is due for periodic update. Visit your nearest {bank} branch with original documents. Never share OTP or PIN.",
       "{bank} recharge of Rs 299 successful. Validity 28 days."],
   hinglish:["Dear {name}, {bank} loan ki EMI Rs {amt} 10-Jul ko due hai. A/c XXXX{otp} me balance rakhein."]}}
];

// ---- extra Hindi (Devanagari) templates, non-golden, to lift HI coverage ----
const HI_EXTRA=[
 {id:"da_hi",cat:"digital_arrest",expected:"danger",langs:{hi:[
   "मैं {agency} से बोल रहा हूँ। आपके आधार पर मनी लॉन्ड्रिंग का मामला दर्ज है। {app} वीडियो कॉल बंद मत कीजिए, किसी को मत बताइए। जाँच के लिए {amt} रुपये सरकारी खाते में भेजिए, वापस मिल जाएगा।",
   "आप डिजिटल अरेस्ट में हैं। कैमरा बंद मत कीजिए, परिवार को मत बताइए। गिरफ़्तारी से बचने के लिए {amt} रुपये अभी ट्रांसफ़र कीजिए।"]}},
 {id:"cp_hi",cat:"courier_parcel",expected:"danger",langs:{hi:[
   "{courier} से बोल रहे हैं। {dest} जा रहे आपके पार्सल में ड्रग्स मिले हैं। अब आपको {agency} अधिकारी से जोड़ रहे हैं, {app} डाउनलोड कीजिए, किसी को मत बताइए, {amt} रुपये भेजिए।"]}},
 {id:"op_hi",cat:"official_phishing",expected:"scam",langs:{hi:[
   "प्रिय ग्राहक, आपका {bank} खाता आज बंद हो जाएगा। तुरंत केवाईसी अपडेट करें: {short}",
   "आपका सिम कार्ड 2 घंटे में बंद हो जाएगा। तुरंत सत्यापन करें: {short}"]}},
 {id:"upi_hi",cat:"upi_payment_fraud",expected:"danger",langs:{hi:[
   "अपना {amt} रुपये कैशबैक पाने के लिए यह क्यूआर स्कैन करें और यूपीआई पिन डालें।"]}},
 {id:"inv_hi",cat:"investment_trading",expected:"scam",langs:{hi:[
   "{celeb} का वीडियो देखिए, यह ट्रेडिंग ऐप रोज़ {pct}% देता है, गारंटीड। अभी ऐप डाउनलोड करें और VIP ग्रुप जॉइन करें।"]}},
 {id:"job_hi",cat:"job_task",expected:"scam",langs:{hi:[
   "नमस्ते, घर बैठे यूट्यूब वीडियो लाइक करें, हर लाइक पर 50 रुपये, रोज़ {amt} रुपये कमाएँ।"]}},
 {id:"loan_hi",cat:"loan_app",expected:"danger",langs:{hi:[
   "आपने लोन लिया था, आज ही {amt} रुपये भरो वरना आपकी मॉर्फ़्ड फ़ोटो आपके सभी संपर्कों को भेज देंगे।"]}},
 {id:"imp_hi",cat:"impersonation_relationship",expected:"danger",langs:{hi:[
   "बेटा, मैं अस्पताल में हूँ, एक्सीडेंट हो गया, अभी {amt} रुपये इस नंबर पर भेज दो, मम्मी को मत बताना।"]}},
 {id:"b_hi",cat:"benign",expected:"benign",langs:{hi:[
   "प्रिय {name}, आपके खाते XXXX{acct} से {amt} रुपये डेबिट हुए। आपने नहीं किया? कार्ड के पीछे दिए नंबर पर कॉल करें।",
   "आपके {bank} लॉगिन का ओटीपी {otp} है। किसी को न बताएँ, बैंक कर्मचारी को भी नहीं।",
   "आपका बिजली बिल उपभोक्ता संख्या 4102{acct} का {amt} रुपये है, 12 तारीख़ तक। आधिकारिक ऐप से भुगतान करें।"]}}
];

// ---- generate to balanced targets ----
const SUFFIX={digital_arrest:" Case ref {ref}.",courier_parcel:" AWB {ref}.",official_phishing:" Ref {ref}.",
  upi_payment_fraud:" Txn {ref}.",investment_trading:" Client ID {ref}.",job_task:" Agent code {ref}.",
  loan_app:" Loan ID {ref}.",impersonation_relationship:"",benign:" Ref {ref}."};
const TARGET={digital_arrest:300,courier_parcel:240,official_phishing:260,upi_payment_fraud:240,
  investment_trading:260,job_task:280,loan_app:220,impersonation_relationship:220,benign:900};
const GOLDEN_TARGET=250;

const rows=[]; const seen=new Set();
function emit(t,lang,base){
  let text=fill(base), key=lang+"|"+text.toLowerCase().replace(/\s+/g," ").trim();
  if(seen.has(key)){ // break collision with a realistic reference suffix
    text=fill(base)+fill(SUFFIX[t.cat]||" Ref {ref}."); key=lang+"|"+text.toLowerCase().replace(/\s+/g," ").trim();
    if(seen.has(key)) return false;
  }
  seen.add(key);
  const r=detect(text);
  rows.push({id:`ds-${rows.length+1}`,template:t.id,cat:t.cat,lang,expected:t.expected,golden:!!t.golden,text,
    engine_verdict:r.verdict,engine_score:r.score,engine_family:r.family,engine_knockout:r.knockout||null,signals:r.codes});
  return true;
}
function generate(templates,targetByCat,goldenMode){
  const byCat={};
  for(const t of templates){ (byCat[t.cat]=byCat[t.cat]||[]).push(t); }
  for(const cat of Object.keys(byCat)){
    const units=[];
    for(const t of byCat[cat]) for(const lang of Object.keys(t.langs)) for(const base of t.langs[lang]) units.push([t,lang,base]);
    const target=goldenMode?Math.round(GOLDEN_TARGET/Object.keys(byCat).length):targetByCat[cat];
    let made=0,attempts=0;
    while(made<target && attempts<target*40){ attempts++; const [t,lang,base]=pick(units); if(emit(t,lang,base)) made++; }
  }
}
generate(T.filter(t=>t.golden),null,true);
generate(T.filter(t=>!t.golden).concat(HI_EXTRA),TARGET,false);

// ---- split: golden templates held out entirely; rest 85/15 train/val ----
const golden=rows.filter(r=>r.golden);
const pool=rows.filter(r=>!r.golden);
// shuffle pool deterministically
for(let i=pool.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
const nVal=Math.floor(pool.length*0.15);
const val=pool.slice(0,nVal), train=pool.slice(nVal);

const wr=(f,arr)=>fs.writeFileSync(f,arr.map(x=>JSON.stringify(x)).join("\n")+"\n");
wr("dataset/dataset.jsonl",rows);
wr("dataset/splits/train.jsonl",train);
wr("dataset/splits/val.jsonl",val);
wr("dataset/splits/golden.jsonl",golden);

// ---- distribution report ----
const count=(arr,f)=>arr.reduce((m,r)=>{const k=f(r);m[k]=(m[k]||0)+1;return m;},{});
const report={
  total:rows.length,
  by_split:{train:train.length,val:val.length,golden:golden.length},
  by_cat:count(rows,r=>r.cat),
  by_lang:count(rows,r=>r.lang),
  benign_share:+(rows.filter(r=>r.cat==="benign").length/rows.length).toFixed(3),
  scam_share:+(rows.filter(r=>r.cat!=="benign").length/rows.length).toFixed(3)
};
fs.writeFileSync("dataset/distribution_report.json",JSON.stringify(report,null,1));
console.log(JSON.stringify(report,null,1));
