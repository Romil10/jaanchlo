const EVAL_W = {E1:0.25,E2:0.25,E3:0.25,E4:0.15,E5:0.10};

const SIGNALS = [
  ["auth.police","E1",60,/\b(police|cbi|c\.?b\.?i|enforcement directorate|\bed\b|ncb|narcotics|customs|cyber\s?cell|crime branch|police station|inspector|constable)\b|पुलिस|सीबीआई|कस्टम|साइबर सेल|अपराध शाखा/i],
  ["auth.judge","E1",60,/\b(court|warrant|arrest warrant|hearing|judge|magistrate|supreme court)\b|वारंट|अदालत|न्यायालय/i],
  ["auth.courier","E1",45,/\b(fedex|dhl|dtdc|bluedart|blue dart|courier|parcel|package|shipment)\b|कूरियर|पार्सल/i],
  ["auth.bank","E1",35,/\b(hdfc|sbi|icici|axis|kotak|pnb|rbi|bank|net ?banking|kyc)\b|बैंक|खाता|केवाईसी/i],
  ["auth.utility","E1",35,/\b(electricity|power supply|bijli|sim card|trai|\bdot\b|telecom|connection|broadband)\b|बिजली|सिम/i],
  ["auth.govt","E1",40,/\b(pan card|\bpan\b|aadhaar|aadhar|income tax|itdept|incometx|uidai|passport office)\b|पैन|आधार|आयकर/i],
  ["auth.celebrity","E1",45,/\b(ambani|adani|ratan tata|sitharaman|mahindra|modi ji|elon|musk|virat|dhoni)\b/i],
  ["auth.family_clone","E1",50,/\b(beta|beti|mummy|mumma|papa|son|daughter|uncle|aunty|nephew|niece|dad|mom|grandson)\b|बेटा|बेटी|मम्मी|पापा/i],
  ["auth.employer","E1",35,/\b(hr team|hiring manager|recruitment|placement|digital marketing company|part ?time job|work\s?(from|at|@)\s?home|work[- ]from[- ]home|\bwfh\b|new ventures?|job (offer|opening|vacancy)|vacanc(y|ies)|(now hiring|hiring now)|online (job|work)|data entry (job|work)?|no experience (needed|required)|earn from home)\b|नौकरी|भर्ती|घर बैठे (नौकरी|काम)/i],
  ["fear.arrest_threat","E2",55,/\b(arrest|jail|custody|will be arrested|non ?bailable)\b|गिरफ्तार|गिरफ़्तार|जेल/i],
  ["fear.digital_arrest","E2",60,/\bdigital arrest\b|under (digital )?arrest|डिजिटल अरेस्ट/i],
  ["fear.isolation","E2",65,/((do ?not|don'?t|never) (tell|inform)|kisi ko mat bata|mat batana|stay on (the |this )?(camera|call|line|video)|camera band mat|do not disconnect|call ko band mat|confidential (case|matter)|national security|किसी को (मत|न) बता|मत बता(इए|ओ|ना|एं)|कैमरा बंद मत|किसी को सूचित (मत|न))/i],
  ["fear.deadline","E2",30,/\b(tonight|within 24|within \d+ (hours|minutes)|immediately|right now|turant|abhi|aaj hi|last chance|expires today)\b|तुरंत|आज ही|अंतिम मौका/i],
  ["fear.account_block","E2",35,/\b(blocked|block today|suspend(ed)?|deactivat|disconnect(ed)?|band ho ?jayega|will be closed)\b|बंद हो|निलंबित/i],
  ["fear.legal_case","E2",45,/\b(case (is )?registered|fir|money laundering|drugs|mdma|narcotics case|smuggl|illegal (items|sim|passport))\b|मामला दर्ज|मुकदमा|ड्रग्स|मनी लॉन्ड्रिंग|एफआईआर|केस दर्ज/i],
  ["fear.emergency_urgency","E2",45,/\b(accident|hospital|emergency|police station|operation)\b.{0,50}(paise|money|transfer|send|bhej|bhejo|help)|(paise|money|paisa).{0,20}(urgent|abhi|turant)|bahut (zaroori|zaruri|urgent)|बहुत ज़रूरी|एक्सीडेंट|अस्पताल.{0,20}पैसे/i],
  ["fear.shame_threat","E2",60,/(morphed|your (photo|photos|video)|contacts ko bhej|send to (all )?your contacts|leak (your|kar)|viral kar|expose|badnaam|मॉर्फ़्ड|फ़ोटो .{0,15}भेज|संपर्कों को भेज|बदनाम|वायरल)/i],
  ["fear.sunk_cost","E2",35,/(score (is )?low|complete (the )?remaining|pending tasks|deposit fas|paisa fas|tasks? (baaki|pending))/i],
  ["pay.deposit_refundable","E3",65,/(refundable|verification deposit|security deposit|rbi escrow|bail (bond|amount|security)|zamanat|refund ho ?jayega|wapas mil ?jayega|paise wapas (aa|mil)|रिफ़ंडेबल|वापस मिल|जमानत|सुरक्षा जमा)/i],
  ["pay.tax_fee_unlock","E3",60,/((pay|jama).{0,25}(tax|fee|gst|charge).{0,30}(withdraw|release|unlock|nikaal)|statutory tax|clearance fee|(tax|fee|gst) (jama|bharo|pay karo)|nikaalne ke liye .{0,15}(tax|fee)|टैक्स .{0,12}(जमा|भर|दे)|निकालने के लिए .{0,12}(टैक्स|फ़ीस)|withdraw .{0,15}(टैक्स|tax))/i],
  ["pay.qr_to_receive","E3",60,/(scan (this |the )?qr|qr code).{0,45}(receive|paisa|payment|advance|claim|milega)|receive.{0,35}scan|enter.{0,12}pin.{0,20}(receive|cashback|claim)|(paane|पाने) के लिए.{0,28}(qr|क्यूआर)|qr scan (karo|karein|करें|कीजिए)|क्यूआर स्कैन|(upi pin|यूपीआई पिन) (daalo|dalo|डालें|डालो)/i],
  ["pay.collect_request","E3",40,/(collect request|payment request of|approve to (claim|receive)|request aayi hai)/i],
  ["pay.refund_return_ask","E3",40,/(sent by mistake|galti se|by mistake|wrong (transfer|number)|return (it|the money)|wapas (kar|bhej))/i],
  ["pay.prepaid_task_deposit","E3",55,/(prepaid task|vip task|deposit.{0,20}(get|milega|return)|invest.{0,15}(get|milega)|recharge karke)/i],
  ["pay.fee_advance","E3",50,/(processing fee|advance fee|registration (fee|charge)|activation fee|release (your )?(loan|funds|prize)|file charge|रजिस्ट्रेशन फ़ीस|एडवांस फ़ीस|प्रोसेसिंग फ़ीस|एक्टिवेशन फ़ीस|फ़ीस .{0,10}(जमा|भर))/i],
  ["pay.gift_card_crypto","E3",55,/\b(gift card|google play card|amazon card|crypto|bitcoin|btc|usdt|binance|wallet address)\b/i],
  ["pay.screen_share","E3",60,/\b(anydesk|any desk|teamviewer|team viewer|quick ?support|screen ?shar(e|ing)|remote access|rust ?desk)\b|share (the )?code|code (batao|share|bhejo)/i],
  ["pay.upi_individual","E3",30,/\b(upi|gpay|google pay|phonepe|paytm|bhim)\b|@[a-z]{2,}/i],
  ["pay.demand","E3",45,/\bbhro\b|bhej ?do|bhejo|jama kar(o|do| de)|transfer (kar|money|rs|amount|funds|the money)|paise (bhej|transfer|do|de)|send (the )?money|clear your name|deposit .{0,15}(get|rs)|pay .{0,18}(fee|deposit|tax|fine|to (release|unlock|avoid|clear))|pay rs ?[\d,]+|send rs ?[\d,]+|भेज दो|भेजो|भेजिए|भरो|जमा कर|ट्रांसफ़र कर|ट्रांसफ़र की|अभी ट्रांसफ़र|रुपये भेज/i],
  ["pay.small_payout_lure","E3",40,/per like|per (video|task|review|rating)|earn .{0,16}(daily|per day|from home)|work\s?(from|at)\s?home|salary\s*(of\s*)?(rs|inr|₹)\s?\d|(monthly|weekly|daily)\s(salary|income|payout)|earn(ing)?s?\s.{0,10}(rs|₹)\s?\d|ghar baithe (kamai|paise)|rs ?\d+ per|घर बैठे|प्रति लाइक|लाइक कर.{0,12}(रुपये|कमा)|रोज़?.{0,10}कमा/i],
  ["chan.intl_number","E4",45,/(\+92|\+84|\+855|\+62|\+234|\+44)\s?\d|international number|foreign number|videsh(i)? number/i],
  ["chan.video_call_official","E4",55,/(skype|video ?call|zoom|whatsapp video).{0,50}(police|officer|cbi|court|statement|arrest|verification)|(police|officer|cbi|court).{0,50}(skype|video ?call|zoom)|camera (band mat|on rakho|chalu rakho)|कैमरा (बंद मत|चालू|ऑन)/i],
  ["chan.ivr_press1","E4",35,/press (1|one)|dial (1|one)|1 dabaye|ek dabaye/i],
  ["chan.app_switch","E4",45,/(download|install|open) (skype|zoom|telegram)|police app|court app/i],
  ["chan.apk_download","E4",50,/\.apk\b|install (this|the|our) app|download (this|the|our|gsin|trading) app|app install karo|link se (app|application)|ऐप (डाउनलोड|इंस्टॉल) कर/i],
  ["chan.shortlink","E4",40,/(bit\.ly|tinyurl|t\.co|rb\.gy|cutt\.ly|is\.gd|shorturl|wa\.me\/|api\.whatsapp\.com|chat\.whatsapp\.com|http:\/\/[^ ]{0,30}\.(xyz|top|info|link|club))/i],
  ["chan.new_number_known_photo","E4",50,/(new number|naya number|phone kho gaya|lost my phone|dropped my phone|this is my new|purana number band)/i],
  ["chan.group_invite","E4",35,/(telegram (group|channel)|whatsapp group|join .{0,20}group|vip group|group me add|trading group)/i],
  ["chan.personal_number_official","E4",40,/(contact|call|whatsapp).{0,10}(kare?in|karo|us)?.{0,6}[6-9]\d{4}[X\d]{4,6}|call urgent.{0,8}\d{10}/i],
  ["content.otp_request","E5",65,/(share|tell|send|bata(o|yein|iye)|provide|confirm)[^.]{0,25}\b(otp|o\.t\.p|one time password|cvv|atm pin|upi pin)\b|\b(otp|cvv|pin)\b[^.]{0,18}(share|bata|send|confirm)/i],
  ["content.too_good_returns","E5",45,/(guaranteed|guarantee(d)? (return|profit)|\d{1,3}\s?%\s?(daily|weekly|per day|per week)|double (your )?(money|paisa)|paisa double|earn .{0,18}daily|risk[- ]?free|fixed (daily )?profit|गारंटीड|गारंटी|दोगुना|रोज़?.{0,22}(कमा|मुनाफ़ा|%)|प्रतिदिन)/i],
  ["content.lottery_prize","E5",50,/(lottery|kbc|kaun banega|jackpot|lucky (draw|winner)|congratulations.{0,40}(won|winner|prize|jeeta)|(won|jeeta).{0,25}(lakh|crore|prize)|inaam|लॉटरी|इनाम|जीता|लकी ड्रॉ|बधाई.{0,20}(जीत|लाख|करोड़))/i],
  ["content.deepfake_media","E5",55,/(deepfake|ai (video|generated))|(video|reel|advertisement).{0,45}(invest|trading|profit|earning)|(ambani|tata|sitharaman|modi ji).{0,40}(video|reel|app)/i],
  ["content.doctored_doc","E5",50,/(arrest warrant|court notice|summon).{0,40}(aadhaar|pan|photo|attached)|(fake|forged) (warrant|seal|stamp|id)|letterhead/i],
  ["content.fake_screenshot","E5",45,/(payment (success(ful)? )?screenshot|screenshot (bhej|attached|of payment)|proof of payment attached)/i],
  ["content.morphed_media_threat","E5",55,/(morphed (photo|pic|image)|nude|obscene|ashleel|gandi photo|मॉर्फ़्ड फ़ोटो|अश्लील|गंदी फ़ोटो)/i],
  ["content.typos_leetspeak","E5",30,/(p0wer|el3ctric|b!ll|disc0nnect|imm[e3]diat|previous month bill was not update|electriccity|costomer|powar|dis ?connected tonight)/i],
  ["content.generic_greeting","E5",25,/^\s*(dear (customer|user|sir\/madam|consumer|valued customer|hdfc user|sbi user))/i]
];

const RE_MASKED_ACCT = /(a\/c|acct|account).{0,8}(x{2,}|\*{2,})\d{2,4}|xxxx\d{3,4}/i;
const RE_CONSUMER_ID = /(consumer (no|id|number)|customer id|ref(erence)? no|pnr|order (no|id|number)|policy (no|number)|उपभोक्ता (संख्या|क्रमांक))/i;
const RE_OTP_DELIVERY = /(otp|one time password)[^.]{0,45}(do ?not share|never share|kisi ko na bataye|share (mat|na) kare)|(do ?not|never|don'?t) share[^.]{0,30}(otp|pin|cvv)|(delivery|courier)[^.]{0,30}otp|otp[^.]{0,30}(delivery|courier ko)/i;
const RE_NAMED = /\b(dear|hi|hello|namaste)\s+[A-Z][a-z]{2,}\b/;


function norm(t){t=t||"";return t
  .replace(/(?<=[a-z])0(?=[a-z])/gi,'o').replace(/(?<=[a-z])3(?=[a-z])/gi,'e')
  .replace(/(?<=[a-z])1(?=[a-z])/gi,'i').replace(/(?<=[a-z])!(?=[a-z])/gi,'i')
  .replace(/(?<=[a-z])\$(?=[a-z])/gi,'s').replace(/(?<=[a-z])@(?=[a-z])/gi,'a');}

const FAMILY = {
  digital_arrest:{sig:["auth.police","auth.judge","fear.digital_arrest","fear.isolation","chan.video_call_official","fear.arrest_threat","fear.legal_case","pay.deposit_refundable"],en:"Digital arrest",hi:"डिजिटल अरेस्ट"},
  courier_parcel:{sig:["auth.courier","chan.ivr_press1","fear.legal_case","chan.intl_number"],en:"Courier / parcel scam",hi:"कूरियर पार्सल स्कैम"},
  official_phishing:{sig:["auth.bank","auth.utility","auth.govt","fear.account_block","chan.shortlink","content.typos_leetspeak","content.generic_greeting","chan.personal_number_official"],en:"Bank / official phishing",hi:"बैंक/सरकारी फ़िशिंग"},
  upi_payment_fraud:{sig:["pay.qr_to_receive","pay.collect_request","pay.refund_return_ask","content.fake_screenshot"],en:"UPI payment fraud",hi:"UPI धोखाधड़ी"},
  investment_trading:{sig:["auth.celebrity","content.too_good_returns","content.deepfake_media","chan.group_invite","pay.tax_fee_unlock","chan.apk_download","pay.gift_card_crypto"],en:"Investment / deepfake scam",hi:"निवेश/डीपफेक घोटाला"},
  job_task:{sig:["pay.small_payout_lure","pay.prepaid_task_deposit","auth.employer","fear.sunk_cost","content.lottery_prize","pay.fee_advance"],en:"Job / task / prize scam",hi:"नौकरी/टास्क/इनाम घोटाला"},
  loan_app:{sig:["fear.shame_threat","content.morphed_media_threat","pay.fee_advance"],en:"Loan app extortion",hi:"लोन ऐप वसूली"},
  impersonation_relationship:{sig:["auth.family_clone","fear.emergency_urgency","chan.new_number_known_photo"],en:"Family / friend impersonation",hi:"परिवार/मित्र की नक़ल"}
};

function classify(codes){
  let best=null,bestScore=0;
  for(const k in FAMILY){
    const hit=FAMILY[k].sig.filter(s=>codes.has(s));
    let sc=0; for(const h of hit){const d=SIGNALS.find(x=>x[0]===h); sc+=d?d[2]:0;}
    if(hit.length>=2 && sc>bestScore){best=k;bestScore=sc;}
  }
  return best;
}

function detect(text){
  const t = text || ""; const n = norm(t);
  const matched = [];
  for(const [code,ev,pts,re] of SIGNALS){ if(re.test(t)||re.test(n)) matched.push({code,ev,pts}); }
  const otpDelivery = RE_OTP_DELIVERY.test(n);
  const sig = matched.filter(m=> !(m.code==="content.otp_request" && otpDelivery));
  const codes = new Set(sig.map(m=>m.code));
  const per = {E1:0,E2:0,E3:0,E4:0,E5:0};
  for(const m of sig){ per[m.ev]+=m.pts; }
  for(const k in per){ per[k]=Math.min(100,per[k]); }
  let composite=0; for(const k in per){ composite+=per[k]*EVAL_W[k]; }
  const evalsHit=Object.values(per).filter(v=>v>0).length;
  const hasAuth=[...codes].some(c=>c.startsWith("auth."));
  const hasPay=[...codes].some(c=>c.startsWith("pay."));
  let knockout=null;
  if(hasAuth && (codes.has("pay.deposit_refundable")||codes.has("pay.tax_fee_unlock"))) knockout="K1";
  else if(codes.has("fear.isolation") && codes.has("chan.video_call_official")) knockout="K2";
  else if(codes.has("content.otp_request")) knockout="K3";
  else if(codes.has("pay.qr_to_receive")) knockout="K4";
  else if(codes.has("fear.shame_threat") && hasPay) knockout="K5";
  else if(codes.has("auth.family_clone") && (codes.has("fear.isolation")||codes.has("fear.emergency_urgency")) && hasPay) knockout="K6";
  else if(codes.has("fear.digital_arrest") && (codes.has("fear.isolation")||hasPay||hasAuth)) knockout="K7";
  else if(codes.has("content.lottery_prize") && (codes.has("pay.fee_advance")||codes.has("pay.demand")||codes.has("pay.tax_fee_unlock"))) knockout="K8";
  else if(codes.has("pay.screen_share") && hasAuth) knockout="K9";
  else if(codes.has("auth.family_clone") && codes.has("chan.new_number_known_photo") && hasPay) knockout="K10";
  else if(hasAuth && codes.has("fear.isolation") && hasPay) knockout="K11";
  else if(codes.has("content.too_good_returns") && codes.has("pay.tax_fee_unlock")) knockout="K12";
  const personalized=(RE_MASKED_ACCT.test(t)||RE_CONSUMER_ID.test(t)||RE_NAMED.test(t));
  const hasLinkOrCallback=codes.has("chan.shortlink")||codes.has("chan.personal_number_official")||/click|link/i.test(n);
  let verdict, score=Math.round(composite);
  if(knockout){ verdict="danger"; score=Math.max(score,75); }
  else{
    if(composite>=60) verdict="danger";
    else if(composite>=30) verdict="care";
    else verdict="safe";
    if(verdict==="danger" && evalsHit<2) verdict="care";
    if(verdict==="danger" && personalized && !hasLinkOrCallback) verdict="care";
    if(verdict==="danger" && codes.has("auth.family_clone") && !codes.has("fear.isolation") && !codes.has("chan.new_number_known_photo")) verdict="care";
  }
  if(!knockout && verdict==="safe" && sig.length>=2){ verdict="care"; score=Math.max(score,30); }
  const maxPts=sig.reduce((m,x)=>x.code.startsWith("auth.")?m:Math.max(m,x.pts),0);
  if(!knockout && verdict==="safe" && maxPts>=50){ verdict="care"; score=Math.max(score,30); }
  const family=classify(codes);
  return {codes:[...codes], per, score, verdict, knockout, personalized, family};
}

function checklistVerdict(a){
  const yes=k=>a&&a[k]===1;
  const QS=["q_auth","q_iso","q_threat","q_pay","q_prize","q_link","q_family","q_channel"];
  const nYes=QS.filter(yes).length;
  const dangerCombo=(yes("q_auth")&&yes("q_iso"))||(yes("q_iso")&&yes("q_pay"))||
    (yes("q_auth")&&yes("q_threat")&&yes("q_pay"))||(yes("q_family")&&yes("q_pay"))||
    (yes("q_prize")&&yes("q_pay"))||(yes("q_link")&&yes("q_pay"));
  let tier="safe";
  if(dangerCombo||nYes>=4) tier="danger";
  else if(nYes>=1) tier="care";
  return {tier,nYes};
}

export { detect, SIGNALS, EVAL_W, FAMILY, classify, norm, checklistVerdict };
