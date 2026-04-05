import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { to, inviterName, inviteLink, familyName } = await req.json()

  const emailBody = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #f5f0e8; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 40px; margin-bottom: 8px;">🌸</div>
      <h1 style="font-size: 24px; color: #1a2e1a; margin: 0;">You're invited to Calla</h1>
    </div>
    <p style="color: #2d4a2d; font-size: 16px; line-height: 1.6;">
      <strong>${inviterName}</strong> has invited you to join their family calendar on Calla.
    </p>
    <p style="color: #5a6e5a; font-size: 15px; line-height: 1.6;">
      Once you join, you'll both see every event, appointment and activity in real time. No more "I thought you knew."
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${inviteLink}" style="background: #2d5a3d; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; display: inline-block;">
        Join ${familyName || "the family"} calendar →
      </a>
    </div>
    <p style="color: #8c9a8c; font-size: 13px; text-align: center; margin-top: 24px;">
      This invite expires in 7 days. If you didn't expect this, you can ignore it.
    </p>
    <hr style="border: none; border-top: 1px solid #e8e0d2; margin: 24px 0;">
    <p style="color: #8c9a8c; font-size: 12px; text-align: center;">
      Calla · getcalla.ca · Made with care in Canada 🍁
    </p>
  </div>
</body>
</html>`

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Calla <hello@getcalla.ca>",
      to: [to],
      subject: `${inviterName} invited you to their Calla family calendar`,
      html: emailBody,
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: res.ok ? 200 : 400,
  })
})