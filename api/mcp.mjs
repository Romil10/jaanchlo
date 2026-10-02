// Vercel serverless entry for the JaanchLo MCP endpoint, served at /mcp via vercel.json rewrite.
import { handleHttp } from "../mcp/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return handleHttp(req, res);
  let pre;
  try { pre = req.body; }
  catch {
    res.writeHead(400, { "content-type": "application/json", "cache-control": "no-store" });
    return res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }));
  }
  if (Buffer.isBuffer(pre)) pre = pre.toString("utf8");
  if (pre === null) pre = undefined;
  return handleHttp(req, res, pre);
}
