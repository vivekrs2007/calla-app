import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret, svix-id, svix-timestamp, svix-signature",
};

// ── Parse "from" string into name + address ───────────────────────────────
// Handles:  "John Doe <john@example.com>"  or just  "john@example.com"
function parseFrom(from: string): { name: string; address: string } {
  if (!from) return { name: "", address: "" };
  const m = from.match(/^(.*?)\s*<([^>]+)>/);
  if (m) return { name: m[1].trim().replace(/^"|"$/g, ""), address: m[2].trim() };
  return { name: "", address: from.trim() };
}

// ── Strip HTML to plain text ──────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log("receive-email called, method:", req.method, "body length:", rawBody.length);

    let body: any = {};
    try { body = JSON.parse(rawBody); } catch (_) {
      console.log("Body is not JSON");
    }

    console.log("body keys:", Object.keys(body).join(","), "| body.prefix:", body.prefix, "| body.type:", body.type);

    const SUPABASE_URL        = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const WEBHOOK_SECRET       = Deno.env.get("WEBHOOK_SECRET");

    console.log("env check — SUPABASE_URL:", !!SUPABASE_URL, "SERVICE_KEY:", !!SUPABASE_SERVICE_KEY, "WEBHOOK_SECRET:", !!WEBHOOK_SECRET);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Missing env vars!");
      return new Response(JSON.stringify({ error: "Missing env vars" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Detect payload format ─────────────────────────────────────────────
    //
    //  A) Resend inbound webhook
    //     { type: "email.received", data: { from, to: [...], subject, text, html } }
    //
    //  B) Direct POST (from a custom forwarder / future use)
    //     { prefix, from_address, from_name, subject, body_text }

    let prefix      = "";
    let from_address = "";
    let from_name    = "";
    let subject      = "";
    let body_text    = "";

    if (body.type === "email.received" && body.data) {
      // ── Resend inbound ──────────────────────────────────────────────────
      const d = body.data;

      // Extract catch prefix from the "to" array
      // e.g.  ["abc1234567@getcalla.ca"]  →  prefix = "abc1234567"
      const toArr: string[] = Array.isArray(d.to) ? d.to : [d.to || ""];
      const toAddr = toArr.find((a: string) => a.includes("@getcalla.ca")) || toArr[0] || "";
      prefix = toAddr.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();

      const parsed = parseFrom(d.from || "");
      from_address = parsed.address;
      from_name    = parsed.name;
      subject      = d.subject || "(No subject)";
      body_text    = d.text || (d.html ? stripHtml(d.html) : "");

    } else if (body.prefix) {
      // ── Direct / custom forwarder format ───────────────────────────────
      // Verify optional webhook secret for direct calls
      if (WEBHOOK_SECRET) {
        const provided = req.headers.get("x-webhook-secret");
        console.log("secret check — provided:", provided, "expected:", WEBHOOK_SECRET, "match:", provided === WEBHOOK_SECRET);
        if (provided !== WEBHOOK_SECRET) {
          console.error("Webhook secret mismatch — rejecting");
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      prefix       = body.prefix;
      from_address = body.from_address || "";
      from_name    = body.from_name    || "";
      subject      = body.subject      || "(No subject)";
      body_text    = body.body_text    || "";

    } else {
      console.warn("receive-email: unknown payload format", JSON.stringify(body).slice(0, 200));
      // Return 200 so Resend doesn't retry unknown events
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prefix) {
      return new Response(JSON.stringify({ error: "Could not extract prefix from to-address" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Reverse-lookup profile by catch_prefix ────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, family_id")
      .eq("catch_prefix", prefix)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError.message);
      return new Response(JSON.stringify({ error: "DB error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      console.log(`No profile for catch_prefix=${prefix}; discarding silently.`);
      return new Response(JSON.stringify({ ok: true, discarded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Insert into catch_items ───────────────────────────────────────────
    const cleanBody = body_text.slice(0, 20000);

    const { error: insertError } = await supabase.from("catch_items").insert({
      family_id:    profile.family_id,
      catch_prefix: prefix,
      from_address,
      from_name,
      subject,
      body_text:    cleanBody,
      received_at:  new Date().toISOString(),
    });

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return new Response(
        JSON.stringify({ error: "DB insert failed", detail: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✓ Stored email for prefix=${prefix}, family=${profile.family_id}, subject="${subject}"`);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("receive-email unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
