/**
 * Calla Inbound Email — Cloudflare Email Worker (no dependencies)
 */

// ── Decode quoted-printable ─────────────────────────────────────────────────
function decodeQP(str) {
  return str
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ── Decode base64 safely ────────────────────────────────────────────────────
function decodeBase64(str) {
  try {
    return atob(str.replace(/\s/g, ""));
  } catch (_) {
    return "";
  }
}

// ── Strip HTML to readable plain text ──────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

// ── Properly extract plain text from a raw RFC 2822 MIME email ──────────────
function extractBodyFromMime(rawText) {
  // Normalise line endings
  rawText = rawText.replace(/\r\n/g, "\n");

  // ── Find MIME boundary ──────────────────────────────────────────────────
  const boundaryMatch =
    rawText.match(/boundary="([^"]+)"/i) ||
    rawText.match(/boundary=([^\s;]+)/i);

  if (boundaryMatch) {
    const boundary = boundaryMatch[1].replace(/^"|"$/g, "").trim();
    const escapedB = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = rawText.split(new RegExp(`\\n--${escapedB}(?:--)?(?:\\n|$)`));

    let plainText = "";
    let htmlText  = "";

    for (const part of parts) {
      if (!part.trim() || part.startsWith("--")) continue;

      const sepIdx = part.indexOf("\n\n");
      if (sepIdx === -1) continue;

      const headers = part.slice(0, sepIdx).toLowerCase();
      let   body    = part.slice(sepIdx + 2);

      // Decode transfer encoding
      if (headers.includes("quoted-printable")) body = decodeQP(body);
      else if (headers.includes("base64"))       body = decodeBase64(body);

      if ((headers.includes("content-type: text/plain") || headers.includes("content-type:text/plain")) && !plainText) {
        plainText = body.trim();
      } else if ((headers.includes("content-type: text/html") || headers.includes("content-type:text/html")) && !htmlText) {
        htmlText = stripHtml(body);
      }

      // If it's a nested multipart, recurse
      if (headers.includes("multipart/") && !plainText && !htmlText) {
        const nested = extractBodyFromMime(part);
        if (nested) plainText = nested;
      }
    }

    return (plainText || htmlText).slice(0, 20000);
  }

  // ── Not multipart — single part ─────────────────────────────────────────
  const sepIdx = rawText.indexOf("\n\n");
  if (sepIdx === -1) return rawText.slice(0, 20000);

  const headers = rawText.slice(0, sepIdx).toLowerCase();
  let   body    = rawText.slice(sepIdx + 2);

  if (headers.includes("quoted-printable")) body = decodeQP(body);
  else if (headers.includes("base64"))       body = decodeBase64(body);

  if (headers.includes("text/html")) body = stripHtml(body);

  return body.trim().slice(0, 20000);
}

export default {
  async email(message, env, ctx) {
    // ── Envelope data (always reliable) ──────────────────────────────────
    const toAddress  = message.to  || "";
    const prefix     = toAddress.split("@")[0].toLowerCase();
    const fromAddress = message.from || "";
    const subject    = message.headers.get("subject") || "(No subject)";
    const fromHeader = message.headers.get("from")    || fromAddress;
    // Parse display name: "John Doe <john@example.com>" → "John Doe"
    const fromName   = (fromHeader.match(/^"?([^"<]+)"?\s*</)?.[1] || "").trim();

    // ── Read + parse the raw MIME email ───────────────────────────────────
    let bodyText = "";
    try {
      const rawBuffer = await new Response(message.raw).arrayBuffer();
      const rawText   = new TextDecoder("utf-8", { fatal: false }).decode(rawBuffer);
      bodyText = extractBodyFromMime(rawText);
    } catch (e) {
      console.error("MIME parse error:", e);
      // Fall back to subject only — better than nothing
      bodyText = subject;
    }

    console.log(`prefix=${prefix} subject="${subject}" bodyLen=${bodyText.length}`);

    // ── POST to Supabase receive-email edge function ──────────────────────
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
        const err = await res.text().catch(() => "");
        console.error(`receive-email HTTP ${res.status}: ${err}`);
      } else {
        console.log(`✓ Stored for prefix=${prefix}`);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  },
};
