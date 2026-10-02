// MCP endpoint contract: live HTTP server on an ephemeral port, JSON-RPC over POST.
import fs from "fs";
import { startMcpServer } from "../../mcp/http.mjs";
import { TOOLS, SUPPORTED_PROTOCOLS } from "../../mcp/core.mjs";
import { validateVerdict } from "../schema.mjs";
import { ok, done } from "./_t.mjs";

const { server, port } = await startMcpServer(0);
const url = `http://127.0.0.1:${port}/mcp`;
const H = { "content-type": "application/json", accept: "application/json, text/event-stream" };
let nid = 1;
async function rpc(method, params) {
  const r = await fetch(url, { method: "POST", headers: H, body: JSON.stringify({ jsonrpc: "2.0", id: nid++, method, params }) });
  return { status: r.status, body: await r.json() };
}
const call = (name, args) => rpc("tools/call", { name, arguments: args });

// handshake
const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } });
ok(init.status === 200 && init.body.result.protocolVersion === "2025-06-18", "initialize echoes a supported protocol version");
ok(init.body.result.capabilities.tools && init.body.result.serverInfo.name === "jaanchlo", "initialize advertises tools capability and server name");
ok(init.body.result.instructions.length <= 512, "server instructions fit in 512 characters");
const init2 = await rpc("initialize", { protocolVersion: "1999-01-01" });
ok(init2.body.result.protocolVersion === SUPPORTED_PROTOCOLS[0], "unknown protocol version falls back to latest supported");
const note = await fetch(url, { method: "POST", headers: H, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
ok(note.status === 202, "notification returns 202 with no body");
ok((await rpc("ping")).body.result !== undefined, "ping answers");

// tools/list and annotations
const list = await rpc("tools/list");
const tools = list.body.result.tools;
ok(tools.length === 3, "three tools listed");
for (const t of tools) {
  const a = t.annotations || {};
  ok(a.readOnlyHint === true && a.destructiveHint === false && a.openWorldHint === false, `${t.name}: read-only, non-destructive, closed-world annotations set`);
  ok(t.description && t.description.length > 80 && t.inputSchema && t.outputSchema, `${t.name}: description, input and output schemas present`);
  ok(!/\b(best|official|pick_me)\b/i.test(t.name), `${t.name}: name avoids promotional words`);
}
ok(JSON.stringify(TOOLS) === JSON.stringify(tools), "listed tools match exported definitions");

// verdicts
const d = await call("check_message_for_scam", { text: "CBI officer: you are under digital arrest, do not tell family, pay refundable deposit", lang: "en" });
const ds = d.body.result.structuredContent;
ok(ds.verdict === "danger" && ds.next_step.includes("1930"), "digital-arrest script -> danger with 1930 next step");
ok(validateVerdict({ verdict: ds.verdict, score: ds.score, signals: ds.signals, reasons: ds.reasons, next_step: ds.next_step }).ok, "structured output passes the engine verdict schema");
ok(d.body.result.content[0].type === "text" && d.body.result.content[0].text.startsWith("Verdict:"), "text content summarises the verdict");
const s = await call("check_message_for_scam", { text: "OTP for your SBI login is 480912. Do NOT share with anyone, including bank staff." });
ok(s.body.result.structuredContent.verdict === "safe", "benign OTP delivery -> safe");
const hi = await call("check_message_for_scam", { text: "आपका पार्सल कस्टम में पकड़ा गया है, ड्रग्स मिले हैं, अभी 1 दबाएँ", lang: "hi" });
ok(hi.body.result.structuredContent.verdict !== "safe" && /[ऀ-ॿ]/.test(hi.body.result.structuredContent.next_step), "Hindi courier script -> not safe, Hindi next step");
const c = await call("check_call_for_scam", { claims_authority: true, told_to_keep_secret: true, asked_for_money_or_otp: true });
ok(c.body.result.structuredContent.verdict === "danger", "call checklist authority + secrecy + payment -> danger");
const c0 = await call("check_call_for_scam", {});
ok(c0.body.result.structuredContent.verdict === "safe" && !c0.body.result.isError, "call checklist with nothing reported -> safe, not an error");
const rep = await call("get_scam_reporting_steps", { situation: "money_lost" });
ok(rep.body.result.structuredContent.urgent === true && rep.body.result.structuredContent.steps[0].includes("1930"), "money_lost -> urgent, 1930 first");
ok(rep.body.result.structuredContent.official_links.every(l => l.url.startsWith("https://") && l.url.endsWith(".gov.in")), "reporting links are official .gov.in HTTPS");
const repHi = await call("get_scam_reporting_steps", { situation: "no_loss_report_attempt", lang: "hi" });
ok(repHi.body.result.structuredContent.urgent === false && /[ऀ-ॿ]/.test(repHi.body.result.structuredContent.steps[0]), "report-only Hindi steps, not urgent");

// errors
const e1 = await call("check_message_for_scam", { text: "   " });
ok(e1.body.result.isError === true, "empty text -> tool error, not a crash");
const e2 = await call("check_message_for_scam", { text: "x".repeat(8001) });
ok(e2.body.result.isError === true, "text over 8000 chars -> tool error");
const e3 = await call("get_scam_reporting_steps", { situation: "other" });
ok(e3.body.result.isError === true, "bad situation -> tool error");
const e4 = await call("delete_everything", {});
ok(e4.body.error && e4.body.error.code === -32602, "unknown tool -> JSON-RPC -32602");
const e5 = await rpc("resources/list");
ok(e5.body.error && e5.body.error.code === -32601, "unsupported method -> -32601");
const e6 = await fetch(url, { method: "POST", headers: H, body: "{bad json" });
ok(e6.status === 400, "malformed JSON -> 400");
const e7 = await fetch(url, { method: "GET" });
ok(e7.status === 405, "GET -> 405 (stateless POST-only endpoint)");
const br = await fetch(url, { headers: { accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" } });
const brBody = await br.text();
ok(br.status === 200 && (br.headers.get("content-type") || "").startsWith("text/html"), "browser GET -> 200 HTML explainer page");
ok(brBody.includes("JaanchLo for ChatGPT") && brBody.includes("https://jaanchlo.regnor.systems/mcp") && !brBody.includes("\u2014"), "explainer names the endpoint and has no em dashes");
const sse = await fetch(url, { headers: { accept: "text/event-stream" } });
ok(sse.status === 405, "MCP client GET asking for an event stream -> still 405");
const mixed = await fetch(url, { headers: { accept: "text/html, text/event-stream" } });
ok((br.headers.get("cache-control")||"").includes("no-store") && /accept/i.test(br.headers.get("vary")||""), "explainer page is uncacheable and varies on Accept, so a shared cache cannot serve it to protocol clients");
ok(mixed.status === 405, "GET accepting both HTML and event stream is treated as a protocol client -> 405");
const post2 = await rpc("ping");
ok(post2.status === 200, "POST still answers after the browser branch");

// privacy static check
for (const f of ["../../mcp/core.mjs", "../../mcp/http.mjs", "../../api/mcp.mjs"]) {
  const src = fs.readFileSync(new URL(f, import.meta.url), "utf8");
  ok(!/appendFile|writeFile|createWriteStream/.test(src), `${f.split("/").pop()}: no disk writes`);
  ok(!/console\.(log|error|warn|info)\([^)]*(body|msg|args|text|raw)/.test(src), `${f.split("/").pop()}: never logs request content`);
  ok(!/fetch\(|https?\.request\(/.test(src), `${f.split("/").pop()}: makes no outbound network calls`);
}

server.close();
done("mcp");
