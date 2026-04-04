/**
 * Calla Inbound Email — Cloudflare Email Worker
 * ───────────────────────────────────────────────
 * Deploy this Worker in the Cloudflare Dashboard:
 *   Workers & Pages → Create Worker → paste this code → Save & Deploy
 *
 * Then add these Environment Variables (Settings → Variables):
 *   SUPABASE_EDGE_URL  = https://pqvxzsrpifiuovhtxldp.supabase.co/functions/v1
 *   WEBHOOK_SECRET     = (same value you set as WEBHOOK_SECRET in Supabase secrets)
 *
 * Finally, add an Email Route in Cloudflare:
 *   Email → Email Routing → Routing Rules → Catch-all → Send to Worker → this Worker
 *
 * Dependencies: postal-mime (bundled via Workers npm)
 *   Add to package.json: "postal-mime": "^2.2.4"
 *   Or use the CDN import below (no build step needed).
 */

import PostalMime from "https://cdn.jsdelivr.net/npm/postal-mime@2.2.4/src/postal-mime.js";

export default {
  /**
   * Cloudflare Email Worker entrypoint.
   * @param {EmailMessage} message
   * @param {object}       env
   * @param {ExecutionContext} ctx
   */
  async email(message, env, ctx) {
    // ── Parse the raw MIME email ──────────────────────────────────────────
    let parsed = {};
    try {
      const rawBuffer = await new Response(message.raw).arrayBuffer();
      const parser = new PostalMime();
      parsed = await parser.parse(rawBuffer);
    } catch (e) {
      console.error("PostalMime parse error:", e);
      // Fall back to envelope data only
    }

    // ── Extract the catch prefix from the To address ──────────────────────
    // e.g.  "abc1234567@getcalla.ca"  →  prefix = "abc1234567"
    const toAddress = message.to || "";
    const prefix = toAddress.split("@")[0].toLowerCase();

    // ── Build clean text body ─────────────────────────────────────────────
    let bodyText = parsed.text || "";
    if (!bodyText && parsed.html) {
      // Strip HTML tags as a fallback
      bodyText = parsed.html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    // ── POST to Supabase receive-email edge function ──────────────────────
    const edgeUrl = (env.SUPABASE_EDGE_URL || "").replace(/\/$/, "");
    try {
      const res = await fetch(`${edgeUrl}/receive-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": env.WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          prefix,
          from_address: message.from || parsed.from?.address || "",
          from_name:    parsed.from?.name || "",
          subject:      parsed.subject || message.headers?.get("subject") || "",
          body_text:    bodyText,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`receive-email HTTP ${res.status}: ${errText}`);
      } else {
        console.log(`Email stored for prefix=${prefix}`);
      }
    } catch (e) {
      console.error("Failed to call receive-email:", e);
    }
  },
};
