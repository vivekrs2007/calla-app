import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.trim().length < 8) {
      return new Response(
        JSON.stringify({ ok: false, error: "Token required" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Use service role — bypasses RLS safely server-side
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("invites")
      .select("id, family_id, invited_email, status")
      .eq("token", token.trim())
      .eq("status", "pending")
      .maybeSingle();

    if (error) {
      console.error("get-invite DB error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: "Lookup failed" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invite not found or expired" }),
        { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Return only the fields the client needs — never expose token back
    return new Response(
      JSON.stringify({
        ok: true,
        invite: {
          id: data.id,
          family_id: data.family_id,
          invited_email: data.invited_email,
          status: data.status,
        },
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("get-invite error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid request" }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
