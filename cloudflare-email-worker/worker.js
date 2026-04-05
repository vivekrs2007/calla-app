/**
 * Calla Inbound Email — Cloudflare Email Worker
 * Uses RFC 2822 blank-line separator to isolate body from headers.
 */

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/\s{3,}/g, "\n\n").trim();
}

function decodeQP(s) {
  return s
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function decodeB64(s) {
  try { return atob(s.replace(/\s/g, "")); } catch (_) { return ""; }
}

// Extract readable text from MIME parts given a boundary
function extractParts(bodyText, boundary) {
  const escaped = escapeRegex(boundary);
  // Split on --boundary lines
  const parts = bodyText.split(new RegExp(`\\n?--${escaped}(?:--|[ \\t]*\\n)`));
  let plainText = "";
  let htmlText  = "";

  for (const part of parts) {
    if (!part.trim()) continue;
    const sep = part.indexOf("\n\n");
    if (sep === -1) continue;

    const headers = part.slice(0, sep).toLowerCase();
    let   content = part.slice(sep + 2);

    // Decode transfer encoding
    if      (headers.includes("base64"))           content = decodeB64(content);
    else if (headers.includes("quoted-printable")) content = decodeQP(content);

    // Nested multipart — recurse
    const nestedBm = headers.match(/boundary="([^"]+)"/i) || headers.match(/boundary=([^\s;]+)/i);
    if (nestedBm && headers.includes("multipart/")) {
      const nested = extractParts(content, nestedBm[1].replace(/"/g, "").trim());
      if (nested && !plainText) plainText = nested;
      continue;
    }

    const isPlain = headers.includes("content-type: text/plain") || headers.includes("content-type:text/plain");
    const isHtml  = headers.includes("content-type: text/html")  || headers.includes("content-type:text/html");

    if (isPlain && !plainText) plainText = content.trim();
    else if (isHtml  && !htmlText)  htmlText  = stripHtml(content);
  }

  return (plainText || htmlText).trim();
}

// Main extractor — finds the blank line that separates RFC 2822 headers from body
function extractBodyFromMime(rawEmail) {
  const text = rawEmail.replace(/\r\n/g, "\n");

  // The first \n\n in the raw email separates top-level headers from body
  const sep = text.indexOf("\n\n");
  if (sep === -1) return text.slice(0, 3000);

  const topHeaders = text.slice(0, sep);
  const body       = text.slice(sep + 2);

  // Check for multipart boundary in top-level headers
  const bm = topHeaders.match(/boundary="([^"]+)"/i) || topHeaders.match(/boundary=([^\s;]+)/i);
  if (bm) {
    const boundary = bm[1].replace(/"/g, "").trim();
    const result   = extractParts(body, boundary);
    if (result) return result.slice(0, 20000);
  }

  // Single-part email
  const enc  = (topHeaders.match(/content-transfer-encoding:\s*([^\n]+)/i)?.[1] || "").toLowerCase().trim();
  let   bodyText = body;
  if      (enc === "base64")           bodyText = decodeB64(bodyText);
  else if (enc === "quoted-printable") bodyText = decodeQP(bodyText);

  if (topHeaders.match(/content-type:\s*text\/html/i)) bodyText = stripHtml(bodyText);

  return bodyText.trim().slice(0, 20000);
}

export default {
  async email(message, env, ctx) {
    const toAddress   = message.to   || "";
    const prefix      = toAddress.split("@")[0].toLowerCase();
    const fromAddress = message.from || "";
    const subject     = message.headers.get("subject") || "(No subject)";
    const fromHeader  = message.headers.get("from")    || fromAddress;
    const fromName    = (fromHeader.match(/^"?([^"<]+)"?\s*</)?.[1] || "").trim();

    let bodyText = subject;
    try {
      const rawBuffer = await new Response(message.raw).arrayBuffer();
      const rawText   = new TextDecoder("utf-8", { fatal: false }).decode(rawBuffer);
      const extracted = extractBodyFromMime(rawText);
      if (extracted.length > 5) bodyText = extracted;
    } catch (e) {
      console.error("Parse error:", e);
    }

    console.log(`prefix=${prefix} subject="${subject}" bodyLen=${bodyText.length} preview="${bodyText.slice(0, 100)}"`);

    const edgeUrl = (env.SUPABASE_EDGE_URL || "").replace(/\/$/, "");
    try {
      const res = await fetch(`${edgeUrl}/receive-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": env.WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({ prefix, from_address: fromAddress, from_name: fromName, subject, body_text: bodyText }),
      });
      if (!res.ok) console.error(`HTTP ${res.status}: ${await res.text().catch(() => "")}`);
      else         console.log(`✓ Stored for prefix=${prefix}`);
    } catch (e) {
      console.error("Fetch error:", e);
    }
  },
};
