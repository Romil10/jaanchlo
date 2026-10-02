// JaanchLo MCP server core: stateless JSON-RPC over MCP streamable HTTP (JSON responses).
// Zero dependencies. Transport-agnostic: handleMessage(obj) -> response obj | null (notification).
// Privacy contract (same as engine/server.mjs): message text is evaluated in memory only.
// It is never logged, stored, or sent to any third party.
import { fromText, fromChecklist } from "../engine/adapters.mjs";
import { RuleEvaluator } from "../engine/evaluator.mjs";
import { validateInputEvent } from "../engine/schema.mjs";

export const SERVER_VERSION = "1.0.0";
export const SUPPORTED_PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const evaluator = new RuleEvaluator();

const INSTRUCTIONS =
  "JaanchLo checks messages and phone calls received in India for known scam patterns " +
  "(digital arrest, courier/parcel, bank/KYC phishing, UPI fraud, investment, job/task, loan-app extortion, " +
  "family impersonation). Verdicts are Safe, Be careful, or Danger, with plain reasons in English or Hindi. " +
  "Pass only the message text the user wants checked. If money was already lost, use get_scam_reporting_steps.";

const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["safe", "care", "danger"], description: "safe = no scam pattern found, care = be careful, danger = matches a known scam pattern" },
    verdict_label: { type: "string" },
    score: { type: "number", minimum: 0, maximum: 100, description: "Scam risk score, 0 to 100" },
    scam_type: { type: ["string", "null"], description: "Matched scam family label, or null" },
    reasons: { type: "array", items: { type: "string" }, description: "Up to five plain-language reasons" },
    next_step: { type: "string" },
    signals: { type: "array", items: { type: "string" }, description: "Rubric signal codes that fired" },
    disclaimer: { type: "string" },
    engine: { type: "string" }
  },
  required: ["verdict", "verdict_label", "score", "reasons", "next_step", "signals", "disclaimer", "engine"]
};

const LANG_PROP = {
  type: "string",
  enum: ["en", "hi", "auto"],
  default: "auto",
  description: "Language for the explanation: en (English) or hi (Hindi). Use hi when the user writes in Hindi or Devanagari. auto uses English explanations."
};

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

const CALL_QUESTIONS = {
  claims_authority: { q: "q_auth", d: "The caller said they are police, CBI, customs, a court, or a bank officer" },
  told_to_keep_secret: { q: "q_iso", d: "The caller told the user to stay on the call or video and not tell family" },
  threatened_arrest_or_block: { q: "q_threat", d: "The caller threatened arrest, a legal case, or a blocked account" },
  asked_for_money_or_otp: { q: "q_pay", d: "The caller asked for money, a 'refundable' deposit, an OTP, or card details" },
  promised_prize_or_earnings: { q: "q_prize", d: "The caller promised a prize, lottery win, or easy daily earnings" },
  asked_to_install_app_or_click_link: { q: "q_link", d: "The caller asked the user to install an app (APK, AnyDesk) or open a link" },
  claimed_family_emergency: { q: "q_family", d: "The caller said a family member is in an emergency and needs money urgently" },
  unusual_number_or_video_call: { q: "q_channel", d: "The call was a sudden video call or came from an unknown or international number" }
};

export const TOOLS = [
  {
    name: "check_message_for_scam",
    title: "Check a message for scam patterns",
    description:
      "Checks the text of an SMS, WhatsApp message, email, or call transcript that a person in India received, using " +
      "JaanchLo's open-source rule engine (48 signals, 20 knockout rules, India-specific scam families). Returns a " +
      "verdict (safe, care, or danger), a 0-100 risk score, the matched scam type, up to five plain-language reasons, " +
      "and the next step. Use when the user asks whether a specific message they received is a scam or fraud. " +
      "Limitations: it reads text only (not images or links' destinations), and it is a second opinion, not a guarantee.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", minLength: 1, maxLength: 8000, description: "The exact text of the message the user received and wants checked." },
        lang: LANG_PROP
      },
      required: ["text"],
      additionalProperties: false
    },
    outputSchema: VERDICT_SCHEMA,
    annotations: { title: "Check a message for scam patterns", ...READ_ONLY }
  },
  {
    name: "check_call_for_scam",
    title: "Check a phone or video call for scam patterns",
    description:
      "Checks a phone or video call the user received in India, from yes/no facts about what the caller did, when " +
      "there is no message text to paste. Set each field to true only if the user says it happened. Returns the " +
      "same verdict, score, reasons, and next step as check_message_for_scam.",
    inputSchema: {
      type: "object",
      properties: {
        ...Object.fromEntries(Object.entries(CALL_QUESTIONS).map(([k, v]) => [k, { type: "boolean", default: false, description: v.d }])),
        lang: LANG_PROP
      },
      additionalProperties: false
    },
    outputSchema: VERDICT_SCHEMA,
    annotations: { title: "Check a phone or video call for scam patterns", ...READ_ONLY }
  },
  {
    name: "get_scam_reporting_steps",
    title: "Get steps to report a scam in India",
    description:
      "Returns the official Indian reporting and recovery steps for a suspected scam: the 1930 National Cyber Crime " +
      "Helpline, cybercrime.gov.in, the bank's official number, and Chakshu on Sanchar Saathi for reporting fraud " +
      "calls and messages. Use when the user has lost money, shared an OTP or bank details, or wants to report a " +
      "scam attempt in India.",
    inputSchema: {
      type: "object",
      properties: {
        situation: {
          type: "string",
          enum: ["money_lost", "details_shared", "no_loss_report_attempt"],
          description: "money_lost = money already left the account; details_shared = OTP, PIN, card, or screen access shared but no loss yet; no_loss_report_attempt = nothing shared, the user wants to report the attempt"
        },
        lang: LANG_PROP
      },
      required: ["situation"],
      additionalProperties: false
    },
    outputSchema: {
      type: "object",
      properties: {
        situation: { type: "string" },
        urgent: { type: "boolean" },
        steps: { type: "array", items: { type: "string" } },
        official_links: { type: "array", items: { type: "object", properties: { name: { type: "string" }, url: { type: "string" } }, required: ["name", "url"] } }
      },
      required: ["situation", "urgent", "steps", "official_links"]
    },
    annotations: { title: "Get steps to report a scam in India", ...READ_ONLY }
  }
];

const LINKS = [
  { name: "National Cyber Crime Reporting Portal", url: "https://cybercrime.gov.in" },
  { name: "Chakshu, Sanchar Saathi (report fraud calls and messages)", url: "https://sancharsaathi.gov.in" }
];

const STEPS = {
  en: {
    money_lost: [
      "Call 1930, the National Cyber Crime Helpline, right now. The sooner you call, the better the chance the bank can hold the money.",
      "Call your bank on the number printed on your card or passbook and ask them to block the card, UPI, and net banking.",
      "File a complaint at cybercrime.gov.in and note the complaint number.",
      "Keep screenshots of the messages, the caller's numbers, and every transaction ID.",
      "Do not pay anyone who offers to recover your money. Recovery offers are a second scam."
    ],
    details_shared: [
      "Call your bank on the number printed on your card or passbook and block the card, UPI, and net banking now.",
      "Change your UPI PIN, net banking password, and email password from your own device.",
      "If you installed an app such as AnyDesk or an APK, uninstall it and turn off mobile data until the bank confirms the account is safe.",
      "If any money moves, call 1930 immediately.",
      "Report the number on Chakshu at sancharsaathi.gov.in."
    ],
    no_loss_report_attempt: [
      "Do not reply, call back, or click any link in the message.",
      "Report the number or message on Chakshu at sancharsaathi.gov.in.",
      "Block the number on your phone and on WhatsApp.",
      "Warn family members, especially elders, about this pattern."
    ]
  },
  hi: {
    money_lost: [
      "अभी 1930 पर कॉल करें, यह राष्ट्रीय साइबर क्राइम हेल्पलाइन है। जितनी जल्दी कॉल करेंगे, बैंक के पैसे रोक पाने की संभावना उतनी ज़्यादा होगी।",
      "अपने कार्ड या पासबुक पर छपे नंबर से बैंक को कॉल करें और कार्ड, UPI और नेट बैंकिंग ब्लॉक करवाएँ।",
      "cybercrime.gov.in पर शिकायत दर्ज करें और शिकायत नंबर लिख लें।",
      "मैसेज के स्क्रीनशॉट, कॉल करने वाले के नंबर और हर ट्रांज़ैक्शन ID संभाल कर रखें।",
      "पैसे वापस दिलाने का दावा करने वाले किसी को भी पैसे न दें। यह दूसरा स्कैम होता है।"
    ],
    details_shared: [
      "अपने कार्ड या पासबुक पर छपे नंबर से अभी बैंक को कॉल करें और कार्ड, UPI और नेट बैंकिंग ब्लॉक करवाएँ।",
      "अपने ही फ़ोन से UPI PIN, नेट बैंकिंग पासवर्ड और ईमेल पासवर्ड बदलें।",
      "अगर AnyDesk या कोई APK ऐप इंस्टॉल किया है तो उसे हटाएँ, और बैंक के पुष्टि करने तक मोबाइल डेटा बंद रखें।",
      "अगर कोई भी पैसा कटे तो तुरंत 1930 पर कॉल करें।",
      "sancharsaathi.gov.in पर Chakshu में उस नंबर की शिकायत करें।"
    ],
    no_loss_report_attempt: [
      "मैसेज का जवाब न दें, वापस कॉल न करें और कोई लिंक न खोलें।",
      "sancharsaathi.gov.in पर Chakshu में नंबर या मैसेज की शिकायत करें।",
      "फ़ोन और WhatsApp पर नंबर ब्लॉक करें।",
      "परिवार, ख़ासकर बुज़ुर्गों को इस तरीके के बारे में बताएँ।"
    ]
  }
};

function langOf(v) { return v === "hi" ? "hi" : (v === "en" ? "en" : "auto"); }

function verdictResult(event) {
  const v = validateInputEvent(event);
  if (!v.ok) return toolError("Invalid input: " + v.errors.join("; "));
  const r = evaluator.evaluate(event);
  const e = r.explanation;
  const out = {
    verdict: r.verdict,
    verdict_label: e.tier_label,
    score: r.score,
    scam_type: e.family_label || null,
    reasons: e.reasons,
    next_step: e.next_step,
    signals: r.codes,
    disclaimer: e.disclaimer,
    engine: "JaanchLo SREM rule engine " + SERVER_VERSION + " (open source, github.com/Romil10/jaanchlo)"
  };
  const lines = [
    `Verdict: ${out.verdict_label} (${out.verdict}), risk score ${out.score}/100.`,
    out.scam_type ? `Scam type: ${out.scam_type}.` : null,
    out.reasons.length ? "Reasons:\n- " + out.reasons.join("\n- ") : "No scam signals matched.",
    `Next step: ${out.next_step}`,
    out.disclaimer
  ].filter(Boolean);
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: out };
}

function toolError(msg) { return { content: [{ type: "text", text: msg }], isError: true }; }

export function callTool(name, args) {
  args = args && typeof args === "object" ? args : {};
  if (name === "check_message_for_scam") {
    if (typeof args.text !== "string" || !args.text.trim()) return toolError("Invalid input: text must be a non-empty string.");
    return verdictResult(fromText({ text: args.text, lang: langOf(args.lang) }));
  }
  if (name === "check_call_for_scam") {
    const answers = {};
    let any = false;
    for (const [k, v] of Object.entries(CALL_QUESTIONS)) { if (args[k] === true) { answers[v.q] = 1; any = true; } }
    if (!any) {
      const L = langOf(args.lang) === "hi" ? "hi" : "en";
      const out = { verdict: "safe", verdict_label: L === "hi" ? "सुरक्षित लगता है" : "Looks safe", score: 0, scam_type: null,
        reasons: [], next_step: L === "hi" ? "कॉल में कोई स्कैम संकेत नहीं मिला। फिर भी किसी अनजान व्यक्ति को OTP या पैसे न दें।" : "None of the scam signals were reported for this call. Still, never share an OTP or send money to an unknown caller.",
        signals: [], disclaimer: L === "hi" ? "JaanchLo एक दूसरी राय है, गारंटी नहीं। संदेह हो तो पैसे न दें, 1930 पर कॉल करें।" : "JaanchLo is a second opinion, not a guarantee. When unsure, do not pay, and call 1930.",
        engine: "JaanchLo SREM rule engine " + SERVER_VERSION + " (open source, github.com/Romil10/jaanchlo)" };
      return { content: [{ type: "text", text: `Verdict: ${out.verdict_label} (safe). ${out.next_step} ${out.disclaimer}` }], structuredContent: out };
    }
    return verdictResult(fromChecklist(answers, langOf(args.lang)));
  }
  if (name === "get_scam_reporting_steps") {
    const s = args.situation;
    if (!["money_lost", "details_shared", "no_loss_report_attempt"].includes(s)) return toolError("Invalid input: situation must be money_lost, details_shared, or no_loss_report_attempt.");
    const L = langOf(args.lang) === "hi" ? "hi" : "en";
    const out = { situation: s, urgent: s !== "no_loss_report_attempt", steps: STEPS[L][s], official_links: LINKS };
    const text = out.steps.map((x, i) => `${i + 1}. ${x}`).join("\n") + "\n" + LINKS.map(l => `${l.name}: ${l.url}`).join("\n");
    return { content: [{ type: "text", text }], structuredContent: out };
  }
  return null;
}

const err = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const res = (id, result) => ({ jsonrpc: "2.0", id, result });

export function handleMessage(msg) {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg && msg.id, -32600, "Invalid Request");
  }
  const isNotification = !("id" in msg);
  if (isNotification) return null;
  const { id, method, params } = msg;
  switch (method) {
    case "initialize": {
      const requested = params && params.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOLS.includes(requested) ? requested : SUPPORTED_PROTOCOLS[0];
      return res(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "jaanchlo", title: "JaanchLo Scam Check", version: SERVER_VERSION },
        instructions: INSTRUCTIONS
      });
    }
    case "ping": return res(id, {});
    case "tools/list": return res(id, { tools: TOOLS });
    case "tools/call": {
      const name = params && params.name;
      let out;
      try { out = callTool(name, params && params.arguments); }
      catch (e) { out = toolError("The scam check failed unexpectedly. Please try again. If you are unsure, do not pay, and call 1930."); }
      if (out === null) return err(id, -32602, "Unknown tool: " + String(name));
      return res(id, out);
    }
    default: return err(id, -32601, "Method not found: " + method);
  }
}
