// HTTP binding for the JaanchLo MCP core (MCP streamable HTTP, stateless, JSON responses only).
// Shared by the Vercel function (api/mcp.mjs) and the local dev server (node mcp/http.mjs).
// Privacy: request bodies are parsed in memory and never logged or persisted.
import http from "http";
import { handleMessage } from "./core.mjs";
import { MCP_PAGE } from "./page.mjs";

const MAX_BODY = 64 * 1024;

function send(res, code, obj, extra = {}) {
  const body = obj === undefined ? "" : JSON.stringify(obj);
  res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store", ...extra });
  res.end(body);
}

function readRaw(req) {
  return new Promise((ok, fail) => {
    let n = 0; const chunks = [];
    req.on("data", c => { n += c.length; if (n > MAX_BODY) { fail(new Error("too large")); req.destroy(); return; } chunks.push(c); });
    req.on("end", () => ok(Buffer.concat(chunks).toString("utf8")));
    req.on("error", fail);
  });
}

// A person's browser asks for HTML; an MCP client opening a stream asks for text/event-stream.
function wantsHtml(req) {
  const a = String((req.headers && req.headers.accept) || "").toLowerCase();
  return a.includes("text/html") && !a.includes("text/event-stream");
}

// preParsed: Vercel may already have parsed the JSON body into req.body.
export async function handleHttp(req, res, preParsed) {
  if (req.method === "OPTIONS") return send(res, 204, undefined, { allow: "POST, OPTIONS" });
  if (req.method === "GET" && /\/health\/?$/.test(req.url || "")) return send(res, 200, { ok: true, server: "jaanchlo-mcp" });
  if ((req.method === "GET" || req.method === "HEAD") && wantsHtml(req)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" });
    return res.end(req.method === "HEAD" ? "" : MCP_PAGE);
  }
  if (req.method !== "POST") return send(res, 405, { jsonrpc: "2.0", id: null, error: { code: -32000, message: "Method not allowed. This MCP endpoint is stateless and accepts POST only." } }, { allow: "POST, OPTIONS" });

  let msg = preParsed;
  if (msg === undefined || typeof msg === "string") {
    let raw = typeof msg === "string" ? msg : undefined;
    try { if (raw === undefined) raw = await readRaw(req); msg = JSON.parse(raw); }
    catch { return send(res, 400, { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error or payload too large" } }); }
  }

  if (Array.isArray(msg)) {
    const out = msg.map(handleMessage).filter(Boolean);
    return out.length ? send(res, 200, out) : send(res, 202, undefined);
  }
  const out = handleMessage(msg);
  if (out === null) return send(res, 202, undefined);
  return send(res, 200, out);
}

export function startMcpServer(port = 0) {
  return new Promise(ok => {
    const server = http.createServer((q, s) => {
      handleHttp(q, s).catch(() => send(s, 500, { jsonrpc: "2.0", id: null, error: { code: -32603, message: "Internal error" } }));
    });
    server.listen(port, "127.0.0.1", () => ok({ server, port: server.address().port }));
  });
}

if (process.argv[1] && process.argv[1].endsWith("http.mjs")) {
  const p = Number(process.env.PORT || 8788);
  startMcpServer(p).then(({ port }) => console.log("JaanchLo MCP on http://127.0.0.1:" + port + "/mcp"));
}
