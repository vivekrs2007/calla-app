/**
 * Calla Inbound Email — Cloudflare Email Worker
 * Simple line-based approach — no external dependencies
 */

function extractReadableText(rawEmail) {
  const lines = rawEmail.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const readable = [];
  let plainSection = [];   // text/plain lines collected
  let inPlain = false;
  let inHtml = false;
  let inBase64Block = false;

  for (let i = 0; i < lines.length; i++) {
    const line   = lines[i];
    const trimmed = line.trim();
    const lower  = trimmed.toLowerCase();

    // ── MIME / email header lines — skip ───────────────────────────────
    if (
      /^(content-type|content-transfer-encoding|content-disposition|mime-version|received|message-id|date|subject|from|to|cc|bcc|reply-to|return-path|dkim-signature|arc-|x-|list-|delivered-to|authentication-results|feedback-id|precedence|auto-submitted)/i
        .test(trimmed)
    ) {
      // Track which section we're entering
      if (lower.startsWith("content-type: text/plain"))  { inPlain = true;  inHtml = false; inBase64Block = false; }
      else if (lower.startsWith("content-type: text/html"))   { inHtml  = true;  inPlain = false; inBase64Block = false; }
      else if (lower.startsWith("content-type: multipart"))   { inPlain = false; inHtml  = false; }
      if (lower.startsWith("content-transfer-encoding: base64")) inBase64Block = true;
      continue;
    }

    // ── MIME boundaries — skip, reset section flags ────────────────────
    if (trimmed.startsWith("--")) {
      inPlain = false; inHtml = false; inBase64Block = false;
      continue;
    }

    // ── Skip base64 blocks (long lines of base64 chars) ───────────────
    if (inBase64Block || /^[A-Za-z0-9+/]{40,}={0,2}$/.test(trimmed)) {
      continue;
    }

    // ── Skip quoted-printable encoded junk ────────────────────────────
    if (/^=[0-9A-Fa-f]{2}/.test(trimmed) && trimmed.length < 8) continue;

    // ── Strip HTML tags if line looks like HTML ────────────────────────
    if ((trimmed.startsWith("<") || trimmed.includes("</")) && trimmed.includes(">")) {
      const stripped = trimmed
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, " ").trim();
      if (stripped.length > 3) readable.push(stripped);
      continue;
    }

    // ── Decode quoted-printable soft line breaks ───────────────────────
    let decoded = trimmed
      .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/=$/, ""); // soft wrap

    if (decoded.length > 0) readable.push(decoded);
  }

  // Deduplicate adjacent identical lines and clean up
  const deduped = [];
  for (const l of readable) {
    if (deduped.length === 0 || deduped[deduped.length - 1] !== l) deduped.push(l);
  }

  return deduped.join("\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 20000);
}

export default {
  async email(message, env, ctx) {
    const toAddress  = message.to   || "";
    const prefix     = toAddress.split("@")[0].toLowerCase();
    const fromAddress = message.from || "";
    const subject    = message.headers.get("subject") || "(No subject)";
    const fromHeader = message.headers.get("from")    || fromAddress;
    const fromName   = (fromHeader.match(/^"?([^"<]+)"?\s*</)?.[1] || "").trim();

    let bodyText = subject; // fallback
    try {
      const rawBuffer = await new Response(message.raw).arrayBuffer();
      const rawText   = new TextDecoder("utf-8", { fatal: false }).decode(rawBuffer);
      const extracted = extractReadableText(rawText);
      if (extracted.length > 10) bodyText = extracted;
    } catch (e) {
      console.error("Parse error:", e);
    }

    console.log(`prefix=${prefix} subject="${subject}" bodyLen=${bodyText.length} preview="${bodyText.slice(0,80)}"`);

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
      if (!res.ok) {
        console.error(`HTTP ${res.status}: ${await res.text().catch(() => "")}`);
      } else {
        console.log(`✓ Stored for prefix=${prefix}`);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  },
};
