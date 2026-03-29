import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID   = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_API_KEY       = Deno.env.get("TWILIO_API_KEY")!;
const TWILIO_API_SECRET    = Deno.env.get("TWILIO_API_SECRET")!;
const TWILIO_PHONE_NUMBER  = Deno.env.get("TWILIO_PHONE_NUMBER")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function todayStr() { return new Date().toISOString().split("T")[0]; }
function nowTimeStr() { const n=new Date(); return String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"); }
function fmt12(t) { const [h,m]=t.split(":").map(Number); return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`; }

function buildSMS(events, members, conflicts) {
  const mm = {}; members.forEach(m => { mm[m.id] = m.name; });
  const lines = ["Good morning! Here's today:",""];
  if (!events.length) { lines.push("Nothing scheduled today. Enjoy!"); }
  else { events.forEach(e => { lines.push((e.member_id&&mm[e.member_id]?mm[e.member_id]+": ":"")+e.title+(e.time?" "+fmt12(e.time):"")+(e.location?" @ "+e.location:"")); }); }
  if (conflicts.length) { lines.push(""); lines.push("Conflict: "+conflicts.join(", ")); }
  lines.push(""); lines.push("-- Calla");
  return lines.join("\n");
}

function detectConflicts(events) {
  const timed = events.filter(e => e.time);
  const out = [];
  for (let i=0;i<timed.length;i++) for (let j=i+1;j<timed.length;j++)
    if (timed[i].time===timed[j].time) out.push(`${timed[i].title} & ${timed[j].title} at ${fmt12(timed[i].time)}`);
  return out;
}

async function sendSMS(to, body) {
  const creds = btoa(`${TWILIO_API_KEY}:${TWILIO_API_SECRET}`);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: { "Authorization": `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ From: TWILIO_PHONE_NUMBER, To: to, Body: body }),
  });
  const data = await res.json();
  if (!res.ok) { console.error("Twilio error:", data); return false; }
  console.log("Sent to", to, "SID:", data.sid);
  return true;
}

serve(async () => {
  try {
    const today = todayStr(); const nowTime = nowTimeStr();
    console.log(`Digest running at ${nowTime} for ${today}`);
    const { data: profiles } = await supabase.from("profiles").select("id,digest_enabled,digest_time,digest_recipients,family_id").eq("digest_enabled",true);
    if (!profiles?.length) return new Response("No subscribers", { status: 200 });
    let sent=0, skipped=0;
    for (const p of profiles) {
      if (!p.digest_time) { skipped++; continue; }
      const [dh,dm]=p.digest_time.split(":").map(Number);
      const [nh,nm]=nowTime.split(":").map(Number);
      if (Math.abs((dh*60+dm)-(nh*60+nm))>5) { skipped++; continue; }
      let recipients={};
      try { recipients=JSON.parse(p.digest_recipients||"{}"); } catch { skipped++; continue; }
      const phones=Object.values(recipients).filter((ph:any)=>ph&&ph.trim().length>5);
      if (!phones.length) { skipped++; continue; }
      const { data: events } = await supabase.from("events").select("id,title,date,time,location,member_id").eq("date",today).order("time",{ascending:true});
      const { data: members } = await supabase.from("members").select("id,name").eq("user_id",p.id);
      const evList=events||[]; const memList=members||[];
      const conflicts=detectConflicts(evList);
      const body=buildSMS(evList,memList,conflicts);
      for (const phone of phones) { const ok=await sendSMS((phone as string).trim(),body); if(ok) sent++; }
    }
    return new Response(`Done. Sent: ${sent}, Skipped: ${skipped}`, { status: 200 });
  } catch(err) { console.error(err); return new Response("Error: "+String(err),{status:500}); }
});
