import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { to, inviterName, inviteLink, familyName } = body;

    console.log("send-invite called — to:", to, "inviter:", inviterName, "family:", familyName);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!to || !to.includes("@")) {
      console.error("Invalid or missing to address:", to);
      return new Response(JSON.stringify({ error: "Invalid recipient email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const displayFamily = familyName || "the family";
    const displayInviter = inviterName || "Someone";

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're invited to Calla</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ebe0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe0;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%);border-radius:20px 20px 0 0;padding:36px 40px 28px;text-align:center;">
          <div style="font-size:36px;margin-bottom:10px;">🌸</div>
          <h1 style="margin:0;font-size:26px;font-weight:800;color:#f5f0e8;letter-spacing:-0.5px;font-family:Georgia,serif;">Calla</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(245,240,232,0.6);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Family Calendar</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 40px;">
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a2e1a;letter-spacing:-0.4px;font-family:Georgia,serif;">
            ${displayInviter} invited you to their family calendar
          </h2>
          <p style="margin:0 0 24px;font-size:15px;color:#4a5e4a;line-height:1.7;">
            You've been added to the <strong style="color:#1a2e1a;">${displayFamily} family</strong> on Calla — the shared calendar that keeps co-parents in sync. See every event, appointment and activity the moment it's added.
          </p>

          <!-- Feature list -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
            <tr><td>
              ${[
                ["📅", "Live calendar — both parents, one view"],
                ["📬", "Forward school emails to auto-add events"],
                ["⚡", "Instant conflict alerts"],
                ["🎙️", "Add events by voice"],
              ].map(([icon, text]) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td width="32" valign="top" style="font-size:18px;padding-right:10px;">${icon}</td>
                  <td style="font-size:14px;color:#3a4e3a;line-height:1.5;font-weight:500;">${text}</td>
                </tr>
              </table>`).join("")}
            </td></tr>
          </table>

          <!-- CTA button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${inviteLink}"
                style="display:inline-block;background:linear-gradient(135deg,#2d5a3d 0%,#3a7a52 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:-0.3px;">
                Accept invite &amp; join ${displayFamily} →
              </a>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;font-size:13px;color:#8c9a8c;text-align:center;line-height:1.6;">
            This invite expires in 7 days.<br/>
            If you weren't expecting this, you can safely ignore it.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f7f4ee;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d2;">
          <p style="margin:0;font-size:12px;color:#a0aa9a;line-height:1.6;">
            Calla · <a href="https://getcalla.ca" style="color:#2d5a3d;text-decoration:none;">getcalla.ca</a> · Made with care in Canada 🍁
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    console.log("Sending via Resend to:", to);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Calla <hello@getcalla.ca>",
        to: [to],
        subject: `${displayInviter} invited you to the ${displayFamily} family calendar on Calla`,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    console.log("Resend response status:", res.status, "body:", JSON.stringify(data).slice(0, 300));

    if (!res.ok) {
      console.error("Resend error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: data.message || "Failed to send email", resend: data }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-invite unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
})
