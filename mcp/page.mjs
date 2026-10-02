// Human-readable page shown when a person opens /mcp in a browser. Protocol clients never see it.
export const MCP_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>JaanchLo for ChatGPT | JaanchLo</title>
<meta name="description" content="This address connects JaanchLo's scam checker to ChatGPT. How to add it, and what it does.">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Ccircle cx='50' cy='50' r='36' fill='none' stroke='%230a0a0a' stroke-width='12'/%3E%3Cpath d='M50 14 A36 36 0 0 0 50 86 Z' fill='%230a0a0a'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+Devanagari:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;font-family:'Inter','Noto Sans Devanagari',system-ui,sans-serif;background:#fff;color:#0a0a0a;line-height:1.6;font-size:17px}
header{border-bottom:1px solid #0a0a0a}.wrap{max-width:760px;margin:0 auto;padding:0 22px}
header .wrap{display:flex;justify-content:space-between;align-items:center;min-height:60px}
.wordmark{font-weight:800;font-size:20px;text-decoration:none;color:#0a0a0a}.wordmark span{font-weight:600;color:#555}
main{padding:44px 0 64px}h1{font-size:clamp(30px,7vw,44px);line-height:1.1;margin:0 0 12px;font-weight:800;letter-spacing:-0.02em}
.lede{color:#333;margin:0 0 28px}h2{font-size:20px;margin:34px 0 8px;font-weight:800}
a{color:#0a0a0a}ol,ul{padding-left:22px}li{margin:6px 0}
.url{display:block;border:1.5px solid #0a0a0a;padding:14px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;word-break:break-all;margin:12px 0 6px}
.note{font-size:14px;color:#555}.box{border:1.5px solid #0a0a0a;padding:18px 20px;margin:28px 0}
footer{background:#0a0a0a;color:#fff;padding:30px 0;font-size:14px}footer a{color:#fff;margin-right:16px}
.hi{font-family:'Noto Sans Devanagari','Inter',sans-serif;color:#333}
</style>
</head>
<body>
<header><div class="wrap"><a class="wordmark" href="/">JaanchLo <span>जांच लो</span></a><a href="/check">Check a message</a></div></header>
<main><div class="wrap">
<h1>JaanchLo for ChatGPT</h1>
<p class="lede">This address connects JaanchLo's scam checker to ChatGPT. It is meant for ChatGPT to use, so there is nothing to do on this page. To check a message yourself, use the <a href="/check">JaanchLo checker</a>.</p>
<p class="hi">यह पता JaanchLo को ChatGPT से जोड़ता है। खुद मैसेज जांचने के लिए <a href="/check">JaanchLo चेकर</a> खोलें।</p>
<h2>What it does inside ChatGPT</h2>
<ul>
<li>Checks a message you received for scam patterns common in India, and gives a verdict: Safe, Be careful, or Danger, with plain reasons.</li>
<li>Checks a suspicious phone or video call from a few yes or no questions.</li>
<li>Gives the official steps if money was lost: 1930, cybercrime.gov.in, your bank, and Chakshu.</li>
</ul>
<p>Answers are available in English and Hindi. The message you check is never stored or logged.</p>
<h2>How to add it in ChatGPT (developer mode)</h2>
<ol>
<li>In ChatGPT, open Settings, then Security and login, and turn on Developer mode.</li>
<li>Go to Plugins and press the plus button.</li>
<li>Paste this address, choose no authentication, and create the connection:</li>
</ol>
<span class="url">https://jaanchlo.regnor.systems/mcp</span>
<p class="note">Opening this address in a browser shows this page. ChatGPT talks to it differently and gets the scam checker.</p>
<div class="box"><strong>Being scammed right now?</strong> Hang up and call <strong>1930</strong>, the National Cyber Crime Helpline.</div>
</div></main>
<footer><div class="wrap"><a href="/">Home</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a><a href="https://github.com/Romil10/jaanchlo" target="_blank" rel="noopener noreferrer">Source code</a></div></footer>
</body>
</html>
`;
