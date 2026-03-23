import { useState, useEffect, useRef, Fragment } from "react";
import {
  Home, Inbox, Users, Bell, Settings, Plus, Mic, MicOff,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MapPin, Clock, Repeat, Package, DollarSign, Trash2,
  X, Check, AlertTriangle, Zap, Sun, Sunset, Moon,
  Copy, Link, LogOut, Share2, Folder, FileText, Calendar,
  ShoppingCart, MessageCircle, Send, List, Star
} from "lucide-react";

/* ─── Global CSS ────────────────────────────────────────────────────────── */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --ink:   #0e0f12;
      --ink2:  #161820;
      --ink3:  #1e2028;
      --ink4:  #272a35;
      --ink5:  #30333f;
      --cream: #f2ede4;
      --cream2:#d4cab8;
      --cream3:#8c8272;
      --sage:  #2e6b5e;
      --sage2: #438f7e;
      --sage3: #72c4b4;
      --sage4: rgba(67,143,126,.14);
      --gold:  #c4953a;
      --gold2: #ddb05c;
      --gold3: #f5d48e;
      --amber: #d4813a;
      --rose:  #c45a5a;
      --red:   #e05050;
      --border:rgba(234,228,216,.07);
      --border2:rgba(234,228,216,.12);
      --border3:rgba(234,228,216,.22);
      --muted: rgba(234,228,216,.38);
      --muted2:rgba(234,228,216,.62);
      /* legacy aliases so existing inline styles still work */
      --sage-light:rgba(83,136,122,.15);
      --sage-mid:  rgba(83,136,122,.28);
      --terra:     #b07042;
      --terra-light:rgba(176,112,66,.12);
    }
    body{
      background:var(--ink2);
      color:var(--cream);
      font-family:'DM Sans','Helvetica Neue',sans-serif;
      -webkit-font-smoothing:antialiased;
      min-height:100vh;
    }
    /* ── Inputs ── */
    input,textarea,select{
      background:var(--ink3);
      border:1.5px solid var(--border2);
      color:var(--cream);
      font-family:'DM Sans','Helvetica Neue',sans-serif;
      border-radius:10px;
      padding:12px 14px;
      font-size:14px;
      outline:none;
      width:100%;
      transition:border-color .18s,background .18s;
    }
    input::placeholder,textarea::placeholder{color:var(--cream3)}
    input:focus,textarea:focus,select:focus{
      border-color:var(--sage2);
      background:var(--ink4);
    }
    select option{background:var(--ink3);color:var(--cream)}
    /* ── Buttons ── */
    button{
      cursor:pointer;
      font-family:'DM Sans','Helvetica Neue',sans-serif;
      border:none;
      transition:opacity .15s,transform .12s,box-shadow .15s,background .15s;
    }
    button:active{transform:scale(.96);opacity:.8}
    /* Row tap feedback */
    .tap-row{transition:background .15s}
    .tap-row:active{background:rgba(240,236,226,.05) !important}
    /* ── Scrollbar ── */
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
    /* Premium selection color */
    ::selection{background:rgba(67,143,126,.35);color:var(--cream)}
    /* Smooth tap highlight removal on mobile */
    *{-webkit-tap-highlight-color:transparent}
    /* ── Animations ── */
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
    .sheet-top{animation:slideDown .38s cubic-bezier(.32,1,.4,1) forwards}
    @keyframes backdropIn{from{opacity:0}to{opacity:1}}
    @keyframes screenEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastIn{from{opacity:0;transform:translateY(-10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes cellPulse{0%{transform:scale(1)}40%{transform:scale(.88)}100%{transform:scale(1)}}
    @keyframes checkOff{from{opacity:1}50%{opacity:.5;transform:translateX(3px)}to{opacity:.45}}
    @keyframes waveform{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.6)}}

    .screen-enter{animation:screenEnter .32s cubic-bezier(.16,1,.3,1) forwards}
    .sheet-enter{animation:slideUp .38s cubic-bezier(.32,1,.4,1) forwards}
    .backdrop-enter{animation:backdropIn .25s ease forwards}
    .toast-enter{animation:toastIn .3s cubic-bezier(.16,1,.3,1) forwards}
    @keyframes memberPop{0%{transform:scale(1)}40%{transform:scale(1.14)}70%{transform:scale(.96)}100%{transform:scale(1)}}
    @keyframes fieldShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
    @keyframes todayGlow{0%,100%{box-shadow:0 0 0 0 rgba(46,107,94,.0)}50%{box-shadow:0 0 12px 3px rgba(46,107,94,.35)}}
    @keyframes conflictSlide{0%{transform:translateX(-6px) translateY(-4px);opacity:0}60%{transform:translateX(2px)}100%{transform:translateX(0) translateY(0);opacity:1}}
    @keyframes strengthFill{from{width:0}to{width:var(--sw)}}
    @keyframes tickDraw{from{stroke-dashoffset:20}to{stroke-dashoffset:0}}
    .member-pop{animation:memberPop .28s cubic-bezier(.34,1.56,.64,1) forwards}
    .field-shake{animation:fieldShake .38s ease forwards}
    .today-glow{animation:todayGlow 3s ease-in-out infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes sonar{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.8);opacity:0}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(83,136,122,.15)}50%{box-shadow:0 0 40px rgba(83,136,122,.3)}}

    /* ── Sheet backdrop ── */
    .sheet-scroll{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
    /* ── Glass card used by sheets ── */
    .glass{
      background:rgba(24,24,28,.92);
      backdrop-filter:blur(28px);
      -webkit-backdrop-filter:blur(28px);
    }
    /* ── Grain texture on header ── */
    .grain::after{
      content:'';
      position:absolute;
      inset:0;
      border-radius:inherit;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity:.04;
      pointer-events:none;
    }
    /* ── Nav label sizes ── */
    .nav-label{font-size:9px;font-weight:600;letter-spacing:.02em;margin-top:1px}
    /* ── Range slider ── */
    input[type=range]{
      -webkit-appearance:none;
      background:var(--ink5);
      border-radius:4px;
      height:4px;
      border:none;
      padding:0;
    }
    input[type=range]::-webkit-slider-thumb{
      -webkit-appearance:none;
      width:18px;height:18px;
      border-radius:50%;
      background:var(--cream);
      box-shadow:0 2px 8px rgba(0,0,0,.4);
      border:2px solid var(--sage2);
    }
  `}</style>
);

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const todayStr = new Date().toISOString().split("T")[0];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WDAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const fd = s => { const d = new Date(s); return MONTHS[d.getMonth()] + " " + d.getDate(); };
const addDays = (s,n) => { const d = new Date(s); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const genId = () => Math.random().toString(36).slice(2,9);

/* ─── Smart time default ───────────────────────────────────────────────── */
const smartTime = () => {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const nextM = m < 30 ? 30 : 0;
  const nextH = m < 30 ? h : h + 1;
  const clamped = Math.max(6, Math.min(21, nextH));
  return String(clamped).padStart(2,"0") + ":" + String(nextM).padStart(2,"0");
};

/* ─── Recurring title keywords ──────────────────────────────────────────── */
const recurringKeywords = ["practice","class","lesson","training","session","rehearsal","club","team","weekly","every"];
const durationKeywords  = {
  practice:90, training:90, rehearsal:90, match:90, game:90,
  lesson:60, class:60, meeting:60, session:60, club:60,
  appointment:45, dentist:45, doctor:45, checkup:45, therapy:50,
};
const smartDuration = (title) => {
  const lo = (title||"").toLowerCase();
  for(const kw in durationKeywords){if(lo.includes(kw)) return durationKeywords[kw];}
  return 0;
};
const addMinutes = (time, mins) => {
  if(!time) return "";
  const [h,m] = time.split(":").map(Number);
  const total = h*60 + m + mins;
  return String(Math.floor(total/60)%24).padStart(2,"0") + ":" + String(total%60).padStart(2,"0");
};

const getWeek = anchor => {
  const d = new Date(anchor), day = d.getDay();
  d.setDate(d.getDate() - day + (day===0 ? -6 : 1));
  return Array.from({length:7}, (_,i) => { const n=new Date(d); n.setDate(d.getDate()+i); return n.toISOString().split("T")[0]; });
};
const recurCount = (freq,start,end) => {
  const days = Math.max(0,Math.round((new Date(end)-new Date(start))/86400000));
  return Math.floor(days/({daily:1,weekly:7,biweekly:14,monthly:30}[freq]||7))+1;
};
const makeRecurring = ev => {
  if (!ev.recurring||!ev.recurEnd) return [{...ev,id:genId()}];
  const step = {daily:1,weekly:7,biweekly:14,monthly:30}[ev.recurFreq]||7;
  const out=[]; let c=new Date(ev.date),e=new Date(ev.recurEnd),i=0;
  while(c<=e&&i<60){out.push({...ev,id:genId(),date:c.toISOString().split("T")[0]});c.setDate(c.getDate()+step);i++;}
  return out;
};

/* ─── Seed data ─────────────────────────────────────────────────────────── */
const M0 = [
  {id:"m1",name:"Mom", color:"var(--sage3)",emoji:"👩"},
  {id:"m2",name:"Dad", color:"var(--sage2)",emoji:"👨"},
  {id:"m3",name:"Emma",color:"#7C3AED",emoji:"👧"},
  {id:"m4",name:"Liam",color:"var(--gold2)",emoji:"👦"},
];
const E0 = [
  {id:"e1",title:"Soccer Practice",memberId:"m3",date:todayStr,            time:"15:00",location:"Riverside Field",color:"#7C3AED",recurring:false},
  {id:"e2",title:"Piano Lesson",   memberId:"m4",date:todayStr,            time:"15:20",location:"Music Academy",  color:"var(--gold2)",recurring:false},
  {id:"e3",title:"Team Meeting",   memberId:"m1",date:addDays(todayStr,1), time:"09:00",location:"Office",         color:"var(--sage3)",recurring:false},
  {id:"e4",title:"Dentist",        memberId:"m2",date:addDays(todayStr,2), time:"11:00",location:"Smile Clinic",   color:"var(--sage2)",recurring:false},
  {id:"e5",title:"Ballet Class",   memberId:"m3",date:addDays(todayStr,3), time:"14:00",location:"Dance Studio",   color:"#7C3AED",recurring:true},
  {id:"e6",title:"Grocery Run",    memberId:"m1",date:addDays(todayStr,4), time:"10:00",location:"Whole Foods",    color:"var(--sage3)",recurring:false},
];
const COLORS = ["var(--sage2)","var(--sage2)","#7C3AED","#D97706","#DC2626","#0891B2"];
const EMOJIS = ["👩","👨","👧","👦","👵","👴","🧑"];

/* ─── Conflict detection ────────────────────────────────────────────────── */
const conflicts = events => {
  const byDate={};
  events.forEach(ev=>{if(!ev.date||!ev.time)return;(byDate[ev.date]=byDate[ev.date]||[]).push(ev);});
  const out=[];
  Object.values(byDate).forEach(evs=>{
    for(let i=0;i<evs.length;i++) for(let j=i+1;j<evs.length;j++){
      const a=evs[i],b=evs[j]; if(!a.time||!b.time) continue;
      const m=t=>{const[h,mm]=t.split(":").map(Number);return h*60+mm;};
      const diff=Math.abs(m(a.time)-m(b.time));
      if(diff<60&&(a.memberId===b.memberId||diff<30)) out.push({a,b,diff,type:a.memberId===b.memberId?"same":"logistics"});
    }
  });
  return out;
};

/* ─── Primitive components ──────────────────────────────────────────────── */
const Pill = ({children,color="var(--cream2)",bg="var(--ink4)",style={}}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,background:bg,color,fontSize:15,fontWeight:600,border:"1px solid rgba(234,228,216,.08)",...style}}>{children}</span>
);
const Toggle = ({on,onChange}) => (
  <div onClick={onChange} style={{width:46,height:26,borderRadius:13,background:on?"var(--sage2)":"var(--ink5)",position:"relative",cursor:"pointer",transition:"background .22s",flexShrink:0,border:"1px solid var(--border2)"}}>
    <div style={{position:"absolute",top:3,left:on?22:3,width:20,height:20,borderRadius:"50%",background:on?"#fff":"var(--cream3)",transition:"left .22s",boxShadow:"0 2px 6px rgba(0,0,0,.4)"}}/>
  </div>
);
const Card = ({children,style={},...p}) => (
  <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",padding:20,...style}}{...p}>{children}</div>
);
const Btn = ({children,v="primary",style={},...p}) => {
  const S={
    primary:{background:"var(--sage)",color:"var(--cream)",padding:"13px 22px",borderRadius:12,fontWeight:700,fontSize:15,boxShadow:"0 4px 20px rgba(58,100,89,.35)"},
    ghost:{background:"transparent",color:"var(--cream2)",padding:"11px 18px",borderRadius:12,fontWeight:500,fontSize:15,border:"1px solid var(--border2)"},
    danger:{background:"rgba(220,80,80,.1)",color:"var(--rose)",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:15,border:"1px solid rgba(220,80,80,.2)"},
    icon:{background:"var(--ink3)",color:"var(--cream2)",padding:10,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--border)"},
  };
  return <button style={{...S[v],...style}}{...p}>{children}</button>;
};

/* ─── Toast ─────────────────────────────────────────────────────────────── */
const Toasts = ({toasts}) => (
  <div style={{position:"fixed",top:16,left:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:10,pointerEvents:"none"}}>
    {toasts.map(t=>(
      <div key={t.id} className="toast-enter" style={{background:"rgba(18,18,24,.97)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid var(--border2)",borderLeft:"3px solid "+(t.color||"var(--sage2)"),borderRadius:16,padding:"13px 18px",boxShadow:"0 8px 40px rgba(0,0,0,.5)",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
        <div><p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>{t.title}</p>{t.body&&<p style={{fontSize:15,color:"var(--muted2)",marginTop:2}}>{t.body}</p>}</div>
      </div>
    ))}
  </div>
);

/* ─── Auth / Onboarding ─────────────────────────────────────────────────── */
const ONBOARD_SLIDES = [
  {
    emoji: "😤",
    headline: "Running your kids' schedules in your head?",
    sub: "Soccer at 3. Piano at 4. Permission slip due Friday. Doctor next Tuesday. That ends today.",
    cta: "That's us →",
    bg: "var(--ink)",
    textColor: "#fff",
    chips: ["🎙 Voice Add","📬 Email Parser","⚡ Conflict Alerts","👨‍👩‍👧 Co-parent Sync","🎒 Packing Lists"],
    trust: null,
  },
  {
    emoji: "📬",
    headline: "Schools send emails. You lose track. We fix that.",
    sub: "Forward any school email to Calla. We extract every event automatically — then delete the email immediately.",
    cta: "How we protect you →",
    bg: "var(--sage)",
    textColor: "#fff",
    chips: null,
    trust: {
      label: "Email Privacy",
      points: ["Email read once to extract events","Permanently deleted right after","Only calendar events are ever stored"],
    },
  },
  {
    emoji: "🔒",
    headline: "Your family's data belongs to your family.",
    sub: "We will never sell your data, read your emails, or show you ads. Calla exists to serve your family — not to monetise it.",
    cta: "We take this seriously →",
    bg: "#2D6A4F",
    textColor: "#fff",
    chips: null,
    trust: {
      label: "Our Privacy Promise",
      points: ["No ads. Ever.","No data selling. Ever.","Emails deleted immediately after extraction","Your family data is never shared with third parties"],
    },
  },
  {
    emoji: "🎙️",
    headline: "Both parents. One calendar. Zero confusion.",
    sub: "Add events by voice. Both parents see changes instantly. No more \"I thought you knew.\"",
    cta: "Let's build your family calendar →",
    bg: "var(--terra)",
    textColor: "#fff",
    chips: null,
    trust: {
      label: "Always free to start",
      points: ["No credit card needed","No hidden fees","Cancel anytime"],
    },
    final: true,
  },
];

function Auth({onLogin}) {
  const [slide,setSlide]=useState(0),[showForm,setShowForm]=useState(false),[mode,setMode]=useState("signup"),[name,setName]=useState(""),[family,setFamily]=useState(""),[email,setEmail]=useState(""),[pass,setPass]=useState(""),[loading,setLoading]=useState(false),[showPass,setShowPass]=useState(false);
  const go=()=>{
    if(!email.trim()||!pass.trim())return;
    if(mode==="signup"){
      if(pass.length<6)return;
      if(!email.includes("@")||!email.includes("."))return;
      if(!name.trim()||!family.trim())return;
    }
    setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin({name:name||"Parent",family:family||"My Family",email});},900);
  };
  const cur=ONBOARD_SLIDES[slide];

  if(!showForm) return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:cur.bg,transition:"background .5s",overflow:"hidden"}}>

      {/* Scrollable content area */}
      <div className="fu" key={slide} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 28px 16px"}}>
        <div style={{fontSize:60,marginBottom:18,textAlign:"center"}}>{cur.emoji}</div>
        <h1 style={{fontSize:26,fontWeight:800,color:cur.textColor,lineHeight:1.25,letterSpacing:"-.5px",marginBottom:12,textAlign:"center"}}>{cur.headline}</h1>
        <p style={{fontSize:15,color:cur.textColor,opacity:.72,lineHeight:1.7,textAlign:"center"}}>{cur.sub}</p>

        {/* Feature chips — slide 0 only */}
        {cur.chips&&(
          <div style={{paddingTop:18,display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center"}}>
            {cur.chips.map(v=>(
              <div key={v} style={{background:"rgba(255,255,255,.1)",borderRadius:99,padding:"5px 13px",fontSize:15,fontWeight:600,color:"var(--cream)"}}>{v}</div>
            ))}
          </div>
        )}

        {/* Privacy / trust block — slides 1, 2, 3 */}
        {cur.trust&&(
          <div style={{marginTop:16,background:"rgba(255,255,255,.08)",borderRadius:16,padding:"14px 16px",border:"1px solid rgba(255,255,255,.12)"}}>
            <p style={{fontSize:15,fontWeight:800,color:"rgba(255,255,255,.55)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{cur.trust.label}</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {cur.trust.points.map((pt,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Check size={10} color="#fff"/>
                  </div>
                  <p style={{fontSize:15,color:"rgba(255,255,255,.88)",fontWeight:500}}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ALWAYS-VISIBLE bottom section — pinned */}
      <div style={{flexShrink:0,padding:"12px 28px calc(32px + env(safe-area-inset-bottom,0px)) 28px",background:"rgba(0,0,0,.15)"}}>
        {/* Dot indicators */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:14}}>
          {ONBOARD_SLIDES.map((_,i)=>(
            <div key={i} onClick={()=>setSlide(i)} style={{width:i===slide?22:6,height:6,borderRadius:3,background:i===slide?"#fff":"rgba(255,255,255,.25)",transition:"width .3s",cursor:"pointer"}}/>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          onClick={()=>{ if(cur.final){setShowForm(true);}else setSlide(s=>s+1); }}
          style={{background:"rgba(255,255,255,.95)",color:cur.bg==="var(--ink)"?"#111":cur.bg,padding:"16px",borderRadius:16,fontWeight:800,fontSize:16,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,.3)"}}>
          {cur.cta}
        </button>

        {/* Secondary links */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          {slide===0
            ? <button onClick={()=>{setMode("login");setShowForm(true);}} style={{background:"transparent",color:"rgba(255,255,255,.55)",fontSize:15,fontWeight:500,padding:"8px 0",border:"none",width:"100%",textAlign:"center"}}>
                Already have an account? Sign in
              </button>
            : <>
                <button onClick={()=>setSlide(s=>s-1)} style={{background:"transparent",color:"rgba(255,255,255,.5)",fontSize:15,fontWeight:500,padding:"8px",border:"none"}}>← Back</button>
                {!cur.final&&<button onClick={()=>setShowForm(true)} style={{background:"transparent",color:"rgba(255,255,255,.38)",fontSize:15,fontWeight:500,padding:"8px",border:"none"}}>Skip →</button>}
              </>
          }
        </div>
      </div>
    </div>
  );

  // ── Sign-up / login form ──
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"var(--ink2)"}}>
      <div className="fu" style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:52,height:52,background:"var(--sage)",borderRadius:16,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><span style={{fontSize:22}}>🌸</span></div>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-.5px",fontFamily:"'Lora',serif"}}>Calla</h1>
          <p style={{color:"var(--cream3)",fontSize:15,marginTop:3}}>The family brain you don't have to be.</p>
        </div>

        {/* Privacy reassurance above form */}
        <div style={{background:"rgba(83,136,122,.08)",border:"1px solid rgba(83,136,122,.2)",borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:22,height:22,background:"var(--sage2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            <Check size={11} color="#fff"/>
          </div>
          <div>
            <p style={{fontWeight:700,fontSize:15,color:"var(--sage3)",marginBottom:3}}>Your privacy is protected</p>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              {["No ads, ever","Emails deleted immediately after extraction","Your data is never sold or shared"].map((pt,i)=>(
                <p key={i} style={{fontSize:15,color:"var(--sage3)"}}>· {pt}</p>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <div style={{display:"flex",background:"var(--ink3)",borderRadius:12,padding:3,border:"1px solid var(--border)",marginBottom:20}}>
            {["signup","login"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:8,background:mode===m?"var(--ink4)":"transparent",color:mode===m?"var(--cream)":"var(--cream3)",fontWeight:600,fontSize:15,border:"none",boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
                {m==="signup"?"Create Family":"Sign In"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="signup"&&(
              <>
                <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
                <input placeholder="e.g. The Johnsons" value={family} onChange={e=>setFamily(e.target.value)}/>
              </>
            )}
            <div style={{position:"relative"}}>
              <input placeholder="you@example.com" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{paddingRight:36}}/>
              {email.includes("@")&&email.includes(".")&&(
                <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:20,height:20,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path d="M1 4l3 3L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray:20,strokeDashoffset:0,animation:"tickDraw .3s ease forwards"}}/>
                  </svg>
                </div>
              )}
            </div>
            <div style={{position:"relative"}}>
              <input placeholder="Choose a password (6+ characters)" type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{paddingRight:44}}/>
              {mode==="signup"&&pass.length>0&&(function(){
                var str=pass.length>=10&&/[A-Z]/.test(pass)&&/[0-9]/.test(pass)?3:pass.length>=6?2:1;
                var cols=["var(--rose)","var(--gold2)","var(--sage2)"];
                var labels=["Weak","Good","Strong"];
                return(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                    <div style={{display:"flex",gap:3,flex:1}}>
                      {[1,2,3].map(function(i){return(
                        <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=str?cols[str-1]:"var(--ink5)",transition:"background .3s"}}/>
                      );})}
                    </div>
                    <span style={{fontSize:11,color:cols[str-1],fontWeight:600,minWidth:40}}>{labels[str-1]}</span>
                  </div>
                );
              })()}
              <button type="button" onClick={()=>setShowPass(function(s){return !s;})} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--muted)",fontSize:15,fontWeight:600,padding:4}}>{showPass?"Hide":"Show"}</button>
            </div>
            <Btn onClick={go} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              {loading
                ? <div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                : <>{mode==="signup"?"Let's get started →":"Sign In →"}</>
              }
            </Btn>
          </div>

          {/* Privacy micro-copy below button */}
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Check size={7} color="#fff"/>
            </div>
            <p style={{fontSize:15,color:"var(--cream3)",textAlign:"center"}}>No credit card · No ads · Email deleted after use · Demo: any credentials</p>
          {mode==="login"&&<button type="button" onClick={()=>alert("We'll send a reset link to your email. Give us a moment.")} style={{background:"none",border:"none",color:"var(--sage3)",fontSize:15,fontWeight:600,display:"block",margin:"8px auto 0",cursor:"pointer"}}>Forgot password?</button>}
          </div>
        </Card>

        <button onClick={()=>setShowForm(false)} style={{background:"none",border:"none",color:"var(--cream3)",fontSize:15,display:"block",margin:"14px auto 0"}}>← Back to intro</button>
      </div>
    </div>
  );
}

/* ─── Co-parent Setup (post-login step 2) ───────────────────────────────── */
function CoParentSetup({user,onDone}) {
  const [partnerEmail,setPartnerEmail]=useState(""),[sent,setSent]=useState(false),[skipped,setSkipped]=useState(false);
  if(skipped||sent) return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:36,textAlign:"center",background:"var(--ink)"}}>
      <div className="fu">
        <div style={{fontSize:72,marginBottom:24}}>{sent?"🎉":"👍"}</div>
        <h2 style={{fontSize:26,fontWeight:700,marginBottom:12,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)"}}>{sent?"Invite sent!":"No problem."}</h2>
        <p style={{color:"var(--cream3)",fontSize:16,lineHeight:1.75,marginBottom:40,fontWeight:300}}>{sent?"We emailed "+partnerEmail+". Once they join, you'll both see every update in real time.":"You can always invite someone later from the Family tab."}</p>
        <Btn onClick={onDone} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px 36px",fontSize:16}}>Take me to my calendar →</Btn>
      </div>
    </div>
  );
  return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink)",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"52px 24px 24px"}}>
        <div className="fu">
          <div style={{fontSize:72,textAlign:"center",marginBottom:28}}>👨‍👩‍👧‍👦</div>
          <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.5px",textAlign:"center",marginBottom:14,fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1.15}}>Who else manages your family's schedule?</h1>
          <p style={{color:"var(--cream3)",fontSize:16,lineHeight:1.75,textAlign:"center",marginBottom:28,fontWeight:300}}>Invite your partner so you both see every event, change and reminder — in real time. No more "I didn't know about that."</p>

          {/* Live sync preview */}
          <div style={{marginBottom:28,border:"1px solid rgba(83,136,122,.25)",borderRadius:16,padding:"16px 12px",background:"rgba(83,136,122,.08)"}}>
            <p style={{fontSize:15,color:"var(--sage3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:16}}>What co-parent sync looks like</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[["You add 'Ballet Tuesday 4pm'","Appears on partner's phone instantly"],["Partner changes pickup time","Your calendar updates automatically"],["Conflict detected automatically","Both parents get alerted"]].map(([a,b],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={14} color="#fff"/></div>
                  <div><p style={{fontSize:15,fontWeight:600,color:"var(--cream)"}}>{a}</p><p style={{fontSize:15,color:"var(--cream3)",marginTop:2,fontWeight:300}}>{b}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned bottom — always visible */}
      <div style={{flexShrink:0,padding:"16px 24px",paddingBottom:"calc(20px + env(safe-area-inset-bottom,0px))"}}>
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <input placeholder="partner@email.com" type="email" value={partnerEmail} onChange={e=>setPartnerEmail(e.target.value)} style={{flex:1,fontSize:15}} onKeyDown={e=>e.key==="Enter"&&partnerEmail.includes("@")&&partnerEmail.trim()!==user.email&&setSent(true)}/>
          <Btn onClick={()=>{if(partnerEmail.includes("@")&&partnerEmail.trim()!==user.email)setSent(true);}} style={{padding:"0 22px",flexShrink:0,fontSize:15}}>Invite</Btn>
        </div>
        <button onClick={()=>setSkipped(true)} style={{background:"none",border:"none",color:"var(--cream3)",fontSize:15,fontWeight:400,display:"block",width:"100%",textAlign:"center",padding:"10px"}}>I'll invite someone later</button>
      </div>
    </div>
  );
}

/* ─── Value Prop Banner ─────────────────────────────────────────────────── */
function ValueBanner({onDismiss}) {
  const [dismissed,setDismissed]=useState(false);
  if(dismissed) return null;
  const dismiss=()=>{setDismissed(true);onDismiss&&onDismiss();};
  return (
    <div className="fu" style={{background:"linear-gradient(135deg,var(--ink3) 0%,rgba(58,100,89,.4) 100%)",borderRadius:16,padding:"20px",marginBottom:16,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-24,right:-24,width:110,height:110,borderRadius:"50%",background:"rgba(255,255,255,.05)"}}/>
      <div style={{position:"absolute",bottom:-30,left:50,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
      <button onClick={dismiss} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--cream)",flexShrink:0}}><X size={12}/></button>
      <p style={{fontSize:15,color:"rgba(255,255,255,.55)",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:5}}>Calla remembers everything</p>
      <p style={{fontSize:20,fontWeight:800,color:"var(--cream)",marginBottom:14,letterSpacing:"-.3px",lineHeight:1.25,paddingRight:24}}>So you don't have to.</p>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {[["🎙","Voice"],["📬","Email Parser"],["⚡","Conflicts"],["🎒","Packing"]].map(([icon,label])=>(
          <div key={label} style={{background:"rgba(255,255,255,.14)",borderRadius:99,padding:"5px 11px",display:"flex",alignItems:"center",gap:5,fontSize:15,fontWeight:600,color:"var(--cream)"}}>
            <span style={{fontSize:15}}>{icon}</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Briefing ──────────────────────────────────────────────────────────── */
function Briefing({events,members,onSelect}) {
  const [open,setOpen]=useState(true);
  const h=new Date().getHours();
  const Icon=h<12?Sun:h<17?Sunset:Moon;
  const greet=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  const todayEvs=events.filter(e=>e.date===todayStr).sort((a,b)=>a.time.localeCompare(b.time));
  const tomEvs=events.filter(e=>e.date===addDays(todayStr,1));
  const gm=id=>members.find(m=>m.id===id)||{emoji:"👤",color:"var(--muted)"};
  const now=new Date().getHours()*60+new Date().getMinutes();
  const toM=t=>{const[hh,mm]=(t||"0:0").split(":").map(Number);return hh*60+mm;};

  if(!open) return (
    <button onClick={()=>setOpen(true)} style={{width:"100%",background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:16,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,color:"var(--cream3)",fontSize:15,fontWeight:500}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><Icon size={15}/><span>{greet}</span></div>
      <ChevronDown size={15}/>
    </button>
  );

  return (
    <Card style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><Icon size={15} color="#6B7280"/><span style={{fontSize:15,color:"var(--cream3)",fontWeight:500}}>{greet} · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</span></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"var(--muted)",display:"flex"}}><ChevronUp size={15}/></button>
      </div>
      <p style={{fontSize:20,fontWeight:800,letterSpacing:"-.3px",marginBottom:todayEvs.length?14:0}}>
        {todayEvs.length===0?"Your day is open ✨":todayEvs.length+" event"+(todayEvs.length>1?"s":"")+" today"}
      </p>
      {todayEvs.map((ev,i)=>{
        var showNoonDivider=i>0&&todayEvs[i-1].time<"12:00"&&ev.time>="12:00";
        const m=gm(ev.memberId),past=toM(ev.time)<now,next=!past&&todayEvs.slice(0,i).every(e=>toM(e.time)<now);
        return (
          <Fragment key={ev.id}>
          {showNoonDivider&&(
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 8px"}}>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
              <span style={{fontSize:11,color:"var(--cream3)",fontWeight:600,letterSpacing:".06em"}}>AFTERNOON</span>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
            </div>
          )}
          <div
            onClick={()=>onSelect&&onSelect(ev)}
            style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,opacity:past?0.4:1,cursor:"pointer",borderRadius:12,padding:"6px 8px",margin:"0 -8px 6px",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{width:3,height:32,borderRadius:2,background:past?"var(--border2)":ev.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:15,fontWeight:600,color:past?"#9CA3AF":"#111"}}>{m.emoji} {ev.title}</p>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <p style={{fontSize:15,color:"var(--muted)"}}>{ev.time}{ev.location&&<span style={{color:"var(--cream3)"}}> · {ev.location}</span>}</p>
                {ev.packingList&&ev.packingList.length>0&&!past&&(
                  <div style={{display:"flex",alignItems:"center",gap:3,background:ev.color+"12",borderRadius:99,padding:"1px 7px"}}>
                    <Package size={9} color={ev.color}/>
                    <span style={{fontSize:15,fontWeight:700,color:ev.color}}>{ev.packingList.length} to pack</span>
                  </div>
                )}
              </div>
            </div>
            {next&&<Pill color={ev.color} bg={ev.color+"15"} style={{animation:"pulse 2s infinite"}}>Next</Pill>}
            {past?<Check size={13} color="#9CA3AF"/>:<ChevronRight size={14} color="#D1D5DB"/>}
          </div>
          </Fragment>
        );
      })}
      {tomEvs.length>0&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border2)"}}>
          <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Tomorrow</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tomEvs.slice(0,3).map(ev=>{const m=gm(ev.memberId);return <Pill key={ev.id} color={ev.color} bg={ev.color+"12"}>{m.emoji} {ev.title}</Pill>;})}
            {tomEvs.length>3&&<Pill color="var(--cream3)" bg="var(--ink4)">+{tomEvs.length-3}</Pill>}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Conflict Banner ───────────────────────────────────────────────────── */
function ConflictBanner({items,members,onSelect}) {
  const [open,setOpen]=useState(false),[dismissed,setDismissed]=useState([]);
  const visible=items.filter(c=>!dismissed.includes(c.a.id+"-"+c.b.id));
  if(!visible.length) return null;
  const gm=id=>members.find(m=>m.id===id)||{name:"?",color:"var(--muted)",emoji:"👤"};
  return (
    <div style={{background:"rgba(176,141,82,.1)",border:"1px solid rgba(176,141,82,.25)",borderRadius:16,marginBottom:16,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",padding:"14px 16px",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
        <AlertTriangle size={15} color="#D97706"/>
        <span style={{flex:1,fontWeight:600,fontSize:15,color:"var(--gold3)"}}>{visible.length} conflict{visible.length>1?"s":""} detected</span>
        {open?<ChevronUp size={15} color="#D97706"/>:<ChevronDown size={15} color="#D97706"/>}
      </button>
      {open&&visible.map(c=>{
        const ma=gm(c.a.memberId),mb=gm(c.b.memberId),key=c.a.id+"-"+c.b.id;
        return (
          <div key={key} style={{borderTop:"1px solid rgba(196,149,58,.3)",padding:"12px 16px"}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div onClick={()=>onSelect&&onSelect(c.a)} style={{flex:1,background:"var(--ink2)",borderRadius:12,padding:10,border:"1px solid rgba(196,149,58,.3)",cursor:"pointer"}}>
                <p style={{fontSize:15,color:c.a.color,fontWeight:700,marginBottom:2}}>{ma.emoji} {ma.name}</p>
                <p style={{fontSize:15,fontWeight:600}}>{c.a.title}</p>
                <p style={{fontSize:15,color:"var(--cream3)"}}>{c.a.time}</p>
                <span style={{fontSize:15,color:"var(--sage3)",fontWeight:600}}>View event</span>
              </div>
              <div style={{display:"flex",alignItems:"center"}}><Zap size={13} color="#D97706"/></div>
              <div onClick={()=>onSelect&&onSelect(c.b)} style={{flex:1,background:"var(--ink2)",borderRadius:12,padding:10,border:"1px solid rgba(196,149,58,.3)",cursor:"pointer"}}>
                <p style={{fontSize:15,color:c.b.color,fontWeight:700,marginBottom:2}}>{mb.emoji} {mb.name}</p>
                <p style={{fontSize:15,fontWeight:600}}>{c.b.title}</p>
                <p style={{fontSize:15,color:"var(--cream3)"}}>{c.b.time}</p>
                <span style={{fontSize:15,color:"var(--sage3)",fontWeight:600}}>View event</span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:15,color:"var(--gold3)"}}>{c.type==="same"?"Double-booked · "+c.diff+"min":"Only "+c.diff+"min gap"}</p>
              <button onClick={e=>{e.stopPropagation();setDismissed(d=>[...d,key]);}} style={{background:"none",border:"none",color:"var(--muted)",fontSize:15,fontWeight:500}}>Dismiss</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Share Sheet ───────────────────────────────────────────────────────── */
const ShareSheet = ({ev,onClose}) => {
  const [mode,setMode]       = useState(null); // null | "sms" | "email" | "copy"
  const [phone,setPhone]     = useState("");
  const [email,setEmail]     = useState("");
  const [sent,setSent]       = useState(false);
  const [copied,setCopied]   = useState(false);

  // Build the shareable event text
  const eventText = (() => {
    const lines = [];
    lines.push("📅 "+ev.title);
    lines.push("");
    if(ev.date) lines.push("🗓  "+fd(ev.date));
    if(ev.time) lines.push("🕐 "+ev.time);
    if(ev.location){
      lines.push("📍 "+ev.location);
      lines.push("   Maps: https://maps.google.com/?q="+encodeURIComponent(ev.location));
    }
    if(ev.notes) lines.push("\n📝 "+ev.notes);
    if(ev.packingList&&ev.packingList.length>0){
      lines.push("\n🎒 Bring: "+ev.packingList.join(", "));
    }
    lines.push("\n— Shared via Calla · getcalla.ca");
    return lines.join("\n");
  })();

  const emailSubject = encodeURIComponent("Event: "+ev.title+" on "+fd(ev.date));
  const emailBody    = encodeURIComponent(eventText);
  const smsBody      = encodeURIComponent(eventText);

  const copyText = () => {
    navigator.clipboard&&navigator.clipboard.writeText(eventText);
    setCopied(true);
    setTimeout(()=>setCopied(false),2500);
  };

  const sendSMS = () => {
    if(!phone.trim()) return;
    // Opens native SMS app with prefilled number and body
    window.open("sms:"+phone.replace(/\s/g,"")+"?body="+smsBody);
    setSent(true);
  };

  const sendEmail = () => {
    if(!email.trim()) return;
    window.open("mailto:"+email+"?subject="+emailSubject+"&body="+emailBody);
    setSent(true);
  };

  const shareNative = () => {
    if(navigator.share){
      navigator.share({title:ev.title, text:eventText}).catch(()=>{});
    } else {
      copyText();
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:600,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fu sheet-scroll" style={{background:"rgba(18,18,22,.97)",borderRadius:"20px 20px 0 0",padding:"8px 20px calc(40px + env(safe-area-inset-bottom,0px))",width:"100%",maxHeight:"85vh",overflowY:"auto",overscrollBehavior:"contain"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h3 style={{fontSize:18,fontWeight:800}}>Share Event</h3>
            <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{ev.title}</p>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"var(--ink4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"auto",minWidth:"auto"}}>
            <X size={16} color="#6B7280"/>
          </button>
        </div>

        {/* Event preview card */}
        <div style={{background:"var(--sage-light)",border:"1.5px solid var(--sage-mid)",borderRadius:16,padding:"14px 16px",marginBottom:20}}>
          <p style={{fontSize:15,fontWeight:700,color:"var(--sage)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>What they'll receive</p>
          <pre style={{fontSize:15,color:"var(--cream)",lineHeight:1.7,fontFamily:"inherit",whiteSpace:"pre-wrap",margin:0}}>{eventText}</pre>
        </div>

        {/* Share options */}
        {!mode&&!sent&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>

            {/* SMS */}
            <button onClick={()=>setMode("sms")} style={{display:"flex",alignItems:"center",gap:16,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:16,padding:"16px 18px",cursor:"pointer",textAlign:"left",width:"100%",transition:"box-shadow .15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
            >
              <div style={{width:48,height:48,borderRadius:16,background:"rgba(46,107,94,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24}}>💬</div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:15}}>Send as Text (SMS)</p>
                <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>Opens your Messages app · Enter any phone number</p>
              </div>
              <ChevronRight size={16} color="#D1D5DB"/>
            </button>

            {/* Email */}
            <button onClick={()=>setMode("email")} style={{display:"flex",alignItems:"center",gap:16,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:16,padding:"16px 18px",cursor:"pointer",textAlign:"left",width:"100%",transition:"box-shadow .15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
            >
              <div style={{width:48,height:48,borderRadius:16,background:"rgba(59,130,246,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24}}>📧</div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:15}}>Send as Email</p>
                <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>Opens your Mail app · Enter any email address</p>
              </div>
              <ChevronRight size={16} color="#D1D5DB"/>
            </button>

            {/* Copy */}
            <button onClick={copyText} style={{display:"flex",alignItems:"center",gap:16,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:16,padding:"16px 18px",cursor:"pointer",textAlign:"left",width:"100%",transition:"box-shadow .15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
            >
              <div style={{width:48,height:48,borderRadius:16,background:copied?"rgba(67,143,126,.18)":"var(--ink4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24,transition:"background .2s"}}>
                {copied?"✅":"📋"}
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:15,color:copied?"var(--sage2)":"var(--ink)"}}>{copied?"Copied!":"Copy to Clipboard"}</p>
                <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>Paste anywhere — WhatsApp, iMessage, Slack…</p>
              </div>
              {copied?<Check size={16} color="var(--sage2)"/>:<Copy size={16} color="#D1D5DB"/>}
            </button>

            {/* Native share sheet (iOS/Android) */}
            {"share" in navigator&&(
              <button onClick={shareNative} style={{display:"flex",alignItems:"center",gap:16,background:"var(--ink2)",borderRadius:16,padding:"16px 18px",cursor:"pointer",textAlign:"left",width:"100%",border:"none"}}>
                <div style={{width:48,height:48,borderRadius:16,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24}}>📤</div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:15,color:"var(--cream)"}}>More Options</p>
                  <p style={{fontSize:15,color:"rgba(255,255,255,.6)",marginTop:2}}>AirDrop, WhatsApp, Telegram and more</p>
                </div>
                <ChevronRight size={16} color="rgba(255,255,255,.4)"/>
              </button>
            )}
          </div>
        )}

        {/* SMS mode */}
        {mode==="sms"&&!sent&&(
          <div className="fu">
            <button onClick={()=>setMode(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,padding:"0 0 16px",minHeight:"auto",minWidth:"auto"}}>
              <ChevronLeft size={15}/>Back
            </button>
            <div style={{background:"rgba(46,107,94,.1)",borderRadius:16,padding:"14px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>💬</span>
              <div>
                <p style={{fontWeight:700,fontSize:15,color:"var(--sage3)",marginBottom:3}}>Send via Text Message</p>
                <p style={{fontSize:15,color:"var(--sage3)",lineHeight:1.6}}>Enter a phone number below. Your native Messages app will open with the event details pre-filled — just hit Send.</p>
              </div>
            </div>
            <label style={{fontSize:15,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>Phone number</label>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flex:1,background:"var(--ink3)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border2)"}}>
                <span style={{fontSize:18,flexShrink:0}}>📱</span>
                <input
                  autoFocus
                  type="tel"
                  placeholder="+1 613 555 0100"
                  value={phone}
                  onChange={e=>setPhone(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendSMS()}
                  style={{background:"transparent",border:"none",padding:0,fontSize:16,flex:1}}
                />
              </div>
            </div>
            <p style={{fontSize:15,color:"var(--muted)",marginBottom:16}}>Works for anyone — grandparents, babysitters, coaches. No app needed on their end.</p>
            <Btn onClick={sendSMS} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:15,opacity:phone.trim()?1:.5}}>
              <Send size={15}/>Open Messages & Send
            </Btn>
          </div>
        )}

        {/* Email mode */}
        {mode==="email"&&!sent&&(
          <div className="fu">
            <button onClick={()=>setMode(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,padding:"0 0 16px",minHeight:"auto",minWidth:"auto"}}>
              <ChevronLeft size={15}/>Back
            </button>
            <div style={{background:"rgba(59,130,246,.1)",borderRadius:16,padding:"14px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>📧</span>
              <div>
                <p style={{fontWeight:700,fontSize:15,color:"var(--sage3)",marginBottom:3}}>Send via Email</p>
                <p style={{fontSize:15,color:"var(--sage2)",lineHeight:1.6}}>Your Mail app will open with the event details and Google Maps link pre-filled. Just hit Send.</p>
              </div>
            </div>
            <label style={{fontSize:15,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>Email address</label>
            <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--ink3)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border2)",marginBottom:14}}>
              <span style={{fontSize:18,flexShrink:0}}>✉️</span>
              <input
                autoFocus
                type="email"
                placeholder="grandma@email.com"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendEmail()}
                style={{background:"transparent",border:"none",padding:0,fontSize:16,flex:1}}
              />
            </div>
            <p style={{fontSize:15,color:"var(--muted)",marginBottom:16}}>The subject line will say "Event: {ev.title} on {fd(ev.date)}".</p>
            <Btn onClick={sendEmail} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:15,opacity:email.includes("@")?1:.5}}>
              <Send size={15}/>Open Mail & Send
            </Btn>
          </div>
        )}

        {/* Sent confirmation */}
        {sent&&(
          <div className="fu" style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:56,marginBottom:14}}>🎉</div>
            <p style={{fontWeight:800,fontSize:18,marginBottom:8}}>
              {mode==="sms"?"Messages app opened!":"Mail app opened!"}
            </p>
            <p style={{fontSize:15,color:"var(--cream3)",lineHeight:1.7,marginBottom:24}}>
              The event details are pre-filled. Just tap <strong>Send</strong> in {mode==="sms"?"Messages":"Mail"} and you're done.
            </p>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" onClick={()=>{setSent(false);setMode(null);}} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>Share Again</Btn>
              <Btn onClick={onClose} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>Done</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Event Sheet ───────────────────────────────────────────────────────── */
const EVENT_COMMENTS = {};

function EventSheet({ev,members,onClose,onDelete,user,onTagNotify}) {
  const [packed,setPacked]     = useState({});
  const [comments,setComments] = useState(EVENT_COMMENTS[ev.id]||[]);
  const [commentText,setCommentText] = useState("");
  const [showComments,setShowComments] = useState(true);
  const [showMentionPicker,setShowMentionPicker] = useState(false);
  const [mentionSearch,setMentionSearch] = useState("");
  const [showShare,setShowShare] = useState(false);
  const commentInputRef = useRef();
  const m=members.find(x=>x.id===ev.memberId)||{emoji:"👤",color:"var(--muted)",name:"?"};

  const handleCommentInput = (val) => {
    setCommentText(val);
    const lastAt = val.lastIndexOf("@");
    if(lastAt !== -1 && (lastAt === 0 || val[lastAt-1]===" ")) {
      setMentionSearch(val.slice(lastAt+1).toLowerCase());
      setShowMentionPicker(true);
    } else { setShowMentionPicker(false); }
  };

  const insertMention = (member) => {
    const lastAt = commentText.lastIndexOf("@");
    setCommentText(commentText.slice(0,lastAt)+"@"+member.name+" ");
    setShowMentionPicker(false);
    setTimeout(()=>commentInputRef.current&&commentInputRef.current.focus(),50);
  };

  const extractMentions = (text) => members.filter(m=>text.toLowerCase().includes("@"+m.name.toLowerCase()));

  const renderCommentText = (text) => {
    const parts = text.split(/(@\w+(?:\s\w+)?)/g);
    return parts.map((part,i)=>{
      const tm=members.find(m=>part.toLowerCase()==="@"+m.name.toLowerCase());
      if(tm) return <span key={i} style={{background:tm.color+"20",color:tm.color,fontWeight:700,borderRadius:4,padding:"0 4px"}}>{tm.emoji} {part}</span>;
      return <span key={i}>{part}</span>;
    });
  };

  const addComment = () => {
    if(!commentText.trim()) return;
    const tagged = extractMentions(commentText);
    const newComment = {
      id:genId(),text:commentText.trim(),
      author:(user&&user.name)||"You",authorEmoji:"👤",
      time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      date:new Date().toLocaleDateString([],{month:"short",day:"numeric"}),
      taggedIds:tagged.map(t=>t.id),
    };
    const updated=[...comments,newComment];
    EVENT_COMMENTS[ev.id]=updated;
    setComments(updated);
    setCommentText("");
    setShowMentionPicker(false);
    if(tagged.length>0&&onTagNotify) tagged.forEach(tm=>onTagNotify({member:tm,event:ev,comment:newComment,author:(user&&user.name)||"You"}));
  };

  const filteredMembers = members.filter(m=>m.name.toLowerCase().startsWith(mentionSearch));
  const openMaps = loc=>window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(loc),"_blank");
  const openDirs = loc=>window.open("https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(loc),"_blank");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet-enter sheet-scroll" style={{borderRadius:"20px 20px 0 0",padding:"8px 20px calc(40px + env(safe-area-inset-bottom,0px))",width:"100%",maxHeight:"92vh",overflowY:"auto",overscrollBehavior:"contain",background:"var(--ink2)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 16px"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <Pill color={m.color} bg={m.color+"15"}>
                {m.photo?<img src={m.photo} style={{width:14,height:14,borderRadius:"50%",objectFit:"cover"}} alt=""/>:m.emoji} {m.name}
              </Pill>
              {ev.recurring&&<Pill color="var(--sage3)" bg="rgba(67,143,126,.14)"><Repeat size={10}/> Recurring</Pill>}
            </div>
            <h2 style={{fontSize:22,fontWeight:800,letterSpacing:"-.3px",lineHeight:1.2}}>{ev.title}</h2>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"var(--ink4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12,minHeight:"auto",minWidth:"auto"}}>
            <X size={16} color="#6B7280"/>
          </button>
        </div>

        {/* Details */}
        <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:16}}>
          {[[Calendar,fd(ev.date),"Date"],[Clock,ev.time||"No time","Time"],ev.cost?[DollarSign,"$"+ev.cost+" / "+(ev.costType||"one-time"),"Cost"]:null].filter(Boolean).map(([Icon,val,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{width:34,height:34,background:"var(--sage-light)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={15} color="var(--sage)"/></div>
              <div><p style={{fontSize:15,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</p><p style={{fontSize:15,fontWeight:600,marginTop:1}}>{val}</p></div>
            </div>
          ))}
        </div>

        {/* Location */}
        {ev.location?(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F3F4F6",marginBottom:10}}>
              <div style={{width:34,height:34,background:"var(--sage-light)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MapPin size={15} color="var(--sage)"/></div>
              <div style={{flex:1}}>
                <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>Location</p>
                <p style={{fontSize:15,fontWeight:600,color:"var(--sage3)",marginTop:1,cursor:"pointer"}} onClick={()=>openMaps(ev.location)}>{ev.location}</p>
              </div>
            </div>
            <div style={{borderRadius:16,overflow:"hidden",border:"1px solid var(--border2)",marginBottom:10,position:"relative"}}>
              <iframe title="Location" src={"https://www.openstreetmap.org/export/embed.html?layer=mapnik&query="+encodeURIComponent(ev.location)} width="100%" height="160" style={{display:"block",border:"none"}} loading="lazy"/>
              <button onClick={()=>openMaps(ev.location)} style={{position:"absolute",top:8,right:8,background:"var(--ink2)",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 8px rgba(0,0,0,.14)",border:"1px solid var(--border)",minHeight:"auto",minWidth:"auto"}}><MapPin size={11} color="var(--sage2)"/><span style={{fontSize:15,fontWeight:700,color:"var(--sage3)"}}>Open</span></button>
            </div>
            <button onClick={()=>openDirs(ev.location)} style={{width:"100%",background:"var(--sage-light)",border:"1.5px solid var(--sage-mid)",borderRadius:12,padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:700,fontSize:15,color:"var(--sage)",cursor:"pointer"}}><MapPin size={16}/>Get Directions</button>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F3F4F6",marginBottom:16}}>
            <div style={{width:34,height:34,background:"var(--ink4)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MapPin size={15} color="#D1D5DB"/></div>
            <div><p style={{fontSize:15,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>Location</p><p style={{fontSize:15,color:"var(--border3)",marginTop:1}}>Not set</p></div>
          </div>
        )}

        {/* Notes */}
        {ev.notes&&<Card style={{marginBottom:16,background:"var(--ink3)"}}><div style={{display:"flex",gap:10}}><FileText size={15} color="var(--cream3)" style={{marginTop:2,flexShrink:0}}/><p style={{fontSize:15,color:"var(--cream2)",lineHeight:1.65}}>{ev.notes}</p></div></Card>}

        {/* Packing */}
        {ev.packingList&&ev.packingList.length>0&&(
          <Card style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <Package size={15} color="var(--sage)"/>
              <p style={{fontWeight:700,fontSize:15}}>Packing List</p>
              {Object.values(packed).filter(Boolean).length>0&&<Pill color="var(--sage)" bg="var(--sage-light)" style={{marginLeft:"auto"}}>{Object.values(packed).filter(Boolean).length}/{ev.packingList.length} packed</Pill>}
            </div>
            {ev.packingList.map((item,i)=>(
              <div key={i} onClick={()=>setPacked(p=>({...p,[i]:!p[i]}))} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<ev.packingList.length-1?"1px solid #F3F4F6":"none",cursor:"pointer"}}>
                <div style={{width:22,height:22,borderRadius:6,border:"1.5px solid "+(packed[i]?"var(--sage2)":"var(--border2)"),background:packed[i]?"var(--sage)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>{packed[i]&&<Check size={12} color="#fff"/>}</div>
                <p style={{fontSize:15,color:packed[i]?"#9CA3AF":"var(--ink)",textDecoration:packed[i]?"line-through":"none"}}>{item}</p>
              </div>
            ))}
            {ev.packingList.length>0&&Object.values(packed).filter(Boolean).length===ev.packingList.length&&<p style={{fontSize:15,color:"var(--sage)",fontWeight:700,marginTop:10,display:"flex",alignItems:"center",gap:5}}><Check size={12}/>All packed!</p>}
          </Card>
        )}

        {/* Comments + @tagging */}
        <div style={{marginBottom:16}}>
          {/* Header */}
          <button onClick={()=>setShowComments(s=>!s)}
            style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",padding:"0 0 14px",width:"100%",justifyContent:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:8,background:"rgba(67,143,126,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <MessageCircle size={14} color="var(--sage3)"/>
            </div>
            <p style={{fontWeight:600,fontSize:16,color:"var(--cream)"}}>Notes & Comments</p>
            {comments.length>0&&(
              <div style={{background:"var(--sage)",borderRadius:99,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px"}}>
                <span style={{fontSize:11,fontWeight:700,color:"var(--cream)"}}>{comments.length}</span>
              </div>
            )}
            <div style={{marginLeft:"auto",color:"var(--cream3)"}}>{showComments?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</div>
          </button>

          {showComments&&(
            <>
              {/* @mention hint — only show when no comments yet */}
              {comments.length===0&&(
                <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--ink3)",borderRadius:14,padding:"12px 14px",marginBottom:14,border:"1px solid var(--border)"}}>
                  <span style={{fontSize:20,flexShrink:0}}>💬</span>
                  <div>
                    <p style={{fontSize:14,fontWeight:500,color:"var(--cream2)",marginBottom:2}}>Leave a note for the family</p>
                    <p style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>Type <strong style={{color:"var(--sage3)",fontWeight:600}}>@name</strong> to tag someone — they'll get notified instantly</p>
                  </div>
                </div>
              )}

              {/* Comment bubbles */}
              {comments.length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:14}}>
                  {comments.map(c=>{
                    const taggedMs=(c.taggedIds||[]).map(id=>members.find(m=>m.id===id)).filter(Boolean);
                    return (
                      <div key={c.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        {/* Avatar */}
                        <div style={{width:32,height:32,borderRadius:10,background:"var(--sage)",backgroundImage:"linear-gradient(135deg,var(--sage),var(--sage2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,boxShadow:"0 2px 8px rgba(46,107,94,.25)"}}>
                          {c.authorEmoji||"👤"}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          {/* Author + time */}
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                            <p style={{fontSize:13,fontWeight:700,color:"var(--cream2)"}}>{c.author}</p>
                            <span style={{width:3,height:3,borderRadius:"50%",background:"var(--border3)",flexShrink:0,display:"inline-block"}}/>
                            <p style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>{c.date} · {c.time}</p>
                          </div>
                          {/* Bubble */}
                          <div style={{background:"var(--ink3)",borderRadius:"4px 16px 16px 16px",padding:"11px 14px",border:"1px solid var(--border2)",marginBottom:taggedMs.length>0?8:0}}>
                            <p style={{fontSize:15,color:"var(--cream)",lineHeight:1.6}}>{renderCommentText(c.text)}</p>
                          </div>
                          {/* Tagged members */}
                          {taggedMs.length>0&&(
                            <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginTop:5}}>
                              <Bell size={11} color="var(--cream3)"/>
                              <span style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>Notified:</span>
                              {taggedMs.map(tm=>(
                                <div key={tm.id} style={{display:"flex",alignItems:"center",gap:4,background:tm.color+"18",borderRadius:99,padding:"3px 9px",border:"1px solid "+tm.color+"35"}}>
                                  <span style={{fontSize:13}}>{tm.photo?<img src={tm.photo} style={{width:12,height:12,borderRadius:"50%",objectFit:"cover"}} alt=""/>:tm.emoji}</span>
                                  <span style={{fontSize:12,fontWeight:700,color:tm.color}}>{tm.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* @mention picker */}
              {showMentionPicker&&filteredMembers.length>0&&(
                <div className="fu" style={{background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:16,marginBottom:10,overflow:"hidden",boxShadow:"0 16px 40px rgba(0,0,0,.4)"}}>
                  <div style={{padding:"10px 14px 8px",borderBottom:"1px solid var(--border)"}}>
                    <p style={{fontSize:11,color:"var(--cream3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Tag a family member</p>
                  </div>
                  {filteredMembers.map((member,i)=>(
                    <div key={member.id} onMouseDown={()=>insertMention(member)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",cursor:"pointer",borderBottom:i<filteredMembers.length-1?"1px solid var(--border)":"none",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--ink4)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      <div style={{width:38,height:38,borderRadius:12,background:member.color+"18",border:"1.5px solid "+member.color+"40",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",fontSize:20,flexShrink:0}}>
                        {member.photo?<img src={member.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:member.emoji}
                      </div>
                      <div style={{flex:1}}>
                        <p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>@{member.name}</p>
                        <p style={{fontSize:12,color:"var(--cream3)",marginTop:1,fontWeight:300}}>Tap to tag · instant notification</p>
                      </div>
                      <div style={{width:28,height:28,borderRadius:8,background:member.color+"22",border:"1px solid "+member.color+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Bell size={13} color={member.color}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
                <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,var(--sage),var(--sage2))",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,boxShadow:"0 2px 8px rgba(46,107,94,.25)"}}>👤</div>
                <div style={{flex:1,background:"var(--ink3)",borderRadius:16,padding:"11px 14px",border:"1px solid var(--border2)",transition:"border-color .2s,box-shadow .2s"}}
                  onFocusCapture={e=>{e.currentTarget.style.borderColor="var(--sage2)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(67,143,126,.12)";}}
                  onBlurCapture={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.boxShadow="none";}}
                >
                  <input
                    ref={commentInputRef}
                    placeholder="Add a note, or @ to loop someone in…"
                    value={commentText}
                    onChange={e=>handleCommentInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&addComment()}
                    onBlur={()=>setTimeout(()=>setShowMentionPicker(false),150)}
                    style={{background:"transparent",border:"none",padding:0,fontSize:15,width:"100%",color:"var(--cream)"}}
                  />
                  {commentText.trim()&&(
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",flex:1}}>
                        {extractMentions(commentText).map(tm=>(
                          <div key={tm.id} style={{display:"flex",alignItems:"center",gap:4,background:tm.color+"18",borderRadius:99,padding:"3px 9px",border:"1px solid "+tm.color+"35"}}>
                            <Bell size={10} color={tm.color}/>
                            <span style={{fontSize:12,fontWeight:700,color:tm.color}}>{tm.name}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={addComment}
                        style={{width:32,height:32,borderRadius:10,background:"var(--sage)",backgroundImage:"linear-gradient(135deg,var(--sage),var(--sage2))",display:"flex",alignItems:"center",justifyContent:"center",border:"none",flexShrink:0,boxShadow:"0 4px 12px rgba(46,107,94,.4)"}}>
                        <Send size={14} color="var(--cream)"/>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Share + Delete row */}
        <div style={{display:"flex",gap:10,marginBottom:0}}>
          <button
            onClick={()=>setShowShare(true)}
            style={{flex:1,background:"var(--sage-light)",border:"1.5px solid var(--sage-mid)",borderRadius:12,padding:"13px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:700,fontSize:15,color:"var(--sage)",cursor:"pointer"}}
          >
            <Share2 size={16}/>Share Event
          </button>
          <Btn v="danger" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={()=>onDelete(ev.id)}>
            <Trash2 size={15}/>Delete
          </Btn>
        </div>

        {/* Share Sheet */}
        {showShare&&<ShareSheet ev={ev} onClose={()=>setShowShare(false)}/>}
      </div>
    </div>
  );
}

/* ─── Add Sheet ─────────────────────────────────────────────────────────── */
function AddSheet({members,onAdd,onClose,events=[]}) {
  const [ev,setEv]=useState({title:"",memberId:members[0]&&members[0].id||"",date:todayStr,time:smartTime(),endTime:"",location:"",recurring:false,recurFreq:"weekly",recurEnd:addDays(todayStr,84),notes:"",packingList:[],cost:"",costType:"one-time",_pack:""});
  const [locQuery,setLocQuery]=useState("");
  const [showLocDrop,setShowLocDrop]=useState(false);
  const [addError,setAddError]=useState("");
  const [shake,setShake]=useState(false);
  const [recurSuggest,setRecurSuggest]=useState(false);
  const recentLocs=[...new Set((events||[]).map(function(e){return e.location;}).filter(Boolean))].slice(0,4);
  const s=f=>v=>setEv(p=>({...p,[f]:v}));
  const submit=()=>{
    if(!ev.title.trim()||!ev.date){setShake(true);setTimeout(()=>setShake(false),400);return;}
    if(ev.endTime&&ev.time&&ev.endTime<=ev.time){setAddError("The end time needs to come after the start — tap to adjust.");return;}
    if(ev.recurring&&ev.recurEnd&&ev.recurEnd<ev.date){setAddError("The repeat window needs to start after the first event date.");return;}
    const m=members.find(x=>x.id===ev.memberId)||members[0];
    const base={...ev,color:m.color,recurGroupId:genId()};
    (ev.recurring?makeRecurring(base):[{...base,id:genId()}]).forEach(e=>onAdd(e));
    onClose();
  };
  const addPack=()=>{if(!ev._pack.trim())return;setEv(p=>({...p,packingList:[...(p.packingList||[]),p._pack.trim()],_pack:""}));};

  // Venue suggestions — common family activity locations
  const VENUE_TYPES=[
    {icon:"⚽",label:"Soccer Field",keywords:["soccer","football","field","park"]},
    {icon:"🏊",label:"Swimming Pool",keywords:["pool","swim","aquatic","leisure"]},
    {icon:"🎵",label:"Music Studio",keywords:["music","piano","guitar","violin","studio","academy"]},
    {icon:"🩰",label:"Dance Studio",keywords:["dance","ballet","studio"]},
    {icon:"🏥",label:"Doctor / Clinic",keywords:["doctor","clinic","dentist","hospital","medical"]},
    {icon:"🏫",label:"School",keywords:["school","elementary","high school","middle"]},
    {icon:"🛒",label:"Grocery Store",keywords:["grocery","supermarket","store","walmart","costco"]},
    {icon:"🎭",label:"Community Centre",keywords:["community","centre","center","hall","rec"]},
    {icon:"🏟️",label:"Arena / Gym",keywords:["arena","gym","rink","court","complex","sportsplex"]},
    {icon:"🌳",label:"Park / Playground",keywords:["park","playground","trail","nature"]},
  ];

  const getSuggestions=()=>{
    const q=locQuery.toLowerCase().trim();
    if(!q){
      var rec=recentLocs.map(function(l){return{icon:"\u{1F550}",label:l,isRecent:true,keywords:[]};});
      return [...rec,...VENUE_TYPES.slice(0,4)];
    }
    return VENUE_TYPES.filter(v=>
      v.label.toLowerCase().includes(q)||
      v.keywords.some(k=>k.includes(q)||q.includes(k))
    ).slice(0,5);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:500,display:"flex",alignItems:"flex-start"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet-top" style={{borderRadius:"0 0 24px 24px",padding:"env(safe-area-inset-top,20px) 20px 32px",width:"100%",maxHeight:"92vh",overflowY:"auto",background:"var(--ink2)",marginTop:0}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:18,fontWeight:800}}>New Event</h2>
          <Btn v="icon" onClick={onClose}><X size={18}/></Btn>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <input placeholder="What's happening?" value={ev.title} maxLength={80} onChange={e=>{var v=e.target.value.slice(0,80);s("title")(v);var lo=v.toLowerCase();setRecurSuggest(!ev.recurring&&recurringKeywords.some(function(k){return lo.includes(k);}));if(v&&!ev.endTime&&ev.time){var dur=smartDuration(v);if(dur)setEv(function(p){return{...p,endTime:addMinutes(p.time,dur)};});}}} style={{fontSize:16,fontWeight:600}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {members.map(m=>(
              <button key={m.id} onClick={()=>s("memberId")(m.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,background:ev.memberId===m.id?m.color+"22":"var(--ink4)",color:ev.memberId===m.id?m.color:"var(--cream3)",border:"1.5px solid "+(ev.memberId===m.id?m.color+"99":"var(--border2)"),fontWeight:600,fontSize:15,border:"none"}}>
                <span>{m.emoji}</span>{m.name}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:5}}>DATE *</label><input type="date" value={ev.date} onChange={e=>s("date")(e.target.value)}/></div>
            <div><label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:5}}>START TIME</label><input type="time" value={ev.time} onChange={e=>s("time")(e.target.value)}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:5}}>END TIME <span style={{fontWeight:400}}>(optional)</span></label><input type="time" value={ev.endTime||""} onChange={e=>s("endTime")(e.target.value)}/></div>
          </div>

          {/* Location with autocomplete */}
          <div style={{position:"relative"}}>
            <label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:5}}>LOCATION</label>
            <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--ink3)",borderRadius:12,padding:"10px 14px",border:"1.5px solid "+(showLocDrop?"var(--sage)":"var(--border2)"),transition:"border-color .15s"}}>
              <MapPin size={15} color={showLocDrop?"var(--sage)":"#9CA3AF"}/>
              <input
                placeholder="Search or type location…"
                value={locQuery||ev.location}
                onChange={e=>{
                  setLocQuery(e.target.value);
                  s("location")(e.target.value);
                  setShowLocDrop(e.target.value.length>0);
                }}
                onFocus={()=>setShowLocDrop(true)}
                onBlur={()=>setTimeout(()=>setShowLocDrop(false),150)}
                style={{background:"transparent",border:"none",padding:0,fontSize:15,flex:1}}
              />
              {ev.location&&<button onClick={()=>{s("location")("");setLocQuery("");}} style={{background:"none",border:"none",color:"var(--muted)",display:"flex",padding:2,flexShrink:0}}><X size={13}/></button>}
            </div>
            {showLocDrop&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:12,boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:50,overflow:"hidden",marginTop:4}}>
                {/* Venue type suggestions */}
                {getSuggestions().map((v,i)=>(
                  <div key={i} onClick={()=>{s("location")(v.label);setLocQuery("");setShowLocDrop(false);}}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",borderBottom:i<getSuggestions().length-1?"1px solid #F3F4F6":"none"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--ink3)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    <span style={{fontSize:20,flexShrink:0}}>{v.icon}</span>
                    <div>
                      <p style={{fontSize:15,fontWeight:600,color:"var(--cream)"}}>{v.label}</p>
                      <p style={{fontSize:15,color:"var(--muted)"}}>{v.keywords.slice(0,3).join(", ")}</p>
                    </div>
                    <MapPin size={13} color="#D1D5DB" style={{marginLeft:"auto",flexShrink:0}}/>
                  </div>
                ))}
                {/* Use typed text as-is */}
                {locQuery.trim()&&(
                  <div onClick={()=>{s("location")(locQuery.trim());setShowLocDrop(false);}}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",background:"rgba(46,107,94,.1)",borderTop:"1px solid var(--border2)"}}
                  >
                    <Check size={15} color="var(--sage2)" style={{flexShrink:0}}/>
                    <p style={{fontSize:15,fontWeight:600,color:"var(--sage2)"}}>Use "{locQuery.trim()}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {recurSuggest&&(
            <div className="fu" style={{background:"rgba(67,143,126,.1)",border:"1px solid rgba(67,143,126,.3)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18,flexShrink:0}}>🔄</span>
              <div style={{flex:1}}>
                <p style={{fontSize:14,fontWeight:600,color:"var(--sage3)",marginBottom:1}}>Looks like a regular event</p>
                <p style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>Set as weekly recurring?</p>
              </div>
              <button onClick={function(){s("recurring")(true);setRecurSuggest(false);}} style={{background:"var(--sage)",color:"var(--cream)",borderRadius:8,padding:"7px 12px",fontSize:13,fontWeight:700,border:"none",flexShrink:0}}>Weekly ✓</button>
              <button onClick={function(){setRecurSuggest(false);}} style={{background:"transparent",color:"var(--cream3)",border:"none",fontSize:18,lineHeight:1,padding:"2px 6px"}}>×</button>
            </div>
          )}
          <Card style={{background:"var(--ink3)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Repeat size={15} color="#6B7280"/>
                <div><p style={{fontWeight:600,fontSize:15}}>Recurring</p><p style={{fontSize:15,color:"var(--muted)"}}>Repeat automatically</p></div>
              </div>
              <Toggle on={ev.recurring} onChange={()=>s("recurring")(!ev.recurring)}/>
            </div>
            {ev.recurring&&(
              <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["daily","weekly","biweekly","monthly"].map(f=>(
                    <button key={f} onClick={()=>s("recurFreq")(f)} style={{padding:"6px 14px",borderRadius:99,background:ev.recurFreq===f?"var(--sage)":"var(--ink4)",color:ev.recurFreq===f?"var(--cream)":"var(--cream3)",fontSize:15,fontWeight:600,border:"1.5px solid",borderColor:ev.recurFreq===f?"var(--sage2)":"var(--border2)",textTransform:"capitalize"}}>{f}</button>
                  ))}
                </div>
                <div><label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:5}}>UNTIL</label><input type="date" value={ev.recurEnd} onChange={e=>s("recurEnd")(e.target.value)}/></div>
                <p style={{fontSize:15,color:"var(--sage2)",fontWeight:600}}>Creates ~{recurCount(ev.recurFreq,ev.date,ev.recurEnd)} events</p>
              </div>
            )}
          </Card>
          <textarea rows={2} placeholder="Notes (optional)" value={ev.notes} onChange={e=>s("notes")(e.target.value)} style={{resize:"none",fontSize:15}}/>
          <Card style={{background:"var(--ink3)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:ev.packingList&&ev.packingList.length?12:0}}>
              <Package size={15} color="#6B7280"/><p style={{fontWeight:600,fontSize:15}}>Packing List</p>
              <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
                {[["⚽","cleats,water bottle,jersey,shin guards"],["🎵","instrument,sheet music,lesson book"]].map(([ico,items])=>(
                  <button key={ico} onClick={()=>{const ex=ev.packingList||[];const add=items.split(",").filter(i=>!ex.includes(i));setEv(p=>({...p,packingList:[...ex,...add]}));}} style={{background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:99,padding:"3px 10px",fontSize:15,fontWeight:500}}>{ico}</button>
                ))}
              </div>
            </div>
            {ev.packingList&&ev.packingList.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {ev.packingList.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:99,padding:"4px 10px 4px 12px"}}>
                    <span style={{fontSize:15}}>{item}</span>
                    <button onClick={()=>setEv(p=>({...p,packingList:p.packingList.filter((_,j)=>j!==i)}))} style={{background:"none",color:"var(--muted)",display:"flex",padding:2}}><X size={11}/></button>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <input placeholder="What's needed?" value={ev._pack} onChange={e=>s("_pack")(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPack()} style={{fontSize:15}}/>
              <button onClick={addPack} style={{background:"var(--sage)",color:"var(--cream)",borderRadius:8,padding:"0 14px",fontWeight:700,fontSize:18,flexShrink:0}}>+</button>
            </div>
          </Card>
          <div style={{display:"flex",gap:10}}>
            <div style={{position:"relative",flex:1}}>
              <DollarSign size={13} color="#9CA3AF" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
              <input placeholder="Monthly cost ($)" type="number" value={ev.cost} onChange={e=>s("cost")(e.target.value)} style={{paddingLeft:32}}/>
            </div>
            <select value={ev.costType} onChange={e=>s("costType")(e.target.value)} style={{width:"auto",minWidth:110,fontSize:15}}>
              <option value="one-time">one-time</option><option value="monthly">/ month</option><option value="session">/ session</option><option value="season">/ season</option>
            </select>
          </div>
          {addError&&<div style={{background:"rgba(196,90,90,.1)",border:"1px solid rgba(196,90,90,.25)",borderRadius:12,padding:"10px 14px",marginBottom:8,fontSize:14,color:"var(--rose)",lineHeight:1.6}}>{addError}</div>}
        <Btn onClick={submit} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
            {ev.recurring?<><Repeat size={15}/>Add Recurring</>:<><Check size={15}/>Add to Calendar</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── Voice Sheet ───────────────────────────────────────────────────────── */
function VoiceSheet({members,onAdd,onClose}) {
  const [stage,setStage]=useState("ready"),[transcript,setTranscript]=useState(""),[parsed,setParsed]=useState(null);
  const rec=useRef(null);

  const parse=text=>{
    const lo=text.toLowerCase(),now=new Date();
    const MN=["january","february","march","april","may","june","july","august","september","october","november","december"];
    const WD=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const tt=function(raw){if(!raw)return"";var m=raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);if(!m)return"";var h=parseInt(m[1]);var mn=m[2]||"00";if(m[3].toLowerCase()==="pm"&&h<12)h+=12;if(m[3].toLowerCase()==="am"&&h===12)h=0;return String(h).padStart(2,"0")+":"+mn;};
    var time="",date="",recurring=false,recurEnd="",recurFreq="weekly";
    var dateWarning="",memberWarning="",multiDays=[];

    // Time extraction
    var tm=lo.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if(tm)time=tt(tm[0]);
    if(!time&&lo.includes("noon"))time="12:00";

    // Recurring end date
    var till=lo.match(/(?:till|until|through)\s+([a-z]+)\s+(\d{1,2})/);
    if(till){var mi=MN.indexOf(till[1]);if(mi!==-1){var td=new Date(now.getFullYear(),mi,parseInt(till[2]));if(td<now)td.setFullYear(now.getFullYear()+1);recurEnd=td.toISOString().split("T")[0];recurring=true;}}

    // B-03: Collect ALL matched weekdays
    var allDays=WD.map(function(w,i){return lo.includes(w)?i:-1;}).filter(function(i){return i!==-1;});
    if(allDays.length>1)multiDays=allDays;
    var di=allDays.length>0?allDays[0]:-1;
    if(di!==-1){var wd=new Date(now);wd.setDate(wd.getDate()+(di-wd.getDay()+7)%7||7);date=wd.toISOString().split("T")[0];}

    // Specific date
    var dm=lo.match(/(?:on\s+)?([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?!\s*(am|pm))/);
    if(dm&&di===-1){
      var mi2=MN.indexOf(dm[1]);
      if(mi2!==-1){
        var day=parseInt(dm[2]);
        var sd=new Date(now.getFullYear(),mi2,day);
        // B-02: detect invalid date rollover (e.g. Feb 30)
        if(sd.getMonth()!==mi2){
          dateWarning="That date doesn't exist (e.g. Feb 30). Please set the date manually.";
          date=todayStr;
        } else {
          if(sd<now)sd.setFullYear(now.getFullYear()+1);
          date=sd.toISOString().split("T")[0];
        }
      }
    }
    if(!date){if(lo.includes("today"))date=todayStr;else if(lo.includes("tomorrow"))date=addDays(todayStr,1);else date=todayStr;}
    if(recurring&&!recurEnd)recurEnd=addDays(date,84);

    // Member matching
    var memberId=members[0]&&members[0].id||"";
    var nameMatched=false;
    for(var mi3=0;mi3<members.length;mi3++){
      if(lo.includes(members[mi3].name.toLowerCase())){memberId=members[mi3].id;nameMatched=true;break;}
    }
    var km=lo.match(/kid\s*(\d)/i);
    if(km){var ki=parseInt(km[1])-1;var kids=members.filter(function(m){return["👧","👦","🧒"].includes(m.emoji);});if(kids[ki]){memberId=kids[ki].id;nameMatched=true;}}

    // B-01: Detect unknown name in speech
    if(!nameMatched){
      var nameMatch=text.match(/\b([A-Z][a-z]{2,})\b/);
      var skipWords=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","January","February","March","April","May","June","July","August","September","October","November","December","Today","Tomorrow","Every","Event","Add","Set","Has","Have","The","And","For","With"];
      if(nameMatch&&skipWords.indexOf(nameMatch[1])===-1){
        var fallback=(members.find(function(m){return m.id===memberId;})||{name:"first member"}).name;
        memberWarning="Could not find "+nameMatch[1]+" in your family. Assigned to "+fallback+" — please reassign if needed.";
      }
    }

    var title=text
      .replace(/(?:kid\s*\d+|my\s+(?:son|daughter|kid|child))/gi,"")
      .replace(/(?:till|until|through)\s+\w+\s+\d+/gi,"")
      .replace(/(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,"")
      .replace(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+(?:st|nd|rd|th)?/gi,"")
      .replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi,"")
      .replace(/(?:at|on|has|have|is|add|set|create|schedule)\s*/gi," ")
      .replace(/\s+/g," ").trim();
    title=title.charAt(0).toUpperCase()+title.slice(1).replace(/[.,!?]+$/,"").trim();
    var mem=members.find(function(x){return x.id===memberId;})||members[0];
    return {title:title||"New Event",date:date,time:time,memberId:memberId,location:"",color:mem&&mem.color||"#111",recurring:recurring,recurFreq:recurFreq,recurEnd:recurEnd,notes:"",packingList:[],cost:"",costType:"one-time",dateWarning:dateWarning,memberWarning:memberWarning,multiDays:multiDays};
  };


  const start=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setStage("nosupport");return;}
    setTranscript("");setStage("listening");
    const r=new SR();r.continuous=false;r.interimResults=true;r.lang="en-US";rec.current=r;
    r.onresult=e=>{const t=Array.from(e.results).map(x=>x[0].transcript).join("");setTranscript(t);r._last=t;};
    r.addEventListener("end",()=>{const f=r._last||"";if(!f.trim()){setStage("error");return;}setStage("processing");setTimeout(()=>{setParsed(parse(f));setStage("preview");},600);});
    r.onerror=()=>setStage("error");r.start();
  };

  const confirm=()=>{
    if(!parsed)return;
    const mem=members.find(x=>x.id===parsed.memberId)||members[0];
    const base={...parsed,color:mem.color,recurGroupId:genId()};
    (parsed.recurring?makeRecurring(base):[{...base,id:genId()}]).forEach(e=>onAdd(e));
    setStage("done");setTimeout(()=>onClose(),1600);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"flex-start"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet-top" style={{borderRadius:"0 0 24px 24px",padding:"env(safe-area-inset-top,20px) 24px 48px",width:"100%",background:"var(--ink2)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 24px"}}/>
        {stage==="ready"&&(
          <div style={{textAlign:"center"}}>
            <div style={{width:68,height:68,background:"var(--sage)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}><Mic size={28} color="#fff"/></div>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:6}}>Voice Add</h2>
            <p style={{color:"var(--cream3)",fontSize:15,marginBottom:18}}>Say the event naturally</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24,textAlign:"left"}}>
              {['"Emma has soccer at 3pm on Wednesday"','"Kid 1 has piano every Thursday till June 25"','"Dentist for Liam on March 20 at 11am"'].map((ex,i)=>(
                <div key={i} style={{background:"var(--ink3)",border:"1px solid var(--border)",borderRadius:12,padding:"10px 14px",fontSize:15,color:"var(--cream2)",fontStyle:"italic"}}>{ex}</div>
              ))}
            </div>
            <Btn onClick={start} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:15}}><Mic size={17}/>Tap to Speak</Btn>
          </div>
        )}
        {stage==="listening"&&(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{position:"relative",width:76,height:76,margin:"0 auto 20px"}}>
              <div style={{position:"absolute",inset:-10,borderRadius:"50%",background:"rgba(37,99,235,.15)",animation:"sonar 1.5s ease-out infinite"}}/>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center"}}><Mic size={26} color="#fff"/></div>
            </div>
            <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>Listening…</p>
            <div style={{background:"var(--ink3)",border:"1px solid var(--border)",borderRadius:12,padding:14,minHeight:50,marginBottom:20}}>
              {transcript?<p style={{fontSize:15,color:"var(--cream2)",fontStyle:"italic",lineHeight:1.6}}>"{transcript}"</p>:<p style={{color:"var(--muted)",fontSize:15}}>Start speaking…</p>}
            </div>
            <Btn v="ghost" onClick={()=>rec.current&&rec.current.stop()} style={{display:"flex",alignItems:"center",gap:8,margin:"0 auto"}}><MicOff size={14}/>Done</Btn>
          </div>
        )}
        {stage==="processing"&&(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:38,height:38,border:"3px solid #E5E7EB",borderTopColor:"#111",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 14px"}}/>
            <p style={{fontWeight:600,fontSize:15}}>Parsing your event…</p>
          </div>
        )}
        {stage==="preview"&&parsed&&(
          <div>
            <p style={{fontWeight:800,fontSize:18,marginBottom:4}}>Does this look right?</p>
            <p style={{color:"var(--cream3)",fontSize:15,marginBottom:18,fontStyle:"italic"}}>"{transcript}"</p>
            {parsed.memberWarning&&(
              <div style={{background:"rgba(176,141,82,.1)",border:"1px solid rgba(176,141,82,.25)",borderRadius:12,padding:"10px 12px",marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
                <AlertTriangle size={14} color="#D97706" style={{flexShrink:0,marginTop:1}}/>
                <p style={{fontSize:15,color:"var(--gold3)",lineHeight:1.6}}>{parsed.memberWarning}</p>
              </div>
            )}
            {parsed.dateWarning&&(
              <div style={{background:"rgba(220,80,80,.08)",border:"1px solid rgba(220,80,80,.2)",borderRadius:12,padding:"10px 12px",marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
                <AlertTriangle size={14} color="#DC2626" style={{flexShrink:0,marginTop:1}}/>
                <p style={{fontSize:15,color:"var(--rose)",lineHeight:1.6}}>{parsed.dateWarning}</p>
              </div>
            )}
            {parsed.multiDays&&parsed.multiDays.length>1&&(
              <div style={{background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)",borderRadius:12,padding:"10px 12px",marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
                <AlertTriangle size={14} color="var(--sage2)" style={{flexShrink:0,marginTop:1}}/>
                <p style={{fontSize:15,color:"var(--sage3)",lineHeight:1.6}}>Multiple days detected. Added the first day. Use Voice Add again for other days.</p>
              </div>
            )}
            <Card style={{marginBottom:18,borderTopWidth:3,borderTopColor:parsed.color}}>
              <input value={parsed.title} onChange={e=>setParsed(p=>({...p,title:e.target.value}))} style={{fontSize:16,fontWeight:700,border:"none",borderBottom:"1px solid var(--border2)",borderRadius:0,padding:"2px 0",marginBottom:14,background:"transparent"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div><label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:4}}>DATE</label><input type="date" value={parsed.date} onChange={e=>setParsed(p=>({...p,date:e.target.value}))} style={{fontSize:15,padding:"8px 10px"}}/></div>
                <div><label style={{fontSize:15,color:"var(--muted)",fontWeight:600,display:"block",marginBottom:4}}>TIME</label><input type="time" value={parsed.time} onChange={e=>setParsed(p=>({...p,time:e.target.value}))} style={{fontSize:15,padding:"8px 10px"}}/></div>
              </div>
              <select value={parsed.memberId} onChange={e=>setParsed(p=>({...p,memberId:e.target.value}))} style={{fontSize:15}}>
                {members.map(m=><option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
              </select>
              {parsed.recurring&&<p style={{fontSize:15,color:"var(--sage3)",fontWeight:600,marginTop:12}}>Recurring {parsed.recurFreq} · {recurCount(parsed.recurFreq,parsed.date,parsed.recurEnd)} events</p>}
            </Card>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" onClick={()=>setStage("ready")} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Retry</Btn>
              <Btn onClick={confirm} style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Check size={15}/>Add to Calendar</Btn>
            </div>
          </div>
        )}
        {stage==="done"&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{width:60,height:60,background:"rgba(83,136,122,.1)",border:"1px solid rgba(83,136,122,.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Check size={26} color="var(--sage2)"/></div>
            <p style={{fontWeight:800,fontSize:18,color:"var(--sage2)"}}>Added!</p>
          </div>
        )}
        {(stage==="error"||stage==="nosupport")&&(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <MicOff size={38} color="#DC2626" style={{margin:"0 auto 14px"}}/>
            <p style={{fontWeight:700,fontSize:16,marginBottom:8}}>{stage==="nosupport"?"Voice not supported":"Didn't catch that"}</p>
            <p style={{color:"var(--cream3)",fontSize:15,marginBottom:22}}>{stage==="nosupport"?"Voice works on Safari (iPhone) or Chrome (Android). On desktop, use Add Event instead.":"Speak clearly with event name, time and date."}</p>
            <Btn onClick={()=>setStage("ready")} style={{margin:"0 auto",display:"flex",alignItems:"center",gap:8}}>Try Again</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Day Sheet ─────────────────────────────────────────────────────────── */
function DaySheet({date,events,members,onClose,onSelect}) {
  const dayEvs=events.filter(function(e){return e.date===date;}).sort(function(a,b){return a.time.localeCompare(b.time);});
  const gm=function(id){return members.find(function(m){return m.id===id;})||{emoji:"👤",color:"var(--muted)",name:"?"};};
  const dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const d=new Date(date+"T12:00:00");
  const label=date===todayStr?"Today":date===addDays(todayStr,1)?"Tomorrow":dayNames[d.getDay()]+", "+MONTHS[d.getMonth()]+" "+d.getDate();
  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",zIndex:500,display:"flex",alignItems:"flex-end"}}>
      <div className="sheet-enter sheet-scroll" style={{borderRadius:"20px 20px 0 0",padding:"8px 20px calc(40px + env(safe-area-inset-bottom,0px))",width:"100%",maxHeight:"80vh",overflowY:"auto",overscrollBehavior:"contain",background:"var(--ink2)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:800,letterSpacing:"-.3px"}}>{label}</h2>
            <p style={{fontSize:15,color:"var(--muted)",marginTop:2}}>{dayEvs.length} event{dayEvs.length!==1?"s":""}</p>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:12,background:"var(--ink4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
        </div>
        {dayEvs.length===0&&(
          <div style={{textAlign:"center",padding:"36px 0"}}>
            <Calendar size={38} color="#D1D5DB" style={{margin:"0 auto 12px"}}/>
            <p style={{color:"var(--muted)",fontWeight:500}}>Nothing scheduled</p>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {dayEvs.map(function(ev){
            const m=gm(ev.memberId);
            return (
              <div key={ev.id} onClick={function(){onClose();setTimeout(function(){onSelect(ev);},120);}}
                style={{background:"var(--ink2)",border:"1px solid var(--border2)",borderLeft:"4px solid "+ev.color,borderRadius:16,padding:"14px 16px",cursor:"pointer"}}
              >
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <div style={{width:34,height:34,borderRadius:12,background:ev.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",borderRadius:12,objectFit:"cover"}} alt=""/>:<span style={{fontSize:16}}>{m.emoji}</span>}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:15}}>{ev.title}</p>
                    <p style={{fontSize:15,color:"var(--muted)",marginTop:1}}>{m.name}</p>
                  </div>
                  <ChevronRight size={16} color="#D1D5DB"/>
                </div>
                <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                  {ev.time&&<div style={{display:"flex",alignItems:"center",gap:5}}><Clock size={12} color="var(--sage)"/><span style={{fontSize:15,fontWeight:600}}>{ev.time}</span></div>}
                  {ev.location&&<div style={{display:"flex",alignItems:"center",gap:5}}><MapPin size={12} color="var(--sage)"/><span style={{fontSize:15,color:"var(--cream3)"}}>{ev.location}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
function DashScreen({events,members,onAdd,onDelete,showBanner,onBannerDismiss,initialSel,onClearSel}) {
  const [anchor,setAnchor]=useState(todayStr);
  const [showAdd,setShowAdd]=useState(false);
  const [showVoice,setShowVoice]=useState(false);
  const [sel,setSel]=useState(null);
  const [map,setMap]=useState(false);
  const [dayView,setDayView]=useState(null);
  const [calView,setCalView]=useState("month");
  useEffect(()=>{if(initialSel){setSel(initialSel);if(onClearSel)onClearSel();}},[]); 
  const week=getWeek(anchor),cfls=conflicts(events);
  const gm=id=>members.find(m=>m.id===id)||{emoji:"👤",color:"var(--muted)"};
  const prev=()=>{const d=new Date(anchor);d.setDate(d.getDate()+(calView==="month"?-28:-7));setAnchor(d.toISOString().split("T")[0]);};
  const next=()=>{const d=new Date(anchor);d.setDate(d.getDate()+(calView==="month"?28:7));setAnchor(d.toISOString().split("T")[0]);};

  const buildMonth=()=>{
    const d=new Date(anchor+"T12:00:00");
    const year=d.getFullYear(),month=d.getMonth();
    const firstDay=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const days=[];
    for(let i=0;i<firstDay;i++) days.push(null);
    for(let i=1;i<=daysInMonth;i++){
      const ds=year+"-"+String(month+1).padStart(2,"0")+"-"+String(i).padStart(2,"0");
      days.push(ds);
    }
    while(days.length%7!==0) days.push(null);
    return days;
  };

  const monthLabel=()=>{
    const d=new Date(anchor+"T12:00:00");
    return MONTHS[d.getMonth()]+" "+d.getFullYear();
  };

  return (
    <div className="screen-enter">
      {/* ── Action buttons — VERY TOP ── */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button onClick={function(){setShowVoice(true);}}
          style={{flex:1,background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:16,padding:"13px 10px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:600,fontSize:15,color:"var(--cream2)"}}>
          <Mic size={18} color="var(--sage3)"/>Voice
        </button>
        <button onClick={function(){setShowAdd(true);}}
          style={{flex:2,background:"linear-gradient(135deg,var(--sage),var(--sage2))",borderRadius:16,padding:"13px 10px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:700,fontSize:15,color:"var(--cream)",boxShadow:"0 4px 20px rgba(46,107,94,.4)"}}>
          <Plus size={18}/>New Event
        </button>
      </div>

      {showBanner&&<ValueBanner onDismiss={onBannerDismiss}/>}
      <Briefing events={events} members={members} onSelect={ev=>setSel(ev)}/>
      <ConflictBanner items={cfls} members={members} onSelect={ev=>setSel(ev)}/>

      {/* ── Calendar header ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={prev} style={{background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:8,padding:"7px 9px",display:"flex",color:"var(--cream2)"}}><ChevronLeft size={15}/></button>
          <span style={{fontSize:16,fontWeight:700,minWidth:120,textAlign:"center",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)"}}>
            {calView==="month"?monthLabel():(fd(week[0])+" – "+fd(week[6]))}
          </span>
          <button onClick={next} style={{background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:8,padding:"7px 9px",display:"flex",color:"var(--cream2)"}}><ChevronRight size={15}/></button>
          <button onClick={()=>setAnchor(todayStr)} style={{background:"none",border:"none",color:"var(--sage3)",fontSize:14,fontWeight:600,padding:"4px 6px"}}>Today</button>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{display:"flex",background:"var(--ink4)",borderRadius:8,padding:2,gap:1}}>
            {[["week","W"],["month","M"]].map(function(pair){
              var v=pair[0],lbl=pair[1];
              return <button key={v} onClick={function(){setCalView(v);}}
                style={{padding:"5px 11px",borderRadius:6,background:calView===v?"var(--ink2)":"transparent",color:calView===v?"var(--cream)":"var(--cream3)",fontWeight:700,fontSize:13,border:"none",boxShadow:calView===v?"0 1px 4px rgba(0,0,0,.3)":"none"}}>{lbl}</button>;
            })}
          </div>
          <button onClick={()=>setMap(m=>!m)}
            style={{background:map?"var(--sage)":"var(--ink3)",border:"1px solid",borderColor:map?"var(--sage2)":"var(--border2)",borderRadius:8,padding:"7px 11px",display:"flex",alignItems:"center",gap:5,color:map?"var(--cream)":"var(--cream2)",fontSize:13,fontWeight:600}}>
            <MapPin size={13}/>Map
          </button>
        </div>
      </div>

      {/* ── Map view — Leaflet + OSM tiles ── */}
      {map?(
        <div style={{marginBottom:16}}>
          {(function(){
            var mapEvs=events.filter(function(e){return e.date===todayStr&&e.location;});
            var openInGoogle=function(loc){window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(loc),"_blank");};
            var openDirections=function(loc){window.open("https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(loc),"_blank");};
            var firstLoc=mapEvs.length?mapEvs[0].location:"Riverside Field, Oakville";
            var leafletHTML=[
              "<!DOCTYPE html><html><head><meta charset='utf-8'/>",
              "<link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/>",
              "<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>",
              "</head><body><div id='map'></div>",
              "<script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'><","\/script>",
              "<script>",
              "var map=L.map('map',{zoomControl:true,attributionControl:false});",
              "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);",
              "fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent('"+firstLoc.replace(/'/g,"\'")+"')+'&format=json&limit=1')",
              ".then(function(r){return r.json();})",
              ".then(function(d){if(d&&d[0]){var lat=parseFloat(d[0].lat),lng=parseFloat(d[0].lon);map.setView([lat,lng],15);L.marker([lat,lng]).addTo(map).bindPopup('"+firstLoc.replace(/'/g,"\'")+"').openPopup();}else{map.setView([43.65,-79.38],13);}}).catch(function(){map.setView([43.65,-79.38],13);});",
              "<","\/script></body></html>"
            ].join("");
            return (
              <div>
                <div style={{borderRadius:16,overflow:"hidden",border:"1px solid var(--border2)",marginBottom:12,position:"relative",height:240}}>
                  <iframe title="Map" width="100%" height="240" style={{display:"block",border:"none"}} srcDoc={leafletHTML}/>
                  <button onClick={function(){openInGoogle(firstLoc);}}
                    style={{position:"absolute",bottom:10,right:10,zIndex:10,background:"rgba(14,15,18,.9)",color:"var(--cream)",borderRadius:8,padding:"7px 13px",fontSize:13,fontWeight:600,border:"1px solid var(--border2)"}}>
                    Open in Google Maps ↗
                  </button>
                </div>
                {mapEvs.length===0?(
                  <div style={{background:"var(--ink2)",borderRadius:16,padding:"24px",textAlign:"center",border:"1px solid var(--border2)"}}>
                    <MapPin size={28} color="var(--cream3)" style={{margin:"0 auto 10px"}}/>
                    <p style={{fontSize:15,color:"var(--cream3)",fontWeight:500}}>No events with locations today</p>
                    <p style={{fontSize:13,color:"var(--muted)",marginTop:4,fontWeight:300}}>Add a location to an event to see it here</p>
                  </div>
                ):(
                  mapEvs.map(function(ev){
                    var m=gm(ev.memberId);
                    return (
                      <div key={ev.id} style={{background:"var(--ink2)",border:"1px solid var(--border2)",borderLeft:"3px solid "+ev.color,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                            <span style={{fontSize:16}}>{m.emoji}</span>
                            <p style={{fontWeight:700,fontSize:15,color:"var(--cream)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</p>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}><MapPin size={12} color="var(--sage3)"/><p style={{fontSize:13,color:"var(--cream3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.location}</p></div>
                          {ev.time&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}><Clock size={12} color="var(--sage3)"/><p style={{fontSize:13,color:"var(--cream3)"}}>{ev.time}</p></div>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                          <button onClick={function(){openDirections(ev.location);}} style={{background:"var(--sage)",color:"var(--cream)",borderRadius:9,padding:"9px 13px",fontSize:13,fontWeight:700,border:"none",display:"flex",alignItems:"center",gap:5}}><MapPin size={13}/>Directions</button>
                          <button onClick={function(){openInGoogle(ev.location);}} style={{background:"var(--ink4)",color:"var(--cream2)",borderRadius:9,padding:"7px 13px",fontSize:12,fontWeight:600,border:"1px solid var(--border2)"}}>Search</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}
        </div>

            /* Month view */
      ):calView==="month"?(
        <div style={{margin:"0 -12px 16px"}}>
          {/* Day headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:2,padding:"0 8px"}}>
            {["S","M","T","W","T","F","S"].map(function(d,i){
              return <p key={i} style={{fontSize:10,fontWeight:700,color:"var(--cream3)",textAlign:"center",padding:"4px 0",letterSpacing:".02em"}}>{d}</p>;
            })}
          </div>
          {/* Calendar grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px"}}>
            {buildMonth().map(function(date,idx){
              var dayEvs=date?events.filter(function(e){return e.date===date;}):[],
                  isT=date===todayStr,
                  d=date?new Date(date+"T12:00:00"):null,
                  isWeekend=d&&(d.getDay()===0||d.getDay()===6);
              return (
                <div key={date||"b"+idx}
                  onClick={date?function(){setDayView(date);}:undefined}
                  style={{
                    height:54,
                    borderRadius:8,
                    padding:"4px 2px",
                    margin:"1px",
                    cursor:date?"pointer":"default",
                    background:!date?"transparent":isT?"var(--sage)":"var(--ink3)",
                    border:date?"1px solid":"1px solid transparent",
                    borderColor:isT?"var(--sage2)":"var(--border)",
                    animation:isT?"todayGlow 3s ease-in-out infinite":"",
                    overflow:"hidden",
                    boxSizing:"border-box",
                  }}>
                  {date&&(
                    <>
                      <p style={{fontSize:11,fontWeight:isT?700:400,color:isT?"#fff":isWeekend?"var(--cream3)":"var(--cream2)",textAlign:"center",lineHeight:1.2,marginBottom:2}}>{d.getDate()}</p>
                      <div style={{display:"flex",flexDirection:"column",gap:1}}>
                        {dayEvs.slice(0,1).map(function(ev){return(
                          <div key={ev.id} onClick={function(e){e.stopPropagation();setSel(ev);}}
                            style={{background:ev.color,borderRadius:2,padding:"1px 3px",overflow:"hidden"}}>
                            <p style={{fontSize:8,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.4}}>{ev.title}</p>
                          </div>
                        );})}
                        {dayEvs.length>1&&(
                          <div style={{display:"flex",gap:1,justifyContent:"center",marginTop:1}}>
                            {dayEvs.slice(1).map(function(e){return(
                              <div key={e.id} style={{width:4,height:4,borderRadius:"50%",background:e.color,flexShrink:0}}/>
                            );})}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {/* Member legend */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8,padding:"8px 16px",background:"var(--ink3)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
            {members.map(function(m){return(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:m.color,flexShrink:0}}/>
                <span style={{fontSize:11,color:"var(--cream3)",fontWeight:500}}>{m.name}</span>
              </div>
            );})}
          </div>
        </div>

      /* Week view */
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
          {week.map(function(date,i){
            var dayEvs=events.filter(function(e){return e.date===date;}),isT=date===todayStr;
            return (
              <div key={date} style={{background:isT?"var(--sage)":"var(--ink3)",border:"1px solid",borderColor:isT?"var(--sage2)":"var(--border)",borderRadius:12,padding:"8px 5px",minHeight:96}}>
                <p style={{fontSize:10,fontWeight:700,color:isT?"rgba(255,255,255,.6)":"var(--cream3)",textTransform:"uppercase",textAlign:"center",marginBottom:2,letterSpacing:".04em"}}>{WDAYS[i]}</p>
                <p onClick={function(){setDayView(date);}} style={{fontSize:15,fontWeight:800,color:"var(--cream)",textAlign:"center",marginBottom:5,cursor:"pointer"}}>{new Date(date).getDate()}</p>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  {dayEvs.slice(0,3).map(function(ev){return(
                    <div key={ev.id} onClick={function(){setSel(ev);}} style={{background:ev.color+"cc",borderRadius:4,padding:"2px 4px",cursor:"pointer"}}>
                      <p style={{fontSize:11,fontWeight:700,color:"#fff",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</p>
                    </div>
                  );})}
                  {dayEvs.length>3&&<p style={{fontSize:11,color:isT?"rgba(255,255,255,.5)":"var(--cream3)",textAlign:"center"}}>+{dayEvs.length-3}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd&&<AddSheet members={members} events={events} onAdd={function(ev){onAdd(ev);setShowAdd(false);}} onClose={function(){setShowAdd(false);}}/>}
      {showVoice&&<VoiceSheet members={members} onAdd={function(ev){onAdd(ev);}} onClose={function(){setShowVoice(false);}}/>}
      {sel&&<EventSheet ev={sel} members={members} onClose={function(){setSel(null);}} onDelete={function(id){onDelete(id);setSel(null);}}/>}
      {dayView&&<DaySheet date={dayView} events={events} members={members} onClose={function(){setDayView(null);}} onSelect={function(ev){setSel(ev);}}/>}
    </div>
  );
}


/* ─── Inbox ─────────────────────────────────────────────────────────────── */
function InboxScreen({members,onAdd}) {
  const [tab,setTab]=useState("email");
  const [text,setText]=useState("");
  const [stage,setStage]=useState("idle");
  const [extracted,setExtracted]=useState([]);
  const [checked,setChecked]=useState(new Set());
  const [deleteProgress,setDeleteProgress]=useState(0);
  const [instructor,setInstructor]=useState(null); // {name, group, type, isUpdate, isCancelled}
  const [log,setLog]=useState([
    {id:"l1",subject:"Spring Soccer Schedule — Coach Mike",date:addDays(todayStr,-3),count:4,instructor:true},
    {id:"l2",subject:"Piano lesson rescheduled — Ms. Sarah",date:addDays(todayStr,-7),count:1,instructor:true},
  ]);

  // ── Instructor detection ──────────────────────────────────────────────────
  function detectInstructor(txt){
    const lo=txt.toLowerCase();

    // Instructor title patterns
    const titlePatterns=[
      /(?:coach|instructor|teacher|tutor|trainer|director|coordinator)\s+([A-Z][a-z]+)/,
      /(?:regards|sincerely|cheers|thanks)[,\s]+(?:coach|instructor|teacher|mr|mrs|ms|miss|dr)\.?\s*([A-Z][a-z]+)/i,
      /[-–]\s*(?:coach|instructor|teacher|mr|mrs|ms|miss|dr)\.?\s*([A-Z][a-z]+)/i,
      /(?:from|sent by)[:\s]+(?:coach|instructor|teacher)\s+([A-Z][a-z]+)/i,
    ];
    let instructorName="";
    for(var i=0;i<titlePatterns.length;i++){
      var m=txt.match(titlePatterns[i]);
      if(m&&m[1]){instructorName=m[1];break;}
    }
    // Also try sign-off: last line with a capitalised name
    if(!instructorName){
      var lines=txt.trim().split("\n").filter(function(l){return l.trim().length>0;});
      var lastLines=lines.slice(-4);
      for(var j=lastLines.length-1;j>=0;j--){
        var ll=lastLines[j].trim();
        if(/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(ll)||/^(?:Coach|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][a-z]+/.test(ll)){
          instructorName=ll.replace(/^(?:Coach|Mr|Mrs|Ms|Miss|Dr)\.?\s+/i,"");
          break;
        }
      }
    }

    // Group/team/class detection
    const groupPatterns=[
      /(?:team|group|class|squad|club|division|band|ensemble|studio|academy)[:\s]+([A-Z][\w\s]{2,30}?)(?:\n|,|\.)/i,
      /([A-Z][\w\s]{2,20}?(?:soccer|football|hockey|swimming|dance|piano|violin|gymnastics|baseball|basketball|tennis|martial arts|karate|ballet)[\w\s]{0,15}?)(?:\n|,|team|class)/i,
      /(?:u\d{1,2}|under[\s-]\d{1,2})\s+([A-Za-z\s]{2,20})/i,
    ];
    var groupName="";
    for(var gi=0;gi<groupPatterns.length;gi++){
      var gm=txt.match(groupPatterns[gi]);
      if(gm&&gm[1]){groupName=gm[1].trim();break;}
    }
    // Subject line often has group name
    var subMatch=txt.match(/subject[:\s]+([^\n]+)/i);
    var subjectLine=subMatch?subMatch[1].trim():"";

    // Activity type
    const activityTypes=["soccer","football","hockey","swimming","dance","piano","violin","guitar","gymnastics","baseball","basketball","tennis","karate","martial arts","ballet","volleyball","lacrosse","rugby","cricket","chess","coding","art","drama","theatre"];
    var activityType="";
    for(var ai=0;ai<activityTypes.length;ai++){
      if(lo.includes(activityTypes[ai])){activityType=activityTypes[ai];break;}
    }

    // Update/cancellation detection
    const cancelWords=["cancelled","canceled","called off","no practice","no session","no class","no lesson","won't be","will not be held","postponed"];
    const rescheduleWords=["rescheduled","moved to","new time","time change","location change","new location","changed to","now at","starting at","instead of"];
    const updateWords=["reminder","update","change","notice","important","please note","heads up","just a note","wanted to let you know"];
    var isCancelled=cancelWords.some(function(w){return lo.includes(w);});
    var isReschedule=rescheduleWords.some(function(w){return lo.includes(w);});
    var isUpdate=isCancelled||isReschedule||updateWords.some(function(w){return lo.includes(w);});

    // Is this from an instructor? Need at least a name or clear instructor language
    var instructorKeywords=["coach","instructor","teacher","tutor","trainer","studio","academy","club","practice","session","class","lesson","drill","tryout","training"];
    var hasInstructorContext=instructorKeywords.some(function(k){return lo.includes(k);});

    if(!instructorName&&!hasInstructorContext) return null;

    return {
      name: instructorName||"Your instructor",
      group: groupName||(activityType?activityType.charAt(0).toUpperCase()+activityType.slice(1)+" Group":""),
      subject: subjectLine,
      activityType: activityType,
      isCancelled: isCancelled,
      isReschedule: isReschedule,
      isUpdate: isUpdate,
    };
  }

  // ── Location extractor ────────────────────────────────────────────────────
  function extractEmailLocation(ctx){
    // Pattern 1: explicit "Location:" or "Venue:" or "Address:" label
    var labelMatch=ctx.match(/(?:location|venue|address|place|held at|held @|located at)\s*[:\-]?\s*([A-Za-z0-9][^\n,]{3,60}?)(?:[,\n]|$)/i);
    if(labelMatch){
      var lm=labelMatch[1].trim();
      if(lm.length>3&&lm.length<65) return lm;
    }

    // Pattern 2: "at <Title Case Venue Name>" — handles multi-word names
    // Run on lowercase ctx for case-insensitive "at", but capture original case
    var atMatches=[];
    var atRe=/\bat\s+([A-Za-z][A-Za-z0-9' ]{2,50}?)(?=\s*[.,\n!?]|\s+on\b|\s+from\b|\s+at\b|$)/gi;
    var atM;
    while((atM=atRe.exec(ctx))!==null){
      var cand=atM[1].trim();
      // Must contain a venue-like word OR be Title Case
      var venueWords2=["field","park","arena","centre","center","school","hall","court","pool","studio","gym","complex","rink","church","ground","facility","track","dome","stadium","pavilion","rec","rec centre","community","ymca","ice","sport","diamond","pitch","oval","square","road","rd","ave","street","st","drive","dr","blvd","way"];
      var lo2=cand.toLowerCase();
      var hasVenueWord=venueWords2.some(function(vw){return lo2.includes(vw);});
      var isTitleCase=/^[A-Z]/.test(cand);
      var isAddress=/\d/.test(cand);
      if((hasVenueWord||isTitleCase||isAddress)&&cand.length>3&&cand.length<55){
        atMatches.push(cand);
      }
    }
    if(atMatches.length) return atMatches[0];

    // Pattern 3: venue word preceded by 1-4 Title Case words
    var venueWordsMain=["Field","Park","Arena","Centre","Center","School","Hall","Court","Pool","Studio","Gym","Complex","Sportsplex","Rink","Church","Grounds","Facility","Stadium","Track","Diamond","Dome","Pitch","Pavilion","Rec","YMCA","Community"];
    for(var i=0;i<venueWordsMain.length;i++){
      var vw=venueWordsMain[i];
      // Case-insensitive search
      var vi=ctx.toLowerCase().indexOf(vw.toLowerCase());
      if(vi>0){
        // Take up to 5 words before the venue word in the same line
        var lineStart=ctx.lastIndexOf("\n",vi)+1;
        var segment=ctx.slice(lineStart,vi+vw.length);
        // Split on common sentence boundaries to get just the venue name portion
        var words=segment.replace(/[.,!?;:]/g," ").trim().split(/\s+/);
        // Find the venue word in words array and take up to 4 words before it + venue word
        var vIdx=words.map(function(w){return w.toLowerCase();}).lastIndexOf(vw.toLowerCase());
        if(vIdx>=0){
          var start=Math.max(0,vIdx-4);
          var result=words.slice(start,vIdx+1).filter(function(w){return w.length>0;}).join(" ");
          if(result.length>3) return result;
        }
      }
    }

    // Pattern 4: street address with number
    var addrMatch=ctx.match(/\b(\d{1,5}\s+[A-Za-z][A-Za-z0-9 ]{3,40}(?:Road|Rd|Street|St|Avenue|Ave|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct)\.?)/i);
    if(addrMatch) return addrMatch[1].trim();

    return "";
  }

  // ── Smart email parser ────────────────────────────────────────────────────
  const analyze=()=>{
    if(!text.trim()) return;
    setStage("analyzing");
    setTimeout(()=>{
      const lo=text.toLowerCase();
      const MN=["january","february","march","april","may","june","july","august","september","october","november","december"];
      const WD=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
      const now=new Date(); const evs=[];
      const tt=function(raw){if(!raw)return"";var m=raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);if(!m)return"";var h=parseInt(m[1]);var mn=m[2]||"00";if(m[3].toLowerCase()==="pm"&&h<12)h+=12;if(m[3].toLowerCase()==="am"&&h===12)h=0;return String(h).padStart(2,"0")+":"+mn;};

      // Detect instructor context first
      var inst=detectInstructor(text);
      setInstructor(inst);

      // Deadline keywords
      const deadlineKeywords=["deadline","last day","last date","register by","registration closes","sign up by","due by","due date","enroll by","cutoff"];
      var isDeadline=deadlineKeywords.some(function(k){return lo.includes(k);});

      // Subject line
      var subjectMatch=text.match(/subject[:\s]+([^\n]+)/i);
      var subjectLine=subjectMatch?subjectMatch[1].trim():"";

      // Topic
      var topicMatch=lo.match(/(?:for\s+)([\w\s]+?training|[\w\s]+?camp|[\w\s]+?league|[\w\s]+?program|[\w\s]+?session|[\w\s]+?registration|[\w\s]+?tryout|[\w\s]+?tournament)/i);
      var topic=topicMatch?topicMatch[1].trim():"";

      // Build base title prefix from instructor context
      var titlePrefix="";
      if(inst){
        if(inst.activityType) titlePrefix=inst.activityType.charAt(0).toUpperCase()+inst.activityType.slice(1);
        else if(inst.group) titlePrefix=inst.group;
        if(inst.name&&inst.name!=="Your instructor") titlePrefix+=(titlePrefix?" — ":"")+"Coach "+inst.name.split(" ")[0];
      }

      // Suggest member based on child name mention
      function suggestMember(ctx2){
        for(var mi=0;mi<members.length;mi++){
          if(ctx2.toLowerCase().includes(members[mi].name.toLowerCase())) return members[mi].id;
        }
        return members[0]&&members[0].id||"";
      }

      // Cancellation — create a special cancelled event
      if(inst&&inst.isCancelled){
        // Find what date is cancelled
        var cancelDateMatch=text.match(/([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/);
        var cancelDayMatch=lo.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
        var cancelDate="";
        if(cancelDateMatch){
          var cm=cancelDateMatch[1].match(/([a-z]+)\s+(\d{1,2})/i);
          if(cm){var cmi=MN.indexOf(cm[1].toLowerCase());if(cmi!==-1){var cd2=new Date(now.getFullYear(),cmi,parseInt(cm[2]));if(cd2<now)cd2.setFullYear(now.getFullYear()+1);cancelDate=cd2.toISOString().split("T")[0];}}
        } else if(cancelDayMatch){
          var cdi=WD.indexOf(cancelDayMatch[1]);
          var cd3=new Date(now);cd3.setDate(cd3.getDate()+(cdi-cd3.getDay()+7)%7||7);
          cancelDate=cd3.toISOString().split("T")[0];
        }
        evs.push({id:genId(),title:(titlePrefix||"Session")+" — CANCELLED",date:cancelDate,time:"",location:"",memberId:suggestMember(text),confidence:cancelDate?"high":"medium",notes:"This session has been cancelled by "+inst.name+". No action needed — just a heads up.",isCancelled:true});
      } else {
        // Recurring events
        var rp=/every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi; var rm2;
        while((rm2=rp.exec(lo))!==null){
          var rdi=WD.indexOf(rm2[1]);
          var rctx=text.slice(Math.max(0,rm2.index-200),Math.min(text.length,rm2.index+300));
          var rtm=rctx.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
          var rloc=extractEmailLocation(rctx)||extractEmailLocation(text);
          var rtitle=titlePrefix||(topic?topic.charAt(0).toUpperCase()+topic.slice(1):rm2[1].charAt(0).toUpperCase()+rm2[1].slice(1)+" Session");
          if(inst&&inst.isReschedule) rtitle+=" (Rescheduled)";
          for(var w=0;w<4;w++){
            var rd=new Date(now);rd.setDate(rd.getDate()+(rdi-rd.getDay()+7)%7+w*7||7+w*7);
            evs.push({id:genId(),title:rtitle,date:rd.toISOString().split("T")[0],time:tt(rtm&&rtm[1]||""),location:rloc,memberId:suggestMember(text),confidence:rtm?"high":"medium",notes:""});
          }
        }

        // Specific dates
        var dp=/([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/g; var dm;
        while((dm=dp.exec(text))!==null){
          var m1=dm[1].match(/([a-z]+)\s+(\d{1,2})/i); if(!m1) continue;
          var mi2=MN.indexOf(m1[1].toLowerCase()); if(mi2===-1) continue;
          var d=new Date(now.getFullYear(),mi2,parseInt(m1[2]));
          if(d.getMonth()!==mi2) continue;
          if(d<now) d.setFullYear(now.getFullYear()+1);
          var ds=d.toISOString().split("T")[0];
          if(evs.some(function(e){return e.date===ds;})) continue;
          var ctx=text.slice(Math.max(0,dm.index-200),Math.min(text.length,dm.index+300));
          var dtm=ctx.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
          var dloc=extractEmailLocation(ctx)||extractEmailLocation(text);
          var dtitle="";var dnotes="";
          if(isDeadline){
            dtitle=(titlePrefix?"Deadline: "+titlePrefix:"Deadline: "+(topic||subjectLine||"Registration"));
            dnotes="Last date to register. Complete before this date.";
          } else if(inst){
            dtitle=titlePrefix||(topic?topic.charAt(0).toUpperCase()+topic.slice(1):subjectLine||"Event");
            if(inst.isReschedule) dtitle+=" (Rescheduled)";
            dnotes=inst.isReschedule?"Time or location has changed — please review details.":"";
          } else {
            dtitle=topic?topic.charAt(0).toUpperCase()+topic.slice(1):subjectLine||"Event on "+dm[1];
          }
          evs.push({id:genId(),title:dtitle,date:ds,time:tt(dtm&&dtm[1]||""),location:dloc,memberId:suggestMember(text),confidence:ds&&dtm?"high":"medium",notes:dnotes});
        }
      }

      if(!evs.length) evs.push({id:genId(),title:titlePrefix||subjectLine||"",date:"",time:"",location:"",memberId:members[0]&&members[0].id||"",confidence:"low",notes:""});

      // Deletion animation
      setStage("deleting");
      setDeleteProgress(0);
      var prog=0;
      var iv=setInterval(function(){
        prog=Math.min(100,prog+4);
        setDeleteProgress(prog);
        if(prog>=100){
          clearInterval(iv);
          setTimeout(function(){
            setExtracted(evs);
            setChecked(new Set(evs.map(function(e){return e.id;})));
            setStage("review");
          },400);
        }
      },28);
    },1200);
  };

  const confirmEmail=()=>{
    extracted.filter(function(e){return checked.has(e.id);}).forEach(function(e){
      var m=members.find(function(x){return x.id===e.memberId;})||members[0];
      onAdd({...e,color:m&&m.color||"#111",id:genId()});
    });
    var logSubject=instructor?("From "+(instructor.name||"Instructor")+(instructor.group?" · "+instructor.group:"")):text.split("\n")[0].slice(0,60)||"Email";
    setLog(function(l){return [{id:genId(),subject:logSubject,date:todayStr,count:extracted.length,instructor:!!instructor},...l];});
    setStage("done");
    setTimeout(function(){setStage("idle");setText("");setExtracted([]);setChecked(new Set());setDeleteProgress(0);setInstructor(null);},2200);
  };

  const cd=function(c){return c==="high"?"var(--sage2)":c==="medium"?"#D97706":"#DC2626";};
  const Tab=({id,label})=><button onClick={()=>setTab(id)} style={{flex:1,padding:"9px",borderRadius:8,background:tab===id?"#fff":"transparent",color:tab===id?"#111":"#6B7280",fontWeight:600,fontSize:15,border:"none",boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.08)":"none"}}>{label}</button>;

  return (
    <div className="screen-enter">
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Catch</h1>
      <p style={{fontSize:15,color:"var(--cream3)",marginBottom:16}}>Extract events from emails — instantly.</p>

      {/* Privacy pledge */}
      <div style={{background:"rgba(83,136,122,.08)",border:"1px solid rgba(83,136,122,.2)",borderRadius:16,padding:"12px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
        <Check size={16} color="var(--sage2)" style={{flexShrink:0,marginTop:2}}/>
        <div>
          <p style={{fontWeight:700,fontSize:15,color:"var(--sage3)",marginBottom:2}}>Your privacy is protected</p>
          <p style={{fontSize:15,color:"var(--sage3)",lineHeight:1.6}}>Emails deleted immediately after extraction. Nothing else is stored.</p>
        </div>
      </div>

      {/* Email tab */}
      {stage==="idle"&&(
        <>
          <Card style={{marginBottom:14,background:"rgba(59,130,246,.08)",borderColor:"#BFDBFE"}}>
            <p style={{fontSize:15,fontWeight:700,color:"var(--sage3)",marginBottom:6}}>Your private catch address</p>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <code style={{flex:1,fontSize:15,fontWeight:700,color:"var(--sage2)",background:"var(--ink2)",border:"1px solid rgba(59,130,246,.25)",borderRadius:8,padding:"9px 12px"}}>family@getcalla.ca</code>
              <button onClick={()=>navigator.clipboard&&navigator.clipboard.writeText("family@getcalla.ca")} style={{background:"var(--sage2)",color:"var(--cream)",border:"none",borderRadius:8,padding:"9px 14px",display:"flex",alignItems:"center",gap:5,fontSize:15,fontWeight:700,flexShrink:0}}><Copy size={13}/>Copy</button>
            </div>
            <p style={{fontSize:15,color:"var(--sage3)"}}>Forward any email here, or ask your coach/instructor to CC this address when they email parents.</p>
          </Card>

          <div style={{position:"relative",marginBottom:10}}>
            <textarea rows={7} placeholder={"Paste any email here...\n\nWorks for:\n• Coach/instructor updates & cancellations\n• School event notices\n• Registration deadlines\n• Any email with event details"} value={text} onChange={e=>setText(e.target.value)} style={{resize:"none",fontSize:15,lineHeight:1.65}}/>
          </div>
          <button onClick={analyze} disabled={!text.trim()} style={{width:"100%",background:text.trim()?"var(--ink)":"var(--ink4)",color:text.trim()?"var(--cream)":"var(--cream3)",borderRadius:12,padding:"14px",fontWeight:700,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"none"}}>
            Extract Events — Delete Email
          </button>
        </>
      )}

      {stage==="analyzing"&&(
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{width:48,height:48,border:"3px solid #E5E7EB",borderTopColor:"#111",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 16px"}}/>
          <p style={{fontWeight:700,fontSize:15,marginBottom:4}}>Reading email…</p>
          <p style={{fontSize:15,color:"var(--muted)"}}>Detecting events and sender</p>
        </div>
      )}

      {stage==="deleting"&&(
        <div style={{padding:"32px 0"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:40,marginBottom:10}}>🗑️</div>
            <p style={{fontWeight:800,fontSize:16,marginBottom:4}}>Deleting email…</p>
            <p style={{fontSize:15,color:"var(--cream3)"}}>Events extracted. Removing email content.</p>
          </div>
          <div style={{background:"var(--ink5)",borderRadius:99,height:8,overflow:"hidden",marginBottom:10}}>
            <div style={{height:"100%",width:deleteProgress+"%",background:"linear-gradient(90deg,#059669,#10B981)",borderRadius:99,transition:"width .05s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:15,color:"var(--cream3)"}}>Email content</span>
            <span style={{fontSize:15,fontWeight:700,color:deleteProgress===100?"var(--sage2)":"#6B7280"}}>{deleteProgress===100?"✓ Deleted":"Deleting… "+deleteProgress+"%"}</span>
          </div>
        </div>
      )}

      {stage==="review"&&(
        <div>
          {/* Email deleted confirmation */}
          <div style={{background:"rgba(83,136,122,.08)",border:"1px solid rgba(83,136,122,.2)",borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <Check size={16} color="var(--sage2)" style={{flexShrink:0}}/>
            <div style={{flex:1}}><p style={{fontWeight:700,color:"var(--sage3)",fontSize:15}}>Email permanently deleted ✓</p><p style={{fontSize:15,color:"var(--sage3)"}}>Only the events below will be saved</p></div>
          </div>

          {/* Instructor broadcast card */}
          {instructor&&(
            <div style={{background: instructor.isCancelled?"rgba(196,90,90,.1)":instructor.isReschedule?"rgba(212,129,58,.1)":"rgba(59,130,246,.08)", border:"1px solid "+(instructor.isCancelled?"rgba(196,90,90,.3)":instructor.isReschedule?"rgba(212,129,58,.3)":"rgba(59,130,246,.2)"),borderRadius:16,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:instructor.isCancelled||instructor.isReschedule?10:0}}>
                <div style={{width:40,height:40,borderRadius:12,background:instructor.isCancelled?"rgba(196,90,90,.15)":instructor.isReschedule?"rgba(212,129,58,.15)":"rgba(59,130,246,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>
                  {instructor.isCancelled?"🚫":instructor.isReschedule?"🔄":"📨"}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:800,fontSize:15,color:instructor.isCancelled?"var(--rose)":instructor.isReschedule?"var(--gold2)":"var(--sage3)",marginBottom:2}}>
                    {instructor.isCancelled?"Cancellation Notice":instructor.isReschedule?"Schedule Update":"Instructor Broadcast"}
                  </p>
                  <p style={{fontSize:15,color:instructor.isCancelled?"var(--rose)":instructor.isReschedule?"var(--amber)":"var(--sage3)",fontWeight:600}}>
                    From {instructor.name}{instructor.group?" · "+instructor.group:""}
                  </p>
                </div>
              </div>
              {instructor.isCancelled&&(
                <div style={{background:"rgba(196,90,90,.1)",borderRadius:8,padding:"8px 12px",display:"flex",gap:8,alignItems:"center"}}>
                  <AlertTriangle size={13} color="#DC2626" style={{flexShrink:0}}/>
                  <p style={{fontSize:15,color:"var(--rose)",fontWeight:600}}>This session has been cancelled. The event is marked for your records.</p>
                </div>
              )}
              {instructor.isReschedule&&!instructor.isCancelled&&(
                <div style={{background:"rgba(196,149,58,.1)",borderRadius:8,padding:"8px 12px",display:"flex",gap:8,alignItems:"center"}}>
                  <AlertTriangle size={13} color="#D97706" style={{flexShrink:0}}/>
                  <p style={{fontSize:15,color:"var(--gold3)",fontWeight:600}}>Time or location has changed — review the updated details below.</p>
                </div>
              )}
            </div>
          )}

          {/* Event review cards */}
          <p style={{fontSize:15,fontWeight:700,color:"var(--cream)",marginBottom:12}}>Review before adding to calendar</p>
          {extracted.map(function(ev){
            var on=checked.has(ev.id);
            return (
              <div key={ev.id} style={{background:"var(--ink2)",border:"1px solid var(--border2)",borderLeft:"3px solid "+(ev.isCancelled?"var(--rose)":on?"var(--sage2)":"var(--border3)"),borderRadius:16,padding:16,marginBottom:10}}>
                {/* Checkbox + title row */}
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                  <div onClick={()=>setChecked(c=>{var n=new Set(c);on?n.delete(ev.id):n.add(ev.id);return n;})}
                    style={{width:24,height:24,borderRadius:7,border:"2px solid "+(on?"var(--sage2)":"var(--border3)"),background:on?"var(--sage2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                    {on&&<Check size={13} color="var(--cream)"/>}
                  </div>
                  <input value={ev.title} onChange={e=>setExtracted(x=>x.map(i=>i.id===ev.id?{...i,title:e.target.value}:i))}
                    style={{flex:1,fontWeight:700,fontSize:15,border:"none",borderBottom:"1px solid var(--border2)",borderRadius:0,padding:"2px 0",background:"transparent",color:ev.isCancelled?"var(--rose)":"var(--cream)"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:cd(ev.confidence)}}/>
                    <span style={{fontSize:12,color:"var(--muted)"}}>{ev.confidence}</span>
                  </div>
                </div>
                {/* Notes / warning banner */}
                {ev.notes&&(
                  <div style={{background:ev.isCancelled?"rgba(196,90,90,.12)":"rgba(212,129,58,.1)",border:"1px solid "+(ev.isCancelled?"rgba(196,90,90,.25)":"rgba(212,129,58,.25)"),borderRadius:8,padding:"8px 10px",marginBottom:10,display:"flex",gap:7}}>
                    <AlertTriangle size={13} color={ev.isCancelled?"var(--rose)":"var(--amber)"} style={{flexShrink:0,marginTop:2}}/>
                    <p style={{fontSize:13,color:ev.isCancelled?"var(--rose)":"var(--gold2)",lineHeight:1.55}}>{ev.notes}</p>
                  </div>
                )}
                {/* Fields grid */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>DATE{!ev.date&&<span style={{color:"var(--rose)"}}> ⚠</span>}</label>
                    <input type="date" value={ev.date} onChange={e=>setExtracted(x=>x.map(i=>i.id===ev.id?{...i,date:e.target.value}:i))} style={{fontSize:14,padding:"8px 10px"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>TIME</label>
                    <input type="time" value={ev.time} onChange={e=>setExtracted(x=>x.map(i=>i.id===ev.id?{...i,time:e.target.value}:i))} style={{fontSize:14,padding:"8px 10px"}}/>
                  </div>
                  {!ev.isCancelled&&(
                    <div style={{gridColumn:"1/-1"}}>
                      <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>LOCATION</label>
                      <input value={ev.location} onChange={e=>setExtracted(x=>x.map(i=>i.id===ev.id?{...i,location:e.target.value}:i))} placeholder="Add location…" style={{fontSize:14,padding:"8px 10px"}}/>
                    </div>
                  )}
                  <div style={{gridColumn:"1/-1"}}>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:7,letterSpacing:".04em"}}>FOR</label>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {members.map(function(m){
                        var active=ev.memberId===m.id;
                        return (
                          <button key={m.id} onClick={()=>setExtracted(x=>x.map(i=>i.id===ev.id?{...i,memberId:m.id}:i))}
                            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:99,border:"1.5px solid",borderColor:active?m.color:"var(--border2)",background:active?m.color+"22":"transparent",cursor:"pointer"}}>
                            <span style={{fontSize:15}}>{m.emoji}</span>
                            <span style={{fontSize:14,fontWeight:active?700:400,color:active?m.color:"var(--cream2)"}}>{m.name}</span>
                            {active&&<Check size={11} color={m.color}/>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{display:"flex",gap:10,marginTop:4}}>
            <Btn v="ghost" onClick={()=>setChecked(new Set(extracted.map(e=>e.id)))} style={{flex:1,fontSize:15}}>Select All</Btn>
            <Btn onClick={confirmEmail} style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Check size={14}/>Add {checked.size} event{checked.size===1?"":"s"} to my calendar</Btn>
          </div>
          <p style={{textAlign:"center",fontSize:15,color:"var(--muted)",marginTop:10}}>Only selected events saved. Email is gone.</p>
        </div>
      )}

      {stage==="done"&&(
        <div style={{textAlign:"center",padding:"36px 0"}}>
          <div style={{width:64,height:64,background:"rgba(83,136,122,.1)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",border:"1px solid rgba(83,136,122,.4)"}}><Check size={28} color="var(--sage2)"/></div>
          <p style={{fontWeight:800,fontSize:18,color:"var(--sage3)",marginBottom:6}}>Added to Calendar!</p>
          <p style={{fontSize:15,color:"var(--muted)"}}>Email deleted · Events saved · Nothing else stored</p>
        </div>
      )}

      {/* Processed log */}
      {stage==="idle"&&log.length>0&&(
        <div style={{marginTop:24}}>
          <p style={{fontSize:15,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Processed & Deleted</p>
          {log.map(function(l){return(
            <div key={l.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:l.instructor?"var(--sage2)":"var(--sage2)",flexShrink:0}}/>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <p style={{fontSize:15,fontWeight:600}}>{l.subject}</p>
                    {l.instructor&&<div style={{background:"rgba(59,130,246,.08)",borderRadius:99,padding:"1px 7px"}}><span style={{fontSize:15,fontWeight:700,color:"var(--sage3)"}}>Instructor</span></div>}
                  </div>
                  <p style={{fontSize:15,color:"var(--muted)",marginTop:2}}>{fd(l.date)} · {l.count} event{l.count!==1?"s":""} extracted</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(46,107,94,.1)",border:"1px solid #A7F3D0",borderRadius:99,padding:"3px 10px"}}>
                <Check size={10} color="var(--sage2)"/>
                <span style={{fontSize:15,fontWeight:700,color:"var(--sage2)"}}>Deleted</span>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

/* ─── Members ───────────────────────────────────────────────────────────── */
function MembersScreen({members,setMembers,events,onBack}) {
  const [profile,setProfile]=useState(null); // member being viewed/edited
  const [showAdd,setShowAdd]=useState(false);
  const [newM,setNewM]=useState({name:"",color:COLORS[0],emoji:EMOJIS[0],email:"",phone:"",age:""});
  const [partnerEmail,setPartnerEmail]=useState("");
  const [partnerSent,setPartnerSent]=useState(false);
  const [showPartner,setShowPartner]=useState(true);
  const photoRef=useRef();
  const profilePhotoRef=useRef();

  const add=()=>{
    if(!newM.name.trim())return;
    setMembers(p=>[...p,{...newM,id:genId(),photo:null}]);
    setNewM({name:"",color:COLORS[0],emoji:EMOJIS[0],email:"",phone:"",age:""});
    setShowAdd(false);
  };

  const updateMember=(id,fields)=>{
    setMembers(p=>p.map(m=>m.id===id?{...m,...fields}:m));
    if(profile&&profile.id===id) setProfile(p=>({...p,...fields}));
  };

  const uploadPhoto=(id,file)=>{
    if(file.size>5*1024*1024){alert("Photo must be under 5MB. Please choose a smaller image.");return;}
    const reader=new FileReader();
    reader.onload=function(){
      updateMember(id,{photo:reader.result});
    };
    reader.readAsDataURL(file);
  };

  // ── Profile view ──────────────────────────────────────────────────────────
  if(profile){
    const m=members.find(x=>x.id===profile.id)||profile;
    const me=events.filter(e=>e.memberId===m.id).sort((a,b)=>a.date.localeCompare(b.date));
    const upcoming=me.filter(e=>e.date>=todayStr);
    const past=me.filter(e=>e.date<todayStr);
    return (
      <div>
        <button onClick={()=>setProfile(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,marginBottom:16,padding:0}}><ChevronLeft size={15}/>Family</button>

        {/* Profile header */}
        <div style={{background:"linear-gradient(135deg,"+m.color+"22,"+m.color+"08)",border:"1.5px solid "+m.color+"30",borderRadius:20,padding:"24px 20px",marginBottom:20,textAlign:"center",position:"relative"}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:12}}>
            <div style={{width:88,height:88,borderRadius:"50%",background:m.color+"20",border:"3px solid "+m.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,overflow:"hidden",margin:"0 auto"}}>
              {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={m.name}/>:m.emoji}
            </div>
            <button onClick={()=>profilePhotoRef.current&&profilePhotoRef.current.click()} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:m.color,border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <span style={{fontSize:15,color:"var(--cream)"}}>📷</span>
            </button>
            <input ref={profilePhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])uploadPhoto(m.id,e.target.files[0]);}}/>
          </div>
          <p style={{fontSize:22,fontWeight:800,letterSpacing:"-.3px",color:"var(--cream)"}}>{m.name}</p>
          {m.age&&<p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{m.age} years old</p>}
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:12}}>
            <div style={{textAlign:"center"}}><p style={{fontSize:20,fontWeight:800,color:m.color}}>{upcoming.length}</p><p style={{fontSize:15,color:"var(--muted)"}}>Upcoming</p></div>
            <div style={{width:1,background:"var(--ink5)"}}/>
            <div style={{textAlign:"center"}}><p style={{fontSize:20,fontWeight:800,color:"var(--cream3)"}}>{past.length}</p><p style={{fontSize:15,color:"var(--muted)"}}>Past</p></div>
          </div>
        </div>

        {/* Editable fields */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden"}}>
            {[
              {label:"Full Name",field:"name",type:"text",placeholder:"Name",icon:"👤"},
              {label:"Email",field:"email",type:"email",placeholder:"email@example.com",icon:"✉️"},
              {label:"Phone",field:"phone",type:"tel",placeholder:"+1 (555) 000-0000",icon:"📱"},
              {label:"Age",field:"age",type:"number",placeholder:"e.g. 8",icon:"🎂",min:0,max:120},
            ].map(({label,field,type,placeholder,icon},i,arr)=>(
              <div key={field} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<arr.length-1?"1px solid #F3F4F6":"none"}}>
                <span style={{fontSize:18,flexShrink:0,width:24,textAlign:"center"}}>{icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</p>
                  <input
                    type={type}
                    value={m[field]||""}
                    placeholder={placeholder}
                    onChange={e=>{var v=e.target.value;if(field==="age"&&v!==""){var n=parseInt(v);if(isNaN(n)||n<0||n>120)return;}var sv=field==="name"&&v.trim()===""?m.name:v;updateMember(m.id,{[field]:sv});}}
                    style={{background:"transparent",border:"none",padding:0,fontSize:15,fontWeight:500,width:"100%",color:"var(--cream)"}}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Emoji + colour */}
          <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",padding:"14px 16px"}}>
            <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,marginBottom:10,textTransform:"uppercase",letterSpacing:".05em"}}>Avatar</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>updateMember(m.id,{emoji:e})} style={{fontSize:20,width:38,height:38,borderRadius:12,background:m.emoji===e?m.color+"20":"#F9FAFB",border:m.emoji===e?"2px solid "+m.color:"2px solid transparent"}}>{e}</button>
              ))}
            </div>
            <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Colour</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>updateMember(m.id,{color:c})} style={{width:30,height:30,borderRadius:"50%",background:c,border:m.color===c?"3px solid #111":"3px solid transparent",boxShadow:m.color===c?"0 0 0 2px #fff, 0 0 0 4px "+c:"none"}}/>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming events */}
        {upcoming.length>0&&(
          <div style={{marginBottom:16}}>
            <p style={{fontSize:15,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Upcoming Events</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {upcoming.slice(0,5).map(ev=>(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--ink2)",borderRadius:12,border:"1px solid var(--border2)",borderLeft:"3px solid "+m.color}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:15,fontWeight:600}}>{ev.title}</p>
                    <p style={{fontSize:15,color:"var(--muted)",marginTop:2}}>{fd(ev.date)}{ev.time?" · "+ev.time:""}{ev.location?" · "+ev.location:""}</p>
                  </div>
                  <Pill color={m.color} bg={m.color+"12"}>{ev.date===todayStr?"Today":"Soon"}</Pill>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remove member */}
        <button onClick={()=>{if(members.length<=1){return;}setMembers(p=>p.filter(x=>x.id!==m.id));setProfile(null);}} style={{width:"100%",background:"none",border:"1.5px solid "+(members.length<=1?"var(--border)":"rgba(196,90,90,.35)"),borderRadius:12,padding:12,color:members.length<=1?"var(--muted)":"var(--rose)",fontWeight:600,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <X size={14}/>Remove {m.name} from family
        </button>
      </div>
    );
  }

  // ── Members list ──────────────────────────────────────────────────────────
  return (
    <div>
      {onBack&&<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,marginBottom:12,padding:0}}><ChevronLeft size={15}/>Back</button>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div><h1 style={{fontSize:22,fontWeight:800}}>Family</h1><p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{members.length} members · tap to edit profile</p></div>
        <Btn onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",fontSize:15}}><Plus size={14}/>Add</Btn>
      </div>

      {/* Co-parent sync CTA */}
      {showPartner&&!partnerSent&&(
        <div style={{background:"linear-gradient(135deg,var(--ink),var(--sage))",borderRadius:16,padding:"18px 20px",marginBottom:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
          <button onClick={()=>setShowPartner(false)} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--cream)"}}><X size={12}/></button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:36,height:36,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👫</div>
            <div><p style={{fontWeight:800,color:"var(--cream)",fontSize:15}}>Invite your partner</p><p style={{fontSize:15,color:"rgba(255,255,255,.6)"}}>Both parents. One calendar. Zero confusion.</p></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <input placeholder="Partner's email" type="email" value={partnerEmail} onChange={e=>setPartnerEmail(e.target.value)} style={{flex:1,fontSize:15,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.2)",color:"var(--cream)",borderRadius:8,padding:"9px 12px"}}/>
            <button onClick={()=>{if(partnerEmail.includes("@"))setPartnerSent(true);}} style={{background:"var(--ink2)",color:"var(--sage2)",borderRadius:8,padding:"0 16px",fontWeight:700,fontSize:15,flexShrink:0}}>Send</button>
          </div>
        </div>
      )}
      {partnerSent&&(
        <Card style={{marginBottom:16,background:"rgba(83,136,122,.1)",border:"1px solid rgba(83,136,122,.25)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={18} color="#fff"/></div>
            <div><p style={{fontWeight:700,color:"var(--sage3)"}}>Partner invited!</p><p style={{fontSize:15,color:"var(--sage3)",marginTop:2}}>When they join, both calendars sync in real time.</p></div>
          </div>
        </Card>
      )}

      {/* Member cards — tappable */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {members.map(m=>{
          const upcoming=events.filter(e=>e.memberId===m.id&&e.date>=todayStr).length;
          return (
            <div key={m.id} onClick={()=>setProfile(m)} style={{background:"var(--ink2)",border:"1px solid var(--border2)",borderLeft:"4px solid "+m.color,borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--ink3)"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              <div style={{width:52,height:52,borderRadius:"50%",background:m.color+"15",border:"2px solid "+m.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,overflow:"hidden"}}>
                {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={m.name}/>:m.emoji}
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:16}}>{m.name}</p>
                <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
                  {m.age&&<span style={{fontSize:15,color:"var(--muted)"}}>{m.age}y</span>}
                  {m.email&&<span style={{fontSize:15,color:"var(--muted)"}}>{m.email}</span>}
                  {!m.age&&!m.email&&<span style={{fontSize:15,color:"#C4B5FD"}}>Tap to add profile →</span>}
                </div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <p style={{fontSize:20,fontWeight:800,color:m.color}}>{upcoming}</p>
                <p style={{fontSize:15,color:"var(--muted)"}}>upcoming</p>
              </div>
              <ChevronRight size={15} color="#D1D5DB"/>
            </div>
          );
        })}
      </div>

      {/* Add member sheet */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="fu" style={{background:"rgba(18,18,22,.97)",borderRadius:"20px 20px 0 0",padding:"8px 20px 40px",width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>
            <h2 style={{fontWeight:800,fontSize:18,marginBottom:18}}>Add Family Member</h2>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <input placeholder="Your first name" value={newM.name} onChange={e=>setNewM(p=>({...p,name:e.target.value}))}/>
              <input placeholder="Email (optional)" type="email" value={newM.email||""} onChange={e=>setNewM(p=>({...p,email:e.target.value}))}/>
              <input placeholder="Phone (optional)" type="tel" value={newM.phone||""} onChange={e=>setNewM(p=>({...p,phone:e.target.value}))}/>
              <input placeholder="Age (optional)" type="number" value={newM.age||""} onChange={e=>setNewM(p=>({...p,age:e.target.value}))}/>
              <div>
                <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,marginBottom:8}}>AVATAR</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {EMOJIS.map(e=><button key={e} onClick={()=>setNewM(p=>({...p,emoji:e}))} style={{fontSize:20,width:38,height:38,borderRadius:12,background:newM.emoji===e?"var(--ink4)":"transparent",border:newM.emoji===e?"2px solid var(--sage2)":"2px solid transparent"}}>{e}</button>)}
                </div>
              </div>
              <div>
                <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,marginBottom:8}}>COLOUR</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {COLORS.map(c=><button key={c} onClick={()=>setNewM(p=>({...p,color:c}))} style={{width:30,height:30,borderRadius:"50%",background:c,border:newM.color===c?"3px solid #111":"3px solid transparent"}}/>)}
                </div>
              </div>
              <Btn onClick={add} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}><Check size={14}/>Add Member</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Notifications ─────────────────────────────────────────────────────── */
function NotifScreen({events,members,onSelectEvent}) {
  const gm=id=>members.find(m=>m.id===id)||{emoji:"👤",color:"var(--cream3)",name:"?"};
  const up=events.filter(e=>e.date>=todayStr).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const du=s=>{
    const d=Math.round((new Date(s)-new Date(todayStr))/86400000);
    return d===0?"Today":d===1?"Tomorrow":d<=7?"In "+d+"d":d<=30?"In "+Math.ceil(d/7)+"w":"In "+Math.ceil(d/30)+"mo";
  };
  const grouped={};
  up.forEach(ev=>{
    const key=ev.date===todayStr?"Today":ev.date===addDays(todayStr,1)?"Tomorrow":fd(ev.date);
    if(!grouped[key])grouped[key]=[];
    grouped[key].push(ev);
  });
  return (
    <div className="screen-enter">
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1}}>Alerts</h1>
        <p style={{fontSize:15,color:"var(--cream3)",marginTop:5,fontWeight:300}}>Upcoming events · {up.length} total</p>
      </div>
      {up.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0"}}>
          <div style={{fontSize:52,marginBottom:16}}>🎉</div>
          <p style={{fontSize:18,fontWeight:600,color:"var(--cream)",marginBottom:8}}>You're all clear</p>
          <p style={{fontSize:15,color:"var(--cream3)",fontWeight:300,lineHeight:1.6}}>No upcoming events. Add one from the Home tab.</p>
        </div>
      )}
      {Object.entries(grouped).map(([group,evs])=>(
        <div key={group} style={{marginBottom:24}}>
          <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--sage3)",marginBottom:10,paddingLeft:2}}>{group}</p>
          <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden"}}>
            {evs.map((ev,i)=>{
              const m=gm(ev.memberId),isT=ev.date===todayStr;
              return (
                <div key={ev.id} onClick={()=>onSelectEvent&&onSelectEvent(ev)}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderBottom:i<evs.length-1?"1px solid rgba(240,236,226,.06)":"none",cursor:"pointer"}}
                >
                  {/* Colour dot */}
                  <div style={{width:4,height:40,borderRadius:2,background:ev.color,flexShrink:0}}/>
                  {/* Member avatar */}
                  <div style={{width:36,height:36,borderRadius:12,background:ev.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,overflow:"hidden"}}>
                    {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:m.emoji}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:16,color:"var(--cream)",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</p>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      {ev.time&&<span style={{fontSize:13,color:"var(--cream3)",display:"flex",alignItems:"center",gap:4}}><Clock size={12} color="var(--sage3)"/>{ev.time}</span>}
                      {ev.location&&<span style={{fontSize:13,color:"var(--cream3)",display:"flex",alignItems:"center",gap:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}><MapPin size={12} color="var(--sage3)"/>{ev.location}</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:600,color:isT?"var(--gold2)":"var(--cream3)",background:isT?"rgba(196,149,58,.12)":"var(--ink4)",borderRadius:99,padding:"4px 10px",border:isT?"1px solid rgba(196,149,58,.25)":"1px solid var(--border)"}}>{du(ev.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Notification Settings Screen ─────────────────────────────────────── */
function NotifSettingsScreen({settings,setSettings,members,onBack}) {
  const RL={"5":"5 min","15":"15 min","30":"30 min","60":"1 hr","120":"2 hr","1440":"1 day","2880":"2 days","10080":"1 week"};
  const DG=[{v:"none",l:"Off"},{v:"daily_morning",l:"Daily 8am"},{v:"daily_evening",l:"Daily 7pm"},{v:"weekly_sunday",l:"Weekly Sunday"},{v:"weekly_monday",l:"Weekly Monday"}];
  const Row=({label,desc,right})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid rgba(240,236,226,.06)"}}>
      <div><p style={{fontSize:16,fontWeight:500,color:"var(--cream)"}}>{label}</p>{desc&&<p style={{fontSize:13,color:"var(--cream3)",marginTop:2,fontWeight:300}}>{desc}</p>}</div>
      {right}
    </div>
  );
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,marginBottom:20,padding:0}}><ChevronLeft size={16}/>Back</button>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:26,fontWeight:700,letterSpacing:"-.3px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)"}}>Notifications</h2>
        <p style={{fontSize:15,color:"var(--cream3)",marginTop:4,fontWeight:300}}>Reminders & quiet hours</p>
      </div>

      {/* Push toggle */}
      <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>General</p>
      <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",marginBottom:22}}>
        <Row label="Push Notifications" desc="Enable alerts on this device" right={<Toggle on={settings.enabled} onChange={()=>setSettings(p=>({...p,enabled:!p.enabled}))}/>}/>
      </div>

      {settings.enabled&&(<>
        {/* Reminder chips */}
        <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Default Reminder Times</p>
        <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",padding:"16px 18px",marginBottom:22}}>
          <p style={{fontSize:14,color:"var(--cream3)",marginBottom:12,fontWeight:300}}>Applied to all events unless overridden</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {Object.entries(RL).map(([r,label])=>{
              const on=settings.reminders.includes(r);
              return <button key={r} onClick={()=>setSettings(p=>({...p,reminders:on?p.reminders.filter(x=>x!==r):[...p.reminders,r]}))}
                style={{padding:"8px 16px",borderRadius:99,background:on?"var(--sage)":"var(--ink4)",color:on?"var(--cream)":"var(--cream3)",fontSize:14,fontWeight:600,border:"1px solid "+(on?"transparent":"var(--border2)"),transition:"all .2s"}}>
                {on?"✓ ":""}{label}
              </button>;
            })}
          </div>
        </div>

        {/* Quiet hours */}
        <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Quiet Hours</p>
        <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",marginBottom:22}}>
          <Row label="Enable Quiet Hours" desc="Silence notifications at night"
            right={<Toggle on={!!(settings.quietHours&&settings.quietHours.enabled)} onChange={()=>setSettings(p=>({...p,quietHours:{...(p.quietHours||{}),enabled:!(p.quietHours&&p.quietHours.enabled)}}))}/>}
          />
          {settings.quietHours&&settings.quietHours.enabled&&(
            <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,borderTop:"1px solid rgba(240,236,226,.06)"}}>
              <div><label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:6,letterSpacing:".05em"}}>FROM</label><input type="time" value={settings.quietHours.from||"22:00"} onChange={e=>setSettings(p=>({...p,quietHours:{...p.quietHours,from:e.target.value}}))}/></div>
              <div><label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:6,letterSpacing:".05em"}}>TO</label><input type="time" value={settings.quietHours.to||"07:00"} onChange={e=>setSettings(p=>({...p,quietHours:{...p.quietHours,to:e.target.value}}))}/></div>
              {settings.quietHours.from&&settings.quietHours.to&&settings.quietHours.from>settings.quietHours.to&&<p style={{fontSize:13,color:"var(--sage3)",gridColumn:"1/-1",marginTop:4}}>ℹ️ Spans midnight — silent until {settings.quietHours.to} next morning</p>}
            </div>
          )}
        </div>

        {/* Per member */}
        <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Per Family Member</p>
        <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden"}}>
          {members.map((m,i)=>{const on=!(settings.mutedMembers||[]).includes(m.id);return(
            <div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",borderBottom:i<members.length-1?"1px solid rgba(240,236,226,.06)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:m.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{m.emoji}</div>
                <p style={{fontWeight:500,fontSize:16,color:"var(--cream)"}}>{m.name}</p>
              </div>
              <Toggle on={on} onChange={()=>setSettings(p=>{const mu=p.mutedMembers||[];return{...p,mutedMembers:on?[...mu,m.id]:mu.filter(x=>x!==m.id)};})}/>
            </div>
          );})}
        </div>
      </>)}
    </div>
  );
}

/* ─── More ──────────────────────────────────────────────────────────────── */
function MoreScreen({members,setMembers,events,user,paid,trialLeft,onUpgrade,onSignOut,notifSettings,setNotifSettings}) {
  const fr=useRef();
  const [confirmSignOut,setConfirmSignOut]=useState(false);
  const [sec,setSec]=useState(null),[docs,setDocs]=useState([{id:"d1",name:"Emma's Vaccination Record",memberId:"m3",emoji:"💉",date:addDays(todayStr,-30)},{id:"d2",name:"Soccer Permission Slip",memberId:"m3",emoji:"⚽",date:addDays(todayStr,-5)},{id:"d3",name:"Insurance Card",memberId:null,emoji:"🏥",date:addDays(todayStr,-60)}]);
  const [budget,setBudget]=useState(500),[invite,setInvite]=useState(""),[invited,setInvited]=useState(false),[link,setLink]=useState("");
  const gm=id=>id?members.find(m=>m.id===id)||{name:"Family",color:"var(--cream3)",emoji:"👨‍👩‍👧‍👦"}:{name:"Family",color:"var(--cream3)",emoji:"👨‍👩‍👧‍👦"};
  const ce=events.filter(e=>e.cost&&parseFloat(e.cost)>0);
  const tot=ce.reduce((s,e)=>{const c=parseFloat(e.cost)||0;return s+(e.costType==="monthly"?c:e.costType==="session"?c*4:e.costType==="season"?c/3:c);},0);
  const Back=()=><button onClick={()=>setSec(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,marginBottom:18,padding:0}}><ChevronLeft size={15}/>Back</button>;
  const SECS=[
    {id:"family",Icon:Users,label:"Family Members",desc:members.length+" members"},
    {id:"digest",Icon:Sun,label:"Morning Text",desc:"Daily SMS with your schedule"},
    {id:"vault",Icon:Folder,label:"Document Vault",desc:"Permission slips, records"},
    {id:"budget",Icon:DollarSign,label:"Budget Tracker",desc:"$"+tot.toFixed(0)+"/mo estimated"},
    {id:"sharing",Icon:Share2,label:"Family Sharing",desc:"Invite partner & share access"},
    {id:"notif_settings",Icon:Bell,label:"Notification Settings",desc:"Reminders, quiet hours"},
  ];
  // Helper: a single row in the grouped list
  const Row=({Icon,iconBg,label,desc,onTap,last=false,danger=false})=>(
    <button onClick={onTap} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"transparent",border:"none",borderBottom:last?"none":"1px solid rgba(240,236,226,.06)",textAlign:"left"}}>
      <div style={{width:38,height:38,borderRadius:12,background:iconBg||"var(--ink4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Icon size={18} color={danger?"var(--rose)":"var(--cream2)"}/>
      </div>
      <div style={{flex:1}}>
        <p style={{fontWeight:600,fontSize:16,color:danger?"var(--rose)":"var(--cream)",lineHeight:1.2}}>{label}</p>
        {desc&&<p style={{fontSize:15,color:"var(--cream3)",marginTop:2,fontWeight:400}}>{desc}</p>}
      </div>
      <ChevronRight size={16} color="rgba(240,236,226,.2)"/>
    </button>
  );

  if(!sec) return (
    <div style={{paddingBottom:8}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1}}>More</h1>
        <p style={{fontSize:15,color:"var(--cream3)",marginTop:4,fontWeight:400}}>Settings & tools</p>
      </div>

      {/* Subscription card */}
      {paid ? (
        <div style={{background:"linear-gradient(135deg,var(--sage),var(--sage2))",borderRadius:16,padding:"18px 20px",marginBottom:24,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:44,height:44,background:"rgba(255,255,255,.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✓</div>
          <div style={{flex:1}}>
            <p style={{fontWeight:700,color:"var(--cream)",fontSize:16}}>Calla Family · Active</p>
            <p style={{fontSize:15,color:"rgba(255,255,255,.65)",marginTop:2}}>Annual plan · No ads, ever</p>
          </div>
        </div>
      ) : (
        <button onClick={onUpgrade} style={{width:"100%",background:"linear-gradient(135deg,var(--sage),var(--sage2))",borderRadius:16,padding:"18px 20px",marginBottom:24,display:"flex",alignItems:"center",gap:14,border:"none"}}>
          <div style={{width:44,height:44,background:"rgba(255,255,255,.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌸</div>
          <div style={{flex:1,textAlign:"left"}}>
            <p style={{fontWeight:700,color:"var(--cream)",fontSize:16}}>Free Trial · {trialLeft} days left</p>
            <p style={{fontSize:15,color:"rgba(255,255,255,.65)",marginTop:2}}>Less than a coffee a month — see plans →</p>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,.5)"/>
        </button>
      )}

      {/* Group 1: Family */}
      <p style={{fontSize:15,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:4}}>Family</p>
      <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",marginBottom:24}}>
        <Row Icon={Users}      iconBg="rgba(83,136,122,.25)"  label="Family Members" desc={members.length+" members"} onTap={()=>setSec("family")}/>
        <Row Icon={Share2}     iconBg="rgba(59,130,246,.2)"   label="Family Sharing" desc="Invite partner & sync" onTap={()=>setSec("sharing")} last/>
      </div>

      {/* Group 2: Tools */}
      <p style={{fontSize:15,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:4}}>Tools</p>
      <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",marginBottom:24}}>
        <Row Icon={Sun}        iconBg="rgba(176,141,82,.25)"  label="Morning Text"   desc="Daily SMS digest"     onTap={()=>setSec("digest")}/>
        <Row Icon={Folder}     iconBg="rgba(139,92,246,.2)"   label="Document Vault" desc="Slips, records, cards" onTap={()=>setSec("vault")}/>
        <Row Icon={DollarSign} iconBg="rgba(16,185,129,.2)"   label="Budget Tracker" desc={"$"+tot.toFixed(0)+"/mo estimated"} onTap={()=>setSec("budget")} last/>
      </div>

      {/* Group 3: Settings */}
      <p style={{fontSize:15,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:4}}>Settings</p>
      <div style={{background:"var(--ink2)",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",marginBottom:24}}>
        <Row Icon={Bell}   iconBg="rgba(59,130,246,.2)"   label="Notifications"      desc="Reminders, quiet hours"  onTap={()=>setSec("notif_settings")}/>
        <Row Icon={LogOut} iconBg="rgba(220,80,80,.15)"   label="Sign Out"            danger                         onTap={()=>setConfirmSignOut(true)} last/>
      </div>

      {/* Sign out confirm */}
      {confirmSignOut&&(
        <div style={{background:"rgba(220,80,80,.07)",border:"1px solid rgba(220,80,80,.18)",borderRadius:16,padding:"20px 18px",marginBottom:8}}>
          <p style={{fontWeight:700,fontSize:16,color:"var(--rose)",textAlign:"center",marginBottom:6}}>Taking a break?</p>
          <p style={{fontSize:15,color:"rgba(220,130,130,.75)",textAlign:"center",marginBottom:18,fontWeight:400}}>Your session data will be cleared.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setConfirmSignOut(false)} style={{flex:1,padding:13,borderRadius:12,background:"var(--ink4)",border:"1px solid var(--border2)",fontWeight:600,fontSize:15,color:"var(--cream2)"}}>Cancel</button>
            <button onClick={()=>onSignOut&&onSignOut()} style={{flex:1,padding:13,borderRadius:12,background:"#c03030",border:"none",fontWeight:700,fontSize:15,color:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><LogOut size={15}/>Sign Out</button>
          </div>
        </div>
      )}

      <p style={{fontSize:15,color:"var(--cream3)",textAlign:"center",marginTop:8,fontWeight:300,opacity:.6}}>Made with care in Canada 🍁 · getcalla.ca</p>
    </div>
  );
  if(sec==="family") return <MembersScreen members={members} setMembers={setMembers} events={events} onBack={()=>setSec(null)}/>;
  if(sec==="digest") return <DigestScreen members={members} onBack={()=>setSec(null)}/>;
  if(sec==="notif_settings") return <NotifSettingsScreen settings={notifSettings} setSettings={setNotifSettings} members={members} onBack={()=>setSec(null)}/>;
  if(sec==="vault") return (
    <div><Back/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontSize:20,fontWeight:800}}>Document Vault</h2><Btn onClick={()=>fr.current&&fr.current.click()} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",fontSize:15}}><Plus size={13}/>Upload</Btn></div>
      <input ref={fr} type="file" style={{display:"none"}}/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {docs.map(d=>{const m=gm(d.memberId);return(
          <Card key={d.id} style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,background:"var(--ink4)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{d.emoji}</div>
            <div style={{flex:1}}><p style={{fontWeight:700,fontSize:15}}>{d.name}</p><div style={{display:"flex",gap:8,marginTop:3}}><span style={{fontSize:15,color:m.color}}>{m.emoji} {m.name}</span><span style={{fontSize:15,color:"var(--muted)"}}>{fd(d.date)}</span></div></div>
            <button onClick={()=>setDocs(x=>x.filter(i=>i.id!==d.id))} style={{background:"none",border:"none",color:"var(--border3)"}}><X size={15}/></button>
          </Card>
        );})}
      </div>
    </div>
  );
  if(sec==="budget") return (
    <div><Back/>
      <h2 style={{fontSize:20,fontWeight:800,marginBottom:18}}>Budget Tracker</h2>
      <Card style={{marginBottom:14,background:"var(--ink3)"}}>
        <p style={{fontSize:15,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Monthly Estimate</p>
        <div style={{display:"flex",alignItems:"flex-end",gap:10,marginBottom:10}}>
          <p style={{fontSize:34,fontWeight:800,color:tot>budget?"#DC2626":"var(--sage2)"}}>${tot.toFixed(0)}</p>
          <p style={{fontSize:15,color:"var(--muted)",marginBottom:6}}>of</p>
          <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:15,fontWeight:700}}>$</span><input type="number" value={budget} onChange={e=>setBudget(Number(e.target.value))} style={{width:76,fontSize:22,fontWeight:800,background:"transparent",border:"none",borderBottom:"1px solid var(--border2)",borderRadius:0,padding:"2px 4px"}}/></div>
        </div>
        <div style={{background:"var(--ink5)",borderRadius:6,height:7,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(tot/budget)*100)+"%",background:tot>budget?"#DC2626":"var(--sage2)",borderRadius:6,transition:"width .5s"}}/></div>
        <p style={{fontSize:15,color:tot>budget?"#DC2626":"var(--sage2)",marginTop:7,fontWeight:600}}>{tot>budget?"$"+(tot-budget).toFixed(0)+" over budget":"$"+(budget-tot).toFixed(0)+" remaining"}</p>
      </Card>
      {ce.length===0&&<div style={{textAlign:"center",padding:"36px 0"}}><DollarSign size={34} color="#D1D5DB" style={{margin:"0 auto 10px"}}/><p style={{color:"var(--muted)"}}>No costs tracked yet</p></div>}
      {members.map(m=>{const me=ce.filter(e=>e.memberId===m.id);if(!me.length)return null;const mt=me.reduce((s,e)=>{const c=parseFloat(e.cost)||0;return s+(e.costType==="monthly"?c:e.costType==="session"?c*4:e.costType==="season"?c/3:c);},0);return(
        <Card key={m.id} style={{marginBottom:10,borderLeft:"4px solid "+m.color}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{m.emoji}</span><p style={{fontWeight:700}}>{m.name}</p></div><p style={{fontSize:18,fontWeight:800,color:m.color}}>${mt.toFixed(0)}<span style={{fontSize:15,color:"var(--muted)",fontWeight:400}}>/mo</span></p></div>
          {me.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:"1px solid var(--border2)"}}><p style={{fontSize:15}}>{e.title}</p><p style={{fontSize:15,color:"var(--cream3)"}}>${e.cost}/{e.costType}</p></div>)}
        </Card>
      );})}
    </div>
  );
  if(sec==="sharing") return (
    <div><Back/>
      <h2 style={{fontSize:20,fontWeight:800,marginBottom:18}}>Family Sharing</h2>
      <Card style={{marginBottom:12,background:"var(--ink3)",borderColor:"#BFDBFE"}}>
        <p style={{fontWeight:700,fontSize:15,marginBottom:4}}>Invite Your Partner</p>
        <p style={{fontSize:15,color:"var(--cream3)",marginBottom:12}}>Full access to view & edit</p>
        {invited?<div style={{background:"rgba(83,136,122,.1)",border:"1px solid rgba(83,136,122,.25)",borderRadius:12,padding:11,display:"flex",gap:8,alignItems:"center"}}><Check size={15} color="var(--sage2)"/><p style={{fontWeight:600,color:"var(--sage3)",fontSize:15}}>Invite sent to {invite}</p></div>:<div style={{display:"flex",gap:8}}><input placeholder="partner@email.com" type="email" value={invite} onChange={e=>setInvite(e.target.value)} style={{flex:1,fontSize:15}}/><Btn onClick={()=>{if(invite.includes("@"))setInvited(true);}} style={{padding:"0 16px",flexShrink:0}}>Invite</Btn></div>}
      </Card>
      <Card style={{marginBottom:12}}>
        <p style={{fontWeight:700,fontSize:15,marginBottom:4}}>Babysitter / Grandparent</p>
        <p style={{fontSize:15,color:"var(--cream3)",marginBottom:12}}>Read-only · no login · expires 24h</p>
        {!link?<Btn v="ghost" onClick={()=>setLink("https://getcalla.ca/s/"+genId().slice(0,8))} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Link size={13}/>Generate Link</Btn>:<div style={{display:"flex",gap:8}}><code style={{flex:1,fontSize:15,color:"var(--sage3)",background:"var(--ink3)",border:"1px solid rgba(59,130,246,.25)",borderRadius:8,padding:"10px 12px",wordBreak:"break-all"}}>{link}</code><button onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(link)} style={{background:"var(--ink4)",border:"1px solid var(--border2)",borderRadius:8,padding:"0 12px",flexShrink:0,display:"flex",alignItems:"center"}}><Copy size={14} color="#374151"/></button></div>}
      </Card>
      <Card>
        <p style={{fontWeight:700,marginBottom:12}}>Access</p>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0"}}><div style={{width:34,height:34,borderRadius:"50%",background:"var(--ink4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👤</div><div style={{flex:1}}><p style={{fontWeight:600,fontSize:15}}>{user&&user.name||"You"}</p><p style={{fontSize:15,color:"var(--muted)"}}>{user&&user.email}</p></div><Pill color="var(--sage2)" bg="#ECFDF5">Owner</Pill></div>
        {invited&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:"1px solid var(--border2)"}}><div style={{width:34,height:34,borderRadius:"50%",background:"var(--ink3)",border:"2px solid #BFDBFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👤</div><div style={{flex:1}}><p style={{fontWeight:600,fontSize:15}}>{invite}</p><p style={{fontSize:15,color:"var(--muted)"}}>Invite pending</p></div><Pill color="#D97706" bg="#FFFBEB">Pending</Pill></div>}
      </Card>
    </div>
  );
  return null;
}

/* ─── Trial & Paywall System ────────────────────────────────────────────── */

// Simulate trial start date — in production this comes from your backend
// For demo: we let you scrub the trial day with a slider
const TRIAL_DAYS = 60;

function trialStatus(startDate) {
  const start = new Date(startDate);
  const now   = new Date();
  const used  = Math.floor((now - start) / 86400000);
  const left  = Math.max(0, TRIAL_DAYS - used);
  const pct   = Math.min(100, Math.round((used / TRIAL_DAYS) * 100));
  return { used, left, pct, expired: left === 0 };
}

/* Paywall / upgrade screen */
function PaywallScreen({ trialLeft, onPay, onDismiss, hard = false }) {
  const [plan, setPlan]       = useState("year20");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const PLANS = [
    {
      id:    "year20",
      label: "Yearly",
      price: "$20",
      per:   "/ year",
      sub:   "Less than $2/month · Best value",
      badge: "Most popular",
      color: "var(--ink)",
    },
    {
      id:    "year30",
      label: "Yearly+",
      price: "$30",
      per:   "/ year",
      sub:   "Supports future features & development",
      badge: "Support us",
      color: "#7C3AED",
    },
  ];

  const pay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); setTimeout(() => onPay(plan), 1400); }, 1800);
  };

  if (done) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--ink)", padding:32, textAlign:"center" }}>
      <div className="fu">
        <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-.5px", marginBottom:10 }}>Welcome to Calla Family!</h2>
        <p style={{ fontSize:15, color:"var(--cream3)", lineHeight:1.7, marginBottom:8 }}>Your family is covered for a full year.</p>
        <p style={{ fontSize:15, color:"var(--muted)" }}>No ads. No data selling. Just your family, organised.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--ink)" }}>
      {/* Header */}
      <div style={{ background:"var(--sage)", padding:"48px 28px 36px", textAlign:"center", position:"relative" }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.04)" }}/>
        <div style={{ position:"absolute", bottom:-30, left:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.03)" }}/>

        {!hard && onDismiss && (
          <button onClick={onDismiss} style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,.1)", border:"none", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.6)" }}>
            <X size={16}/>
          </button>
        )}

        <div style={{ width:64, height:64, background:"rgba(255,255,255,.1)", borderRadius:20, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16, fontSize:32 }}>🏠</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:"var(--cream)", letterSpacing:"-.5px", marginBottom:8 }}>
          {hard ? "Your free trial has ended" : `${trialLeft} days left in your trial`}
        </h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.65)", lineHeight:1.7 }}>
          {hard
            ? "Upgrade to keep your family's schedule, history and all your data."
            : "Lock in your family plan now and never worry about losing your data."}
        </p>

        {/* Trial progress bar — only on soft paywall */}
        {!hard && (
          <div style={{ marginTop:20, background:"rgba(255,255,255,.1)", borderRadius:99, height:6, overflow:"hidden" }}>
            <div style={{ height:"100%", width:((TRIAL_DAYS - trialLeft)/TRIAL_DAYS*100)+"%" , background:"linear-gradient(90deg,#34D399,#059669)", borderRadius:99 }}/>
          </div>
        )}
      </div>

      <div style={{ flex:1, padding:"28px 24px" }}>

        {/* What's included */}
        <p style={{ fontSize:15, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:14 }}>Everything included — no limits</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
          {[
            ["🎙","Voice Add","Say it, it's added"],
            ["📬","Email Parser","Auto-extract events"],
            ["⚡","Conflict Alerts","Never double-book"],
            ["👨‍👩‍👧","Co-parent Sync","Both parents, live"],
            ["🎒","Packing Lists","Nothing forgotten"],
            ["📁","Document Vault","Permission slips safe"],
            ["💰","Budget Tracker","All costs in one place"],
            ["🔒","Privacy First","Emails deleted instantly"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:"var(--ink2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <p style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{title}</p>
              <p style={{ fontSize:15, color:"var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Plan picker */}
        <p style={{ fontSize:15, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Choose your plan</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {PLANS.map(p => (
            <div
              key={p.id}
              onClick={() => setPlan(p.id)}
              style={{
                background: plan===p.id ? p.color : "#fff",
                border: "2px solid",
                borderColor: plan===p.id ? p.color : "var(--border2)",
                borderRadius:16,
                padding:"16px 18px",
                cursor:"pointer",
                transition:"all .15s",
                display:"flex",
                alignItems:"center",
                gap:14,
              }}
            >
              {/* Radio */}
              <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid", borderColor:plan===p.id?"#fff":"#D1D5DB", background:plan===p.id?"rgba(255,255,255,.25)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {plan===p.id && <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--ink2)" }}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <p style={{ fontWeight:800, fontSize:16, color:plan===p.id?"#fff":"#111" }}>{p.price}<span style={{ fontSize:15, fontWeight:500, opacity:.7 }}>{p.per}</span></p>
                  <div style={{ background:plan===p.id?"rgba(255,255,255,.2)":"var(--ink4)", borderRadius:99, padding:"2px 8px" }}>
                    <span style={{ fontSize:15, fontWeight:700, color:plan===p.id?"#fff":"#374151" }}>{p.badge}</span>
                  </div>
                </div>
                <p style={{ fontSize:15, color:plan===p.id?"rgba(255,255,255,.72)":"#6B7280" }}>{p.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Per-month equivalent callout */}
        <div style={{ background:"rgba(46,107,94,.1)", border:"1px solid rgba(83,136,122,.25)", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
          <Check size={16} color="var(--sage2)" style={{ flexShrink:0 }}/>
          <p style={{ fontSize:15, color:"var(--sage3)", fontWeight:600 }}>
            {plan==="year20"
              ? "That's $1.67/month — less than a coffee per month to organise your whole family."
              : "That's $2.50/month — and directly funds new features for your family."}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={pay}
          style={{ width:"100%", background:"var(--sage)", color:"var(--cream)", padding:"16px", borderRadius:16, fontWeight:800, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", gap:10, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,.15)", marginBottom:12 }}
        >
          {loading
            ? <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
            : <>Get Calla Family — {plan==="year20"?"$20":"$30"}/yr</>
          }
        </button>

        {/* Privacy micro-copy */}
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:5 }}>
          <p style={{ fontSize:15, color:"var(--muted)" }}>Secure payment · Cancel anytime · No auto-renewal surprises</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--sage2)", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={6} color="#fff"/></div>
            <p style={{ fontSize:15, color:"var(--cream3)" }}>No ads · No data selling · Emails deleted after extraction</p>
          </div>
        </div>

        {!hard && onDismiss && (
          <button onClick={onDismiss} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:15, display:"block", margin:"16px auto 0", padding:"8px" }}>
            Maybe later — remind me in 7 days
          </button>
        )}
      </div>
    </div>
  );
}

/* Trial countdown banner — shown inside the app */
function TrialBanner({ daysLeft, onUpgrade }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const urgent  = daysLeft <= 7;
  const warning = daysLeft <= 14;

  const bg     = urgent  ? "rgba(196,90,90,.12)"   : warning ? "rgba(196,149,58,.1)" : "rgba(46,107,94,.1)";
  const border = urgent  ? "rgba(196,90,90,.3)"    : warning ? "rgba(196,149,58,.35)" : "rgba(46,107,94,.25)";
  const color  = urgent  ? "var(--rose)"           : warning ? "var(--gold2)"        : "var(--sage3)";
  const icon   = urgent  ? "⚠️"                    : warning ? "⏳"                  : "✓";

  const msg = urgent
    ? `Only ${daysLeft} day${daysLeft!==1?"s":""} left — upgrade now to keep your data`
    : warning
    ? `${daysLeft} days left in your free trial`
    : `${daysLeft} days left — enjoying Calla so far?`;

  return (
    <div style={{ background:bg, border:"1.5px solid "+border, borderRadius:12, padding:"11px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
      <p style={{ flex:1, fontSize:15, fontWeight:600, color }}>{msg}</p>
      <button
        onClick={onUpgrade}
        style={{ background:color, color:"var(--cream)", border:"none", borderRadius:8, padding:"6px 14px", fontSize:15, fontWeight:700, flexShrink:0 }}
      >
        Upgrade
      </button>
      {!urgent && (
        <button onClick={()=>setDismissed(true)} style={{ background:"none", border:"none", color:"var(--muted)", display:"flex", padding:4, flexShrink:0 }}>
          <X size={13}/>
        </button>
      )}
    </div>
  );
}

/* ─── Morning Text / Digest Screen ─────────────────────────────────────── */
function DigestScreen({members,onBack}) {
  const [phones,setPhones]=useState({});
  const [sendTime,setSendTime]=useState("07:00");
  const [active,setActive]=useState(false);
  const [saved,setSaved]=useState(false);
  const PRESETS=[["06:30","6:30 AM"],["07:00","7:00 AM"],["07:30","7:30 AM"],["08:00","8:00 AM"]];
  const sampleMsg="Good morning! Today: Soccer Practice 4pm Riverside Field (Liam), Piano Lesson 3:20pm Music Academy (Emma). Tomorrow: Team Meeting 9am.\n\n— Calla Family Calendar";
  const save=function(){
    var nums=Object.values(phones).filter(function(p){return p.trim().length>0;});
    var invalid=nums.filter(function(p){return p.replace(/[\s\-()+]/g,"").length<7;});
    if(invalid.length>0){setDigestError("That number looks short — double-check it and your texts will arrive ☀️");return;}
    if(nums.length===0){setDigestError("Add at least one number so your morning texts have somewhere to go ☀️");return;}
    setSaved(true);setActive(true);setTimeout(function(){setSaved(false);},2000);
  };
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"var(--cream3)",fontWeight:600,fontSize:15,marginBottom:18,padding:0}}><ChevronLeft size={15}/>Back</button>
      <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>Morning Text</h2>
      <p style={{fontSize:15,color:"var(--cream3)",marginBottom:18}}>Get a daily SMS with your family schedule</p>
      <Card style={{marginBottom:14,background:"#111",padding:0,overflow:"hidden"}}>
        <div style={{padding:"10px 14px 6px",display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#34C759"}}/>
          <p style={{fontSize:15,color:"rgba(255,255,255,.4)",fontWeight:600}}>Messages preview</p>
        </div>
        <div style={{padding:"0 14px 16px"}}>
          <div style={{background:"#3A3A3C",borderRadius:"14px 14px 14px 4px",padding:"10px 14px",maxWidth:"80%"}}>
            <p style={{fontSize:15,color:"var(--cream)",lineHeight:1.6,whiteSpace:"pre-line"}}>{sampleMsg}</p>
          </div>
        </div>
      </Card>
      <Card style={{marginBottom:14}}>
        <p style={{fontWeight:700,marginBottom:10}}>Send time</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
          {PRESETS.map(function(p){return(
            <button key={p[0]} onClick={function(){setSendTime(p[0]);}} style={{padding:"7px 14px",borderRadius:99,background:sendTime===p[0]?"var(--sage)":"var(--ink3)",color:sendTime===p[0]?"var(--cream)":"var(--cream3)",fontSize:15,fontWeight:600,border:"none"}}>{p[1]}</button>
          );})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <label style={{fontSize:15,color:"var(--cream3)",fontWeight:600}}>Custom time:</label>
          <input type="time" value={sendTime} onChange={function(e){setSendTime(e.target.value);}} style={{fontSize:15,padding:"6px 10px"}}/>
        </div>
      </Card>
      <Card style={{marginBottom:14}}>
        <p style={{fontWeight:700,marginBottom:12}}>Phone numbers</p>
        {members.slice(0,2).map(function(m){return(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:m.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{m.emoji}</div>
            <input placeholder={m.name+"'s phone"} value={phones[m.id]||""} onChange={function(e){var v=e.target.value;setPhones(function(p){var n={};Object.keys(p).forEach(function(k){n[k]=p[k];});n[m.id]=v;return n;});}} style={{flex:1,fontSize:15}}/>
          </div>
        );})}
        <p style={{fontSize:15,color:"var(--muted)",marginTop:4}}>Powered by Twilio · Standard SMS rates apply</p>
      </Card>
      {digestError&&<div style={{background:"rgba(196,90,90,.1)",border:"1px solid rgba(196,90,90,.25)",borderRadius:12,padding:"12px 14px",marginBottom:12,fontSize:14,color:"var(--rose)",lineHeight:1.6}}>{digestError}</div>}
      <button onClick={save} style={{width:"100%",background:"var(--ink)",color:"var(--cream)",borderRadius:12,padding:14,fontWeight:700,fontSize:15,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {saved?"✓ Saved!":active?"Update Settings":"Turn on Morning Text"}
      </button>
    </div>
  );
}

/* ─── Lists Screen ──────────────────────────────────────────────────────── */
function ListsScreen({members}) {
  const PRESET=[
    {id:"grocery",icon:"🛒",name:"Grocery",color:"var(--sage2)",items:[]},
    {id:"todo",icon:"✅",name:"To Do",color:"var(--sage3)",items:[]},
    {id:"packing",icon:"🎒",name:"Packing",color:"#7C3AED",items:[]},
  ];
  const [lists,setLists]=useState(PRESET);
  const [active,setActive]=useState("grocery");
  const [input,setInput]=useState("");
  const [assignTo,setAssignTo]=useState("");
  const [showDone,setShowDone]=useState(false);
  const [newListName,setNewListName]=useState("");
  const [addingList,setAddingList]=useState(false);
  const inputRef=useRef();
  const cur=lists.find(function(l){return l.id===active;})||lists[0];

  const addItem=function(){
    if(!input.trim())return;
    setLists(function(ls){return ls.map(function(l){return l.id===active?{...l,items:[...l.items,{id:genId(),text:input.trim(),done:false,assignTo:assignTo}]}:l;});});
    setInput("");
    inputRef.current&&inputRef.current.focus();
  };
  const toggle=function(itemId){
    setLists(function(ls){return ls.map(function(l){return l.id===active?{...l,items:l.items.map(function(i){return i.id===itemId?{...i,done:!i.done}:i;})}:l;});});
  };
  const deleteItem=function(itemId){
    setLists(function(ls){return ls.map(function(l){return l.id===active?{...l,items:l.items.filter(function(i){return i.id!==itemId;})}:l;});});
  };
  const clearDone=function(){
    setLists(function(ls){return ls.map(function(l){return l.id===active?{...l,items:l.items.filter(function(i){return !i.done;})}:l;});});
  };
  const addList=function(){
    if(!newListName.trim())return;
    const ICONS=["📋","⭐","🏠","🎯","📚","🏃","🎵","💊"];
    const CLRS=["#DC2626","#D97706","#0891B2","#7C3AED","var(--sage2)","var(--sage2)"];
    const id=genId();
    setLists(function(ls){return [...ls,{id:id,icon:ICONS[Math.floor(Math.random()*ICONS.length)],name:newListName.trim(),color:CLRS[Math.floor(Math.random()*CLRS.length)],items:[]}];});
    setActive(id);setNewListName("");setAddingList(false);
  };
  const pending=cur.items.filter(function(i){return !i.done;});
  const done=cur.items.filter(function(i){return i.done;});
  const gm=function(id){return id?members.find(function(m){return m.id===id;}):null;};

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div><h1 style={{fontSize:22,fontWeight:800}}>Lists</h1><p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>Shared with your whole family</p></div>
        <button onClick={function(){setAddingList(true);}} style={{width:36,height:36,borderRadius:12,background:"var(--sage)",display:"flex",alignItems:"center",justifyContent:"center",border:"none",minHeight:"auto",minWidth:"auto"}}><Plus size={18} color="#fff"/></button>
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12,marginBottom:16,scrollbarWidth:"none"}}>
        {lists.map(function(l){
          const pc=l.items.filter(function(i){return !i.done;}).length;
          return (
            <button key={l.id} onClick={function(){setActive(l.id);}} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:99,border:"2px solid",borderColor:active===l.id?l.color:"var(--border2)",background:active===l.id?l.color+"22":"transparent",color:active===l.id?l.color:"var(--cream3)",fontWeight:active===l.id?700:500,fontSize:15,whiteSpace:"nowrap",flexShrink:0,minHeight:"auto",minWidth:"auto"}}>
              <span style={{fontSize:15}}>{l.icon}</span>{l.name}
              {pc>0&&<div style={{width:18,height:18,borderRadius:"50%",background:active===l.id?l.color:"var(--ink4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:15,fontWeight:800,color:active===l.id?"var(--cream)":"var(--cream3)"}}>{pc}</span></div>}
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:"var(--ink3)",borderRadius:12,padding:"10px 14px",border:"1px solid var(--border2)"}}>
          <span style={{fontSize:18,flexShrink:0}}>{cur.icon}</span>
          <input ref={inputRef} placeholder={"Add to "+cur.name+"..."} value={input} onChange={function(e){setInput(e.target.value.slice(0,100));}} maxLength={100} onKeyDown={function(e){if(e.key==="Enter")addItem();}} style={{background:"transparent",border:"none",padding:0,fontSize:15,flex:1,fontWeight:500}}/>
          {members.length>0&&<select value={assignTo} onChange={function(e){setAssignTo(e.target.value);}} style={{background:"transparent",border:"none",fontSize:15,color:"var(--muted)",padding:0,width:"auto",backgroundImage:"none",minWidth:0}}>
            <option value="">Anyone</option>
            {members.map(function(m){return <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>;})}
          </select>}
        </div>
        <button onClick={addItem} style={{width:46,height:46,borderRadius:12,background:"var(--sage)",display:"flex",alignItems:"center",justifyContent:"center",border:"none",flexShrink:0,minHeight:"auto",minWidth:"auto"}}><Plus size={20} color="#fff"/></button>
      </div>
      {cur.items.length===0&&<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:52,marginBottom:12}}>{cur.icon}</div><p style={{fontWeight:700,fontSize:16,marginBottom:6}}>{cur.name} list is empty</p><p style={{fontSize:15,color:"var(--muted)"}}>Type above and press Enter to add items.</p></div>}
      {pending.length>0&&<div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:12}}>
        {pending.map(function(item){
          const m=gm(item.assignTo);
          return (
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"var(--ink2)",borderRadius:12,border:"1px solid var(--border2)",marginBottom:4}}>
              <div onClick={function(){toggle(item.id);}} style={{width:24,height:24,borderRadius:8,border:"1px solid var(--border2)",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}/>
              <p style={{flex:1,fontSize:15,fontWeight:500,color:"var(--cream)"}}>{item.text}</p>
              {m&&<div style={{display:"flex",alignItems:"center",gap:4,background:m.color+"12",borderRadius:99,padding:"2px 8px",flexShrink:0}}><span style={{fontSize:15}}>{m.emoji}</span><span style={{fontSize:15,fontWeight:600,color:m.color}}>{m.name}</span></div>}
              <button onClick={function(){deleteItem(item.id);}} style={{background:"none",border:"none",color:"var(--border3)",display:"flex",padding:4,minHeight:"auto",minWidth:"auto",flexShrink:0}}><X size={14}/></button>
            </div>
          );
        })}
      </div>}
      {done.length>0&&<div>
        <button onClick={function(){setShowDone(function(s){return !s;});}} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:"var(--muted)",fontSize:15,fontWeight:600,padding:"4px 0",marginBottom:8,minHeight:"auto",minWidth:"auto"}}>
          {showDone?<ChevronUp size={14}/>:<ChevronDown size={14}/>}{done.length} completed
          {showDone&&<button onClick={function(e){e.stopPropagation();clearDone();}} style={{marginLeft:8,background:"rgba(220,80,80,.08)",border:"1px solid #FECACA",borderRadius:6,padding:"2px 8px",fontSize:15,fontWeight:600,color:"var(--red)",minHeight:"auto",minWidth:"auto"}}>Clear</button>}
        </button>
        {showDone&&done.map(function(item){return (
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"var(--ink3)",borderRadius:12,border:"1.5px solid #F3F4F6",marginBottom:4,opacity:.7}}>
            <div onClick={function(){toggle(item.id);}} style={{width:24,height:24,borderRadius:8,border:"2px solid "+cur.color,background:cur.color,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><Check size={12} color="#fff"/></div>
            <p style={{flex:1,fontSize:15,color:"var(--muted)",textDecoration:"line-through"}}>{item.text}</p>
            <button onClick={function(){deleteItem(item.id);}} style={{background:"none",border:"none",color:"var(--border3)",display:"flex",padding:4,minHeight:"auto",minWidth:"auto",flexShrink:0}}><X size={14}/></button>
          </div>
        );})}
      </div>}
      {addingList&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={function(e){if(e.target===e.currentTarget)setAddingList(false);}}>
        <div className="fu" style={{background:"rgba(18,18,22,.97)",borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",width:"100%"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"0 auto 20px"}}/>
          <h3 style={{fontSize:17,fontWeight:800,marginBottom:16}}>New List</h3>
          <div style={{display:"flex",gap:10}}>
            <input autoFocus placeholder="Name this list…" value={newListName} onChange={function(e){setNewListName(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")addList();}} style={{flex:1,fontSize:15}}/>
            <Btn onClick={addList} style={{flexShrink:0,display:"flex",alignItems:"center",gap:6}}><Check size={14}/>Create</Btn>
          </div>
        </div>
      </div>}
    </div>
  );
}


/* ─── Nav ───────────────────────────────────────────────────────────────── */
function Nav({active,setActive,inboxBadge,notifBadge}) {
  var items=[
    {id:"home",  Icon:Home,         label:"Home"},
    {id:"inbox", Icon:Zap,          label:"Catch", badge:inboxBadge},
    {id:"lists", Icon:ShoppingCart, label:"Lists"},
    {id:"notif", Icon:Bell,         label:"Alerts",badge:notifBadge},
    {id:"more",  Icon:Settings,     label:"More"},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(22,22,26,.97)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:"1px solid rgba(240,236,226,.07)",display:"flex",alignItems:"center",padding:"6px 4px",paddingBottom:"calc(10px + env(safe-area-inset-bottom,0px))",zIndex:200,gap:0}}>
      {items.map(function(item){
        var isActive=active===item.id;
        return (
          <button key={item.id} onClick={function(){setActive(item.id);}}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"2px 0",background:"transparent",border:"none",position:"relative"}}
          >
            {/* Wide pill — matches Willow style */}
            <div style={{width:isActive?56:38,height:34,borderRadius:99,background:isActive?"rgba(83,136,122,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"width .3s cubic-bezier(.34,1.56,.64,1),background .22s",position:"relative"}}>
              {isActive&&<div style={{position:"absolute",inset:0,borderRadius:99,border:"1px solid rgba(133,191,177,.25)"}}/>}
              <item.Icon size={21} strokeWidth={isActive?2.1:1.5} color={isActive?"#85bfb1":"rgba(240,236,226,.35)"}/>
              {item.badge>0&&<div style={{position:"absolute",top:0,right:isActive?0:"-2px",background:"#e05050",color:"#fff",borderRadius:99,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,border:"2px solid rgba(22,22,26,.97)",padding:"0 3px"}}>{item.badge>9?"9+":item.badge}</div>}
            </div>
            <span style={{fontSize:15,fontWeight:isActive?700:400,letterSpacing:".01em",color:isActive?"#85bfb1":"rgba(240,236,226,.32)",transition:"color .2s"}}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}


const DN={enabled:true,reminders:["60","1440"],digest:"daily_morning",quietHours:{enabled:true,from:"22:00",to:"07:00"},mutedMembers:[],perEvent:{}};

export default function App() {
  const [user,setUser]           = useState(null);
  const [setupDone,setSetupDone] = useState(false);
  const [tab,setTab]             = useState("home");
  const [globalSel,setGlobalSel] = useState(null);
  const [members,setMembers]     = useState(M0);
  const [events,setEvents]       = useState(E0);
  const [notif,setNotif]         = useState(DN);
  const [toasts,setToasts]       = useState([]);
  const [inboxBadge,setInboxBadge] = useState(2);
  const [showBanner,setShowBanner] = useState(true);
  const [paid,setPaid]           = useState(false);
  const [showPaywall,setShowPaywall] = useState(false);

  // ── Demo: trial day scrubber ──────────────────────────────────────────────
  // In production this would be user.createdAt from your backend
  // Here we let you simulate any trial day (0–65) via a hidden slider
  const [simDay,setSimDay] = useState(0);
  const fakeStart = new Date(Date.now() - simDay * 86400000).toISOString();
  const trial = paid ? null : trialStatus(fakeStart);

  const toast=t=>{const id=genId();setToasts(p=>[...p,{...t,id}]);setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),3000);};

  useEffect(()=>{
    if(!user) return;
    const t=setTimeout(()=>{toast({icon:"📬",title:"New email from Mrs. Johnson",body:"Tap Inbox to review",color:"var(--sage3)"});setInboxBadge(p=>p+1);},7000);
    return()=>clearTimeout(t);
  },[user]);
  useEffect(()=>{
    if(!user) return;
    const t=setTimeout(()=>{const n=events.find(e=>e.date>=todayStr);if(n)toast({icon:"⏰",title:"Reminder: "+n.title,body:n.time,color:n.color});},13000);
    return()=>clearTimeout(t);
  },[user]);

  const addEvent=ev=>{setEvents(p=>[...p,ev]);toast({icon:"✓",title:"Event added",body:ev.title,color:"var(--sage2)"});};
  const delEvent=id=>setEvents(p=>p.filter(e=>e.id!==id));

  // ── Step 1: Auth ──────────────────────────────────────────────────────────
  if(!user) return (
    <><GS/><Auth onLogin={u=>{setUser(u);setTimeout(()=>toast({icon:"👋",title:"Welcome, "+u.name+"! 60 days free.",color:"var(--sage2)"}),400);}}/></>
  );
  // ── Step 2: Co-parent setup ───────────────────────────────────────────────
  if(!setupDone) return (
    <><GS/><Toasts toasts={toasts}/><CoParentSetup user={user} onDone={()=>setSetupDone(true)}/></>
  );
  // ── Step 3: Hard paywall — trial expired ──────────────────────────────────
  if(!paid && trial && trial.expired) return (
    <><GS/><Toasts toasts={toasts}/><PaywallScreen trialLeft={0} onPay={()=>{setPaid(true);toast({icon:"🎉",title:"You're a Calla Family member!",color:"var(--sage2)"});}} hard={true}/></>
  );
  // ── Step 4: Soft paywall overlay ──────────────────────────────────────────
  if(showPaywall) return (
    <><GS/><Toasts toasts={toasts}/><PaywallScreen trialLeft={trial?trial.left:0} onPay={()=>{setPaid(true);setShowPaywall(false);toast({icon:"🎉",title:"You're a Calla Family member!",color:"var(--sage2)"});}} onDismiss={()=>setShowPaywall(false)}/></>
  );

  const go=t=>{setTab(t);if(t==="inbox")setInboxBadge(0);};
  const upc=events.filter(e=>e.date>=todayStr&&e.date<=addDays(todayStr,2)).length;

  const screen=()=>{
    if(tab==="home")    return <DashScreen events={events} members={members} onAdd={addEvent} onDelete={delEvent} showBanner={showBanner} onBannerDismiss={()=>setShowBanner(false)} initialSel={globalSel} onClearSel={()=>setGlobalSel(null)}/>;
    if(tab==="inbox")   return <InboxScreen members={members} onAdd={addEvent}/>;
    if(tab==="lists")   return <ListsScreen members={members}/>;
    if(tab==="members") return <MembersScreen members={members} setMembers={setMembers} events={events}/>;
    if(tab==="notif")   return <NotifScreen events={events} members={members} onSelectEvent={ev=>{setGlobalSel(ev);setTab("home");}}/>;
    if(tab==="more")    return <MoreScreen members={members} setMembers={setMembers} events={events} user={user} paid={paid} trialLeft={trial?trial.left:null} onUpgrade={()=>setShowPaywall(true)} notifSettings={notif} setNotifSettings={setNotif} onSignOut={()=>{setUser(null);setSetupDone(false);setTab("home");setEvents(E0);setMembers(M0);setPaid(false);setShowPaywall(false);toast({icon:"👋",title:"Signed out",color:"var(--cream3)"});}}/>;
  };

  return (
    <>
      <GS/>
      <Toasts toasts={toasts}/>
      <div style={{minHeight:"100vh",paddingBottom:90,background:"var(--ink)"}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"20px 18px"}}>

          {/* ── Header ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,position:"relative"}}>
            {/* Logo */}
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:36,height:36,background:"linear-gradient(145deg,var(--sage),var(--sage2))",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(58,100,89,.4)",flexShrink:0}}>
                <span style={{fontSize:17}}>🌸</span>
              </div>
              <div>
                <p style={{fontWeight:700,fontSize:17,letterSpacing:"-.02em",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1}}>{user.family}</p>
                <p style={{fontSize:15,color:"var(--cream3)",fontWeight:500,marginTop:1,letterSpacing:".02em"}}>Family Calendar</p>
              </div>
            </div>
            {/* Right: avatars + badge + bell */}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {members.slice(0,3).map(m=>(
                <div key={m.id} onClick={()=>go("more")} title={m.name}
                  style={{width:28,height:28,borderRadius:"50%",background:m.color+"18",border:"1.5px solid "+m.color+"35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",overflow:"hidden",flexShrink:0,transition:"transform .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                >
                  {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={m.name}/>:m.emoji}
                </div>
              ))}
              {paid
                ? <div style={{background:"rgba(83,136,122,.15)",border:"1px solid rgba(83,136,122,.3)",borderRadius:99,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}>
                    <Check size={10} color="var(--sage3)"/>
                    <span style={{fontSize:15,fontWeight:700,color:"var(--sage3)"}}>Family</span>
                  </div>
                : <button onClick={()=>setShowPaywall(true)} style={{background:"linear-gradient(135deg,var(--sage),var(--sage2))",color:"var(--cream)",borderRadius:99,padding:"5px 12px",fontSize:15,fontWeight:700,border:"none",boxShadow:"0 2px 12px rgba(58,100,89,.4)"}}>
                    {trial&&trial.left}d free
                  </button>
              }
              <button onClick={()=>go("notif")} style={{width:32,height:32,background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
                <Bell size={15} color="var(--cream3)"/>
                {upc>0&&<div style={{position:"absolute",top:-3,right:-3,background:"var(--red)",color:"var(--cream)",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,border:"2px solid var(--ink)"}}>{upc}</div>}
              </button>
            </div>
          </div>

          {/* Trial countdown banner */}
          {!paid && trial && trial.left <= 30 && (
            <TrialBanner daysLeft={trial.left} onUpgrade={()=>setShowPaywall(true)}/>
          )}

          {screen()}

          {/* ── Demo scrubber — hidden after subscription ── */}
          {!paid&&(
          <div style={{marginTop:36,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:16,padding:"18px"}}>
            <p style={{fontSize:15,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>🛠 Demo: Simulate Trial Day</p>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
              <input type="range" min={0} max={65} value={simDay} onChange={e=>setSimDay(Number(e.target.value))} style={{flex:1}}/>
              <div style={{background:"var(--sage)",color:"var(--cream)",borderRadius:8,padding:"4px 12px",fontSize:15,fontWeight:700,flexShrink:0}}>Day {simDay}</div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {[[0,"Day 1"],[29,"Day 29"],[30,"Day 30 ⚠"],[45,"Day 45 🔴"],[59,"Day 59"],[60,"Day 60 🚫"]].map(([d,l])=>(
                <button key={d} onClick={()=>setSimDay(d)} style={{background:simDay===d?"var(--sage)":"var(--ink3)",color:simDay===d?"var(--cream)":"var(--cream3)",borderRadius:8,padding:"5px 10px",fontSize:15,fontWeight:600,border:"1px solid var(--border2)"}}>{l}</button>
              ))}
            </div>
            <p style={{fontSize:15,color:"var(--cream3)",marginTop:10}}>
              {trial&&trial.expired?"Trial expired — hard paywall":trial&&trial.left<=7?"Urgent — "+trial.left+"d left":trial&&trial.left<=30?"Soft banner — "+trial.left+"d left":"No banner — "+trial.left+"d remaining"}
            </p>
          </div>
          )}

        </div>
      </div>
      <Nav active={tab} setActive={go} inboxBadge={inboxBadge} notifBadge={upc&&notif.enabled?upc:0}/>
    </>
  );
}
