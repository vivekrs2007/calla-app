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
      return new Response(JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!to || !to.includes("@")) {
      console.error("Invalid or missing to address:", to);
      return new Response(JSON.stringify({ ok: false, error: "Invalid recipient email" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const displayFamily = familyName || "the family";
    const displayInviter = inviterName || "Someone";

    const features = [
      {
        icon: "📅",
        title: "One shared calendar",
        desc: "Every event either of you adds appears instantly on both phones. No more missed pickups or double-booked Saturdays.",
      },
      {
        icon: "📬",
        title: "Forward school emails — events appear automatically",
        desc: "Forward any school or activity email to your Calla address. Claude AI reads it and adds the event for you.",
      },
      {
        icon: "📸",
        title: "Snap a flyer, get an event",
        desc: "Photo of a swim meet poster or activity schedule? Calla reads it and adds every date in seconds.",
      },
      {
        icon: "🗺️",
        title: "Discover local activities for your kids",
        desc: "Browse curated sports, arts, and enrichment programs near you — filtered by age and neighbourhood.",
      },
      {
        icon: "💬",
        title: "Daily SMS brief",
        desc: "Wake up to a text summary of today's schedule — no app needed. Just a simple morning heads-up.",
      },
      {
        icon: "⚡",
        title: "Instant conflict alerts",
        desc: "Calla flags overlaps the moment they happen so you can sort them out before they become a problem.",
      },
    ];

    const featureRows = features.map(({ icon, title, desc }) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td width="44" valign="top" style="padding-right:12px;">
            <div style="width:36px;height:36px;background:#f0f8f2;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">${icon}</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1a2e1a;">${title}</p>
            <p style="margin:0;font-size:13px;color:#6a7e6a;line-height:1.55;">${desc}</p>
          </td>
        </tr>
      </table>`).join("");

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're invited to Calla</title>
</head>
<body style="margin:0;padding:0;background-color:#eee8db;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eee8db;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- ── Hero header ───────────────────────────────────────────── -->
        <tr><td style="background:linear-gradient(160deg,#152b1c 0%,#1e3d2a 55%,#2d5a3d 100%);border-radius:20px 20px 0 0;padding:44px 40px 36px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;line-height:1;">🌸</div>
          <h1 style="margin:0 0 6px;font-size:30px;font-weight:800;color:#f5f0e8;letter-spacing:-0.6px;font-family:Georgia,'Times New Roman',serif;">
            You're invited to Calla
          </h1>
          <p style="margin:0 0 20px;font-size:14px;color:rgba(245,240,232,0.55);letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">
            Family Calendar · Built in Ottawa, Canada 🍁
          </p>
          <!-- Pill badge -->
          <div style="display:inline-block;background:rgba(245,240,232,0.1);border:1px solid rgba(245,240,232,0.2);border-radius:99px;padding:7px 18px;">
            <span style="font-size:13px;color:rgba(245,240,232,0.8);font-weight:600;">
              ${displayInviter} is sharing the ${displayFamily} calendar with you
            </span>
          </div>
        </td></tr>

        <!-- ── Intro ─────────────────────────────────────────────────── -->
        <tr><td style="background:#ffffff;padding:32px 40px 8px;">
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1a2e1a;letter-spacing:-0.3px;font-family:Georgia,'Times New Roman',serif;">
            The smarter way to co-parent
          </h2>
          <p style="margin:0 0 8px;font-size:15px;color:#4a5e4a;line-height:1.75;">
            Calla is the family calendar built for parents who are managing busy kids' lives across two households. Every event, every activity, every schedule — shared in real time between you and ${displayInviter}.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#4a5e4a;line-height:1.75;">
            Here's everything you get the moment you join:
          </p>
        </td></tr>

        <!-- ── Feature list ──────────────────────────────────────────── -->
        <tr><td style="background:#ffffff;padding:0 40px 28px;">
          <div style="background:#f7f4ee;border-radius:16px;padding:24px 20px;">
            ${featureRows}
          </div>
        </td></tr>

        <!-- ── Social proof strip ────────────────────────────────────── -->
        <tr><td style="background:#ffffff;padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e3d2a,#2d5a3d);border-radius:14px;padding:20px 24px;">
            <tr>
              <td width="44" valign="top" style="font-size:28px;padding-right:14px;">💬</td>
              <td valign="top">
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#f5f0e8;font-style:italic;line-height:1.55;">
                  "I used to miss half my kids' events. Now everything just shows up — even from emails I didn't even read properly."
                </p>
                <p style="margin:0;font-size:12px;color:rgba(245,240,232,0.5);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">
                  Calla parent · Toronto
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ── CTA ──────────────────────────────────────────────────── -->
        <tr><td style="background:#ffffff;padding:0 40px 36px;text-align:center;">
          <a href="${inviteLink}"
            style="display:inline-block;background:linear-gradient(135deg,#2d5a3d 0%,#3a7a52 100%);color:#ffffff;text-decoration:none;padding:18px 48px;border-radius:14px;font-size:17px;font-weight:800;letter-spacing:-0.3px;box-shadow:0 4px 16px rgba(45,90,61,0.35);">
            Accept &amp; open my calendar →
          </a>
          <p style="margin:16px 0 0;font-size:13px;color:#a0aa9a;line-height:1.6;">
            Free for 60 days · No credit card required<br/>
            Takes less than 60 seconds to set up
          </p>
        </td></tr>

        <!-- ── Privacy & trust ────────────────────��──────────────────── -->
        <tr><td style="background:#ffffff;padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e0ede5;border-radius:16px;overflow:hidden;">
            <!-- Header row -->
            <tr><td style="background:#f0f8f2;padding:14px 20px;border-bottom:1px solid #e0ede5;">
              <p style="margin:0;font-size:13px;font-weight:800;color:#1a2e1a;letter-spacing:0.04em;text-transform:uppercase;">
                🔒 Your privacy — always protected
              </p>
            </td></tr>
            <!-- Trust items -->
            <tr><td style="padding:16px 20px;">
              ${[
                ["🗑️", "School emails deleted after processing", "Forwarded emails are read by AI to extract the event, then permanently deleted. We never store or index your inbox."],
                ["👶", "Zero kids' data stored or sold — ever", "We never collect, profile, or monetise information about your children. No exceptions."],
                ["🔐", "Your calendar is private to your family", "Only you and the people you explicitly invite can see your events. No advertisers, no third parties."],
                ["🇨🇦", "Canadian-built, Canadian-hosted", "Calla is made by a small team in Ottawa, ON. Your data stays in Canada and is governed by PIPEDA."],
                ["🚫", "No ads. No tracking. No data brokers.", "We make money from subscriptions only — not from selling your family's information."],
              ].map(([icon, title, desc]) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td width="32" valign="top" style="font-size:17px;padding-right:10px;padding-top:1px;">${icon}</td>
                  <td valign="top">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1a2e1a;">${title}</p>
                    <p style="margin:0;font-size:12px;color:#7a8e7a;line-height:1.55;">${desc}</p>
                  </td>
                </tr>
              </table>`).join("")}
            </td></tr>
          </table>
        </td></tr>

        <!-- ── Install nudge ──────────────────────────────────────────�� -->
        <tr><td style="background:#f7f4ee;padding:20px 40px;border-top:1px solid #e8e0d2;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="28" valign="top" style="font-size:20px;padding-right:10px;">📲</td>
              <td valign="top" style="font-size:13px;color:#6a7a6a;line-height:1.6;">
                <strong style="color:#1a2e1a;">Best on iPhone:</strong> open the link in Safari, tap <strong>Share → Add to Home Screen</strong> for the full app experience.
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ── Footer ───────────────────────────────────────────────── -->
        <tr><td style="background:#f0ebe0;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d2;">
          <p style="margin:0;font-size:12px;color:#a0aa9a;line-height:1.8;">
            This invite expires in 7 days · If you weren't expecting this, safely ignore it.<br/>
            <a href="https://getcalla.ca" style="color:#2d5a3d;text-decoration:none;font-weight:600;">getcalla.ca</a> · Built with care in Ottawa, Canada 🍁
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
        subject: `${displayInviter} invited you to the ${displayFamily} family calendar 🌸`,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    console.log("Resend response status:", res.status, "body:", JSON.stringify(data).slice(0, 300));

    if (!res.ok) {
      console.error("Resend error:", JSON.stringify(data));
      return new Response(JSON.stringify({ ok: false, error: data.message || "Resend rejected the email", resend: data }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-invite unhandled error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
})
