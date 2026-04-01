import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAJOR_CITIES = [
  { city: "Toronto",   province: "Ontario" },
  { city: "Vancouver", province: "British Columbia" },
  { city: "Calgary",   province: "Alberta" },
  { city: "Edmonton",  province: "Alberta" },
  { city: "Ottawa",    province: "Ontario" },
  { city: "Montreal",  province: "Quebec" },
  { city: "Winnipeg",  province: "Manitoba" },
];

const CATEGORIES = [
  { name: "Sports & Fitness", examples: "soccer, basketball, hockey, swimming, gymnastics, martial arts, tennis, baseball, volleyball, track" },
  { name: "Music & Arts", examples: "piano lessons, guitar, violin, choir, drama, dance, art classes, pottery, photography, band" },
  { name: "Community & Family", examples: "Easter egg hunt, farmers market, family festival, cultural event, heritage day, parade, movie night, charity run" },
  { name: "Academic & STEM", examples: "coding camp, robotics, science fair, math tutoring, chess club, debate, reading program" },
  { name: "Outdoor & Nature", examples: "hiking club, nature walks, camping, gardening, environmental program, outdoor adventure" },
];

async function fetchAndSaveCity(
  city: string,
  province: string,
  anthropicKey: string,
  supabase: any
): Promise<{ city: string; count: number; status: string; error?: string }> {
  const location = `${city}, ${province}`;
  const today = new Date().toISOString().slice(0, 10);
  const sixtyDays = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const categoryList = CATEGORIES.map(c => `- ${c.name}: ${c.examples}`).join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 6000,
        system: `You are a local events expert for ${city}. You know all the community centres, recreation halls, music schools, sports leagues, cultural events, and family activities in ${city}. Respond ONLY with a valid JSON array. No markdown, no explanation.`,
        messages: [{
          role: "user",
          content: `List 40 diverse kids and family activities, registrations, classes, and community events in ${location} between ${today} and ${sixtyDays}.

Cover ALL of these categories broadly:
${categoryList}

Include:
- Sports league registrations with deadlines
- Music and art class enrolments
- Community hall events and festivals
- Night markets, cultural events, family nights
- Outdoor programs and camps
- STEM and academic programs
- Free and paid events

Use real venue names, community centres, recreation halls, and cultural centres specific to ${city}.

JSON array format (40 items):
[{
  "title": "event name",
  "category": "Soccer or Basketball or Hockey or Swimming or Music or Art or Dance or Community or Other",
  "date": "YYYY-MM-DD or empty",
  "deadline": "YYYY-MM-DD or empty",
  "location": "specific venue name, ${city}",
  "description": "brief description max 120 chars",
  "url": "website or empty"
}]

All 25 results must be in ${city}. Mix paid and free events. Include evening and weekend events.`,
        }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let text = "";
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === "text") text += block.text;
      }
    }

    text = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    const events = Array.isArray(parsed) ? parsed : [];

    // Delete old + insert new
    await supabase.from("discover_cache").delete()
      .eq("city_normalized", city.toLowerCase())
      .eq("is_major", true);

    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("discover_cache").insert({
      city,
      city_normalized: city.toLowerCase(),
      radius: 25,
      events,
      fetched_at: new Date().toISOString(),
      is_major: true,
      expires_at: expiresAt,
    });

    return { city, count: events.length, status: "ok" };
  } catch (err) {
    return { city, count: 0, status: "error", error: String(err) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!ANTHROPIC_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // All cities in parallel
  const results = await Promise.all(
    MAJOR_CITIES.map(({ city, province }) =>
      fetchAndSaveCity(city, province, ANTHROPIC_KEY, supabase)
    )
  );

  // Clean up expired on-demand caches
  await supabase.from("discover_cache")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .eq("is_major", false);

  const ok = results.filter(r => r.status === "ok").length;

  return new Response(JSON.stringify({
    results,
    refreshed_at: new Date().toISOString(),
    summary: `${ok}/${MAJOR_CITIES.length} cities refreshed`,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
