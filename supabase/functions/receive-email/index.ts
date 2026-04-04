import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ── Verify Cloudflare webhook secret ───────────────────────────────────────
  const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== WEBHOOK_SECRET) {
      console.warn("receive-email: bad webhook secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const body = await req.json();
    const { prefix, from_address, from_name, subject, body_text } = body;

    if (!prefix) {
      return new Response(JSON.stringify({ error: "Missing prefix" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL       = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Look up which profile owns this catch prefix ───────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, family_id")
      .eq("catch_prefix", prefix)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError.message);
      return new Response(JSON.stringify({ error: "DB error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      // Accept the email silently — no bounce, just discard
      console.log(`No profile for catch_prefix=${prefix}; discarding.`);
      return new Response(JSON.stringify({ ok: true, discarded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Sanitise body: truncate at 20 000 chars to avoid huge DB rows ─────
    const cleanBody = (body_text || "").slice(0, 20000);

    // ── Insert into catch_items ────────────────────────────────────────────
    const { error: insertError } = await supabase.from("catch_items").insert({
      family_id:    profile.family_id,
      catch_prefix: prefix,
      from_address: from_address || "",
      from_name:    from_name || "",
      subject:      subject || "(No subject)",
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

    console.log(`Stored email for prefix=${prefix}, family=${profile.family_id}`);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("receive-email unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
