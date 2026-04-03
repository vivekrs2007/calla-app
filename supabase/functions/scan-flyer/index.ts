import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAJOR_CITIES = ["toronto","vancouver","calgary","edmonton","ottawa","montreal","winnipeg"];

function isActive(event: any): boolean {
  const today = new Date().toISOString().slice(0, 10);
  // Keep if deadline is in future or not set
  if (event.deadline && event.deadline < today) return false;
  // Keep if date is in future or not set
  if (event.date && event.date < today && !event.deadline) return false;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ANTHROPIC_KEY) {
      return new Response(JSON.stringify({ error: "Missing ANTHROPIC_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DISCOVER mode ──────────────────────────────────────────────────────────
    if (body.type === "discover") {
      const location = (body.location || "").trim();
      const rad = body.radius || 10;
      // Use the LAST comma-separated part as the city name.
      // e.g. "Riverside South, Ottawa" → city = "Ottawa", not "Riverside South"
      const parts = location.split(",");
      const cityNorm = parts[parts.length - 1].trim().toLowerCase();
      const city = parts[parts.length - 1].trim();
      const today = new Date().toISOString().slice(0, 10);

      if (!location) {
        return new Response(JSON.stringify({ result: "[]" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Step 1: Check Supabase cache ────────────────────────────────────────
      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const { data: cached } = await supabase
          .from("discover_cache")
          .select("events, fetched_at, expires_at, is_major")
          .eq("city_normalized", cityNorm)
          .order("fetched_at", { ascending: false })
          .limit(1)
          .single();

        if (cached) {
          // Check if cache is still valid
          const notExpired = !cached.expires_at || cached.expires_at > new Date().toISOString();
          if (notExpired) {
            // Filter out expired events
            const active = (cached.events || []).filter(isActive);
            console.log(`Cache hit for ${city}: ${active.length} active events`);
            return new Response(JSON.stringify({ result: JSON.stringify(active), source: "cache", fetched_at: cached.fetched_at }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      // ── Step 2: No cache — call Anthropic ───────────────────────────────────
      console.log(`No cache for ${city}, calling Anthropic...`);
      const nextMonth = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3000,
          system: `You find local kids activities for ${city}. Respond ONLY with a valid JSON array. No markdown. Every result must be in ${city}.`,
          messages: [{
            role: "user",
            content: `List 12 kids activities, sports registrations, swim lessons, music classes and community events within ${rad}km of ${location} happening between ${today} and ${nextMonth}. Include registration deadlines. Use realistic venue names in ${city}. JSON array: title, category (Soccer/Basketball/Hockey/Swimming/Music/Art/Dance/Community/STEM/Outdoor/Other), date (YYYY-MM-DD or ""), deadline (YYYY-MM-DD or ""), location (venue in ${city}), description (max 120 chars), url (or ""). All results must be in ${city}.`,
          }],
        }),
      });

      const data = await response.json();
      if (data.error) {
        return new Response(JSON.stringify({ error: data.error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let resultText = "";
      if (data.content && Array.isArray(data.content)) {
        for (const block of data.content) {
          if (block.type === "text") resultText += block.text;
        }
      }

      resultText = resultText.replace(/```json|```/g, "").trim();

      let events: any[] = [];
      try {
        const parsed = JSON.parse(resultText);
        events = Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return new Response(JSON.stringify({ error: "Parse failed", raw: resultText.slice(0, 200) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Step 3: Save to Supabase cache ──────────────────────────────────────
      if (SUPABASE_URL && SUPABASE_SERVICE_KEY && events.length > 0) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const isMajor = MAJOR_CITIES.includes(cityNorm);
        // Major cities: 35 days. On-demand cities: 30 days
        const days = isMajor ? 35 : 30;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        // Delete old entry
        await supabase.from("discover_cache")
          .delete()
          .eq("city_normalized", cityNorm);

        // Insert fresh
        await supabase.from("discover_cache").insert({
          city,
          city_normalized: cityNorm,
          radius: rad,
          events,
          fetched_at: new Date().toISOString(),
          is_major: isMajor,
          expires_at: expiresAt,
        });

        console.log(`Saved ${events.length} events for ${city} to cache`);
      }

      // Filter active events before returning
      const active = events.filter(isActive);
      return new Response(JSON.stringify({ result: JSON.stringify(active), source: "fresh" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── FLYER SCAN mode ────────────────────────────────────────────────────────
    const { image, mediaType } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType || "image/jpeg", data: image },
            },
            {
              type: "text",
              text: `Extract event details from this flyer. Return ONLY a JSON object (no markdown):
{"title":"","date":"YYYY-MM-DD or empty","time":"HH:MM or empty","endTime":"HH:MM or empty","location":"","notes":"","cost":"","costType":"one-time"}`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    return new Response(JSON.stringify({ result: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
