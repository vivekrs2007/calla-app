import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SERVICE_ACCOUNT      = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Get FCM access token using service account
async function getFCMToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    iss: SERVICE_ACCOUNT.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(SERVICE_ACCOUNT.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  const jwt = `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function sendToToken(token: string, title: string, body: string, data: any = {}) {
  const accessToken = await getFCMToken();
  const projectId = SERVICE_ACCOUNT.project_id;

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: Object.fromEntries(Object.entries(data).map(([k,v]) => [k, String(v)])),
          webpush: {
            notification: { title, body, icon: "/favicon.svg" }
          }
        }
      }),
    }
  );

  const result = await res.json();
  if (!res.ok) { console.error("FCM error:", JSON.stringify(result)); return false; }
  console.log("FCM sent:", result.name);
  return true;
}

serve(async (req) => {
  try {
    const { user_id, title, body, data } = await req.json();
    if (!user_id || !title || !body) {
      return new Response("Missing user_id, title or body", { status: 400 });
    }

    // Get all tokens for this user
    const { data: tokens } = await supabase
      .from("user_push_tokens")
      .select("token")
      .eq("user_id", user_id);

    if (!tokens || tokens.length === 0) {
      return new Response("No tokens for user", { status: 200 });
    }

    let sent = 0;
    for (const t of tokens) {
      const ok = await sendToToken(t.token, title, body, data || {});
      if (ok) sent++;
    }

    return new Response(`Sent: ${sent}`, { status: 200 });
  } catch(err) {
    console.error(err);
    return new Response("Error: " + String(err), { status: 500 });
  }
});
