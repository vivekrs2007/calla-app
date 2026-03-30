import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function fmt12(t: string): string {
  const [h,m] = t.split(":").map(Number);
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}

async function sendPush(userId: string, title: string, body: string) {
  await supabase.functions.invoke("send-push-notification", {
    body: { user_id: userId, title, body }
  });
}

serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const forceSend = body.force === true;

    // Toronto time
    const torontoTime = new Date().toLocaleString("en-US", { timeZone: "America/Toronto" });
    const now = new Date(torontoTime);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().split("T")[0];

    console.log(`check-reminders running at ${now.getHours()}:${now.getMinutes()} Toronto`);

    // Fetch all profiles with notification settings
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, family_id");

    if (!profiles || profiles.length === 0) return new Response("No profiles", { status: 200 });

    let sent = 0;

    for (const profile of profiles) {
      // Get notif settings from localStorage mirror (stored in profiles)
      const { data: notifData } = await supabase
        .from("profiles")
        .select("notif_settings")
        .eq("id", profile.id)
        .single();

      // Default reminder times: 60min and 1440min (1 day)
      let reminderMins = [60, 1440];
      if (notifData && notifData.notif_settings) {
        try {
          const ns = JSON.parse(notifData.notif_settings);
          if (ns.reminders) {
            reminderMins = ns.reminders.map((r: string) => parseInt(r));
          }
        } catch(e) {}
      }

      // Fetch today and tomorrow events for this user
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { data: events } = await supabase
        .from("events")
        .select("id, title, date, time, location, member_id")
        .in("date", [todayStr, tomorrowStr])
        .or(`user_id.eq.${profile.id}${profile.family_id ? `,family_id.eq.${profile.family_id}` : ""}`)
        .not("time", "is", null);

      if (!events || events.length === 0) continue;

      for (const ev of events) {
        if (!ev.time) continue;

        // Calculate event time in minutes from midnight
        const [eh, em] = ev.time.split(":").map(Number);
        let eventMins = eh * 60 + em;

        // If event is tomorrow, add 1440 mins
        if (ev.date === tomorrowStr) eventMins += 1440;

        for (const reminder of reminderMins) {
          const triggerMins = eventMins - reminder;
          const diff = Math.abs(triggerMins - nowMins);

          if (forceSend || diff <= 1) {
            const label = reminder === 60 ? "1 hour" :
                         reminder === 30 ? "30 minutes" :
                         reminder === 15 ? "15 minutes" :
                         reminder === 1440 ? "tomorrow" :
                         reminder + " minutes";

            const title = ev.title;
            const body = `Starting in ${label}` + (ev.time ? ` at ${fmt12(ev.time)}` : "") + (ev.location ? ` @ ${ev.location}` : "");

            console.log(`Sending reminder for ${ev.title} (${label} before)`);
            await sendPush(profile.id, title, body);
            sent++;
          }
        }
      }

      // Check for conflicts
      const todayEvents = (events || []).filter(e => e.date === todayStr && e.time);
      for (let i = 0; i < todayEvents.length; i++) {
        for (let j = i + 1; j < todayEvents.length; j++) {
          if (todayEvents[i].time === todayEvents[j].time) {
            const conflictMins = todayEvents[i].time.split(":").map(Number).reduce((h,m,i) => i===0?h*60:h+m, 0);
            const diff = Math.abs(conflictMins - 60 - nowMins);
            if (forceSend || diff <= 1) {
              await sendPush(profile.id,
                "Schedule Conflict Detected",
                `${todayEvents[i].title} and ${todayEvents[j].title} overlap at ${fmt12(todayEvents[i].time)}`
              );
              sent++;
            }
          }
        }
      }
    }

    return new Response(`Done. Sent: ${sent}`, { status: 200 });
  } catch(err) {
    console.error(err);
    return new Response("Error: " + String(err), { status: 500 });
  }
});
