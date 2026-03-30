import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PROMPT = "You are a helpful assistant that extracts calendar events from school flyers, newsletters, and notices." +
  " Extract ALL events from this image. Respond ONLY with a valid JSON array, no markdown, no extra text." +
  " Each object must have: title (string), date (string YYYY-MM-DD, guess current year if not shown)," +
  " time (string HH:MM 24hr or null), location (string or null), notes (string or null)." +
  " If no events found return [].";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });

  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64 || !mediaType) return new Response(JSON.stringify({ error: "Missing imageBase64 or mediaType" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    const allowed = ["image/jpeg","image/png","image/gif","image/webp"];
    if (!allowed.includes(mediaType)) return new Response(JSON.stringify({ error: "Unsupported image type" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    if (imageBase64.length > 7000000) return new Response(JSON.stringify({ error: "Image too large. Please use a smaller photo." }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } }, { type: "text", text: PROMPT }] }] }),
    });

    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: data.error?.message || "AI error" }), { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

    var raw = "";
    (data.content || []).forEach((b: any) => { if (b.type === "text") raw += b.text; });

    var events = [];
    try { events = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch(e) { return new Response(JSON.stringify({ error: "Could not parse events. Try a clearer photo." }), { status: 422, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }); }

    return new Response(JSON.stringify({ events }), { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch(err) {
    return new Response(JSON.stringify({ error: "Server error. Please try again." }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
