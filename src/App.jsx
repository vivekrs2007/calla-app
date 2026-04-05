import { useState, useEffect, useRef, Fragment } from "react";
import { supabase, SUPABASE_KEY } from "./supabase.js";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY        || "",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN    || "calla-notifications.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID     || "calla-notifications",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "calla-notifications.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID      || "537577069849",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID         || "1:537577069849:web:994097c1c8bb677d0ab988"
};

// Initialize Firebase only on web, not on iOS/Capacitor
let firebaseApp = null;
let messaging = null;
const isCapacitor = typeof window !== "undefined" && window.location.protocol === "capacitor:";

if (!isCapacitor && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  firebaseApp = initializeApp(firebaseConfig);
  messaging = getMessaging(firebaseApp);
} else if (!isCapacitor) {
  firebaseApp = initializeApp(firebaseConfig);
  messaging = null;
}

import {
  Home, Inbox, Users, Bell, Settings, Plus, Mic, MicOff, Search,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  MapPin, Clock, Repeat, Package, DollarSign, Trash2,
  X, Check, AlertTriangle, Zap, Sun, Sunset, Moon,
  Copy, Link, LogOut, Share2, Folder, FileText, Calendar,
  ShoppingCart, MessageCircle, Send, List, Star, Compass, Locate
, ExternalLink } from "lucide-react";


/* ─── Scroll Lock (iOS-safe) ────────────────────────────────────────────────
   Uses position:fixed + top offset technique — the only fully reliable method
   for WKWebView. overflow:hidden alone does NOT stop iOS momentum scroll.    */
var _scrollLockCount = 0;

function lockBodyScroll() {
  _scrollLockCount++;
  if (_scrollLockCount > 1) return;
  var scrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = "fixed";
  document.body.style.top      = "-" + scrollY + "px";
  document.body.style.left     = "0";
  document.body.style.right    = "0";
  document.body.style.width    = "100%";
  document.body.setAttribute("data-scroll-y", String(scrollY));
}

function unlockBodyScroll() {
  _scrollLockCount = Math.max(0, _scrollLockCount - 1);
  if (_scrollLockCount > 0) return;
  var scrollY = parseInt(document.body.getAttribute("data-scroll-y") || "0", 10);
  document.body.style.position = "";
  document.body.style.top      = "";
  document.body.style.left     = "";
  document.body.style.right    = "";
  document.body.style.width    = "";
  document.body.removeAttribute("data-scroll-y");
  window.scrollTo(0, scrollY);
}

/* Hook: call inside any modal component */
function useScrollLock(isOpen) {
  useEffect(function() {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return function() {
      if (isOpen) unlockBodyScroll();
    };
  }, [isOpen]);
}

/* ─── Global CSS ────────────────────────────────────────────────────────── */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      /* ── Warm Linen Theme ── */
      --ink:   #f0ebe0;
      --ink2:  #eae4d8;
      --ink3:  #e3ddd0;
      --ink4:  #dad4c8;
      --ink5:  #d0c9bc;
      --cream: #1a2e1a;
      --cream2:#2d4a2d;
      --cream3:#5a6e5a;
      --sage:  #1a3a2a;
      --sage2: #2d6a45;
      --sage3: #4a9a65;
      --sage4: rgba(45,90,61,.1);
      --gold:  #a07820;
      --gold2: #c49a30;
      --gold3: #e8c060;
      --amber: #b86820;
      --rose:  #a83838;
      --red:   #c84040;
      --border:rgba(45,60,45,.08);
      --border2:rgba(45,60,45,.13);
      --border3:rgba(45,60,45,.22);
      --muted: rgba(45,60,45,.4);
      --muted2:rgba(45,60,45,.65);
      /* legacy aliases */
      --sage-light:rgba(45,90,61,.1);
      --sage-mid:  rgba(45,90,61,.2);
      --terra:     #8b5a2a;
      --terra-light:rgba(139,90,42,.1);
      /* iOS Safe Area Tokens (requires viewport-fit=cover in index.html) */
      --safe-top:    env(safe-area-inset-top,    0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      --safe-left:   env(safe-area-inset-left,   0px);
      --safe-right:  env(safe-area-inset-right,  0px);
    }
    body{
      background:var(--ink2);
      color:var(--cream);
      font-family:'DM Sans','Helvetica Neue',sans-serif;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      min-height:100dvh;
      overscroll-behavior:none;
      -webkit-text-size-adjust:100%;
      text-size-adjust:100%;
    }
    /* iOS scroll lock — applied by lockBodyScroll() */
    body[data-scroll-y]{
      overflow:hidden;
    }
    /* ── Inputs ── */
    input,textarea,select{
      background:#fff;
      border:1.5px solid var(--border2);
      color:var(--cream);
      color-scheme:light;
      font-family:'DM Sans','Helvetica Neue',sans-serif;
      border-radius:10px;
      padding:12px 14px;
      font-size:16px;
      outline:none;
      width:100%;
      transition:border-color .18s,background .18s,box-shadow .18s;
      box-shadow:0 1px 3px rgba(45,60,45,.06);
    }
    input::placeholder,textarea::placeholder{color:var(--cream3)}
    input:focus,textarea:focus,select:focus{
      border-color:var(--sage2);
      background:#fff;
      box-shadow:0 0 0 3px rgba(61,122,82,.1);
    }
    select option{background:#fff;color:var(--cream)}
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
    .tap-row:active{background:rgba(45,60,45,.05) !important}
    /* ── Scrollbar ── */
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border3);border-radius:3px}
    /* Premium selection color */
    ::selection{background:rgba(61,122,82,.25);color:var(--cream)}
    /* Smooth tap highlight removal on mobile */
    *{-webkit-tap-highlight-color:transparent}
    /* ── Animations ── */
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
    @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:none;opacity:1}}
    .sheet-top{animation:slideDown .38s cubic-bezier(.32,1,.4,1) forwards}
    @keyframes backdropIn{from{opacity:0}to{opacity:1}}
    @keyframes screenEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
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
    @keyframes todayGlow{0%,100%{box-shadow:0 0 0 0 rgba(45,90,61,.0)}50%{box-shadow:0 0 8px 2px rgba(45,90,61,.25)}}
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
    .sheet-scroll{overflow-y:scroll;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;will-change:transform}
    /* ── Glass card used by sheets ── */
    .glass{
      background:rgba(245,240,232,.95);
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
    .nav-label{font-size:10px;font-weight:600;letter-spacing:.01em;margin-top:2px;color:inherit}
    /* ── Range slider ── */
    input[type=range]{
      -webkit-appearance:none;
      background:var(--ink4);
      border-radius:4px;
      height:4px;
      border:none;
      padding:0;
    }
    input[type=range]::-webkit-slider-thumb{
      -webkit-appearance:none;
      width:18px;height:18px;
      border-radius:50%;
      background:#fff;
      box-shadow:0 2px 8px rgba(0,0,0,.15);
      border:2px solid var(--sage2);
    }
  `}</style>
);

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const toDateStr = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const todayStr = toDateStr(new Date());
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WDAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const fd = s => { const d = new Date(s+"T12:00:00"); return MONTHS[d.getMonth()]+" "+d.getDate(); };
const addDays = (s,n) => { const d = new Date(s+"T12:00:00"); d.setDate(d.getDate()+n); return toDateStr(d); };
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
  {id:"m1",name:"Mom", color:"#2d5a3d",emoji:"👩"},
  {id:"m2",name:"Dad", color:"#3d7a52",emoji:"👨"},
  {id:"m3",name:"Emma",color:"#7C3AED",emoji:"👧"},
  {id:"m4",name:"Liam",color:"#a07820",emoji:"👦"},
];
const COLORS = ["var(--sage2)","var(--sage2)","#7C3AED","#D97706","#DC2626","#0891B2"];
const EMOJIS = ["👩‍🦰","👨‍💼","👧🏼","🧒🏽","👩🏽","👨🏿","👧🏻","🧒🏾","👩‍🍼","🧔","👩🏾‍💼","👨‍🍳"];

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
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,background:bg,color,fontSize:15,fontWeight:600,border:"1.5px solid var(--border2)",...style}}>{children}</span>
);
const Toggle = ({on,onChange}) => (
  <div onClick={onChange} style={{width:46,height:26,borderRadius:13,background:on?"var(--sage2)":"var(--ink4)",position:"relative",cursor:"pointer",transition:"background .22s",flexShrink:0,border:"1px solid var(--border2)",boxShadow:"inset 0 1px 3px rgba(0,0,0,.1)"}}>
    <div style={{position:"absolute",top:3,left:on?22:3,width:20,height:20,borderRadius:"50%",background:on?"#fff":"var(--cream3)",transition:"left .22s",boxShadow:"0 2px 6px rgba(0,0,0,.4)"}}/>
  </div>
);
const Card = ({children,style={},...p}) => (
  <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",padding:20,boxShadow:"0 1px 4px rgba(45,60,45,.06)",...style}}{...p}>{children}</div>
);
const Btn = ({children,v="primary",style={},...p}) => {
  const S={
    primary:{background:"var(--sage)",color:"#fff",padding:"13px 22px",borderRadius:12,fontWeight:700,fontSize:15,boxShadow:"0 4px 16px rgba(45,90,61,.3)"},
    ghost:{background:"transparent",color:"var(--cream2)",padding:"11px 18px",borderRadius:12,fontWeight:500,fontSize:15,border:"1.5px solid var(--border2)"},
    danger:{background:"rgba(168,56,56,.08)",color:"var(--rose)",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:15,border:"1px solid rgba(168,56,56,.2)"},
    icon:{background:"#fff",color:"var(--cream2)",padding:10,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--border2)",boxShadow:"0 1px 3px rgba(0,0,0,.06)"},
  };
  return <button style={{...S[v],...style}}{...p}>{children}</button>;
};

/* ─── Toast ─────────────────────────────────────────────────────────────── */
/* ─── OnboardingScreen ───────────────────────────────────────────────────── */
function OnboardingScreen({onDone}) {
  var [slide,setSlide] = useState(0);
  var [startX,setStartX] = useState(0);
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var now = new Date();
  var calMonth = months[now.getMonth()] + " " + now.getFullYear();

  function next() { if(slide < 2) setSlide(slide+1); else onDone(); }
  function prev() { if(slide > 0) setSlide(slide-1); }

  var trackStyle = {
    display:"flex",
    transition:"transform .42s cubic-bezier(.77,0,.18,1)",
    transform:"translateX(-" + (slide*100) + "%)",
    flex:1,
    minHeight:0,
  };

  var shell = {
    position:"fixed",top:0,left:0,right:0,bottom:0,
    zIndex:9999,background:"#0c1e14",
    display:"flex",flexDirection:"column",
    fontFamily:"-apple-system,'Helvetica Neue',sans-serif",
    WebkitFontSmoothing:"antialiased",
    overflow:"hidden",
  };

  var txtBlock = {
    flexShrink:0,
    padding:"calc(env(safe-area-inset-top,44px) + 8px) 18px 0",
    display:"flex",flexDirection:"column",gap:5,
  };

  var cntBlock = {
    flex:1,minHeight:0,
    padding:"10px 16px 0",
    display:"flex",flexDirection:"column",justifyContent:"center",
  };

  var bot = {
    flexShrink:0,
    padding:"8px 16px calc(env(safe-area-inset-bottom,20px) + 10px)",
    display:"flex",flexDirection:"column",alignItems:"center",gap:8,
  };

  var logo = {fontSize:11,fontWeight:700,color:"#c9a84c",fontFamily:"'Playfair Display',Georgia,serif",letterSpacing:".01em"};
  var eyebrow = {fontSize:10,fontWeight:600,color:"rgba(245,240,232,.45)",letterSpacing:".12em",textTransform:"uppercase"};
  var hed = {fontSize:26,fontWeight:900,lineHeight:1.1,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",letterSpacing:"-.5px"};
  var sub = {fontSize:14,lineHeight:1.55,color:"rgba(245,240,232,.6)",fontWeight:400};
  var cta = {width:"100%",padding:14,background:"#f5f0e8",color:"#0f2318",border:"none",borderRadius:100,fontSize:14,fontWeight:700,fontFamily:"-apple-system,sans-serif",cursor:"pointer",letterSpacing:"-.1px"};
  var skipBtn = {background:"none",border:"none",fontSize:11,color:"rgba(245,240,232,.3)",cursor:"pointer",padding:"2px 0"};
  var stepTxt = {fontSize:11,color:"rgba(245,240,232,.3)"};

  var slides = [
    {bg:"linear-gradient(165deg,#1c3d2a 0%,#0f2318 55%,#0c1e14 100%)"},
    {bg:"linear-gradient(170deg,#0d2018 0%,#112a1c 55%,#0f2318 100%)"},
    {bg:"radial-gradient(ellipse 110% 55% at 55% 15%,#3a7a32 0%,#1a4a22 35%,#0d2016 65%,#091410 100%)"},
  ];

  var ctaLabels = ["See how it works →","That's the promise →","Create my family's calendar"];

  return (
    <div style={shell}
      onTouchStart={function(e){setStartX(e.touches[0].clientX);}}
      onTouchEnd={function(e){
        var dx=e.changedTouches[0].clientX-startX;
        if(Math.abs(dx)<44) return;
        if(dx<0) next(); else prev();
      }}
    >
      <div style={trackStyle}>

        {/* ── SLIDE 1: Calendar ── */}
        <div style={{minWidth:"100%",display:"flex",flexDirection:"column",overflow:"hidden",background:slides[0].bg}}>
          <div style={txtBlock}>
            <span style={logo}>{"🌿 Calla"}</span>
            <span style={eyebrow}>Family Calendar</span>
            <p style={hed}>Never miss a game.<br/><em style={{fontStyle:"italic"}}>Never double-book</em> again.</p>
            <p style={sub}>One shared calendar that catches conflicts before your week falls apart.</p>
          </div>
          <div style={cntBlock}>
            <div style={{background:"#fff",borderRadius:12,padding:"8px 7px 7px",display:"flex",flexDirection:"column",gap:4,overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,marginBottom:2}}>
                <span style={{fontSize:10,fontWeight:700,color:"#1a3a2a",fontFamily:"'Playfair Display',Georgia,serif"}}>{calMonth}</span>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#2d7a4f",display:"inline-block"}}></span><span style={{fontSize:7,color:"#777"}}>Soccer</span>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#9b59b6",display:"inline-block"}}></span><span style={{fontSize:7,color:"#777"}}>Piano</span>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#e67e22",display:"inline-block"}}></span><span style={{fontSize:7,color:"#777"}}>School</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
                {["Mo","Tu","We","Th","Fr","Sa","Su"].map(function(d){return <div key={d} style={{fontSize:6,color:"#bbb",textAlign:"center",textTransform:"uppercase",fontWeight:700}}>{d}</div>;})}
                {[null,null,null,null,null].map(function(_,i){return <div key={"e"+i}></div>;})}
                {[
                  {d:1,ev:[{c:"#2d7a4f",t:"U8"}]},{d:2},{d:3},{d:4,ev:[{c:"#9b59b6",t:"Piano"}]},
                  {d:5},{d:6},{d:7},{d:8,ev:[{c:"#2d7a4f",t:"Train"}]},{d:9,ev:[{c:"#e67e22",t:"Fair"}]},
                  {d:10},{d:11,ev:[{c:"#9b59b6",t:"Piano"}]},{d:12},
                  {d:13,today:true},{d:14},
                  {d:15,cf:true,ev:[{c:"#2d7a4f",t:"Final"},{c:"#e74c3c",t:"Piano ⚡"}]},{d:16},
                  {d:17},{d:18,ev:[{c:"#9b59b6",t:"Piano"}]},{d:19},{d:20,ev:[{c:"#e67e22",t:"P.Eve"}]},{d:21},
                  {d:22,cf:true,ev:[{c:"#2d7a4f",t:"Train"},{c:"#e74c3c",t:"Trip ⚡"}]},{d:23},
                  {d:24},{d:25,ev:[{c:"#9b59b6",t:"Piano"}]},{d:26},{d:27},{d:28},{d:29,ev:[{c:"#2d7a4f",t:"U8"}]},{d:30},
                ].map(function(day){
                  return (
                    <div key={day.d} style={{display:"flex",flexDirection:"column",gap:1,padding:1,background:day.cf?"rgba(231,76,60,.07)":"transparent",borderRadius:day.cf?3:0}}>
                      {day.today
                        ? <span style={{fontSize:5,background:"#1a3a2a",color:"#fff",borderRadius:"50%",width:12,height:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>{day.d}</span>
                        : <span style={{fontSize:7,color:"#444",fontWeight:600,textAlign:"center",lineHeight:"12px"}}>{day.d}</span>
                      }
                      {(day.ev||[]).map(function(ev,i){return <div key={i} style={{fontSize:5,borderRadius:2,padding:"1px 2px",color:"#fff",overflow:"hidden",whiteSpace:"nowrap",lineHeight:1.3,background:ev.c}}>{ev.t}</div>;})}
                    </div>
                  );
                })}
              </div>
              <div style={{background:"rgba(231,76,60,.1)",border:"1px solid rgba(231,76,60,.25)",borderRadius:6,padding:"4px 6px",fontSize:8,color:"#c0392b",fontWeight:700,textAlign:"center",flexShrink:0}}>{"⚡ 2 conflicts detected — tap to resolve"}</div>
            </div>
          </div>
          <div style={bot}>
            <div style={{display:"flex",justifyContent:"space-between",width:"100%"}}><button style={skipBtn} onClick={onDone}>Skip</button><span style={stepTxt}>1 of 3</span></div>
            <div style={{display:"flex",gap:5}}>{[0,1,2].map(function(i){return <div key={i} style={{width:i===0?"14px":"5px",height:5,borderRadius:i===0?3:"50%",background:i===slide?"#fff":"rgba(255,255,255,.2)",transition:"all .25s"}}></div>;})}</div>
            <button style={cta} onClick={next}>{ctaLabels[0]}</button>
          </div>
        </div>

        {/* ── SLIDE 2: Forward / Snap / Speak ── */}
        <div style={{minWidth:"100%",display:"flex",flexDirection:"column",overflow:"hidden",background:slides[1].bg}}>
          <div style={txtBlock}>
            <span style={logo}>{"🌿 Calla"}</span>
            <span style={eyebrow}>Add events, 3 ways</span>
            <p style={hed}>Forward it. Snap it.<br/>Speak it. Done.</p>
            <p style={sub}>School emails, flyers, voice — Calla catches it all. Conflicts spotted instantly. Both parents notified.</p>
          </div>
          <div style={cntBlock}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
              {[["✉️","#1e3a5a","Forward email","Any school email → events"],["📷","#1a3a2a","Snap a flyer","Photo → events instantly"],["🎤","#2a1a3a","Just say it","Voice to calendar"]].map(function(mt){return (
                <div key={mt[2]} style={{borderRadius:11,padding:"10px 8px",display:"flex",flexDirection:"column",gap:5,background:mt[1]}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{mt[0]}</div>
                  <p style={{fontSize:11,fontWeight:700,color:"#f5f0e8",lineHeight:1.2}}>{mt[2]}</p>
                  <p style={{fontSize:9,color:"rgba(245,240,232,.48)",lineHeight:1.35}}>{mt[3]}</p>
                </div>
              );})}
            </div>
            <div style={{background:"rgba(160,80,20,.25)",border:"1px solid rgba(220,110,30,.35)",borderRadius:10,padding:"9px 10px",display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(200,90,20,.3)",border:"1px solid rgba(230,110,30,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{"⚡"}</div>
              <div><p style={{fontSize:10,fontWeight:700,color:"#f5a030",marginBottom:1}}>Conflict detected · 30 min gap</p><p style={{fontSize:9,color:"rgba(245,180,100,.6)"}}>Soccer &amp; Piano overlap Saturday</p></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
              {[["👩‍🦰","Mom notified"],["👨‍🦱","Dad notified"]].map(function(n){return(
                <div key={n[1]} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,padding:8,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:16,flexShrink:0}}>{n[0]}</span>
                  <div><p style={{fontSize:9,color:"rgba(245,240,232,.7)",fontWeight:600}}>{n[1]}</p><p style={{fontSize:9,color:"#52b788",fontWeight:700,marginTop:2}}>{"✓ Delivered"}</p></div>
                </div>
              );})}
            </div>
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,padding:"8px 10px",display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:13}}>{"🔒"}</span>
              <p style={{fontSize:9,color:"rgba(245,240,232,.35)"}}>Emails deleted immediately after — nothing stored on our servers</p>
            </div>
          </div>
          <div style={bot}>
            <div style={{display:"flex",justifyContent:"space-between",width:"100%"}}><button style={skipBtn} onClick={onDone}>Skip</button><span style={stepTxt}>2 of 3</span></div>
            <div style={{display:"flex",gap:5}}>{[0,1,2].map(function(i){return <div key={i} style={{width:i===1?"14px":"5px",height:5,borderRadius:i===1?3:"50%",background:i===slide?"#fff":"rgba(255,255,255,.2)",transition:"all .25s"}}></div>;})}</div>
            <button style={cta} onClick={next}>{ctaLabels[1]}</button>
          </div>
        </div>

        {/* ── SLIDE 3: Family + Pricing ── */}
        <div style={{minWidth:"100%",display:"flex",flexDirection:"column",overflow:"hidden",background:slides[2].bg}}>
          <div style={txtBlock}>
            <span style={{...logo,color:"#fff"}}>Calla</span>
            <span style={eyebrow}>Start free today</span>
            <p style={{...hed,color:"#e8d870"}}>Ready to get<br/>your brain back?</p>
            <p style={sub}>No credit card needed. Cancel anytime.</p>
          </div>
          <div style={cntBlock}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
              <div style={{background:"rgba(255,255,255,.09)",border:"1px solid rgba(255,255,255,.14)",borderRadius:12,padding:"9px 8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(255,255,255,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,flexShrink:0}}>{"🧭"}</div>
                  <span style={{fontSize:10,fontWeight:700,color:"#f5f0e8"}}>Discover</span>
                </div>
                {[["rgba(82,183,100,.3)","🌍","Local Activities"],["rgba(200,120,40,.3)","⚽","Soccer U8"],["rgba(200,70,70,.3)","🎹","Piano"],["rgba(100,150,200,.3)","🏊","Swim class"]].map(function(r){return(
                  <div key={r[2]} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <div style={{width:15,height:15,borderRadius:"50%",background:r[0],flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>{r[1]}</div>
                    <span style={{fontSize:9,color:"rgba(245,240,232,.8)",fontWeight:500}}>{r[2]}</span>
                  </div>
                );})}
              </div>
              <div style={{background:"rgba(255,255,255,.09)",border:"1px solid rgba(255,255,255,.14)",borderRadius:12,padding:"9px 8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(255,255,255,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,flexShrink:0}}>{"☀️"}</div>
                  <span style={{fontSize:10,fontWeight:700,color:"#f5f0e8"}}>Morning Brief</span>
                </div>
                <div style={{background:"rgba(255,255,255,.07)",borderRadius:"6px 6px 6px 0",padding:6,marginBottom:5,display:"flex",gap:5}}>
                  <div style={{width:15,height:15,borderRadius:"50%",background:"linear-gradient(135deg,#4a9a6a,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,flexShrink:0,marginTop:1}}>{"😊"}</div>
                  <p style={{fontSize:8,color:"rgba(245,240,232,.72)",lineHeight:1.4}}>Soccer Sat 10am. Piano conflicts — reschedule?</p>
                </div>
                <div style={{background:"rgba(220,120,40,.18)",border:"1px solid rgba(220,120,40,.3)",borderRadius:5,padding:"4px 6px",fontSize:8,fontWeight:700,color:"#f59b42",textAlign:"center"}}>{"⚡ Conflict warning"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              {[["👩","linear-gradient(135deg,#f4a56a,#e07b3a)","Mom"],["👨","linear-gradient(135deg,#9ab4f0,#6a8de0)","Dad"],["🧒","linear-gradient(135deg,#f4d06a,#e0aa3a)","Emma"],["🧒🏾","linear-gradient(135deg,#6af4c8,#3ae0a0)","Liam"]].map(function(av){return(
                <div key={av[2]} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:40,height:40,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,background:av[1]}}>{av[0]}</div>
                  <span style={{fontSize:8,color:"rgba(245,240,232,.55)"}}>{av[2]}</span>
                </div>
              );})}
            </div>
            <div>
              {[["60 days completely free"],["Both parents · all kids included"],["$19.99/year — less than a coffee a month"]].map(function(bl){return(
                <div key={bl[0]} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.06)",fontSize:11,color:"rgba(245,240,232,.82)"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#c9a84c",flexShrink:0}}></div>{bl[0]}
                </div>
              );})}
            </div>
          </div>
          <div style={bot}>
            <div style={{display:"flex",gap:5}}>{[0,1,2].map(function(i){return <div key={i} style={{width:i===2?"14px":"5px",height:5,borderRadius:i===2?3:"50%",background:i===slide?"#fff":"rgba(255,255,255,.2)",transition:"all .25s"}}></div>;})}</div>
            <button style={cta} onClick={onDone}>{ctaLabels[2]}</button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── PasswordChangeFields ───────────────────────────────────────────────── */
function PasswordChangeFields({toast}) {
  var [newPass,setNewPass]=useState("");
  var [confirmPass,setConfirmPass]=useState("");
  var [saving,setSaving]=useState(false);
  var [err,setErr]=useState("");
  function save(){
    setErr("");
    if(newPass.length<8){setErr("Password must be at least 8 characters.");return;}
    if(newPass!==confirmPass){setErr("Passwords don't match.");return;}
    setSaving(true);
    supabase.auth.updateUser({password:newPass}).then(function(res){
      setSaving(false);
      if(res.error){setErr("Could not update password. Try again.");}
      else{toast({icon:"✓",title:"Password updated",color:"var(--sage2)"});setNewPass("");setConfirmPass("");}
    }).catch(function(){setSaving(false);setErr("Network error. Please try again.");});
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid var(--border2)",padding:"12px 14px",boxShadow:"0 1px 3px rgba(45,60,45,.05)"}}>
        <input type="password" value={newPass} placeholder="New password (8+ characters)" onChange={function(e){setNewPass(e.target.value);setErr("");}} style={{width:"100%",background:"transparent",border:"none",padding:0,fontSize:15,color:"var(--cream)",fontWeight:500,boxShadow:"none"}}/>
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid var(--border2)",padding:"12px 14px",boxShadow:"0 1px 3px rgba(45,60,45,.05)"}}>
        <input type="password" value={confirmPass} placeholder="Confirm new password" onChange={function(e){setConfirmPass(e.target.value);setErr("");}} style={{width:"100%",background:"transparent",border:"none",padding:0,fontSize:15,color:"var(--cream)",fontWeight:500,boxShadow:"none"}}/>
      </div>
      {err&&<p style={{fontSize:13,color:"var(--rose)",fontWeight:600,paddingLeft:2}}>{err}</p>}
      {(newPass||confirmPass)&&<button onClick={save} style={{background:"var(--sage)",color:"#fff",border:"none",borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:700,width:"100%"}}>{saving?"Saving...":"Update Password"}</button>}
    </div>
  );
}

/* ─── AccountField ──────────────────────────────────────────────────────── */
function AccountField({value,placeholder,type="text",onSave}) {
  const [val,setVal]=useState(value);
  const [editing,setEditing]=useState(false);
  const [saving,setSaving]=useState(false);
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid var(--border2)",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 3px rgba(45,60,45,.05)",marginBottom:0}}>
      <input
        type={type}
        value={val}
        placeholder={placeholder}
        onChange={function(e){setVal(e.target.value);setEditing(true);}}
        style={{flex:1,background:"transparent",border:"none",padding:0,fontSize:15,color:"var(--cream)",fontWeight:500,boxShadow:"none"}}
      />
      {editing&&(
        <button onClick={function(){
          setSaving(true);
          onSave(val);
          setTimeout(function(){setSaving(false);setEditing(false);},800);
        }} style={{background:"var(--sage)",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:700,flexShrink:0}}>
          {saving?"Saving...":"Save"}
        </button>
      )}
      {!editing&&<span style={{fontSize:12,color:"var(--cream3)"}}>Tap to edit</span>}
    </div>
  );
}

const Toasts = ({toasts}) => (
  <div style={{position:"fixed",top:16,left:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:10,pointerEvents:"none"}}>
    {toasts.map(t=>(
      <div key={t.id} className="toast-enter" style={{background:"#f0ebe2",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid var(--border2)",borderLeft:"3px solid "+(t.color||"var(--sage2)"),borderRadius:16,padding:"13px 18px",boxShadow:"0 8px 32px rgba(45,60,45,.15)",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
        <div><p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>{t.title}</p>{t.body&&<p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{t.body}</p>}</div>
      </div>
    ))}
  </div>
);

/* ─── Auth / Onboarding ─────────────────────────────────────────────────── */
const ONBOARD_SLIDES = [
  {
    bg:        "linear-gradient(160deg,#1a2e1a 0%,#2d5a3d 100%)",
    textColor: "#f5f0e8",
    eyebrow:   "FAMILY CALENDAR APP",
    headline:  "Never miss a game.\nNever double-book again.",
    sub:       "One shared family calendar that catches conflicts before your week falls apart. Forward emails, snap flyers, or just say it.",
    cta:       "See how it works →",
    visual:    { type: "chaos-pills" },
  },
  {
    bg:        "linear-gradient(160deg,#1a2e1a 0%,#2d4a20 100%)",
    textColor: "#f5f0e8",
    eyebrow:   "THREE WAYS TO ADD",
    headline:  "Forward it.\nSnap it. Say it.",
    sub:       "School emails, paper flyers, and voice notes become real calendar events in seconds.",
    cta:       "Show me a real example →",
    visual:    { type: "email-delete" },
  },
  {
    bg:        "linear-gradient(160deg,#1a2e1a 0%,#1a3a2a 100%)",
    textColor: "#f5f0e8",
    eyebrow:   "DISCOVER & MORNING BRIEF",
    headline:  "Find what's nearby.\nKnow what's next.",
    sub:       "Discover activities near you and wake up with one simple summary of your whole day.",
    cta:       "Show me my mornings →",
    visual:    { type: "superpowers" },
  },
  {
    bg:        "linear-gradient(160deg,#1a2e1a 0%,#2d5a3d 100%)",
    textColor: "#f5f0e8",
    eyebrow:   "FREE FOR 60 DAYS",
    headline:  "Start free.\nStay coordinated.",
    sub:       "Both parents. All kids. One calm plan for the week ahead.",
    cta:       "Create our family calendar →",
    final:     true,
    visual:    { type: "trust" },
  },
];

function Auth({onLogin}) {
  const [slide,setSlide]=useState(0),[showForm,setShowForm]=useState(true),[mode,setMode]=useState("signup"),[name,setName]=useState(""),[family,setFamily]=useState(""),[email,setEmail]=useState(""),[pass,setPass]=useState(""),[loading,setLoading]=useState(false),[showPass,setShowPass]=useState(false),[authError,setAuthError]=useState("");

  // Clear error when switching tabs
  function switchMode(m){setMode(m);setAuthError("");}

  const go=()=>{
    setAuthError("");
    // Validate all fields
    if(mode==="signup"){
      if(!name.trim()){setAuthError("Please enter your name.");return;}
      if(!family.trim()){setAuthError("Please enter your family name.");return;}
      if(!email.trim()){setAuthError("Please enter your email address.");return;}
      if(!email.includes("@")||!email.includes(".")){setAuthError("Please enter a valid email address.");return;}
      if(!pass.trim()){setAuthError("Please choose a password.");return;}
      if(pass.length<8){setAuthError("Password must be at least 8 characters.");return;}
    } else {
      if(!email.trim()){setAuthError("Please enter your email address.");return;}
      if(!pass.trim()){setAuthError("Please enter your password.");return;}
    }
    setLoading(true);
    if(mode==="signup"){
      supabase.auth.signUp({email:email.trim().toLowerCase(),password:pass,options:{data:{name:name.trim(),family_name:family.trim()}}}).then(function(res){
        setLoading(false);
        if(res.error){
          var msg=res.error.message||"";
          if(msg.toLowerCase().includes("already registered")||msg.toLowerCase().includes("already exists")){
            setAuthError("An account with this email already exists. Try signing in instead.");
          } else if(msg.toLowerCase().includes("invalid email")){
            setAuthError("Please enter a valid email address.");
          } else if(msg.toLowerCase().includes("password")){
            setAuthError("Password must be at least 6 characters.");
          } else {
            setAuthError("Something went wrong. Please try again.");
          }
          return;
        }
        var u=res.data.user;
        supabase.from("profiles").upsert({id:u.id,name:name.trim(),family_name:family.trim(),setup_done:false,trial_start:new Date().toISOString(),paid:false}).then(function(){
          onLogin({id:u.id,name:name.trim()||"Parent",family:family.trim()||"My Family",email:email.trim()});
        });
      }).catch(function(){setLoading(false);setAuthError("Network error. Please check your connection and try again.");});
    } else {
      supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password:pass}).then(function(res){
        setLoading(false);
        if(res.error){setAuthError("Wrong email or password — try again.");return;}
        var u=res.data.user;
        var meta=u.user_metadata||{};
        localStorage.setItem("calla_setup_"+u.id,"true");
        onLogin({id:u.id,name:meta.name||"Parent",family:meta.family_name||"My Family",email:u.email});
      }).catch(function(){setLoading(false);setAuthError("Network error. Please check your connection and try again.");});
    }
  };
  const cur=ONBOARD_SLIDES[slide];

  if(!showForm) return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:cur.bg,transition:"background .6s",overflow:"hidden"}}>

      {/* Top bar — logo + slide counter */}
      <div style={{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"env(safe-area-inset-top,16px) 24px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:16}}>
          <div style={{width:28,height:28,background:"rgba(245,240,232,.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:14}}>🌸</span>
          </div>
          <span style={{fontSize:15,fontWeight:700,color:"rgba(245,240,232,.9)",letterSpacing:"-.01em"}}>calla</span>
        </div>
        <button onClick={()=>{setMode("login");setShowForm(true);setAuthError("");}}
          style={{background:"rgba(245,240,232,.12)",border:"1px solid rgba(245,240,232,.2)",borderRadius:99,padding:"6px 14px",fontSize:13,fontWeight:600,color:"rgba(245,240,232,.8)",paddingTop:16}}>
          Sign in
        </button>
      </div>

      {/* Main content */}
      <div className="fu" key={slide} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 28px 16px"}}>

        {/* Eyebrow label */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(245,240,232,.12)",borderRadius:99,padding:"4px 12px",marginBottom:20,alignSelf:"flex-start",border:"1px solid rgba(245,240,232,.15)"}}>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(245,240,232,.7)",letterSpacing:".12em"}}>{cur.eyebrow}</span>
        </div>

        {/* Headline — Playfair Display, large */}
        <h1 style={{fontSize:32,fontWeight:800,color:cur.textColor,lineHeight:1.15,letterSpacing:"-.6px",marginBottom:14,fontFamily:"'Playfair Display',Georgia,serif",whiteSpace:"pre-line"}}>{cur.headline}</h1>

        {/* Subheadline */}
        <p style={{fontSize:15,color:cur.textColor,opacity:.82,lineHeight:1.65,marginBottom:16,fontWeight:300,maxWidth:340}}>{cur.sub}</p>

        {/* Visual block — changes per slide */}

        {/* SLIDE 1: Phone mockup — voice adding an event */}
        {cur.visual&&cur.visual.type==="chaos-pills"&&(
          <div style={{marginBottom:8}}>
            <div style={{background:"rgba(245,240,232,.07)",border:"1px solid rgba(245,240,232,.14)",borderRadius:20,padding:"16px"}}>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div style={{flex:1,background:"rgba(45,90,61,.3)",border:"1px solid rgba(45,90,61,.5)",borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
                  <span style={{fontSize:28,display:"block",marginBottom:6}}>🧒</span>
                  <p style={{fontSize:11,fontWeight:700,color:"rgba(245,240,232,.9)"}}>Saturday</p>
                  <p style={{fontSize:10,color:"rgba(245,240,232,.5)",marginTop:2}}>Soccer · 10am</p>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{background:"rgba(45,90,61,.18)",border:"1px solid rgba(45,90,61,.3)",borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:14}}>👩</span>
                    <div>
                      <p style={{fontSize:10,fontWeight:700,color:"rgba(245,240,232,.85)"}}>Mom · free</p>
                      <p style={{fontSize:10,color:"rgba(100,200,120,.8)"}}>No conflicts ✓</p>
                    </div>
                  </div>
                  <div style={{background:"rgba(45,90,61,.18)",border:"1px solid rgba(45,90,61,.3)",borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:14}}>👨</span>
                    <div>
                      <p style={{fontSize:10,fontWeight:700,color:"rgba(245,240,232,.85)"}}>Dad · free</p>
                      <p style={{fontSize:10,color:"rgba(100,200,120,.8)"}}>Ready to drive ✓</p>
                    </div>
                  </div>
                  <div style={{background:"rgba(220,140,30,.12)",border:"1px solid rgba(220,140,30,.25)",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                    <p style={{fontSize:10,fontWeight:700,color:"rgba(245,240,232,.85)"}}>April</p>
                    <div style={{display:"flex",justifyContent:"center",gap:3,marginTop:4}}>
                      {[1,2,3,4,5].map(function(d,i){return(
                        <div key={i} style={{width:18,height:18,borderRadius:4,background:i===2?"rgba(220,140,30,.5)":"rgba(245,240,232,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:11,color:"rgba(245,240,232,.7)"}}>{11+d}</span>
                        </div>
                      );})}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{background:"rgba(245,240,232,.05)",borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:12}}>⚡</span>
                <p style={{fontSize:11,color:"rgba(245,240,232,.6)"}}>Conflicts caught automatically, both parents notified</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Three ways to add — matching landing page */}
        {cur.visual&&cur.visual.type==="email-delete"&&(
          <div style={{marginBottom:8}}>
            <div style={{background:"rgba(245,240,232,.06)",border:"1px solid rgba(245,240,232,.12)",borderRadius:20,padding:"14px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(59,130,246,.12)",border:"1px solid rgba(59,130,246,.25)",borderRadius:12,padding:"10px 12px"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"rgba(59,130,246,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:16}}>📧</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:12,fontWeight:700,color:"rgba(245,240,232,.9)"}}>01 · Forward it</p>
                    <p style={{fontSize:10,color:"rgba(245,240,232,.5)",marginTop:1}}>Any school email → event created automatically</p>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(100,200,120,.9)"}}>✓</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(45,90,61,.15)",border:"1px solid rgba(45,90,61,.3)",borderRadius:12,padding:"10px 12px"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"rgba(45,90,61,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:16}}>📸</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:12,fontWeight:700,color:"rgba(245,240,232,.9)"}}>02 · Snap it</p>
                    <p style={{fontSize:10,color:"rgba(245,240,232,.5)",marginTop:1}}>Photo of a flyer → date, time and details extracted</p>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(100,200,120,.9)"}}>✓</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(124,58,237,.12)",border:"1px solid rgba(124,58,237,.25)",borderRadius:12,padding:"10px 12px"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"rgba(124,58,237,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:16}}>🎙️</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:12,fontWeight:700,color:"rgba(245,240,232,.9)"}}>03 · Say it</p>
                    <p style={{fontSize:10,color:"rgba(245,240,232,.5)",marginTop:1}}>Voice to calendar, other parent notified instantly</p>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(100,200,120,.9)"}}>✓</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,background:"rgba(220,60,60,.1)",border:"1px solid rgba(220,60,60,.2)",borderRadius:10,padding:"8px 12px"}}>
                <span style={{fontSize:12}}>🔒</span>
                <p style={{fontSize:11,color:"rgba(255,140,140,.85)",fontWeight:600}}>Email permanently deleted after extraction</p>
              </div>
            </div>
          </div>
        )}

        

        {/* SLIDE 3: Discover + Morning Brief — matching landing page */}
        {cur.visual&&cur.visual.type==="superpowers"&&(
          <div style={{marginBottom:8}}>
            <div style={{background:"rgba(245,240,232,.06)",border:"1px solid rgba(245,240,232,.12)",borderRadius:20,padding:"14px"}}>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div style={{flex:1,background:"rgba(45,90,61,.18)",border:"1px solid rgba(45,90,61,.3)",borderRadius:14,padding:"12px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <span style={{fontSize:16}}>🧭</span>
                    <p style={{fontSize:12,fontWeight:700,color:"rgba(245,240,232,.9)"}}>Nearby</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {["⚽ Soccer U8","🎵 Piano","🏊 Swim class"].map(function(t,i){return(
                      <div key={i} style={{background:"rgba(45,90,61,.25)",borderRadius:7,padding:"5px 8px"}}>
                        <p style={{fontSize:10,color:"rgba(245,240,232,.8)",fontWeight:500}}>{t}</p>
                      </div>
                    );})}
                  </div>
                </div>
                <div style={{flex:1,background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.22)",borderRadius:14,padding:"12px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <span style={{fontSize:16}}>☀️</span>
                    <p style={{fontSize:12,fontWeight:700,color:"rgba(245,240,232,.9)"}}>Today</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{background:"rgba(0,0,0,.2)",borderRadius:7,padding:"5px 8px"}}>
                      <p style={{fontSize:10,color:"rgba(245,240,232,.7)"}}>8:30am Soccer · Liam</p>
                    </div>
                    <div style={{background:"rgba(0,0,0,.2)",borderRadius:7,padding:"5px 8px"}}>
                      <p style={{fontSize:10,color:"rgba(245,240,232,.7)"}}>3:00pm Piano · Emma</p>
                    </div>
                    <div style={{background:"rgba(220,140,30,.15)",borderRadius:7,padding:"5px 8px"}}>
                      <p style={{fontSize:10,color:"rgba(220,140,30,.9)",fontWeight:600}}>⚡ Overlap at 3pm</p>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{background:"rgba(245,240,232,.05)",borderRadius:10,padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:12}}>📱</span>
                <p style={{fontSize:11,color:"rgba(245,240,232,.55)"}}>Morning SMS sent · wake up knowing your whole day</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Pricing card — matching landing page */}
        {cur.visual&&cur.visual.type==="trust"&&(
          <div style={{marginBottom:8}}>
            <div style={{background:"linear-gradient(160deg,rgba(45,90,61,.35) 0%,rgba(26,58,42,.5) 100%)",border:"1px solid rgba(45,90,61,.5)",borderRadius:20,padding:"18px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(82,183,136,.15) 0%,transparent 70%)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:20}}>🌿</span>
                <p style={{fontSize:14,fontWeight:800,color:"rgba(245,240,232,.95)",fontFamily:"'Playfair Display',Georgia,serif"}}>Calla Family Plan</p>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:"inline-block",background:"rgba(201,168,76,.15)",border:"1px solid rgba(201,168,76,.3)",borderRadius:20,padding:"4px 12px",marginBottom:8}}>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(201,168,76,.9)"}}>60 days completely free</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontSize:32,fontWeight:900,color:"rgba(201,168,76,.95)",fontFamily:"'Playfair Display',Georgia,serif"}}>$19.99</span>
                  <span style={{fontSize:12,color:"rgba(245,240,232,.5)"}}>per year</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {["Both parents included","All kids — unlimited","Conflict detection","Forward · Snap · Voice","Morning brief","Cancel anytime"].map(function(f,i){return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:11,color:"rgba(82,183,136,.9)",fontWeight:700}}>✓</span>
                    <p style={{fontSize:11,color:"rgba(245,240,232,.75)"}}>{f}</p>
                  </div>
                );})}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ALWAYS-VISIBLE bottom section — pinned */}
      <div style={{flexShrink:0,padding:"12px 24px calc(28px + env(safe-area-inset-bottom,0px)) 24px"}}>

        {/* Dot indicators */}
        <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:16}}>
          {ONBOARD_SLIDES.map(function(_,i){return(
            <div key={i} onClick={function(){setSlide(i);}}
              style={{width:i===slide?24:6,height:6,borderRadius:3,background:i===slide?"rgba(245,240,232,.9)":"rgba(245,240,232,.25)",transition:"width .3s cubic-bezier(.34,1.56,.64,1)",cursor:"pointer"}}/>
          );})}
        </div>

        {/* Primary CTA */}
        <button
          onClick={function(){if(cur.final){setShowForm(true);}else setSlide(function(s){return s+1;});}}
          style={{background:"rgba(245,240,232,.95)",color:"#1a3a1a",padding:"17px",borderRadius:16,fontWeight:800,fontSize:16,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,.25)",letterSpacing:"-.01em"}}>
          {cur.cta}
        </button>

        {/* Secondary */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          {slide===0
            ? <button onClick={function(){setMode("login");setShowForm(true);}} style={{background:"transparent",color:"rgba(245,240,232,.45)",fontSize:14,fontWeight:400,padding:"8px 0",border:"none",width:"100%",textAlign:"center"}}>
                Already have an account? <span style={{color:"rgba(245,240,232,.7)",fontWeight:600}}>Sign in</span>
              </button>
            : <>
                <button onClick={function(){setSlide(function(s){return s-1;});}} style={{background:"transparent",color:"rgba(245,240,232,.45)",fontSize:14,padding:"8px",border:"none"}}>← Back</button>
                {!cur.final&&<button onClick={function(){setShowForm(true);}} style={{background:"transparent",color:"rgba(245,240,232,.35)",fontSize:14,padding:"8px",border:"none"}}>Skip</button>}
              </>
          }
        </div>
      </div>
    </div>
  );

  // ── Sign-up / login form ──
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"var(--ink)"}}>
      <div className="fu" style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:52,height:52,background:"var(--sage)",borderRadius:16,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><span style={{fontSize:22}}>🌸</span></div>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif"}}>Calla</h1>
          <p style={{color:"var(--cream3)",fontSize:15,marginTop:3}}>The family brain you don't have to be.</p>
        </div>

        {/* Privacy reassurance above form */}
        <div style={{background:"rgba(45,90,61,.06)",border:"1px solid rgba(83,136,122,.2)",borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
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
              <button key={m} onClick={()=>switchMode(m)} style={{flex:1,padding:"9px",borderRadius:8,background:mode===m?"var(--ink4)":"transparent",color:mode===m?"var(--cream)":"var(--cream3)",fontWeight:600,fontSize:15,border:"none",boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
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
              <input placeholder="Choose a password (8+ characters)" type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{paddingRight:44}}/>
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
              <button type="button" onClick={()=>setShowPass(function(s){return !s;})} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--cream3)",fontSize:15,fontWeight:600,padding:4}}>{showPass?"Hide":"Show"}</button>
            </div>
            <Btn onClick={go} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              {loading
                ? <div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                : <>{mode==="signup"?"Let's get started →":"Sign In →"}</>
              }
            </Btn>
            {authError&&<div style={{background:authError.startsWith("✓")?"rgba(45,90,61,.08)":"rgba(168,56,56,.08)",border:"1px solid "+(authError.startsWith("✓")?"rgba(45,90,61,.25)":"rgba(168,56,56,.2)"),borderRadius:10,padding:"10px 14px",marginTop:8,fontSize:14,color:authError.startsWith("✓")?"var(--sage2)":"var(--rose)",textAlign:"center"}}>{authError}</div>}
          </div>

          {/* Privacy micro-copy — signup only. Forgot password — login only */}
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            {mode==="signup"&&(
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Check size={7} color="#fff"/>
                </div>
                <p style={{fontSize:13,color:"var(--cream3)",textAlign:"center"}}>No credit card required · No ads · Your data is private</p>
              </div>
            )}
            {mode==="login"&&<button type="button" onClick={function(){if(!email.trim()){setAuthError("Enter your email above first.");return;}setLoading(true);supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:window.location.origin}).then(function(res){setLoading(false);if(res.error){setAuthError("Could not send reset email. Please try again.");}else{setAuthError("✓ Password reset email sent! Check your inbox.");}});}} style={{background:"none",border:"none",color:"var(--sage3)",fontSize:14,fontWeight:600,cursor:"pointer"}}>Forgot password?</button>}
          </div>
        </Card>

      </div>
    </div>
  );
}

/* ─── Tour Demo Animations ──────────────────────────────────────────────── */
function CalendarDemo() {
  var [phase,setPhase]=useState(0);
  useEffect(function(){
    var active=true;
    function run(){
      if(!active)return;
      setPhase(0);
      var t1=setTimeout(function(){if(active)setPhase(1);},700);
      var t2=setTimeout(function(){if(active)setPhase(2);},1400);
      var t3=setTimeout(function(){if(active)setPhase(3);},2100);
      var t4=setTimeout(function(){if(active)run();},4400);
      return function(){clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4);};
    }
    run();
    return function(){active=false;};
  },[]);
  var evs=[
    {e:"⚽",t:"Soccer pickup",time:"3:30 PM",c:"#4ade80"},
    {e:"🎵",t:"Piano lesson",time:"3:45 PM",c:"#c084fc",conflict:true},
    {e:"🏀",t:"Basketball",time:"4:00 PM",c:"#fb923c"},
  ];
  return (
    <div style={{background:"rgba(255,255,255,.08)",borderRadius:14,padding:"12px 14px"}}>
      <p style={{fontSize:10,color:"rgba(255,255,255,.38)",fontWeight:700,letterSpacing:".1em",marginBottom:10,margin:"0 0 10px 0"}}>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}</p>
      {evs.map(function(ev,i){
        var show=phase>i;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:i>0?"1px solid rgba(255,255,255,.07)":"none",opacity:show?1:0,transform:show?"none":"translateY(6px)",transition:"opacity .35s ease "+(i*.1)+"s, transform .35s ease "+(i*.1)+"s"}}>
            <div style={{width:3,height:30,borderRadius:2,background:ev.c,flexShrink:0}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:13,fontWeight:600,color:"#f5f0e8",margin:0}}>{ev.e} {ev.t}</p>
              <p style={{fontSize:11,color:"rgba(245,240,232,.42)",margin:0}}>{ev.time}</p>
            </div>
            {ev.conflict&&show&&phase>=2&&<div style={{background:"rgba(239,68,68,.85)",borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#fff",animation:"pulse 1.5s infinite",flexShrink:0}}>⚠️ Conflict</div>}
          </div>
        );
      })}
    </div>
  );
}
function CatchDemo() {
  var MODES=[
    {icon:"🎙️",label:"Voice memo",hint:"\"Soccer registration April 15th...\"",result:"⚽ Soccer Registration · Apr 15"},
    {icon:"📧",label:"Forward email",hint:"Forward to team@getcalla.ca",result:"🎵 Piano lesson · Apr 9 · 4:00 PM"},
    {icon:"📷",label:"Snap a flyer",hint:"Point camera at any event flyer",result:"🏊 Swim camp · Jul 8–12 · Minto"},
  ];
  var [idx,setIdx]=useState(0);
  var [showResult,setShowResult]=useState(false);
  useEffect(function(){
    var active=true;
    function run(){
      if(!active)return;
      setShowResult(false);
      var t1=setTimeout(function(){if(active)setShowResult(true);},1100);
      var t2=setTimeout(function(){
        if(!active)return;
        setIdx(function(i){return(i+1)%MODES.length;});
        run();
      },3000);
    }
    run();
    return function(){active=false;};
  },[]);
  var mode=MODES[idx];
  return (
    <div style={{background:"rgba(255,255,255,.08)",borderRadius:14,padding:"14px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:38,height:38,borderRadius:12,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{mode.icon}</div>
        <div style={{flex:1}}>
          <p style={{fontSize:12,fontWeight:700,color:"rgba(245,240,232,.9)",margin:0}}>{mode.label}</p>
          <p style={{fontSize:11,color:"rgba(245,240,232,.42)",margin:"2px 0 0 0"}}>{mode.hint}</p>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,opacity:showResult?1:0,transition:"opacity .3s ease"}}>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,.15)"}}/>
        <p style={{fontSize:10,color:"rgba(245,240,232,.38)",margin:0,fontWeight:600,letterSpacing:".06em"}}>CALLA ADDED</p>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,.15)"}}/>
      </div>
      <div style={{background:"rgba(255,255,255,.1)",borderRadius:10,padding:"8px 12px",opacity:showResult?1:0,transform:showResult?"none":"translateY(5px)",transition:"opacity .4s ease .1s, transform .4s ease .1s"}}>
        <p style={{fontSize:13,fontWeight:600,color:"#f5f0e8",margin:0}}>{mode.result}</p>
      </div>
    </div>
  );
}
function DiscoverDemo() {
  var ITEMS=[
    {e:"⚽",t:"Youth Soccer League",loc:"Minto Recreation Centre",c:"#4ade80"},
    {e:"💻",t:"Python Coding Camp",loc:"Ottawa Public Library",c:"#60a5fa"},
    {e:"🎵",t:"Music Together",loc:"NAC Arts Centre",c:"#c084fc"},
  ];
  var [count,setCount]=useState(0);
  useEffect(function(){
    var active=true;
    function run(){
      if(!active)return;
      setCount(0);
      var t1=setTimeout(function(){if(active)setCount(1);},500);
      var t2=setTimeout(function(){if(active)setCount(2);},1100);
      var t3=setTimeout(function(){if(active)setCount(3);},1700);
      var t4=setTimeout(function(){if(active)run();},4200);
    }
    run();
    return function(){active=false;};
  },[]);
  return (
    <div style={{background:"rgba(255,255,255,.08)",borderRadius:14,padding:"10px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}>
        <MapPin size={11} color="rgba(245,240,232,.45)"/>
        <p style={{fontSize:10,color:"rgba(245,240,232,.45)",fontWeight:700,margin:0,letterSpacing:".08em"}}>OTTAWA, ON · NEARBY</p>
      </div>
      {ITEMS.map(function(item,i){
        var show=count>i;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderTop:i>0?"1px solid rgba(255,255,255,.07)":"none",opacity:show?1:0,transform:show?"none":"translateY(8px)",transition:"opacity .35s ease, transform .35s ease"}}>
            <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{item.e}</div>
            <div style={{flex:1}}>
              <p style={{fontSize:12,fontWeight:700,color:"#f5f0e8",margin:0}}>{item.t}</p>
              <p style={{fontSize:10,color:"rgba(245,240,232,.38)",margin:"1px 0 0 0"}}>{item.loc}</p>
            </div>
            <div style={{width:6,height:6,borderRadius:"50%",background:item.c,flexShrink:0}}/>
          </div>
        );
      })}
    </div>
  );
}

/* ─── First-Time Setup (post sign-up onboarding) ────────────────────────── */
function FirstTimeSetup({user,onDone}) {
  var COLORS=["#2d5a3d","#1a5c8a","#7c3aed","#c2410c","#0f766e","#b45309","#be185d","#3d6b1a"];
  var EMOJIS=["👦","👧","👨","👩","👴","👵","🧒","🧑","👶","🧔","👱","🧕"];
  var [step,setStep]=useState(0);
  var [familyName,setFamilyName]=useState((user&&user.family&&user.family!=="My Family")?user.family:"");
  var [famErr,setFamErr]=useState("");
  var [mems,setMems]=useState([{id:genId(),name:"",color:"#2d5a3d",emoji:"👤",_showPicker:false,_showEmoji:false}]);
  var [slide,setSlide]=useState(0);
  var [saving,setSaving]=useState(false);
  var touchX=useRef(null);

  function goNext(){
    if(step===0){if(!familyName.trim()){setFamErr("Please enter your family name.");return;}setFamErr("");setStep(1);}
    else if(step===1){setStep(2);}
  }
  function addMem(){setMems(function(p){return[...p,{id:genId(),name:"",color:COLORS[p.length%COLORS.length],emoji:"👤",_showPicker:false,_showEmoji:false}];});}
  function updateMem(id,fields){setMems(function(p){return p.map(function(m){return m.id===id?Object.assign({},m,fields):m;});});}
  function removeMem(id){setMems(function(p){return p.filter(function(m){return m.id!==id;});});}
  function closeAll(){setMems(function(p){return p.map(function(m){return Object.assign({},m,{_showPicker:false,_showEmoji:false});});});}

  function finish(){
    setSaving(true);
    var fname=familyName.trim()||"My Family";
    var valid=mems.filter(function(m){return m.name.trim().length>0;});
    var saves=[
      supabase.from("profiles").update({family_name:fname,setup_done:true,onboarding_seen:true}).eq("id",user.id),
      supabase.auth.updateUser({data:{family_name:fname}}),
    ];
    valid.forEach(function(m){
      saves.push(supabase.from("members").upsert({id:m.id,user_id:user.id,name:m.name.trim(),color:m.color,emoji:m.emoji||"👤"}));
    });
    Promise.all(saves).catch(function(){}).finally(function(){setSaving(false);onDone(fname,valid);});
  }

  var DOTS=(
    <div style={{display:"flex",justifyContent:"center",gap:6,paddingTop:"calc(env(safe-area-inset-top,44px) + 18px)"}}>
      {[0,1,2].map(function(i){return <div key={i} style={{width:i===step?22:6,height:6,borderRadius:99,background:i<=step?"var(--sage2)":"var(--border2)",transition:"all .3s"}}/>;})};
    </div>
  );

  /* ── Step 0: Family name ── */
  if(step===0) return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink2)"}}>
      {DOTS}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px 16px"}}>
        <div className="fu" style={{textAlign:"center"}}>
          <div style={{fontSize:68,marginBottom:20,lineHeight:1}}>🌸</div>
          <h1 style={{fontSize:28,fontWeight:800,letterSpacing:"-.5px",marginBottom:10,fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1.15}}>Welcome to Calla</h1>
          <p style={{color:"var(--cream3)",fontSize:16,lineHeight:1.7,marginBottom:32,fontWeight:300}}>Let's set up your family calendar in two minutes.</p>
        </div>
        <div className="fu">
          <p style={{fontSize:14,fontWeight:700,color:"var(--cream2)",marginBottom:8,letterSpacing:".02em"}}>What's your family name?</p>
          <input placeholder="e.g. The Johnsons" value={familyName}
            onChange={function(e){setFamilyName(e.target.value);setFamErr("");}}
            style={{fontSize:17,fontWeight:600}} onKeyDown={function(e){if(e.key==="Enter")goNext();}}/>
          {famErr&&<p style={{fontSize:13,color:"var(--rose)",marginTop:6}}>{famErr}</p>}
          <p style={{fontSize:13,color:"var(--cream3)",marginTop:6}}>Shown in your app header and on shared calendars.</p>
        </div>
      </div>
      <div style={{padding:"0 28px",paddingBottom:"calc(28px + env(safe-area-inset-bottom,0px))"}}>
        <Btn onClick={goNext} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"16px",fontSize:16}}>Continue →</Btn>
      </div>
    </div>
  );

  /* ── Step 1: Family members ── */
  if(step===1) return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink2)"}}>
      {DOTS}
      <div style={{flex:1,overflowY:"auto",padding:"24px 24px 8px",WebkitOverflowScrolling:"touch"}} onClick={closeAll}>
        <div className="fu">
          <h1 style={{fontSize:24,fontWeight:800,letterSpacing:"-.4px",marginBottom:8,fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1.2}}>Who's in your family?</h1>
          <p style={{color:"var(--cream3)",fontSize:15,lineHeight:1.6,marginBottom:24,fontWeight:300}}>Pick a colour and emoji for each member. You can always edit this later.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {mems.map(function(m,idx){return(
              <div key={m.id} style={{background:"#fff",borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 4px rgba(26,46,26,.06)",position:"relative"}}
                onClick={function(e){e.stopPropagation();}}>
                {/* Colour picker */}
                <div style={{position:"relative",flexShrink:0}}>
                  <div onClick={function(){updateMem(m.id,{_showPicker:!m._showPicker,_showEmoji:false});}}
                    style={{width:36,height:36,borderRadius:"50%",background:m.color,cursor:"pointer",border:"2px solid rgba(255,255,255,.6)",boxShadow:"0 2px 6px rgba(0,0,0,.18)",flexShrink:0}}/>
                  {m._showPicker&&(
                    <div style={{position:"absolute",top:44,left:0,background:"#fff",borderRadius:14,padding:10,boxShadow:"0 4px 24px rgba(0,0,0,.15)",display:"flex",flexWrap:"wrap",gap:8,width:176,zIndex:30}}>
                      {COLORS.map(function(c){return(
                        <div key={c} onClick={function(){updateMem(m.id,{color:c,_showPicker:false});}}
                          style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",outline:m.color===c?"3px solid "+c:"none",outlineOffset:2,boxShadow:m.color===c?"0 0 0 2px #fff inset":"none"}}/>
                      );})}
                    </div>
                  )}
                </div>
                {/* Emoji picker */}
                <div style={{position:"relative",flexShrink:0}}>
                  <div onClick={function(){updateMem(m.id,{_showEmoji:!m._showEmoji,_showPicker:false});}}
                    style={{width:36,height:36,borderRadius:10,background:"rgba(26,46,26,.06)",border:"1.5px solid rgba(26,46,26,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer"}}>
                    {m.emoji||"👤"}
                  </div>
                  {m._showEmoji&&(
                    <div style={{position:"absolute",top:44,left:0,background:"#fff",borderRadius:14,padding:10,boxShadow:"0 4px 24px rgba(0,0,0,.15)",display:"flex",flexWrap:"wrap",gap:6,width:216,zIndex:30}}>
                      {EMOJIS.map(function(em){return(
                        <div key={em} onClick={function(){updateMem(m.id,{emoji:em,_showEmoji:false});}}
                          style={{width:36,height:36,borderRadius:8,background:m.emoji===em?"rgba(45,90,61,.12)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",border:m.emoji===em?"1.5px solid var(--sage2)":"1.5px solid transparent"}}>
                          {em}
                        </div>
                      );})}
                    </div>
                  )}
                </div>
                <input placeholder={"Member "+(idx+1)+" — e.g. Emma"} value={m.name}
                  onChange={function(e){updateMem(m.id,{name:e.target.value});}}
                  style={{flex:1,fontSize:15,border:"none",outline:"none",background:"transparent",color:"#1a2e1a",fontFamily:"-apple-system,sans-serif",fontWeight:500}}/>
                {mems.length>1&&(
                  <button onClick={function(){removeMem(m.id);}} style={{background:"rgba(180,180,180,.12)",border:"none",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                    <X size={13} color="#888"/>
                  </button>
                )}
              </div>
            );})}
          </div>
          <button onClick={addMem} style={{background:"none",border:"1.5px dashed var(--border3)",borderRadius:12,padding:"11px 0",width:"100%",color:"var(--sage2)",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <Plus size={14}/>Add another member
          </button>
        </div>
      </div>
      <div style={{padding:"12px 24px",paddingBottom:"calc(24px + env(safe-area-inset-bottom,0px))"}}>
        <Btn onClick={goNext} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"15px",fontSize:16}}>
          {mems.some(function(m){return m.name.trim().length>0;})?'Continue →':'Skip for now →'}
        </Btn>
      </div>
    </div>
  );

  /* ── Step 2: Animated feature tour ── */
  var CARDS=[
    {title:"One shared calendar",body:"Every event, every member — one view. Calla spots conflicts before they ruin your week.",bg:"linear-gradient(140deg,#0f2a1a 0%,#1a4a2d 100%)",Demo:CalendarDemo},
    {title:"Calla catches it all",body:"Voice, email, or a photo of a flyer. Calla reads it and adds the event automatically.",bg:"linear-gradient(140deg,#0f0f2a 0%,#1a1a4a 100%)",Demo:CatchDemo},
    {title:"Discover nearby",body:"Kids sports, music classes, and community events near you — refreshed every day.",bg:"linear-gradient(140deg,#0a1f2a 0%,#0d3545 100%)",Demo:DiscoverDemo},
  ];
  var card=CARDS[slide];
  var Demo=card.Demo;
  return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink2)"}}>
      {DOTS}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"16px 24px 8px",overflow:"hidden"}}
        onTouchStart={function(e){touchX.current=e.touches[0].clientX;}}
        onTouchEnd={function(e){
          if(touchX.current===null)return;
          var diff=touchX.current-e.changedTouches[0].clientX;
          if(Math.abs(diff)>40){if(diff>0&&slide<CARDS.length-1)setSlide(function(s){return s+1;});else if(diff<0&&slide>0)setSlide(function(s){return s-1;});}
          touchX.current=null;
        }}>
        <div className="fu" key={slide} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:"100%",borderRadius:24,padding:"18px 18px 20px",background:card.bg,boxShadow:"0 8px 36px rgba(0,0,0,.3)",marginBottom:20,overflow:"hidden"}}>
            <Demo/>
            <h2 style={{fontSize:22,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",letterSpacing:"-.3px",marginBottom:8,lineHeight:1.2,marginTop:16}}>{card.title}</h2>
            <p style={{fontSize:14,color:"rgba(245,240,232,.62)",lineHeight:1.65,fontWeight:300,margin:0}}>{card.body}</p>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {CARDS.map(function(_,i){return(
              <div key={i} onClick={function(){setSlide(i);}}
                style={{width:i===slide?22:8,height:8,borderRadius:99,background:i===slide?"var(--sage2)":"var(--border3)",transition:"all .3s",cursor:"pointer"}}/>
            );})}
          </div>
        </div>
      </div>
      <div style={{padding:"0 24px",paddingBottom:"calc(24px + env(safe-area-inset-bottom,0px))"}}>
        {slide<CARDS.length-1?(
          <div style={{display:"flex",gap:10}}>
            <button onClick={finish} disabled={saving} style={{flex:1,background:"none",border:"1px solid var(--border2)",borderRadius:12,padding:"14px",fontSize:15,fontWeight:600,color:"var(--cream3)",cursor:"pointer"}}>Skip</button>
            <Btn onClick={function(){setSlide(function(s){return s+1;});}} style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px",fontSize:16}}>Next →</Btn>
          </div>
        ):(
          <Btn onClick={finish} disabled={saving} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"15px",fontSize:16}}>
            {saving?"Setting up…":"Let's get started 🌸"}
          </Btn>
        )}
      </div>
    </div>
  );
}

/* ─── AI + Privacy Disclosure Modal ────────────────────────────────────── */
function AiDisclosureModal({onDone}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(10,20,14,.72)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)"}}>
      <div className="fu" style={{background:"var(--ink2)",borderRadius:"24px 24px 0 0",padding:"28px 24px",paddingBottom:"calc(28px + env(safe-area-inset-bottom,0px))",maxWidth:480,width:"100%",border:"1px solid var(--border2)"}}>
        <div style={{width:40,height:4,borderRadius:99,background:"var(--border2)",margin:"0 auto 24px"}}/>
        <div style={{fontSize:40,textAlign:"center",marginBottom:16}}>🔒</div>
        <h2 style={{fontSize:22,fontWeight:700,textAlign:"center",marginBottom:10,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1.2}}>How Calla handles your kids' data</h2>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
          {[
            ["🤖","AI reads your emails to extract event details","Email text is sent to Anthropic's Claude AI to identify dates, times, and names. It is not stored or used to train AI models."],
            ["🗑️","Emails are deleted immediately after you save","Once you tap Save to Calendar, the original email is permanently deleted from our servers. We never keep email content."],
            ["🔐","Kids' names stay within your family","Names and events you add are visible only to you and any co-parent you invite. We never share or sell your children's data."],
          ].map(([icon,title,body],i)=>(
            <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",background:"rgba(45,90,61,.08)",borderRadius:14,padding:"14px 14px"}}>
              <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
              <div>
                <p style={{fontWeight:700,fontSize:14,color:"var(--cream)",marginBottom:3}}>{title}</p>
                <p style={{fontSize:13,color:"var(--cream3)",lineHeight:1.55}}>{body}</p>
              </div>
            </div>
          ))}
        </div>
        <Btn onClick={onDone} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:16,padding:"16px"}}>
          <Check size={16}/>Got it — I understand
        </Btn>
      </div>
    </div>
  );
}

/* ─── Co-parent Setup (post-login step 2) ───────────────────────────────── */
function CoParentSetup({user,onDone,onInvite}) {
  const [partnerEmail,setPartnerEmail]=useState(""),[sent,setSent]=useState(false),[skipped,setSkipped]=useState(false),[sending,setSending]=useState(false);
  function doInvite(){
    if(!partnerEmail.includes("@")||partnerEmail.trim()===user.email||sending) return;
    setSending(true);
    if(onInvite){
      onInvite(partnerEmail,function(ok){setSending(false);setSent(true);});
    } else {
      setSending(false);setSent(true);
    }
  }
  if(skipped||sent) return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:36,textAlign:"center",background:"var(--ink2)"}}>
      <div className="fu">
        <div style={{fontSize:72,marginBottom:24}}>{sent?"🎉":"👍"}</div>
        <h2 style={{fontSize:26,fontWeight:700,marginBottom:12,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)"}}>{sent?"Invite sent!":"No problem."}</h2>
        <p style={{color:"var(--cream3)",fontSize:16,lineHeight:1.75,marginBottom:40,fontWeight:300}}>{sent?"We emailed "+partnerEmail+". Once they join, you'll both see every update in real time.":"You can always invite someone later from the Family tab."}</p>
        <Btn onClick={onDone} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px 36px",fontSize:16}}>Take me to my calendar →</Btn>
      </div>
    </div>
  );
  return (
    <div style={{height:"100vh",maxHeight:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink2)",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"52px 24px 24px"}}>
        <div className="fu">
          <div style={{fontSize:72,textAlign:"center",marginBottom:28}}>👨‍👩‍👧‍👦</div>
          <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.5px",textAlign:"center",marginBottom:14,fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",lineHeight:1.15}}>Who else manages your family's schedule?</h1>
          <p style={{color:"var(--cream3)",fontSize:16,lineHeight:1.75,textAlign:"center",marginBottom:28,fontWeight:300}}>Invite your partner so you both see every event, change and reminder — in real time. No more "I didn't know about that."</p>

          {/* Live sync preview */}
          <div style={{marginBottom:28,border:"1px solid rgba(83,136,122,.25)",borderRadius:16,padding:"16px 12px",background:"rgba(45,90,61,.06)"}}>
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
          <input placeholder="partner@email.com" type="email" value={partnerEmail} onChange={e=>setPartnerEmail(e.target.value)} style={{flex:1,fontSize:15}} onKeyDown={e=>e.key==="Enter"&&doInvite()}/>
          <Btn onClick={doInvite} style={{padding:"0 22px",flexShrink:0,fontSize:15}}>{sending?"Sending…":"Invite"}</Btn>
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
    <div className="fu" style={{background:"linear-gradient(135deg,#1a3a2a 0%,#2d5a3d 100%)",borderRadius:18,padding:"20px",marginBottom:16,position:"relative",overflow:"hidden",boxShadow:"0 4px 20px rgba(26,58,42,.25)"}}>
      {/* Decorative circles */}
      <div style={{position:"absolute",top:-28,right:-28,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
      <div style={{position:"absolute",bottom:-32,left:40,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
      <button onClick={dismiss} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><X size={12}/></button>
      {/* Eyebrow */}
      <p style={{fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",marginBottom:6}}>Calla remembers everything</p>
      {/* Headline */}
      <p style={{fontSize:22,fontWeight:800,color:"#f5f0e8",marginBottom:16,letterSpacing:"-.4px",lineHeight:1.2,paddingRight:28,fontFamily:"'Playfair Display',Georgia,serif"}}>So you don't have to.</p>
      {/* Feature pills */}
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {[["🎙","Voice"],["📬","Email Parser"],["⚡","Conflicts"],["🎒","Packing"],["📷","Upload Flyer"],["🧭","Discover"],["☀️","Morning Brief"]].map(([icon,label])=>(
          <div key={label} style={{background:"rgba(255,255,255,.14)",border:"1px solid rgba(255,255,255,.2)",borderRadius:99,padding:"6px 12px",display:"flex",alignItems:"center",gap:5,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.92)"}}>
            <span style={{fontSize:13}}>{icon}</span>{label}
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
  const gm=id=>members.find(m=>m.id===id)||{emoji:"👤",color:"var(--cream3)"};
  const now=new Date().getHours()*60+new Date().getMinutes();
  const toM=t=>{const[hh,mm]=(t||"0:0").split(":").map(Number);return hh*60+mm;};

  if(!open) return (
    <button onClick={()=>setOpen(true)} style={{width:"100%",background:"#fff",border:"1px solid var(--border2)",borderRadius:16,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,color:"var(--cream3)",fontSize:15,fontWeight:500,boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><Icon size={15}/><span>{greet}</span></div>
      <ChevronDown size={15}/>
    </button>
  );

  return (
    <Card style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><Icon size={15} color="var(--cream3)"/><span style={{fontSize:15,color:"#3d5a3d",fontWeight:500}}>{greet} · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</span></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"var(--cream3)",display:"flex"}}><ChevronUp size={15}/></button>
      </div>
      <p style={{fontSize:22,fontWeight:800,letterSpacing:"-.4px",color:"#1a2e1a",marginBottom:todayEvs.length?16:0}}>
        {todayEvs.length===0?"Your day is open ✨":todayEvs.length+" event"+(todayEvs.length>1?"s":"")+" today"}
      </p>
      {todayEvs.map((ev,i)=>{
        var showNoonDivider=i>0&&todayEvs[i-1].time<"12:00"&&ev.time>="12:00";
        const m=gm(ev.memberId),past=toM(ev.time)<now,next=!past&&todayEvs.slice(0,i).every(e=>toM(e.time)<now);
        return (
          <Fragment key={ev.id}>
          {showNoonDivider&&(
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 8px"}}>
              <div style={{flex:1,height:1,background:"var(--border2)"}}/>
              <span style={{fontSize:11,color:"var(--cream3)",fontWeight:600,letterSpacing:".06em"}}>AFTERNOON</span>
              <div style={{flex:1,height:1,background:"var(--border2)"}}/>
            </div>
          )}
          <div
            onClick={()=>onSelect&&onSelect(ev)}
            style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,opacity:past?0.5:1,cursor:"pointer",borderRadius:12,padding:"6px 8px",margin:"0 -8px 6px",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(45,60,45,.04)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{width:4,height:36,borderRadius:2,background:past?"var(--ink4)":ev.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:16,fontWeight:700,color:past?"var(--cream3)":"#1a2e1a"}}>{m.emoji} {ev.title}</p>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <p style={{fontSize:13,color:"#4a5e4a",fontWeight:400}}>{ev.time}{ev.location&&<span style={{color:"var(--cream3)"}}> · {ev.location}</span>}</p>
                {ev.packingList&&ev.packingList.length>0&&!past&&(
                  <div style={{display:"flex",alignItems:"center",gap:3,background:ev.color+"12",borderRadius:99,padding:"1px 7px"}}>
                    <Package size={9} color={ev.color}/>
                    <span style={{fontSize:15,fontWeight:700,color:ev.color}}>{ev.packingList.length} to pack</span>
                  </div>
                )}
              </div>
            </div>
            {next&&<Pill color={ev.color} bg={ev.color+"15"} style={{animation:"pulse 2s infinite"}}>Next</Pill>}
            {past?<Check size={13} color="var(--cream3)"/>:<ChevronRight size={14} color="var(--border3)"/>}
          </div>
          </Fragment>
        );
      })}
      {tomEvs.length>0&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border2)"}}>
          <p style={{fontSize:15,color:"#2d4a2d",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Tomorrow</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tomEvs.slice(0,3).map(ev=>{const m=gm(ev.memberId);return <Pill key={ev.id} color={ev.color} bg={ev.color+"22"} style={{border:"1.5px solid "+ev.color+"55",fontWeight:700}}>{m.emoji} {ev.title}</Pill>;})}
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
  const gm=id=>members.find(m=>m.id===id)||{name:"?",color:"var(--cream3)",emoji:"👤"};
  return (
    <div style={{background:"rgba(160,120,32,.08)",border:"1.5px solid rgba(160,120,32,.3)",borderRadius:16,marginBottom:16,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",padding:"14px 16px",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
        <AlertTriangle size={15} color="#D97706"/>
        <span style={{flex:1,fontWeight:600,fontSize:15,color:"var(--amber)"}}>{visible.length} conflict{visible.length>1?"s":""} detected</span>
        {open?<ChevronUp size={15} color="#D97706"/>:<ChevronDown size={15} color="#D97706"/>}
      </button>
      {open&&visible.map(c=>{
        const ma=gm(c.a.memberId),mb=gm(c.b.memberId),key=c.a.id+"-"+c.b.id;
        return (
          <div key={key} style={{borderTop:"1px solid rgba(196,149,58,.3)",padding:"12px 16px"}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div onClick={()=>onSelect&&onSelect(c.a)} style={{flex:1,background:"#fff",borderRadius:12,padding:10,border:"1px solid rgba(160,120,32,.25)",cursor:"pointer",boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}>
                <p style={{fontSize:15,color:c.a.color,fontWeight:700,marginBottom:2}}>{ma.emoji} {ma.name}</p>
                <p style={{fontSize:15,fontWeight:600}}>{c.a.title}</p>
                <p style={{fontSize:15,color:"var(--cream3)"}}>{c.a.time}</p>
                <span style={{fontSize:15,color:"var(--sage3)",fontWeight:600}}>View event</span>
              </div>
              <div style={{display:"flex",alignItems:"center"}}><Zap size={13} color="#D97706"/></div>
              <div onClick={()=>onSelect&&onSelect(c.b)} style={{flex:1,background:"#fff",borderRadius:12,padding:10,border:"1px solid rgba(160,120,32,.25)",cursor:"pointer",boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}>
                <p style={{fontSize:15,color:c.b.color,fontWeight:700,marginBottom:2}}>{mb.emoji} {mb.name}</p>
                <p style={{fontSize:15,fontWeight:600}}>{c.b.title}</p>
                <p style={{fontSize:15,color:"var(--cream3)"}}>{c.b.time}</p>
                <span style={{fontSize:15,color:"var(--sage3)",fontWeight:600}}>View event</span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:15,color:"var(--amber)"}}>{c.type==="same"?"Double-booked · "+c.diff+"min":"Only "+c.diff+"min gap"}</p>
              <button onClick={e=>{e.stopPropagation();setDismissed(d=>[...d,key]);}} style={{background:"none",border:"none",color:"var(--cream3)",fontSize:15,fontWeight:500}}>Dismiss</button>
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
    <div style={{position:"fixed",inset:0,background:"rgba(26,46,26,.35)",zIndex:600,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet-enter sheet-scroll" style={{background:"var(--ink2)",borderRadius:"20px 20px 0 0",padding:"8px 20px calc(env(safe-area-inset-bottom,20px) + 28px)",width:"100%",height:"85vh",overflowY:"scroll",overscrollBehavior:"contain",WebkitOverflowScrolling:"touch"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h3 style={{fontSize:18,fontWeight:800}}>Share Event</h3>
            <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{ev.title}</p>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"var(--ink4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"auto",minWidth:"auto"}}>
            <X size={16} color="var(--cream3)"/>
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
              <div style={{width:48,height:48,borderRadius:16,background:"rgba(45,90,61,.07)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24}}>💬</div>
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
            <div style={{background:"rgba(45,90,61,.07)",borderRadius:16,padding:"14px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>💬</span>
              <div>
                <p style={{fontWeight:700,fontSize:15,color:"var(--sage3)",marginBottom:3}}>Send via Text Message</p>
                <p style={{fontSize:15,color:"var(--sage3)",lineHeight:1.6}}>Enter a phone number below. Your native Messages app will open with the event details pre-filled — just hit Send.</p>
              </div>
            </div>
            <label style={{fontSize:15,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>Phone number</label>
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
            <p style={{fontSize:15,color:"var(--cream3)",marginBottom:16}}>Works for anyone — grandparents, babysitters, coaches. No app needed on their end.</p>
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
            <label style={{fontSize:15,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:8}}>Email address</label>
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
            <p style={{fontSize:15,color:"var(--cream3)",marginBottom:16}}>The subject line will say "Event: {ev.title} on {fd(ev.date)}".</p>
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
function EventSheet({ev,members,onClose,onDelete,user,onTagNotify}) {
  useScrollLock(true);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [packed,setPacked]     = useState({});
  const [comments,setComments] = useState([]);
  const [commentText,setCommentText] = useState("");
  const [showComments,setShowComments] = useState(true);
  const [showMentionPicker,setShowMentionPicker] = useState(false);
  const [mentionSearch,setMentionSearch] = useState("");
  const [showShare,setShowShare] = useState(false);
  const commentInputRef = useRef();
  const sheetRef = useRef();
  const dragStartY = useRef(null);
  const dragCurrentY = useRef(null);
  const m=members.find(x=>x.id===ev.memberId)||{emoji:"👤",color:"var(--cream3)",name:"?"};

  // ── Load comments from Supabase ──────────────────────────────────────────
  useEffect(function(){
    supabase.from("event_comments").select("*").eq("event_id",ev.id).order("created_at",{ascending:true}).then(function(res){
      if(res.data&&res.data.length>0){
        setComments(res.data.map(function(c){return{
          id:c.id,text:c.text,author:c.author_name,authorEmoji:"👤",
          time:new Date(c.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
          date:new Date(c.created_at).toLocaleDateString([],{month:"short",day:"numeric"}),
          taggedIds:c.tagged_ids||[],
        };}));
      }
    }).catch(function(){});
  },[ev.id]);

  // ── Swipe-down-to-dismiss ────────────────────────────────────────────────
  var handleTouchStart = function(e) {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = e.touches[0].clientY;
    if(sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };
  var handleTouchMove = function(e) {
    if(dragStartY.current === null) return;
    var delta = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = e.touches[0].clientY;
    if(delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = "translateY("+delta+"px)";
    }
  };
  var handleTouchEnd = function() {
    if(dragStartY.current === null) return;
    var delta = dragCurrentY.current - dragStartY.current;
    if(sheetRef.current) {
      sheetRef.current.style.transition = "transform .25s ease";
    }
    if(delta > 120) {
      if(sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
      setTimeout(onClose, 250);
    } else {
      if(sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
    }
    dragStartY.current = null;
    dragCurrentY.current = null;
  };

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
    setComments(function(p){return[...p,newComment];});
    setCommentText("");
    setShowMentionPicker(false);
    supabase.from("event_comments").insert({
      id:newComment.id,event_id:ev.id,user_id:(user&&user.id)||null,
      author_name:newComment.author,text:newComment.text,tagged_ids:newComment.taggedIds,
    }).then(function(res){
      if(res.error) setComments(function(p){return p.filter(function(c){return c.id!==newComment.id;});});
    }).catch(function(){
      setComments(function(p){return p.filter(function(c){return c.id!==newComment.id;});});
    });
    if(tagged.length>0&&onTagNotify) tagged.forEach(tm=>onTagNotify({member:tm,event:ev,comment:newComment,author:(user&&user.name)||"You"}));
  };

  const filteredMembers = members.filter(m=>m.name.toLowerCase().startsWith(mentionSearch));
  const openMaps = loc=>window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(loc),"_blank");
  const openDirs = loc=>window.open("https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(loc),"_blank");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(26,46,26,.5)",zIndex:600,display:"flex",alignItems:"flex-end"}} onClick={function(e){if(e.target===e.currentTarget)onClose();}}>
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position:"fixed",bottom:0,left:0,right:0,
          height:"92dvh",
          background:"var(--ink2)",
          borderRadius:"20px 20px 0 0",
          display:"flex",flexDirection:"column",
          overflow:"hidden",
          transform:"translateY(0)",
          transition:"transform .3s cubic-bezier(.32,1,.4,1)",
          willChange:"transform",
        }}
      >
        {/* ── Drag handle + close button ── */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{flexShrink:0,padding:"10px 20px 0",touchAction:"none"}}
        >
          <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"0 auto 12px"}}/>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",paddingBottom:12,borderBottom:"1px solid var(--border)"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                <Pill color={m.color} bg={m.color+"15"}>
                  {m.photo?<img src={m.photo} style={{width:14,height:14,borderRadius:"50%",objectFit:"cover"}} alt=""/>:m.emoji} {m.name}
                </Pill>
                {ev.recurring&&<Pill color="var(--sage3)" bg="rgba(67,143,126,.14)"><Repeat size={10}/> Recurring</Pill>}
              </div>
              <h2 style={{fontSize:20,fontWeight:800,letterSpacing:"-.3px",lineHeight:1.2,paddingRight:8}}>{ev.title}</h2>
            </div>
            <button
              onClick={onClose}
              style={{width:32,height:32,borderRadius:"50%",background:"var(--ink4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12,minHeight:"auto",minWidth:"auto",touchAction:"manipulation"}}
            >
              <X size={16} color="var(--cream3)"/>
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{flex:1,minHeight:0,overflowY:"scroll",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"16px 20px calc(env(safe-area-inset-bottom,0px) + 100px) 20px"}}>

          {/* Details */}
          <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:16}}>
            {[[Calendar,fd(ev.date),"Date"],[Clock,ev.time||"No time","Time"],ev.cost?[DollarSign,"$"+ev.cost+" / "+(ev.costType||"one-time"),"Cost"]:null].filter(Boolean).map(([Icon,val,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F3F4F6"}}>
                <div style={{width:34,height:34,background:"var(--sage-light)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={15} color="var(--sage)"/></div>
                <div><p style={{fontSize:15,color:"#2d4a2d",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</p><p style={{fontSize:15,fontWeight:600,marginTop:1}}>{val}</p></div>
              </div>
            ))}
          </div>

          {/* Location */}
          {ev.location?(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F3F4F6",marginBottom:10}}>
                <div style={{width:34,height:34,background:"var(--sage-light)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MapPin size={15} color="var(--sage)"/></div>
                <div style={{flex:1}}>
                  <p style={{fontSize:15,color:"#2d4a2d",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>Location</p>
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
              <div><p style={{fontSize:15,color:"#2d4a2d",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>Location</p><p style={{fontSize:15,color:"var(--border3)",marginTop:1}}>Not set</p></div>
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
                <div key={i} onClick={()=>setPacked(p=>({...p,[i]:!p[i]}))} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<ev.packingList.length-1?"1px solid #F3F4F6":"none",cursor:"pointer",transition:"background .15s"}}>
                  <div style={{width:22,height:22,borderRadius:6,border:"1.5px solid "+(packed[i]?"var(--sage2)":"var(--border2)"),background:packed[i]?"var(--sage)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>{packed[i]&&<Check size={12} color="#fff"/>}</div>
                  <p style={{fontSize:15,color:packed[i]?"#9CA3AF":"var(--ink)",textDecoration:packed[i]?"line-through":"none"}}>{item}</p>
                </div>
              ))}
              {ev.packingList.length>0&&Object.values(packed).filter(Boolean).length===ev.packingList.length&&<p style={{fontSize:15,color:"var(--sage)",fontWeight:700,marginTop:10,display:"flex",alignItems:"center",gap:5}}><Check size={12}/>All packed!</p>}
            </Card>
          )}

          {/* Comments + @tagging */}
          <div style={{marginBottom:16}}>
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
                {comments.length===0&&(
                  <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--ink3)",borderRadius:14,padding:"12px 14px",marginBottom:14,border:"1px solid var(--border)"}}>
                    <span style={{fontSize:20,flexShrink:0}}>💬</span>
                    <div>
                      <p style={{fontSize:14,fontWeight:500,color:"var(--cream2)",marginBottom:2}}>Leave a note for the family</p>
                      <p style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>Type <strong style={{color:"var(--sage3)",fontWeight:600}}>@name</strong> to tag someone</p>
                    </div>
                  </div>
                )}

                {comments.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:14}}>
                    {comments.map(c=>{
                      const taggedMs=(c.taggedIds||[]).map(id=>members.find(m=>m.id===id)).filter(Boolean);
                      return (
                        <div key={c.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div style={{width:32,height:32,borderRadius:10,background:"var(--sage)",backgroundImage:"linear-gradient(135deg,var(--sage),var(--sage2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,boxShadow:"0 2px 8px rgba(46,107,94,.25)"}}>
                            {c.authorEmoji||"👤"}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                              <p style={{fontSize:13,fontWeight:700,color:"var(--cream2)"}}>{c.author}</p>
                              <span style={{width:3,height:3,borderRadius:"50%",background:"var(--border3)",flexShrink:0,display:"inline-block"}}/>
                              <p style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>{c.date} · {c.time}</p>
                            </div>
                            <div style={{background:"var(--ink3)",borderRadius:"4px 16px 16px 16px",padding:"11px 14px",border:"1px solid var(--border2)",marginBottom:taggedMs.length>0?8:0}}>
                              <p style={{fontSize:15,color:"var(--cream)",lineHeight:1.6}}>{renderCommentText(c.text)}</p>
                            </div>
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
          <div style={{display:"flex",gap:10,paddingBottom:"calc(env(safe-area-inset-bottom,16px) + 8px)"}}>
            <button
              onClick={()=>setShowShare(true)}
              style={{flex:1,background:"var(--sage-light)",border:"1.5px solid var(--sage-mid)",borderRadius:12,padding:"13px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:700,fontSize:15,color:"var(--sage)",cursor:"pointer"}}
            >
              <Share2 size={16}/>Share Event
            </button>
            <Btn v="danger" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={function(){setConfirmDelete(true);}}>
              <Trash2 size={15}/>Delete
            </Btn>
          </div>

          {/* Share Sheet */}
          {showShare&&<ShareSheet ev={ev} onClose={()=>setShowShare(false)}/>}

        </div>

        {/* Delete confirmation sheet */}
        {confirmDelete&&(
          <div style={{position:"fixed",inset:0,background:"rgba(26,46,26,.5)",zIndex:700,display:"flex",alignItems:"flex-end"}} onClick={function(){setConfirmDelete(false);}}>
            <div className="fu" style={{background:"#f5f0e8",borderRadius:"20px 20px 0 0",padding:"24px 20px",paddingBottom:"calc(env(safe-area-inset-bottom,20px) + 20px)",width:"100%"}} onClick={function(e){e.stopPropagation();}}>
              <div style={{width:36,height:4,borderRadius:2,background:"var(--ink4)",margin:"0 auto 20px"}}/>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{width:56,height:56,background:"rgba(168,56,56,.08)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",border:"1px solid rgba(168,56,56,.2)"}}><Trash2 size={22} color="var(--rose)"/></div>
                <p style={{fontSize:19,fontWeight:800,color:"#1a2e1a",marginBottom:6,fontFamily:"'Playfair Display',Georgia,serif"}}>Delete this event?</p>
                <p style={{fontSize:15,color:"#2d5a3d",fontWeight:600}}>{ev.title}</p>
                <p style={{fontSize:13,color:"var(--cream3)",marginTop:6,fontWeight:400}}>This cannot be undone.</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={function(){setConfirmDelete(false);}} style={{flex:1,padding:"14px",borderRadius:12,background:"#fff",border:"1.5px solid var(--border2)",fontWeight:600,fontSize:15,color:"var(--cream2)",boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}>Keep it</button>
                <button onClick={function(){onDelete(ev.id);}} style={{flex:1,padding:"14px",borderRadius:12,background:"#a83838",border:"none",fontWeight:700,fontSize:15,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Trash2 size={14}/>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Add Sheet ─────────────────────────────────────────────────────────── */
function AddSheet({members,onAdd,onClose,events=[]}) {
  useScrollLock(true);  // Lock background scroll while modal is open
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
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,background:"rgba(26,46,26,.5)"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"var(--ink2)",borderRadius:"0 0 24px 24px",display:"flex",flexDirection:"column"}}>
        <div style={{flexShrink:0,padding:"calc(env(safe-area-inset-top,44px) + 8px) 20px 0"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 16px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:18,fontWeight:800}}>New Event</h2>
            <Btn v="icon" onClick={onClose}><X size={18}/></Btn>
          </div>
        </div>
        <div style={{flex:1,minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",padding:"0 20px 8px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <input placeholder="What's happening?" value={ev.title} maxLength={80} onChange={e=>{var v=e.target.value.slice(0,80);s("title")(v);var lo=v.toLowerCase();setRecurSuggest(!ev.recurring&&recurringKeywords.some(function(k){return lo.includes(k);}));if(v&&!ev.endTime&&ev.time){var dur=smartDuration(v);if(dur)setEv(function(p){return{...p,endTime:addMinutes(p.time,dur)};});}}} style={{fontSize:16,fontWeight:600}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{members.map(m=>(<button key={m.id} onClick={()=>s("memberId")(m.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,background:ev.memberId===m.id?m.color+"22":"var(--ink4)",color:ev.memberId===m.id?m.color:"var(--cream3)",border:"1.5px solid "+(ev.memberId===m.id?m.color+"99":"var(--border2)"),fontWeight:600,fontSize:15,border:"none"}}><span>{m.emoji}</span>{m.name}</button>))}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5}}>DATE *</label><input type="date" value={ev.date} onChange={e=>s("date")(e.target.value)} style={{colorScheme:"light",color:"var(--cream)",background:"#fff"}}/></div>
            <div><label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5}}>START TIME</label><input type="time" value={ev.time} onChange={e=>s("time")(e.target.value)} style={{colorScheme:"light",color:"var(--cream)",background:"#fff"}}/></div>
            <div style={{gridColumn:"span 2"}}><label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5}}>END TIME <span style={{fontWeight:400}}>(optional)</span></label><input type="time" value={ev.endTime||""} onChange={e=>s("endTime")(e.target.value)} style={{colorScheme:"light",color:"var(--cream)",background:"#fff"}}/></div>
          </div>
          <div style={{position:"relative"}}>
            <label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5}}>LOCATION</label>
            <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--ink3)",borderRadius:12,padding:"10px 14px",border:"1.5px solid "+(showLocDrop?"var(--sage)":"var(--border2)"),transition:"border-color .15s"}}>
              <MapPin size={15} color={showLocDrop?"var(--sage)":"#9CA3AF"}/>
              <input placeholder="Search or type location…" value={locQuery||ev.location} onChange={e=>{setLocQuery(e.target.value);s("location")(e.target.value);setShowLocDrop(e.target.value.length>0);}} onFocus={()=>setShowLocDrop(true)} onBlur={()=>setTimeout(()=>setShowLocDrop(false),150)} style={{background:"transparent",border:"none",padding:0,fontSize:15,flex:1}}/>
              {ev.location&&<button onClick={()=>{s("location")("");setLocQuery("");}} style={{background:"none",border:"none",color:"var(--cream3)",display:"flex",padding:2,flexShrink:0}}><X size={13}/></button>}
            </div>
            {showLocDrop&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:12,boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:50,overflow:"hidden",marginTop:4}}>{getSuggestions().map((v,i)=>(<div key={i} onClick={()=>{s("location")(v.label);setLocQuery("");setShowLocDrop(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",borderBottom:i<getSuggestions().length-1?"1px solid #F3F4F6":"none"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(45,60,45,.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><span style={{fontSize:20,flexShrink:0}}>{v.icon}</span><div><p style={{fontSize:15,fontWeight:600,color:"var(--cream)"}}>{v.label}</p><p style={{fontSize:15,color:"var(--cream3)"}}>{v.keywords.slice(0,3).join(", ")}</p></div><MapPin size={13} color="#D1D5DB" style={{marginLeft:"auto",flexShrink:0}}/></div>))}{locQuery.trim()&&(<div onClick={()=>{s("location")(locQuery.trim());setShowLocDrop(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",background:"rgba(45,90,61,.07)",borderTop:"1px solid var(--border2)"}}><Check size={15} color="var(--sage2)" style={{flexShrink:0}}/><p style={{fontSize:15,fontWeight:600,color:"var(--sage2)"}}>Use "{locQuery.trim()}"</p></div>)}</div>)}
          </div>
          {recurSuggest&&(<div className="fu" style={{background:"rgba(67,143,126,.1)",border:"1px solid rgba(67,143,126,.3)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18,flexShrink:0}}>🔄</span><div style={{flex:1}}><p style={{fontSize:14,fontWeight:600,color:"var(--sage3)",marginBottom:1}}>Looks like a regular event</p><p style={{fontSize:12,color:"var(--cream3)",fontWeight:300}}>Set as weekly recurring?</p></div><button onClick={function(){s("recurring")(true);setRecurSuggest(false);}} style={{background:"var(--sage)",color:"var(--ink)",borderRadius:8,padding:"7px 12px",fontSize:13,fontWeight:700,border:"none",flexShrink:0}}>Weekly ✓</button><button onClick={function(){setRecurSuggest(false);}} style={{background:"transparent",color:"var(--cream3)",border:"none",fontSize:18,lineHeight:1,padding:"2px 6px"}}>×</button></div>)}
          <Card style={{background:"var(--ink3)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Repeat size={15} color="var(--cream3)"/><div><p style={{fontWeight:600,fontSize:15}}>Recurring</p><p style={{fontSize:15,color:"var(--cream3)"}}>Repeat automatically</p></div></div><Toggle on={ev.recurring} onChange={()=>s("recurring")(!ev.recurring)}/></div>
            {ev.recurring&&(<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["daily","weekly","biweekly","monthly"].map(f=>(<button key={f} onClick={()=>s("recurFreq")(f)} style={{padding:"6px 14px",borderRadius:99,background:ev.recurFreq===f?"var(--sage)":"var(--ink4)",color:ev.recurFreq===f?"var(--cream)":"var(--cream3)",fontSize:15,fontWeight:600,border:"1.5px solid",borderColor:ev.recurFreq===f?"var(--sage2)":"var(--border2)",textTransform:"capitalize"}}>{f}</button>))}</div><div><label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5}}>UNTIL</label><input type="date" value={ev.recurEnd} onChange={e=>s("recurEnd")(e.target.value)} style={{colorScheme:"light",color:"var(--cream)",background:"#fff"}}/></div><p style={{fontSize:15,color:"var(--sage2)",fontWeight:600}}>Creates ~{recurCount(ev.recurFreq,ev.date,ev.recurEnd)} events</p></div>)}
          </Card>
          <textarea rows={2} placeholder="Notes (optional)" value={ev.notes} onChange={e=>s("notes")(e.target.value)} style={{resize:"none",fontSize:15}}/>
          <Card style={{background:"var(--ink3)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:ev.packingList&&ev.packingList.length?12:0}}><Package size={15} color="var(--cream3)"/><p style={{fontWeight:600,fontSize:15}}>Packing List</p><div style={{display:"flex",gap:6,marginLeft:"auto"}}>{[["⚽","cleats,water bottle,jersey,shin guards"],["🎵","instrument,sheet music,lesson book"]].map(([ico,items])=>(<button key={ico} onClick={()=>{const ex=ev.packingList||[];const add=items.split(",").filter(i=>!ex.includes(i));setEv(p=>({...p,packingList:[...ex,...add]}));}} style={{background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:99,padding:"3px 10px",fontSize:15,fontWeight:500}}>{ico}</button>))}</div></div>
            {ev.packingList&&ev.packingList.length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{ev.packingList.map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:5,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:99,padding:"4px 10px 4px 12px"}}><span style={{fontSize:15}}>{item}</span><button onClick={()=>setEv(p=>({...p,packingList:p.packingList.filter((_,j)=>j!==i)}))} style={{background:"none",color:"var(--cream3)",display:"flex",padding:2}}><X size={11}/></button></div>))}</div>)}
            <div style={{display:"flex",gap:8}}><input placeholder="What's needed?" value={ev._pack} onChange={e=>s("_pack")(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPack()} style={{fontSize:15}}/><button onClick={addPack} style={{background:"var(--sage)",color:"var(--ink)",borderRadius:8,padding:"0 14px",fontWeight:700,fontSize:18,flexShrink:0}}>+</button></div>
          </Card>
          <div style={{display:"flex",gap:10}}><div style={{position:"relative",flex:1}}><DollarSign size={13} color="#9CA3AF" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/><input placeholder="Monthly cost ($)" type="number" value={ev.cost} onChange={e=>s("cost")(e.target.value)} style={{paddingLeft:32}}/></div><select value={ev.costType} onChange={e=>s("costType")(e.target.value)} style={{width:"auto",minWidth:110,fontSize:15}}><option value="one-time">one-time</option><option value="monthly">/ month</option><option value="session">/ session</option><option value="season">/ season</option></select></div>
          {addError&&<div style={{background:"rgba(196,90,90,.1)",border:"1px solid rgba(196,90,90,.25)",borderRadius:12,padding:"10px 14px",marginBottom:8,fontSize:14,color:"var(--rose)",lineHeight:1.6}}>{addError}</div>}
          </div>
        </div>
        <div style={{flexShrink:0,padding:"12px 20px",paddingBottom:"calc(env(safe-area-inset-bottom,16px) + 12px)",background:"var(--ink2)",borderTop:"1px solid var(--border)"}}>
          <Btn onClick={submit} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%"}}>
            {ev.recurring?<><Repeat size={15}/>Add Recurring</>:<><Check size={15}/>Add to Calendar</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function VoiceSheet({members,onAdd,onClose}) {
  useScrollLock(true);
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
    r.onerror=e=>{if(e.error==="not-allowed"||e.error==="permission-denied"){setStage("micdenied");}else{setStage("error");}};r.start();
  };

  const confirm=()=>{
    if(!parsed)return;
    const mem=members.find(x=>x.id===parsed.memberId)||members[0];
    const base={...parsed,color:mem.color,recurGroupId:genId()};
    (parsed.recurring?makeRecurring(base):[{...base,id:genId()}]).forEach(e=>onAdd(e));
    setStage("done");setTimeout(()=>onClose(),1600);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(26,46,26,.35)",zIndex:500,display:"flex",alignItems:"flex-start"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
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
              {transcript?<p style={{fontSize:15,color:"var(--cream2)",fontStyle:"italic",lineHeight:1.6}}>"{transcript}"</p>:<p style={{color:"var(--cream3)",fontSize:15}}>Start speaking…</p>}
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
              <div style={{background:"rgba(160,120,32,.08)",border:"1.5px solid rgba(160,120,32,.3)",borderRadius:12,padding:"10px 12px",marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
                <AlertTriangle size={14} color="#D97706" style={{flexShrink:0,marginTop:1}}/>
                <p style={{fontSize:15,color:"var(--gold)",lineHeight:1.6}}>{parsed.memberWarning}</p>
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
                <div><label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:4}}>DATE</label><input type="date" value={parsed.date} onChange={e=>setParsed(p=>({...p,date:e.target.value}))} style={{fontSize:15,padding:"8px 10px"}}/></div>
                <div><label style={{fontSize:15,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:4}}>TIME</label><input type="time" value={parsed.time} onChange={e=>setParsed(p=>({...p,time:e.target.value}))} style={{fontSize:15,padding:"8px 10px"}}/></div>
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
            <div style={{width:60,height:60,background:"rgba(45,90,61,.06)",border:"1px solid rgba(83,136,122,.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Check size={26} color="var(--sage2)"/></div>
            <p style={{fontWeight:800,fontSize:18,color:"var(--sage2)"}}>Added!</p>
          </div>
        )}
        {(stage==="error"||stage==="nosupport"||stage==="micdenied")&&(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <MicOff size={38} color="#DC2626" style={{margin:"0 auto 14px"}}/>
            <p style={{fontWeight:700,fontSize:16,marginBottom:8}}>
              {stage==="nosupport"?"Voice not supported":stage==="micdenied"?"Microphone blocked":"Didn't catch that"}
            </p>
            <p style={{color:"var(--cream3)",fontSize:15,marginBottom:22}}>
              {stage==="nosupport"
                ?"Voice works on Safari (iPhone) or Chrome (Android). Use Add Event to add manually."
                :stage==="micdenied"
                ?"Calla needs microphone access. Go to your browser or phone Settings → Calla → Microphone and allow access, then try again."
                :"Speak clearly and include the event name, time, and date."}
            </p>
            {stage!=="micdenied"&&<Btn onClick={()=>setStage("ready")} style={{margin:"0 auto",display:"flex",alignItems:"center",gap:8}}>Try Again</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Day Sheet ─────────────────────────────────────────────────────────── */
function DaySheet({date,events,members,onClose,onSelect}) {
  const dayEvs=events.filter(function(e){return e.date===date;}).sort(function(a,b){return a.time.localeCompare(b.time);});
  const gm=function(id){return members.find(function(m){return m.id===id;})||{emoji:"👤",color:"var(--cream3)",name:"?"};};
  const dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const d=new Date(date+"T12:00:00");
  const label=date===todayStr?"Today":date===addDays(todayStr,1)?"Tomorrow":dayNames[d.getDay()]+", "+MONTHS[d.getMonth()]+" "+d.getDate();
  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(26,46,26,.5)",zIndex:500,display:"flex",alignItems:"flex-end"}}>
      <div className="sheet-enter sheet-scroll" style={{borderRadius:"20px 20px 0 0",padding:"8px 20px calc(env(safe-area-inset-bottom,20px) + 28px)",width:"100%",height:"80vh",overflowY:"scroll",overscrollBehavior:"contain",background:"var(--ink2)",WebkitOverflowScrolling:"touch",willChange:"transform"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:800,letterSpacing:"-.3px"}}>{label}</h2>
            <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{dayEvs.length} event{dayEvs.length!==1?"s":""}</p>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:12,background:"var(--ink4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
        </div>
        {dayEvs.length===0&&(
          <div style={{textAlign:"center",padding:"36px 0"}}>
            <Calendar size={38} color="#D1D5DB" style={{margin:"0 auto 12px"}}/>
            <p style={{color:"var(--cream3)",fontWeight:500}}>Nothing scheduled</p>
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
                    <p style={{fontSize:15,color:"var(--cream3)",marginTop:1}}>{m.name}</p>
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
function DashScreen({events,members,onAdd,onDelete,showBanner,onBannerDismiss,initialSel,onClearSel,onShowAdd,onShowVoice,onSelectEv,trialExpired,onUpgrade,topBar,selectedMemberId,familyName}) {
  const [anchor,setAnchor]=useState(todayStr);
  const [showAdd,setShowAdd]=useState(false);
  const [showVoice,setShowVoice]=useState(false);
  const [sel,setSel]=useState(null);
  const [map,setMap]=useState(false);
  const [dayView,setDayView]=useState(null);
  const [calView,setCalView]=useState("month");
  const [selMember,setSelMember]=useState(null);
  // Route all event opens through App-level onSelectEv so EventSheet renders
  // outside animated containers and stays truly viewport-anchored.
  const openEv=function(ev){if(onSelectEv)onSelectEv(ev);else setSel(ev);};
  useEffect(()=>{if(initialSel){openEv(initialSel);if(onClearSel)onClearSel();}},[]);
  const filteredEvents=selMember?events.filter(function(e){return e.memberId===selMember;}):events;
  const week=getWeek(anchor),cfls=conflicts(filteredEvents);
  const gm=id=>members.find(m=>m.id===id)||{emoji:"👤",color:"var(--cream3)"};
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

  var dashHour=new Date().getHours();
  var dashGreet=dashHour<12?"Good morning":dashHour<17?"Good afternoon":"Good evening";
  var dashDay=new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});

  return (
    <div className="screen-enter">
      {/* ── Hero header ── */}
      <div style={{background:"linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%)",margin:"-20px -18px 16px",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 28px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 24px rgba(30,61,42,.25)"}}>
        {topBar}
        <p style={{fontSize:11,fontWeight:600,color:"rgba(245,240,232,.45)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4,fontFamily:"-apple-system,sans-serif"}}>{dashDay}</p>
        <p style={{fontSize:26,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,letterSpacing:"-.4px",marginBottom:12}}>{dashGreet},<br/><em style={{fontStyle:"italic",color:"#c9a84c"}}>{familyName||"My Family"}.</em></p>
        <div style={{background:"rgba(255,255,255,.10)",borderRadius:14,padding:4,display:"flex",gap:4}}>
          <button onClick={function(){if(trialExpired){onUpgrade&&onUpgrade();return;}onShowAdd();}}
            style={{flex:1,padding:"9px 0",borderRadius:10,background:"#f5f0e8",color:"#1e3d2a",fontWeight:700,fontSize:13,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s",fontFamily:"-apple-system,sans-serif"}}>
            <Plus size={14}/>Add Event
          </button>
          <button onClick={function(){if(trialExpired){onUpgrade&&onUpgrade();return;}onShowVoice();}}
            style={{flex:1,padding:"9px 0",borderRadius:10,background:"transparent",color:"rgba(245,240,232,.85)",fontWeight:700,fontSize:13,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s",fontFamily:"-apple-system,sans-serif"}}>
            <Mic size={14} color="rgba(245,240,232,.85)"/>Voice
          </button>
        </div>
      </div>

      {showBanner&&<ValueBanner onDismiss={onBannerDismiss}/>}
          {selMember&&(
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:10,padding:"8px 12px",marginBottom:12,border:"1px solid var(--border2)"}}>
              <span style={{fontSize:14}}>{(members.find(function(m){return m.id===selMember;})||{}).emoji}</span>
              <p style={{flex:1,fontSize:14,fontWeight:600,color:"var(--cream)"}}>{(members.find(function(m){return m.id===selMember;})||{name:"Member"}).name}'s events</p>
              <button onClick={function(){setSelMember(null);}} style={{background:"none",border:"none",color:"var(--cream3)",fontSize:12,cursor:"pointer",padding:0}}>Show all</button>
            </div>
          )}
      <Briefing events={filteredEvents} members={members} onSelect={openEv} selMember={selMember}/>
      <ConflictBanner items={cfls} members={members} onSelect={openEv}/>

      {/* ── Calendar header ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={prev} style={{background:"#fff",border:"1px solid var(--border2)",borderRadius:8,padding:"7px 9px",display:"flex",color:"var(--cream2)",boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}><ChevronLeft size={15}/></button>
          <span style={{fontSize:16,fontWeight:700,minWidth:120,textAlign:"center",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)"}}>
            {calView==="month"?monthLabel():(fd(week[0])+" – "+fd(week[6]))}
          </span>
          <button onClick={next} style={{background:"#fff",border:"1px solid var(--border2)",borderRadius:8,padding:"7px 9px",display:"flex",color:"var(--cream2)",boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}><ChevronRight size={15}/></button>
          <button onClick={()=>setAnchor(todayStr)} style={{background:"none",border:"none",color:"var(--sage)",fontSize:14,fontWeight:600,padding:"4px 6px"}}>Today</button>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{display:"flex",background:"var(--ink3)",borderRadius:8,padding:2,gap:1,border:"1px solid var(--border)"}}>
            {[["week","W"],["month","M"]].map(function(pair){
              var v=pair[0],lbl=pair[1];
              return <button key={v} onClick={function(){setCalView(v);}}
                style={{padding:"5px 11px",borderRadius:6,background:calView===v?"var(--sage)":"transparent",color:calView===v?"#fff":"var(--cream3)",color:calView===v?"#fff":"var(--cream3)",fontWeight:700,fontSize:13,border:"none",boxShadow:calView===v?"0 1px 4px rgba(0,0,0,.3)":"none"}}>{lbl}</button>;
            })}
          </div>
          <button onClick={()=>setMap(m=>!m)}
            style={{background:map?"var(--sage)":"#fff",color:map?"#fff":"var(--cream2)",border:"1px solid",borderColor:map?"var(--sage2)":"var(--border2)",borderRadius:8,padding:"7px 11px",display:"flex",alignItems:"center",gap:5,color:map?"var(--cream)":"var(--cream2)",fontSize:13,fontWeight:600}}>
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
                    style={{position:"absolute",bottom:10,right:10,zIndex:10,background:"#1a3a2a",color:"#f5f0e8",borderRadius:8,padding:"7px 13px",fontSize:13,fontWeight:600,border:"none",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>
                    Open in Google Maps ↗
                  </button>
                </div>
                {mapEvs.length===0?(
                  <div style={{background:"var(--ink2)",borderRadius:16,padding:"24px",textAlign:"center",border:"1px solid var(--border2)"}}>
                    <MapPin size={28} color="var(--cream3)" style={{margin:"0 auto 10px"}}/>
                    <p style={{fontSize:15,color:"var(--cream3)",fontWeight:500}}>No events with locations today</p>
                    <p style={{fontSize:13,color:"var(--cream3)",marginTop:4,fontWeight:300}}>Add a location to an event to see it here</p>
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
                          <button onClick={function(){openDirections(ev.location);}} style={{background:"var(--sage)",color:"var(--ink)",borderRadius:9,padding:"9px 13px",fontSize:13,fontWeight:700,border:"none",display:"flex",alignItems:"center",gap:5}}><MapPin size={13}/>Directions</button>
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
                    background:!date?"transparent":isT?"var(--sage)":"#fff",
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
                          <div key={ev.id} onClick={function(e){e.stopPropagation();openEv(ev);}}
                            style={{background:ev.color,borderRadius:2,padding:"1px 3px",overflow:"hidden"}}>
                            <p style={{fontSize:10,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.4}}>{ev.title}</p>
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
              <div key={date} style={{background:isT?"var(--sage)":"var(--ink3)",border:"1px solid",borderColor:isT?"var(--sage2)":"var(--border3)",borderRadius:12,padding:"8px 5px",minHeight:96}}>
                <p style={{fontSize:10,fontWeight:700,color:isT?"rgba(255,255,255,.6)":"var(--cream3)",textTransform:"uppercase",textAlign:"center",marginBottom:2,letterSpacing:".04em"}}>{WDAYS[i]}</p>
                <p onClick={function(){setDayView(date);}} style={{fontSize:15,fontWeight:800,color:"var(--cream)",textAlign:"center",marginBottom:5,cursor:"pointer"}}>{new Date(date).getDate()}</p>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  {dayEvs.slice(0,3).map(function(ev){var evCol=ev.color||(members.find(function(m){return m.id===ev.memberId;})||{color:"#2d7a52"}).color;return(
                    <div key={ev.id} onClick={function(){if(onSelectEv)onSelectEv(ev);else setSel(ev);}} style={{background:evCol+"cc",borderRadius:4,padding:"2px 4px",cursor:"pointer",overflow:"hidden",minWidth:0}}>
                      <p style={{fontSize:11,fontWeight:700,color:"#fff",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",whiteSpace:"nowrap"}}>{ev.title}</p>
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
      {dayView&&<DaySheet date={dayView} events={events} members={members} onClose={function(){setDayView(null);}} onSelect={function(ev){setDayView(null);openEv(ev);}}/>}
    </div>
  );
}


/* ─── Inbox ─────────────────────────────────────────────────────────────── */

/* ─── Flyer Scanner ─────────────────────────────────────────────────────── */
function FlyerScanner({members, onAdd}) {
  var [scanStage, setScanStage]         = useState("idle");      // idle | loading | review | done | error | pdfhint
  var [previewSrc, setPreviewSrc]       = useState(null);
  var [fileName, setFileName]           = useState("");
  var [extractedEvs, setExtractedEvs]   = useState([]);
  var [selectedIds, setSelectedIds]     = useState(new Set());
  var [errorMsg, setErrorMsg]           = useState("");
  var [loadingStep, setLoadingStep]     = useState(0);           // 0,1,2
  var fileRef                           = useRef();
  var stepTimerRef                      = useRef(null);

  // ── Step animator ──────────────────────────────────────────────────────────
  function startStepAnim() {
    setLoadingStep(0);
    var step = 0;
    stepTimerRef.current = setInterval(function() {
      step = step + 1;
      if (step >= 2) { clearInterval(stepTimerRef.current); }
      setLoadingStep(step);
    }, 1800);
  }
  function stopStepAnim() {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
  }

  useEffect(function(){return function(){stopStepAnim();};},[]);

  // ── File pick ─────────────────────────────────────────────────────────────
  function handleFilePick(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    setErrorMsg("");
    setFileName(file.name);

    if (file.type === "application/pdf") {
      setPreviewSrc("pdf");
      setScanStage("preview");
      return;
    }

    var reader = new FileReader();
    reader.onload = function(ev) {
      setPreviewSrc(ev.target.result);
      setScanStage("preview");
    };
    reader.readAsDataURL(file);
  }

  // ── Scan via Claude Vision API ────────────────────────────────────────────
  function doScan() {
    var file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setErrorMsg("PDFs can't be scanned directly. Take a screenshot of the flyer page and upload that image — it works great!");
      setScanStage("pdfhint");
      return;
    }

    setScanStage("loading");
    startStepAnim();

    var reader = new FileReader();
    reader.onload = function(ev) {
      var dataUrl = ev.target.result;
      var mediaType = file.type || "image/jpeg";
      var img = new Image();
      img.onload = function() {
        var maxDim = 1024;
        var w = img.width, h = img.height;
        if(w > maxDim || h > maxDim) {
          var scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var compressed = canvas.toDataURL("image/jpeg", 0.85);
        callClaude(compressed.split(",")[1], "image/jpeg");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function callClaude(base64, mediaType) {
    fetch("https://pqvxzsrpifiuovhtxldp.supabase.co/functions/v1/scan-flyer", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer "+SUPABASE_KEY },
      body: JSON.stringify({ image: base64, mediaType: mediaType })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      stopStepAnim();
      if(data.error){setErrorMsg(data.error||"Couldn\'t scan this flyer.");setScanStage("error");return;}
      var resultText=data.result||"";var parsed=null;
      try{parsed=JSON.parse(resultText.replace(/```json|```/g,"").trim());}
      catch(e){setErrorMsg("Couldn\'t read the flyer. Try a clearer photo.");setScanStage("error");return;}
      var events=Array.isArray(parsed)?parsed:(parsed&&parsed.title?[parsed]:[]);
      if(!events||events.length===0){setErrorMsg("No events found. Try a clearer photo.");setScanStage("error");return;}
      // Attach ids and default memberId
      var withIds = events.map(function(ev) {
        return {
          id: genId(),
          title:    ev.title    || "Untitled Event",
          date:     ev.date     || todayStr,
          time:     ev.time     || "",
          location: ev.location || "",
          notes:    ev.notes    || "",
          memberId: members && members[0] ? members[0].id : ""
        };
      });
      var allIds = new Set(withIds.map(function(e) { return e.id; }));
      setExtractedEvs(withIds);
      setSelectedIds(allIds);
      setScanStage("review");
    }).catch(function(err) {
      stopStepAnim();
      setErrorMsg("Connection failed. Check your internet and try again.");
      setScanStage("error");
    });
  }

  // ── Confirm add ───────────────────────────────────────────────────────────
  function confirmAdd() {
    extractedEvs.forEach(function(ev) {
      if (!selectedIds.has(ev.id)) return;
      var m = members && members.find(function(x) { return x.id === ev.memberId; });
      onAdd({
        id:       genId(),
        title:    ev.title,
        date:     ev.date,
        time:     ev.time,
        location: ev.location,
        notes:    ev.notes,
        memberId: ev.memberId,
        color:    m ? m.color : "#2d5a3d"
      });
    });
    setScanStage("done");
    setTimeout(function() { resetScanner(); }, 2400);
  }

  function resetScanner() {
    setScanStage("idle");
    setPreviewSrc(null);
    setFileName("");
    setExtractedEvs([]);
    setSelectedIds(new Set());
    setErrorMsg("");
    setLoadingStep(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggleEvent(id) {
    setSelectedIds(function(prev) {
      var next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === extractedEvs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(extractedEvs.map(function(e) { return e.id; })));
    }
  }

  function updateEv(id, fields) {
    setExtractedEvs(function(prev) {
      return prev.map(function(ev) { return ev.id === id ? Object.assign({}, ev, fields) : ev; });
    });
  }

  var stepLabels = ["Analysing image", "Finding events & dates", "Formatting for calendar"];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*,application/pdf"
        style={{display:"none"}} onChange={handleFilePick}/>

      {/* ── IDLE: upload zone ── */}
      {(scanStage === "idle") && (
        <div onClick={function() { if(fileRef.current) fileRef.current.click(); }}
          style={{background:"var(--ink)",border:"2px dashed var(--border2)",borderRadius:18,padding:"32px 20px",textAlign:"center",cursor:"pointer",transition:"border-color .2s,background .2s"}}>
          <div style={{fontSize:42,marginBottom:12}}>📄</div>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:19,fontWeight:700,color:"var(--cream)",marginBottom:8}}>Scan a school flyer</p>
          <p style={{fontSize:14,color:"var(--cream3)",lineHeight:1.65,marginBottom:18}}>Take a photo, upload a screenshot,<br/>or drop any school notice here</p>
          <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
            {["📸 Camera photo","🖼️ Screenshot","📄 PDF (screenshot it)"].map(function(t) {
              return (
                <span key={t} style={{background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:99,padding:"5px 12px",fontSize:12,fontWeight:600,color:"var(--cream3)"}}>{t}</span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PREVIEW: show image + scan button ── */}
      {(scanStage === "preview") && (
        <div>
          <div style={{background:"var(--ink)",border:"1px solid var(--border2)",borderRadius:16,overflow:"hidden",marginBottom:12}}>
            {previewSrc !== "pdf"
              ? <img src={previewSrc} alt="Flyer" style={{width:"100%",maxHeight:260,objectFit:"cover",display:"block"}}/>
              : <div style={{padding:"32px 20px",textAlign:"center"}}>
                  <div style={{fontSize:44,marginBottom:10}}>📄</div>
                  <p style={{fontWeight:600,color:"var(--cream)",fontSize:15,marginBottom:4}}>{fileName}</p>
                  <p style={{fontSize:13,color:"var(--cream3)"}}>PDF ready</p>
                </div>
            }
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderTop:"1px solid var(--border)"}}>
              <span style={{fontSize:13,fontWeight:500,color:"var(--cream3)",maxWidth:200,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{fileName}</span>
              <button onClick={resetScanner} style={{fontSize:12,fontWeight:600,color:"var(--sage2)",background:"none",border:"none",cursor:"pointer"}}>Change</button>
            </div>
          </div>
          <button onClick={doScan}
            style={{width:"100%",background:"linear-gradient(135deg,var(--sage),var(--sage2))",color:"var(--ink)",border:"none",borderRadius:14,padding:"15px",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 20px rgba(45,90,61,.28)"}}>
            🔍 Extract Events with AI
          </button>
        </div>
      )}

      {/* ── LOADING ── */}
      {(scanStage === "loading") && (
        <div style={{background:"var(--ink)",border:"1px solid var(--border)",borderRadius:18,padding:"32px 20px",textAlign:"center"}}>
          <div style={{width:36,height:36,border:"3px solid var(--border2)",borderTopColor:"var(--sage2)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 16px"}}/>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:"var(--cream)",marginBottom:5}}>Reading your flyer…</p>
          <p style={{fontSize:13,color:"var(--cream3)",marginBottom:20}}>Claude AI is extracting all events</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {stepLabels.map(function(label, i) {
              var isDone   = i < loadingStep;
              var isActive = i === loadingStep;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:isActive?"rgba(45,90,61,.08)":"var(--ink2)",borderRadius:10,transition:"all .3s"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:isDone?"var(--sage3)":isActive?"var(--sage2)":"var(--border2)",transition:"background .3s"}}/>
                  <span style={{fontSize:13,fontWeight:500,color:isDone?"var(--sage3)":isActive?"var(--sage2)":"var(--cream3)",transition:"color .3s"}}>{label}</span>
                  {isDone && <span style={{marginLeft:"auto",fontSize:12,color:"var(--sage3)"}}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PDF HINT ── */}
      {(scanStage === "pdfhint") && (
        <div>
          <div style={{background:"rgba(212,129,58,.08)",border:"1px solid rgba(212,129,58,.25)",borderRadius:14,padding:"16px",marginBottom:14,display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>📸</span>
            <div>
              <p style={{fontWeight:700,fontSize:14,color:"var(--gold2)",marginBottom:3}}>Screenshot the PDF instead</p>
              <p style={{fontSize:13,color:"var(--gold2)",lineHeight:1.6}}>{errorMsg}</p>
            </div>
          </div>
          <button onClick={resetScanner}
            style={{width:"100%",background:"var(--sage)",border:"none",borderRadius:14,padding:"14px",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer"}}>
            Upload a screenshot
          </button>
        </div>
      )}

      {/* ── ERROR ── */}
      {(scanStage === "error") && (
        <div>
          <div style={{background:"rgba(168,56,56,.06)",border:"1px solid rgba(168,56,56,.2)",borderRadius:14,padding:"16px",marginBottom:14,display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
            <div>
              <p style={{fontWeight:700,fontSize:14,color:"var(--rose)",marginBottom:3}}>Couldn't scan this flyer</p>
              <p style={{fontSize:13,color:"var(--rose)",lineHeight:1.6}}>{errorMsg}</p>
            </div>
          </div>
          <button onClick={resetScanner}
            style={{width:"100%",background:"var(--ink)",border:"1.5px solid var(--border2)",borderRadius:14,padding:"14px",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",fontSize:15,fontWeight:600,color:"var(--cream3)",cursor:"pointer"}}>
            Try a different image
          </button>
        </div>
      )}

      {/* ── REVIEW ── */}
      {(scanStage === "review") && (
        <div>
          {/* Header row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,fontWeight:700,color:"var(--cream)",lineHeight:1}}>Found {extractedEvs.length} event{extractedEvs.length !== 1 ? "s" : ""}</p>
              <p style={{fontSize:13,color:"var(--cream3)",marginTop:3}}>{selectedIds.size} selected</p>
            </div>
            <button onClick={toggleAll}
              style={{fontSize:13,fontWeight:600,color:"var(--sage2)",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
              {selectedIds.size === extractedEvs.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Event cards */}
          {extractedEvs.map(function(ev) {
            var isOn = selectedIds.has(ev.id);
            return (
              <div key={ev.id} style={{background:"var(--ink)",border:"1px solid var(--border2)",borderLeft:"3px solid "+(isOn?"var(--sage2)":"var(--border3)"),borderRadius:16,padding:16,marginBottom:10,opacity:isOn?1:.55,transition:"opacity .2s,border-color .2s"}}>
                {/* Title + toggle */}
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div onClick={function() { toggleEvent(ev.id); }}
                    style={{width:24,height:24,borderRadius:7,border:"2px solid "+(isOn?"var(--sage2)":"var(--border3)"),background:isOn?"var(--sage2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all .2s"}}>
                    {isOn && <Check size={13} color="var(--ink)"/>}
                  </div>
                  <input value={ev.title}
                    onChange={function(e) { updateEv(ev.id, {title: e.target.value}); }}
                    style={{flex:1,fontWeight:700,fontSize:15,border:"none",borderBottom:"1px solid var(--border2)",borderRadius:0,padding:"2px 0",background:"transparent",color:"var(--cream)"}}/>
                </div>

                {/* Date / Time / Location */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>DATE</label>
                    <input type="date" value={ev.date}
                      onChange={function(e) { updateEv(ev.id, {date: e.target.value}); }}
                      style={{fontSize:14,padding:"8px 10px"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>TIME</label>
                    <input type="time" value={ev.time}
                      onChange={function(e) { updateEv(ev.id, {time: e.target.value}); }}
                      style={{fontSize:14,padding:"8px 10px"}}/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>LOCATION</label>
                    <input value={ev.location}
                      onChange={function(e) { updateEv(ev.id, {location: e.target.value}); }}
                      placeholder="Add location…"
                      style={{fontSize:14,padding:"8px 10px"}}/>
                  </div>
                  {ev.notes ? (
                    <div style={{gridColumn:"span 2"}}>
                      <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>NOTES</label>
                      <input value={ev.notes}
                        onChange={function(e) { updateEv(ev.id, {notes: e.target.value}); }}
                        style={{fontSize:14,padding:"8px 10px"}}/>
                    </div>
                  ) : null}
                  {/* For which member */}
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:7,letterSpacing:".04em"}}>FOR</label>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {members && members.map(function(m) {
                        var active = ev.memberId === m.id;
                        return (
                          <button key={m.id}
                            onClick={function() { updateEv(ev.id, {memberId: m.id}); }}
                            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:99,border:"1.5px solid",borderColor:active?m.color:"var(--border2)",background:active?m.color+"22":"transparent",cursor:"pointer"}}>
                            <span style={{fontSize:15}}>{m.emoji}</span>
                            <span style={{fontSize:14,fontWeight:active?700:400,color:active?m.color:"var(--cream2)"}}>{m.name}</span>
                            {active && <Check size={11} color={m.color}/>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Action buttons */}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button onClick={resetScanner}
              style={{flex:1,background:"var(--ink)",border:"1.5px solid var(--border2)",borderRadius:12,padding:"13px",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",fontSize:15,fontWeight:600,color:"var(--cream3)",cursor:"pointer"}}>
              Cancel
            </button>
            <button onClick={confirmAdd} disabled={selectedIds.size === 0}
              style={{flex:2,background:selectedIds.size===0?"var(--ink4)":"linear-gradient(135deg,var(--sage),var(--sage2))",color:selectedIds.size===0?"var(--cream3)":"var(--ink)",border:"none",borderRadius:12,padding:"13px",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",fontSize:15,fontWeight:700,cursor:selectedIds.size===0?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:selectedIds.size===0?"none":"0 4px 16px rgba(45,90,61,.28)"}}>
              <Check size={15}/> Add {selectedIds.size} event{selectedIds.size !== 1 ? "s" : ""} to Calendar
            </button>
          </div>
          <p style={{textAlign:"center",fontSize:13,color:"var(--cream3)",marginTop:10}}>You can edit any field before adding.</p>
        </div>
      )}

      {/* ── DONE ── */}
      {(scanStage === "done") && (
        <div style={{textAlign:"center",padding:"36px 0"}}>
          <div style={{width:64,height:64,background:"rgba(45,90,61,.06)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",border:"1px solid rgba(83,136,122,.4)"}}>
            <Check size={28} color="var(--sage2)"/>
          </div>
          <p style={{fontWeight:800,fontSize:18,color:"var(--sage3)",marginBottom:6}}>Added to Calendar!</p>
          <p style={{fontSize:14,color:"var(--cream3)"}}>Events saved from your flyer 🌸</p>
        </div>
      )}
    </div>
  );
}

function InboxScreen({members,onAdd,user,familyId,topBar,aiDisclosureSeen,onShowAiDisclosure}) {
  const [tab,setTab]=useState("email");
  const [text,setText]=useState("");
  const [stage,setStage]=useState("idle");
  const [extracted,setExtracted]=useState([]);
  const [checked,setChecked]=useState(new Set());
  const [deleteProgress,setDeleteProgress]=useState(0);
  const [instructor,setInstructor]=useState(null); // {name, group, type, isUpdate, isCancelled}
  const [log,setLog]=useState([]);

  // ── Received emails from catch address ───────────────────────────────────
  const [catchItems,setCatchItems]=useState([]);
  const [loadingCatch,setLoadingCatch]=useState(false);
  const [selectedCatchId,setSelectedCatchId]=useState(null); // id of item being processed

  var catchPrefix=user&&user.catchPrefix?user.catchPrefix:(user&&user.id?user.id.replace(/-/g,"").slice(0,10):"");

  function loadCatchItems(){
    if(!catchPrefix) return;
    setLoadingCatch(true);
    // Query by catch_prefix OR by family_id so both co-parents see shared inbox
    var q=supabase.from("catch_items")
      .select("id,from_address,from_name,subject,body_text,received_at,processed")
      .eq("processed",false)
      .order("received_at",{ascending:false})
      .limit(20);
    if(familyId){
      q=supabase.from("catch_items")
        .select("id,from_address,from_name,subject,body_text,received_at,processed")
        .eq("family_id",familyId)
        .eq("processed",false)
        .order("received_at",{ascending:false})
        .limit(20);
    } else {
      q=supabase.from("catch_items")
        .select("id,from_address,from_name,subject,body_text,received_at,processed")
        .eq("catch_prefix",catchPrefix)
        .eq("processed",false)
        .order("received_at",{ascending:false})
        .limit(20);
    }
    q.then(function(res){
      setLoadingCatch(false);
      if(res.data) setCatchItems(res.data);
    }).catch(function(){setLoadingCatch(false);});
  }

  // Load on mount and when tab becomes email
  useEffect(function(){
    if(tab==="email") loadCatchItems();
  },[tab,familyId,catchPrefix]);

  // Poll every 30 s while on email tab
  useEffect(function(){
    if(tab!=="email") return;
    var interval=setInterval(function(){loadCatchItems();},30000);
    return function(){clearInterval(interval);};
  },[tab,familyId,catchPrefix]);

  function openCatchItem(item){
    setSelectedCatchId(item.id);
    var body=item.body_text||item.subject||"";
    setText(body);
    // Auto-analyze immediately — no need to scroll and tap another button
    analyze(body);
  }

  function deleteCatchItem(id){
    supabase.from("catch_items").delete().eq("id",id).then(function(){
      setCatchItems(function(prev){return prev.filter(function(x){return x.id!==id;});});
    }).catch(function(){});
  }

  function fmtReceivedAt(iso){
    if(!iso) return "";
    var d=new Date(iso);
    var now=new Date();
    var diff=Math.floor((now-d)/60000);
    if(diff<2) return "just now";
    if(diff<60) return diff+"m ago";
    if(diff<1440) return Math.floor(diff/60)+"h ago";
    return d.toLocaleDateString("en-CA",{month:"short",day:"numeric"});
  }

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
      // Skip if candidate starts with a time (e.g. "3pm", "12:30pm", "3 pm")
      if(/^\d{1,2}(?::\d{2})?\s*(?:am|pm)/i.test(cand)) continue;
      // Skip common non-venue words
      if(/^(the|a|an|this|that|our|your|his|her|their|my)\b/i.test(cand)) continue;
      // Must contain a venue-like word OR be Title Case
      var venueWords2=["field","park","arena","centre","center","school","hall","court","pool","studio","gym","complex","rink","church","ground","facility","track","dome","stadium","pavilion","rec","rec centre","community","ymca","ice","sport","diamond","pitch","oval","square","road","rd","ave","street","st","drive","dr","blvd","way"];
      var lo2=cand.toLowerCase();
      var hasVenueWord=venueWords2.some(function(vw){return lo2.includes(vw);});
      var isTitleCase=/^[A-Z]/.test(cand);
      var isAddress=/\d/.test(cand);
      if((hasVenueWord||isTitleCase||isAddress)&&cand.length>3&&cand.length<55){
        // Strip everything from an em dash / en dash / " - " onward (e.g. "Minto Arena — Coach Smith")
        cand=cand.split(/\s*[—–]\s*/)[0].trim();
        cand=cand.split(/\s+-\s+/)[0].trim();
        if(cand.length>3) atMatches.push(cand);
      }
    }
    // Prefer the match that actually contains a venue word
    if(atMatches.length){
      var venueWords3=["field","park","arena","centre","center","school","hall","court","pool","studio","gym","complex","rink","church","ground","facility","track","dome","stadium","pavilion","rec","community","ymca"];
      var best=atMatches.find(function(c){return venueWords3.some(function(vw){return c.toLowerCase().includes(vw);});});
      return best||atMatches[0];
    }

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
          var candidate=words.slice(start,vIdx+1).filter(function(w){return w.length>0;});
          // Walk backwards from venue word, keep only Title Case words (stops at lowercase like "at","3pm")
          var venueResult=[];
          for(var ci=candidate.length-1;ci>=0;ci--){
            var cw=candidate[ci];
            if(/^[A-Z]/.test(cw)){venueResult.unshift(cw);}
            else{break;}
          }
          var result=venueResult.length>0?venueResult.join(" "):candidate.join(" ");
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
  const analyze=(overrideText)=>{
    var t=overrideText||text;
    if(!t.trim()) return;
    if(overrideText) setText(overrideText);
    setStage("analyzing");
    setTimeout(function(){
      try{
      var lo=t.toLowerCase();
      var MN=["january","february","march","april","may","june","july","august","september","october","november","december"];
      var MNA=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
      var WD=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
      var now=new Date();
      var evs=[];

      // ── Time parser ─────────────────────────────────────────────────────
      function parseTime(raw){
        if(!raw) return "";
        var m=raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
        if(!m) return "";
        var h=parseInt(m[1]);
        var mn=m[2]||"00";
        if(m[3].toLowerCase()==="pm"&&h<12) h+=12;
        if(m[3].toLowerCase()==="am"&&h===12) h=0;
        return String(h).padStart(2,"0")+":"+mn;
      }

      // ── Suggest member ───────────────────────────────────────────────────
      function suggestMember(ctx2){
        for(var mi=0;mi<members.length;mi++){
          if(ctx2.toLowerCase().includes(members[mi].name.toLowerCase())) return members[mi].id;
        }
        return members[0]&&members[0].id||"";
      }

      // ── Location extractor ───────────────────────────────────────────────
      function getLocation(ctx){
        // Pattern 1: explicit label
        var lb=ctx.match(/(?:location|venue|address|place|held at|located at|where)[:\s]+([A-Za-z0-9][^\n,]{3,60}?)(?:[,\n]|$)/i);
        if(lb&&lb[1].trim().length>3) return lb[1].trim();
        // Pattern 2: "at <Venue>"
        var atRe=/\bat\s+([A-Za-z][A-Za-z0-9' ]{2,50}?)(?=\s*[.,\n!?]|\s+on\b|\s+from\b|$)/gi;
        var atM;
        var venueWords=["field","park","arena","centre","center","school","hall","court","pool","studio","gym","complex","rink","church","grounds","facility","track","dome","stadium","pavilion","rec","ymca","community","clinic","hospital","office","library","lab","room","rd","ave","street","st","drive","blvd","way","diamond","pitch"];
        while((atM=atRe.exec(ctx))!==null){
          var cand=atM[1].trim();
          var hasV=venueWords.some(function(v){return cand.toLowerCase().includes(v);});
          var isAddr=/\d/.test(cand);
          var isCap=/^[A-Z]/.test(cand);
          if((hasV||isAddr||isCap)&&cand.length>3&&cand.length<55) return cand;
        }
        // Pattern 3: venue word preceded by title case words
        var vwMain=["Field","Park","Arena","Centre","Center","School","Hall","Court","Pool","Studio","Gym","Complex","Rink","Grounds","Stadium","Track","Clinic","Hospital","Library","Community"];
        for(var i=0;i<vwMain.length;i++){
          var vi=ctx.toLowerCase().indexOf(vwMain[i].toLowerCase());
          if(vi>0){
            var lineStart=ctx.lastIndexOf("\n",vi)+1;
            var seg=ctx.slice(lineStart,vi+vwMain[i].length);
            var words=seg.replace(/[.,!?;:]/g," ").trim().split(/\s+/);
            var vIdx=words.map(function(w){return w.toLowerCase();}).lastIndexOf(vwMain[i].toLowerCase());
            if(vIdx>=0){
              var result=words.slice(Math.max(0,vIdx-4),vIdx+1).filter(function(w){return w.length>0;}).join(" ");
              if(result.length>3) return result;
            }
          }
        }
        // Pattern 4: street address
        var addr=ctx.match(/(\d{1,5}\s+[A-Za-z][A-Za-z0-9 ]{3,40}(?:Road|Rd|Street|St|Avenue|Ave|Blvd|Drive|Dr|Way|Lane|Court)\.?)/i);
        if(addr) return addr[1].trim();
        return "";
      }

      // ── Local date formatter (avoids UTC-offset day-shift from toISOString) ─
      function localDateStr(d){
        return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
      }

      // ── Date parsers ─────────────────────────────────────────────────────
      // Parse "March 29" or "March 29th" or "Mar 29"
      function parseNamedDate(str){
        var m=str.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
        if(!m) return "";
        var mIdx=MN.indexOf(m[1].toLowerCase());
        if(mIdx===-1) mIdx=MNA.indexOf(m[1].toLowerCase().slice(0,3));
        if(mIdx===-1) return "";
        var d=new Date(now.getFullYear(),mIdx,parseInt(m[2]));
        if(d<now) d.setFullYear(now.getFullYear()+1);
        return localDateStr(d);
      }

      // Parse "Monday" / "this Monday" / "next Monday"
      function parseWeekdayDate(str){
        var m=str.match(/(?:this|next|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        if(!m) return "";
        var wdi=WD.indexOf(m[1].toLowerCase());
        var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()); // midnight local — no UTC shift
        var diff=(wdi-d.getDay()+7)%7;
        if(diff===0) diff=7; // if today, use next week
        d.setDate(d.getDate()+diff);
        return localDateStr(d);
      }

      // ── Extract subject line ─────────────────────────────────────────────
      var subjectMatch=t.match(/subject[:\s]+([^\n]+)/i);
      var subjectLine=subjectMatch?subjectMatch[1].trim():"";

      // ── Detect instructor ────────────────────────────────────────────────
      var inst=detectInstructor(t);
      setInstructor(inst);

      // ── Build base title ─────────────────────────────────────────────────
      var titlePrefix="";
      if(inst){
        if(inst.activityType) titlePrefix=inst.activityType.charAt(0).toUpperCase()+inst.activityType.slice(1);
        else if(inst.group) titlePrefix=inst.group;
        if(inst.name&&inst.name!=="Your instructor") titlePrefix+=(titlePrefix?" — ":"")+"Coach "+inst.name.split(" ")[0];
      }

      // ── Remove duplicate dates tracker ───────────────────────────────────
      var usedDates={};

      // ── 1. Specific named dates: March 29, Apr 6th, etc. ─────────────────
      var namedRe=/([A-Z][a-z]+\.?\s+\d{1,2}(?:st|nd|rd|th)?)(?!\d)/g;
      var nm;
      while((nm=namedRe.exec(t))!==null){
        var ds=parseNamedDate(nm[1]);
        if(!ds||usedDates[ds]) continue;
        usedDates[ds]=true;
        // Get the CURRENT LINE containing the date — tightest possible context
        var lineStart2=t.lastIndexOf("\n",nm.index)+1;
        var lineEnd2=t.indexOf("\n",nm.index);
        if(lineEnd2===-1) lineEnd2=t.length;
        var lineCtx=t.slice(lineStart2,lineEnd2);
        // Also get ±1 line context if needed
        var nearCtx=t.slice(Math.max(0,nm.index-80),Math.min(t.length,nm.index+120));
        // Time: prefer same line, fall back to near context
        var tm2=lineCtx.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i)||nearCtx.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
        // Location: prefer same line
        var loc2=getLocation(lineCtx)||getLocation(nearCtx);
        // Title: extract event keyword from current line (Practice, Game, Lesson etc.)
        var eventKws=["practice","game","match","lesson","class","session","appointment","dentist","doctor","meeting","training","rehearsal","recital","concert","tournament","tryout","camp","clinic","checkup","playdate"];
        var lineTitle="";
        var lineLo2=lineCtx.toLowerCase();
        for(var eki=0;eki<eventKws.length;eki++){
          if(lineLo2.includes(eventKws[eki])){
            lineTitle=eventKws[eki].charAt(0).toUpperCase()+eventKws[eki].slice(1);
            break;
          }
        }
        var title2=lineTitle?(titlePrefix?(titlePrefix+" — "+lineTitle):lineTitle):(titlePrefix||subjectLine||"Event on "+nm[1]);
        if(inst&&inst.isCancelled) title2+=" — CANCELLED";
        if(inst&&inst.isReschedule) title2+=" (Rescheduled)";
        evs.push({id:genId(),title:title2,date:ds,time:parseTime(tm2&&tm2[1]||""),location:loc2,memberId:suggestMember(lineCtx),confidence:tm2?"high":"medium",notes:""});
      }

      // ── 2. Weekday references: this Thursday, next Monday, on Saturday ───
      var wdRe=/(?:this|next|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
      var wm;
      while((wm=wdRe.exec(lo))!==null){
        var wds=parseWeekdayDate(wm[0]);
        if(!wds||usedDates[wds]) continue;
        usedDates[wds]=true;
        var ctx3fwd=t.slice(wm.index,Math.min(t.length,wm.index+200));
        // Search both before and after the weekday for a time (e.g. "at 10 PM on Monday")
        var ctx3around=t.slice(Math.max(0,wm.index-80),Math.min(t.length,wm.index+200));
        var tm3=ctx3around.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
        var loc3=getLocation(ctx3fwd)||getLocation(t);
        var lineBefore3=t.slice(Math.max(0,wm.index-120),wm.index);
        var lastLine3=lineBefore3.split("\n").pop().trim();
        var sentenceTitle3=lastLine3
          .replace(/\s+(?:on|at|this|next)\s*$/i,"")                      // strip trailing "at/on"
          .replace(/\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi,"") // strip time (e.g. "at 10 PM")
          .trim();
        var title3=sentenceTitle3&&sentenceTitle3.length>2&&sentenceTitle3.length<50?sentenceTitle3:(titlePrefix||subjectLine||wm[1].charAt(0).toUpperCase()+wm[1].slice(1)+" Event");
        // Use full text for member suggestion so names before the weekday are found
        evs.push({id:genId(),title:title3,date:wds,time:parseTime(tm3&&tm3[1]||""),location:loc3,memberId:suggestMember(t),confidence:tm3?"high":"medium",notes:""});
      }

      // ── 3. Recurring "every Monday" ──────────────────────────────────────
      var recRe=/every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
      var rm3;
      while((rm3=recRe.exec(lo))!==null){
        var rdi=WD.indexOf(rm3[1]);
        var rctx=t.slice(rm3.index,Math.min(t.length,rm3.index+300));
        var rtm=rctx.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
        var rloc=getLocation(rctx)||getLocation(t);
        var rlineBefore=t.slice(Math.max(0,rm3.index-120),rm3.index);
        var rLastLine=rlineBefore.split("\n").pop().trim();
        var rSentTitle=rLastLine.replace(/\s+(?:every|on|at)\s*$/i,"").trim();
        var rtitle=rSentTitle&&rSentTitle.length>2&&rSentTitle.length<50?rSentTitle:(titlePrefix||subjectLine||rm3[1].charAt(0).toUpperCase()+rm3[1].slice(1)+" Session");
        for(var w=0;w<4;w++){
          var rd=new Date(now.getFullYear(),now.getMonth(),now.getDate());
          var rdiff=(rdi-rd.getDay()+7)%7+w*7;
          if(rdiff===0) rdiff=7;
          rd.setDate(rd.getDate()+rdiff);
          var rds=localDateStr(rd);
          if(!usedDates[rds]){
            usedDates[rds]=true;
            evs.push({id:genId(),title:rtitle,date:rds,time:parseTime(rtm&&rtm[1]||""),location:rloc,memberId:suggestMember(t),confidence:rtm?"high":"medium",notes:""});
          }
        }
      }

      // ── 4. Fallback — no dates found but has time and location ───────────
      if(!evs.length){
        var fbTm=t.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
        var fbLoc=getLocation(t);
        evs.push({id:genId(),title:titlePrefix||subjectLine||"",date:"",time:parseTime(fbTm&&fbTm[1]||""),location:fbLoc,memberId:suggestMember(t),confidence:"low",notes:""});
      }

      // Go straight to review — deletion happens only after user confirms Save
      setExtracted(evs);
      setChecked(new Set(evs.map(function(e){return e.id;})));
      // Show one-time AI + privacy disclosure if a kid's name was detected
      var kidNameDetected=evs.some(function(e){return e.memberId;})&&members.some(function(m){return t.toLowerCase().includes(m.name.toLowerCase());});
      if(kidNameDetected&&!aiDisclosureSeen&&onShowAiDisclosure) onShowAiDisclosure();
      setStage("review");
      }catch(e){
        console.error("analyze crash:",e);
        setStage("idle");
      }
    },1200);
  };

    const confirmEmail=()=>{
    // Add events to calendar
    extracted.filter(function(e){return checked.has(e.id);}).forEach(function(e){
      var m=members.find(function(x){return x.id===e.memberId;})||members[0];
      onAdd({...e,color:m&&m.color||"#111",id:genId()});
    });
    var logSubject=instructor?("From "+(instructor.name||"Instructor")+(instructor.group?" · "+instructor.group:"")):text.split("\n")[0].slice(0,60)||"Email";
    setLog(function(l){return [{id:genId(),subject:logSubject,date:todayStr,count:extracted.length,instructor:!!instructor},...l];});
    // If this came from the inbox, run deletion animation THEN delete + done
    if(selectedCatchId){
      var captureCatchId=selectedCatchId;
      setStage("deleting");
      setDeleteProgress(0);
      var prog2=0;
      var iv2=setInterval(function(){
        prog2=Math.min(100,prog2+4);
        setDeleteProgress(prog2);
        if(prog2>=100){
          clearInterval(iv2);
          deleteCatchItem(captureCatchId);
          setSelectedCatchId(null);
          setTimeout(function(){
            setStage("done");
            setTimeout(function(){setStage("idle");setText("");setExtracted([]);setChecked(new Set());setDeleteProgress(0);setInstructor(null);},2200);
          },300);
        }
      },28);
    } else {
      setStage("done");
      setTimeout(function(){setStage("idle");setText("");setExtracted([]);setChecked(new Set());setDeleteProgress(0);setInstructor(null);},2200);
    }
  };

  const cd=function(c){return c==="high"?"var(--sage2)":c==="medium"?"#D97706":"#DC2626";};
  const Tab=({id,label,icon})=><button onClick={function(){setTab(id);}} style={{flex:1,padding:"9px 4px",borderRadius:8,background:tab===id?"#fff":"transparent",color:tab===id?"var(--cream)":"var(--cream3)",fontWeight:600,fontSize:13,border:"none",boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.08)":"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><span>{icon}</span>{label}</button>;

  return (
    <div className="screen-enter">
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div style={{background:"linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%)",margin:"-20px -18px 20px",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 24px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 24px rgba(30,61,42,.25)"}}>
        {topBar}
        <div style={{textAlign:"center",marginBottom:18}}>
          <p style={{fontSize:11,fontWeight:700,color:"rgba(245,240,232,.5)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Smart Inbox</p>
          <p style={{fontSize:27,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.2,letterSpacing:"-.5px",marginBottom:0}}>Calla Remembers<br/>Everything.</p>
        </div>
        {/* Tab switcher */}
        <div style={{background:"rgba(255,255,255,.10)",borderRadius:14,padding:4,display:"flex",gap:4}}>
          <button onClick={function(){setTab("email");}} style={{flex:1,padding:"9px 0",borderRadius:10,background:tab==="email"?"#f5f0e8":"transparent",color:tab==="email"?"#1e3d2a":"rgba(245,240,232,.8)",fontWeight:700,fontSize:13,border:"none",transition:"all .2s",fontFamily:"-apple-system,sans-serif"}}>✉️ Email Inbox</button>
          <button onClick={function(){setTab("flyer");}} style={{flex:1,padding:"9px 0",borderRadius:10,background:tab==="flyer"?"#f5f0e8":"transparent",color:tab==="flyer"?"#1e3d2a":"rgba(245,240,232,.8)",fontWeight:700,fontSize:13,border:"none",transition:"all .2s",fontFamily:"-apple-system,sans-serif"}}>📄 Flyer Capture</button>
        </div>
      </div>

      {/* Flyer tab */}
      {tab==="flyer"&&(
        <FlyerScanner members={members} onAdd={onAdd}/>
      )}

      {/* Email tab — idle */}
      {tab==="email"&&stage==="idle"&&(
        <>
          {/* ── Private address card ─────────────────────────────────────── */}
          {(function(){
            var addr=catchPrefix+"@getcalla.ca";
            return (
              <div style={{background:"linear-gradient(135deg,#1e3d2a 0%,#2d5a3d 100%)",borderRadius:20,padding:"18px 18px 16px",marginBottom:20,boxShadow:"0 4px 20px rgba(30,61,42,.18)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"rgba(245,240,232,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔒</div>
                  <div>
                    <p style={{fontWeight:700,fontSize:13,color:"rgba(245,240,232,.5)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:1}}>Your Private Catch Address</p>
                  </div>
                </div>
                <div style={{background:"rgba(245,240,232,.08)",border:"1px solid rgba(245,240,232,.15)",borderRadius:12,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                  <code style={{flex:1,fontSize:14,fontWeight:700,color:"#a8d5b5",letterSpacing:".02em",wordBreak:"break-all"}}>{addr}</code>
                  <button onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(addr);}} style={{background:"rgba(245,240,232,.15)",border:"none",borderRadius:8,padding:"7px 12px",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:"#f5f0e8",flexShrink:0,cursor:"pointer"}}>
                    <Copy size={12}/>Copy
                  </button>
                </div>
                <p style={{fontSize:13,color:"rgba(245,240,232,.6)",lineHeight:1.55}}>Forward coach or school emails here, or CC it when registering for activities.</p>
              </div>
            );
          })()}

          {/* ── Inbox emails ─────────────────────────────────────────────── */}
          {loadingCatch&&catchItems.length===0&&(
            <div style={{textAlign:"center",padding:"24px 0 8px"}}>
              <div style={{width:32,height:32,border:"2.5px solid var(--border2)",borderTopColor:"var(--sage2)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
              <p style={{fontSize:14,color:"var(--cream3)"}}>Checking inbox…</p>
            </div>
          )}

          {catchItems.length>0&&(
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <p style={{fontSize:13,fontWeight:700,color:"var(--cream2)",letterSpacing:".05em",textTransform:"uppercase"}}>Inbox</p>
                  <span style={{background:"var(--sage2)",color:"#fff",borderRadius:99,padding:"2px 8px",fontSize:11,fontWeight:800}}>{catchItems.length}</span>
                </div>
                <button onClick={loadCatchItems} style={{background:"none",border:"none",color:"var(--sage2)",fontSize:13,fontWeight:600,padding:"4px 0",cursor:"pointer"}}>↻ Refresh</button>
              </div>
              {catchItems.map(function(item){
                var isSelected=selectedCatchId===item.id;
                var initials=((item.from_name||item.from_address||"?").trim().split(/\s+/).map(function(w){return w[0];}).slice(0,2).join("")).toUpperCase()||"?";
                return (
                  <div key={item.id} style={{background:isSelected?"rgba(45,90,61,.08)":"var(--ink2)",border:"1.5px solid "+(isSelected?"var(--sage2)":"var(--border2)"),borderRadius:18,padding:"14px 14px 12px",marginBottom:10,boxShadow:isSelected?"0 0 0 3px rgba(45,90,61,.12)":"0 1px 4px rgba(0,0,0,.06)",transition:"all .2s"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                      {/* Sender avatar */}
                      <div style={{width:40,height:40,borderRadius:13,background:"linear-gradient(135deg,#2d5a3d,#4a8a64)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#f5f0e8",flexShrink:0,letterSpacing:".02em"}}>{initials}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:700,fontSize:14,color:"var(--cream)",marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.subject||"(No subject)"}</p>
                        <p style={{fontSize:12,color:"var(--cream3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.from_name||item.from_address||"Unknown"} · {fmtReceivedAt(item.received_at)}</p>
                      </div>
                      <button onClick={function(){deleteCatchItem(item.id);}} style={{background:"none",border:"none",padding:"4px 6px",color:"var(--cream3)",fontSize:18,flexShrink:0,cursor:"pointer",lineHeight:1}}>×</button>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:12}}>
                      <button onClick={function(){openCatchItem(item);}} style={{flex:1,background:"linear-gradient(135deg,#2d5a3d,#3d7a54)",color:"#f5f0e8",border:"none",borderRadius:11,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 8px rgba(45,90,61,.3)"}}>
                        ✨ Extract Events
                      </button>
                      <button onClick={function(){deleteCatchItem(item.id);}} style={{background:"var(--ink3)",color:"var(--cream3)",border:"1px solid var(--border2)",borderRadius:11,padding:"10px 16px",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                        Discard
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Empty inbox state ────────────────────────────────────────── */}
          {!loadingCatch&&catchItems.length===0&&(
            <div style={{textAlign:"center",padding:"8px 0 20px"}}>
              <div style={{fontSize:40,marginBottom:10,opacity:.5}}>📭</div>
              <p style={{fontWeight:700,fontSize:15,color:"var(--cream2)",marginBottom:4}}>Inbox is empty</p>
              <p style={{fontSize:13,color:"var(--cream3)",lineHeight:1.6,maxWidth:260,margin:"0 auto 0"}}>Forward a coach or school email to your catch address and it'll appear here automatically.</p>
            </div>
          )}

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0 16px"}}>
            <div style={{flex:1,height:1,background:"var(--border2)"}}/>
            <p style={{fontSize:12,fontWeight:600,color:"var(--cream3)",letterSpacing:".06em",textTransform:"uppercase"}}>or paste an email</p>
            <div style={{flex:1,height:1,background:"var(--border2)"}}/>
          </div>

          {/* ── Paste section ────────────────────────────────────────────── */}
          <div style={{background:"var(--ink2)",border:"1.5px solid var(--border2)",borderRadius:18,overflow:"hidden",marginBottom:12}}>
            <textarea rows={6} placeholder={"Paste any email text here…\n\nWorks for:\n• Practice & game schedules\n• Cancellations & rescheduling\n• Registration confirmations\n• Any message with event details"} value={text} onChange={e=>{setText(e.target.value);if(!e.target.value)setSelectedCatchId(null);}} style={{resize:"none",fontSize:14,lineHeight:1.7,border:"none",borderRadius:0,background:"transparent",padding:"14px 16px",width:"100%",boxSizing:"border-box"}}/>
            {text.trim()&&(
              <div style={{borderTop:"1px solid var(--border2)",padding:"10px 12px",display:"flex",justifyContent:"flex-end"}}>
                <button onClick={()=>analyze()} style={{background:"linear-gradient(135deg,#2d5a3d,#3d7a54)",color:"#f5f0e8",border:"none",borderRadius:10,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 8px rgba(45,90,61,.3)"}}>
                  ✨ Extract Events
                </button>
              </div>
            )}
          </div>
          {!text.trim()&&(
            <button disabled style={{width:"100%",background:"var(--ink3)",color:"var(--cream3)",borderRadius:12,padding:"13px",fontWeight:700,fontSize:14,border:"1.5px dashed var(--border2)",opacity:.6,cursor:"default",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              ✨ Extract Events
            </button>
          )}
        </>
      )}

      {tab==="email"&&stage==="analyzing"&&(
        <div style={{textAlign:"center",padding:"48px 0 32px"}}>
          <style>{`@keyframes pulseRing{0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(45,90,61,.5)}70%{transform:scale(1);box-shadow:0 0 0 14px rgba(45,90,61,0)}100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(45,90,61,0)}}`}</style>
          <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#2d5a3d,#4a8a64)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",animation:"pulseRing 1.4s ease-out infinite",fontSize:26}}>✉️</div>
          <p style={{fontWeight:800,fontSize:17,color:"var(--cream)",marginBottom:6,fontFamily:"'Playfair Display',Georgia,serif"}}>Reading your email…</p>
          <p style={{fontSize:14,color:"var(--cream3)",lineHeight:1.6}}>Detecting events, dates & sender</p>
        </div>
      )}

      {tab==="email"&&stage==="deleting"&&(
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

      {tab==="email"&&stage==="review"&&(
        <div>
          {/* Privacy note — only shown when reviewing a caught inbox email */}
          {selectedCatchId&&(
          <div style={{background:"rgba(45,90,61,.06)",border:"1px solid rgba(83,136,122,.2)",borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <Check size={16} color="var(--sage2)" style={{flexShrink:0}}/>
            <div style={{flex:1}}><p style={{fontWeight:700,color:"var(--sage3)",fontSize:15}}>Email will be deleted on save ✓</p><p style={{fontSize:15,color:"var(--sage3)"}}>Only the events below will be saved</p></div>
          </div>
          )}

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
                <div style={{background:"rgba(140,100,20,.08)",border:"1px solid rgba(140,100,20,.18)",borderRadius:8,padding:"8px 12px",display:"flex",gap:8,alignItems:"center"}}>
                  <AlertTriangle size={13} color="#D97706" style={{flexShrink:0}}/>
                  <p style={{fontSize:15,color:"var(--gold)",fontWeight:600}}>Time or location has changed — review the updated details below.</p>
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
                    <span style={{fontSize:12,color:"var(--cream3)"}}>{ev.confidence}</span>
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
                    <div style={{gridColumn:"span 2"}}>
                      <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:5,letterSpacing:".04em"}}>LOCATION</label>
                      <input value={ev.location} onChange={e=>setExtracted(x=>x.map(i=>i.id===ev.id?{...i,location:e.target.value}:i))} placeholder="Add location…" style={{fontSize:14,padding:"8px 10px"}}/>
                    </div>
                  )}
                  <div style={{gridColumn:"span 2"}}>
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
          <p style={{textAlign:"center",fontSize:15,color:"var(--cream3)",marginTop:10}}>Only selected events saved. Email is gone.</p>
        </div>
      )}

      {stage==="done"&&(
        <div style={{textAlign:"center",padding:"48px 0",animation:"catchDone .5s ease-out"}}>
          <style>{`
            @keyframes catchDone {
              0%   { opacity:0; transform:scale(.85); }
              60%  { opacity:1; transform:scale(1.06); }
              100% { opacity:1; transform:scale(1); }
            }
            @keyframes flashRing {
              0%   { box-shadow:0 0 0 0 rgba(45,160,100,.7); }
              70%  { box-shadow:0 0 0 22px rgba(45,160,100,0); }
              100% { box-shadow:0 0 0 0 rgba(45,160,100,0); }
            }
          `}</style>
          <div style={{width:72,height:72,background:"rgba(45,90,61,.10)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",border:"2px solid var(--sage2)",animation:"flashRing .8s ease-out .1s both"}}>
            <Check size={34} color="var(--sage2)"/>
          </div>
          <p style={{fontWeight:800,fontSize:22,color:"var(--sage3)",marginBottom:8,letterSpacing:"-.3px"}}>Added to Calendar! 🎉</p>
          <p style={{fontSize:15,color:"var(--cream3)"}}>Email deleted · Events saved · Nothing else stored</p>
        </div>
      )}

      {/* Processed log */}
      {tab==="email"&&stage==="idle"&&log.length>0&&(
        <div style={{marginTop:24}}>
          <p style={{fontSize:15,color:"var(--cream3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Processed & Deleted</p>
          {log.map(function(l){return(
            <div key={l.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:l.instructor?"var(--sage2)":"var(--sage2)",flexShrink:0}}/>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <p style={{fontSize:15,fontWeight:600}}>{l.subject}</p>
                    {l.instructor&&<div style={{background:"rgba(59,130,246,.08)",borderRadius:99,padding:"1px 7px"}}><span style={{fontSize:15,fontWeight:700,color:"var(--sage3)"}}>Instructor</span></div>}
                  </div>
                  <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{fd(l.date)} · {l.count} event{l.count!==1?"s":""} extracted</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(45,90,61,.07)",border:"1px solid #A7F3D0",borderRadius:99,padding:"3px 10px"}}>
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
function MembersScreen({members,setMembers,events,onBack,saveMember,deleteMember,sendInvite}) {
  const [profile,setProfile]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newM,setNewM]=useState({name:"",color:COLORS[0],emoji:EMOJIS[0],email:"",phone:"",age:""});
  const [partnerEmail,setPartnerEmail]=useState("");
  const [partnerSent,setPartnerSent]=useState(false);
  const [inviteLink,setInviteLink]=useState("");
  const [inviting,setInviting]=useState(false);
  const [inviteError,setInviteError]=useState("");
  const [showPartner,setShowPartner]=useState(true);
  const [photoError,setPhotoError]=useState("");
  const photoRef=useRef();
  const profilePhotoRef=useRef();

  const add=()=>{
    if(!newM.name.trim())return;
    var newMember={...newM,id:genId(),photo:null};
    setMembers(function(p){return[...p,newMember];});
    if(saveMember) saveMember(newMember);
    setNewM({name:"",color:COLORS[0],emoji:EMOJIS[0],email:"",phone:"",age:""});
    setShowAdd(false);
  };

  const updateMember=(id,fields)=>{
    setMembers(function(p){return p.map(function(m){return m.id===id?{...m,...fields}:m;});});
    if(profile&&profile.id===id) setProfile(function(p){return({...p,...fields});});
  };

  const uploadPhoto=(id,file)=>{
    if(file.size>5*1024*1024){setPhotoError("Photo must be under 5MB. Please choose a smaller image.");setTimeout(function(){setPhotoError("");},3500);return;}
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
        <div style={{paddingTop:"calc(env(safe-area-inset-top,44px) + 14px)",marginBottom:4}}><button onClick={()=>setProfile(null)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--sage)",border:"none",borderRadius:10,color:"#f5f0e8",fontWeight:700,fontSize:14,padding:"9px 16px",boxShadow:"0 2px 8px rgba(26,58,42,.2)"}}><ChevronLeft size={16}/>Back</button></div>

        {/* Profile header */}
        <div style={{background:"linear-gradient(135deg,"+m.color+"18,"+m.color+"06)",border:"1.5px solid "+m.color+"30",borderRadius:20,padding:"24px 20px",marginBottom:20,textAlign:"center",position:"relative"}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:12}}>
            <div style={{width:88,height:88,borderRadius:"50%",background:m.color+"20",border:"3px solid "+m.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,overflow:"hidden",margin:"0 auto"}}>
              {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={m.name}/>:m.emoji}
            </div>
            <button onClick={function(){profilePhotoRef.current&&profilePhotoRef.current.click();}} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:m.color,border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <span style={{fontSize:15,color:"var(--cream)"}}>📷</span>
            </button>
            <input ref={profilePhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])uploadPhoto(m.id,e.target.files[0]);}}/>
          </div>
          {photoError&&<p style={{fontSize:13,color:"var(--rose)",textAlign:"center",marginBottom:4,fontWeight:500}}>{photoError}</p>}
          <p style={{fontSize:22,fontWeight:800,letterSpacing:"-.3px",color:"var(--cream)"}}>{m.name}</p>
          <div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(0,0,0,.08)",borderRadius:99,padding:"3px 10px",marginTop:6,border:"1px solid rgba(0,0,0,.1)"}}>
            <span style={{fontSize:10}}>✏️</span>
            <span style={{fontSize:11,color:"rgba(245,240,232,.8)",fontWeight:600,letterSpacing:".04em"}}>TAP FIELDS TO EDIT</span>
          </div>
          {m.age&&<p style={{fontSize:15,color:"rgba(245,240,232,.7)",marginTop:2}}>{m.age} years old</p>}
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:12}}>
            <div style={{textAlign:"center"}}><p style={{fontSize:20,fontWeight:800,color:"var(--cream)"}}>{upcoming.length}</p><p style={{fontSize:13,color:"var(--cream2)"}}>Upcoming</p></div>
            <div style={{width:1,background:"var(--border2)"}}/>
            <div style={{textAlign:"center"}}><p style={{fontSize:20,fontWeight:800,color:"var(--cream)"}}>{past.length}</p><p style={{fontSize:13,color:"var(--cream2)"}}>Past</p></div>
          </div>
        </div>

        {/* Editable fields */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)"}}>
            {[
              {label:"Full Name",field:"name",type:"text",placeholder:"Name",icon:"👤"},
              {label:"Email",field:"email",type:"email",placeholder:"email@example.com",icon:"✉️"},
              {label:"Phone",field:"phone",type:"tel",placeholder:"+1 (555) 000-0000",icon:"📱"},
              {label:"Age",field:"age",type:"number",placeholder:"e.g. 8",icon:"🎂",min:0,max:120},
            ].map(({label,field,type,placeholder,icon},i,arr)=>(
              <div key={field} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<arr.length-1?"1px solid #F3F4F6":"none"}}>
                <span style={{fontSize:18,flexShrink:0,width:24,textAlign:"center"}}>{icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:15,color:"var(--cream3)",fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</p>
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
          <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",padding:"14px 16px",boxShadow:"0 1px 4px rgba(45,60,45,.06)"}}>
            <p style={{fontSize:15,color:"var(--cream3)",fontWeight:600,marginBottom:10,textTransform:"uppercase",letterSpacing:".05em"}}>Avatar</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>updateMember(m.id,{emoji:e})} style={{fontSize:20,width:38,height:38,borderRadius:12,background:m.emoji===e?m.color+"20":"rgba(45,60,45,.04)",border:m.emoji===e?"2px solid "+m.color:"2px solid transparent"}}>{e}</button>
              ))}
            </div>
            <p style={{fontSize:15,color:"var(--cream3)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Colour</p>
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
            <p style={{fontSize:12,fontWeight:700,color:"var(--cream2)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Upcoming Events</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {upcoming.slice(0,5).map(ev=>(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#fff",borderRadius:12,border:"1px solid var(--border2)",borderLeft:"3px solid "+m.color,boxShadow:"0 1px 3px rgba(45,60,45,.05)"}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:15,fontWeight:600}}>{ev.title}</p>
                    <p style={{fontSize:15,color:"var(--cream3)",marginTop:2}}>{fd(ev.date)}{ev.time?" · "+ev.time:""}{ev.location?" · "+ev.location:""}</p>
                  </div>
                  <Pill color={m.color} bg={m.color+"12"}>{ev.date===todayStr?"Today":"Soon"}</Pill>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remove member */}
        <button
          disabled={members.length<=1}
          onClick={function(){
            if(window.confirm("Remove "+m.name+" from your family?\n\nWarning: This will remove them from your calendar. Their existing events will remain but will show no family member.\n\nThis cannot be undone.")){
              if(deleteMember){deleteMember(m.id);}else{setMembers(function(p){return p.filter(function(x){return x.id!==m.id;});});}
              setProfile(null);
            }
          }}
          style={{width:"100%",background:"rgba(168,56,56,.06)",border:"1.5px solid "+(members.length<=1?"var(--border)":"rgba(168,56,56,.25)"),borderRadius:12,padding:12,color:members.length<=1?"var(--cream3)":"var(--rose)",fontWeight:600,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:members.length<=1?0.45:1,cursor:members.length<=1?"not-allowed":"pointer"}}>
          <X size={14}/>Remove {m.name} from family
        </button>
        {members.length<=1&&<p style={{fontSize:13,color:"var(--cream3)",textAlign:"center",marginTop:6}}>You need at least one family member.</p>}
      </div>
    );
  }

  // ── Members list ──────────────────────────────────────────────────────────
  return (
    <div>
      {onBack&&<div style={{paddingTop:"calc(env(safe-area-inset-top,44px) + 14px)",marginBottom:4}}><button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--sage)",border:"none",borderRadius:10,color:"#f5f0e8",fontWeight:700,fontSize:14,padding:"9px 16px",boxShadow:"0 2px 8px rgba(26,58,42,.2)"}}><ChevronLeft size={16}/>Back</button></div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div><p style={{fontSize:14,color:"var(--cream3)",marginTop:2}}>{members.length} member{members.length===1?"":"s"} · tap to edit profile</p></div>
        <Btn onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",fontSize:15}}><Plus size={14}/>Add Member</Btn>
      </div>

      {/* Co-parent sync CTA */}
      {showPartner&&!partnerSent&&(
        <div style={{background:"linear-gradient(135deg,#1a3a2a,#2d5a3d)",borderRadius:16,padding:"18px 20px",marginBottom:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
          <button onClick={()=>setShowPartner(false)} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",color:"#f5f0e8"}}><X size={12}/></button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:36,height:36,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👫</div>
            <div><p style={{fontWeight:800,color:"#f5f0e8",fontSize:15}}>Invite your partner</p><p style={{fontSize:15,color:"rgba(255,255,255,.6)"}}>Both parents. One calendar. Zero confusion.</p></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <input placeholder="Partner's email" type="email" value={partnerEmail} onChange={e=>setPartnerEmail(e.target.value)} style={{flex:1,fontSize:15,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.2)",color:"var(--cream)",borderRadius:8,padding:"9px 12px"}}/>
            <button onClick={function(){
              if(!partnerEmail.includes("@")){setInviteError("Please enter a valid email.");return;}
              setInviting(true);setInviteError("");
              if(sendInvite){
                sendInvite(partnerEmail,function(link){
                  setInviteLink(link);setPartnerSent(true);setInviting(false);
                },function(err){
                  setInviteError(err||"Something went wrong.");setInviting(false);
                });
              } else {
                setPartnerSent(true);setInviting(false);
              }
            }} style={{background:"rgba(245,240,232,.9)",color:"#1a3a2a",borderRadius:8,padding:"0 16px",fontWeight:700,fontSize:15,flexShrink:0}}>{inviting?"Sending...":"Send"}</button>
          </div>
        </div>
      )}
      {partnerSent&&(
        <Card style={{marginBottom:16,background:"rgba(45,90,61,.06)",border:"1px solid rgba(83,136,122,.25)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:inviteLink?12:0}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={18} color="#fff"/></div>
            <div><p style={{fontWeight:700,color:"var(--sage)"}}>Invite created!</p><p style={{fontSize:13,color:"var(--sage2)",marginTop:2}}>Share this link with your partner:</p></div>
          </div>
          {inviteLink&&(
            <div style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid var(--border2)",display:"flex",alignItems:"center",gap:8}}>
              <p style={{flex:1,fontSize:12,color:"var(--cream2)",wordBreak:"break-all",lineHeight:1.4}}>{inviteLink}</p>
              <button onClick={function(){navigator.clipboard&&navigator.clipboard.writeText(inviteLink);}} style={{background:"var(--sage)",color:"#fff",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,flexShrink:0}}>Copy</button>
            </div>
          )}
          {!inviteLink&&<p style={{fontSize:13,color:"var(--sage2)"}}>When they open the link and sign up, both calendars sync in real time.</p>}
        </Card>
      )}

      {/* Member cards — tappable */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {members.map(m=>{
          const upcoming=events.filter(e=>e.memberId===m.id&&e.date>=todayStr).length;
          return (
            <div key={m.id} onClick={()=>setProfile(m)} style={{background:"#fff",border:"1px solid var(--border2)",borderLeft:"4px solid "+m.color,borderRadius:16,boxShadow:"0 1px 4px rgba(45,60,45,.06)",padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(45,60,45,.05)"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              <div style={{width:52,height:52,borderRadius:"50%",background:m.color+"15",border:"2px solid "+m.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,overflow:"hidden"}}>
                {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={m.name}/>:m.emoji}
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:16,color:"#1a2e1a"}}>{m.name}</p>
                <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
                  {m.age&&<span style={{fontSize:15,color:"var(--cream3)"}}>{m.age}y</span>}
                  {m.email&&<span style={{fontSize:15,color:"var(--cream3)"}}>{m.email}</span>}
                  {!m.age&&!m.email&&<span style={{fontSize:15,color:"var(--sage2)"}}>Tap to add profile →</span>}
                </div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <p style={{fontSize:20,fontWeight:800,color:m.color}}>{upcoming}</p>
                <p style={{fontSize:15,color:"#4a5e4a"}}>upcoming</p>
              </div>
              <ChevronRight size={15} color="#D1D5DB"/>
            </div>
          );
        })}
      </div>

      {/* Add member sheet */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(26,46,26,.5)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="fu" style={{background:"#f5f0e8",borderRadius:"20px 20px 0 0",padding:"8px 20px 40px",width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"var(--ink5)",margin:"8px auto 20px"}}/>
            <h2 style={{fontWeight:800,fontSize:18,marginBottom:18}}>Add Family Member</h2>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <input placeholder="Your first name" value={newM.name} onChange={e=>setNewM(p=>({...p,name:e.target.value}))}/>
              <input placeholder="Email (optional)" type="email" value={newM.email||""} onChange={e=>setNewM(p=>({...p,email:e.target.value}))}/>
              <input placeholder="Phone (optional)" type="tel" value={newM.phone||""} onChange={e=>setNewM(p=>({...p,phone:e.target.value}))}/>
              <input placeholder="Age (optional)" type="number" value={newM.age||""} onChange={e=>setNewM(p=>({...p,age:e.target.value}))}/>
              <div>
                <p style={{fontSize:15,color:"var(--cream3)",fontWeight:600,marginBottom:8}}>AVATAR</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {EMOJIS.map(e=><button key={e} onClick={()=>setNewM(p=>({...p,emoji:e}))} style={{fontSize:28,width:48,height:48,borderRadius:12,background:newM.emoji===e?"var(--ink4)":"transparent",border:newM.emoji===e?"2px solid var(--sage2)":"2px solid transparent"}}>{e}</button>)}
                </div>
              </div>
              <div>
                <p style={{fontSize:15,color:"var(--cream3)",fontWeight:600,marginBottom:8}}>COLOUR</p>
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
function NotifScreen({events,members,onSelectEvent,topBar}) {
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
      <div style={{background:"linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%)",margin:"-20px -18px 16px",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 28px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 24px rgba(30,61,42,.25)"}}>
        {topBar}
        <div style={{marginTop:8}}>
          <p style={{fontSize:26,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,letterSpacing:"-.4px"}}>Alerts</p>
          <p style={{fontSize:13,color:"rgba(245,240,232,.55)",marginTop:3,fontFamily:"-apple-system,sans-serif"}}>{up.length} upcoming event{up.length===1?"":"s"}</p>
        </div>
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
          <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)"}}>
            {evs.map((ev,i)=>{
              const m=gm(ev.memberId),isT=ev.date===todayStr;
              return (
                <div key={ev.id} onClick={()=>onSelectEvent&&onSelectEvent(ev)}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderBottom:i<evs.length-1?"1px solid rgba(240,236,226,.06)":"none",cursor:"pointer",transition:"background .15s"}}
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
function NotifSettingsScreen({settings,setSettings,members,onBack,requestPermission}) {
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
      <div style={{paddingTop:"calc(env(safe-area-inset-top,44px) + 14px)",marginBottom:4}}><button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--sage)",border:"none",borderRadius:10,color:"#f5f0e8",fontWeight:700,fontSize:14,padding:"9px 16px",boxShadow:"0 2px 8px rgba(26,58,42,.2)"}}><ChevronLeft size={16}/>Back</button></div>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:26,fontWeight:700,letterSpacing:"-.3px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)"}}>Notifications</h2>
        <p style={{fontSize:15,color:"var(--cream3)",marginTop:4,fontWeight:300}}>Reminders & quiet hours</p>
      </div>

      {/* Push toggle */}
      <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>General</p>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)",marginBottom:22}}>
        <Row label="Push Notifications" desc="Enable alerts on this device" right={<Toggle on={settings.enabled} onChange={function(){
          if(!settings.enabled){
            // Turning ON — check current permission state first
            if(!("Notification" in window)) return;
            if(Notification.permission==="denied") return;
            if(requestPermission) requestPermission();
          }
          setSettings(function(p){
            var next={...p,enabled:!p.enabled};
            localStorage.setItem("calla_notif",JSON.stringify(next));
            return next;
          });
        }}/>}/>
        {"Notification" in window && Notification.permission==="denied" && (
          <div style={{padding:"10px 18px",background:"rgba(168,56,56,.06)",borderTop:"1px solid rgba(168,56,56,.1)"}}>
            <p style={{fontSize:13,color:"var(--rose)",lineHeight:1.6}}>⚠️ Notifications are blocked in your browser. Click the lock icon in the address bar → set Notifications to <strong>Allow</strong> → refresh.</p>
          </div>
        )}

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
        <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)",marginBottom:22}}>
          <Row label="Enable Quiet Hours" desc="Silence notifications at night"
            right={<Toggle on={!!(settings.quietHours&&settings.quietHours.enabled)} onChange={()=>setSettings(p=>({...p,quietHours:{...(p.quietHours||{}),enabled:!(p.quietHours&&p.quietHours.enabled)}}))}/>}
          />
          {settings.quietHours&&settings.quietHours.enabled&&(
            <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,borderTop:"1px solid rgba(240,236,226,.06)"}}>
              <div><label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:6,letterSpacing:".05em"}}>FROM</label><input type="time" value={settings.quietHours.from||"22:00"} onChange={e=>setSettings(p=>({...p,quietHours:{...p.quietHours,from:e.target.value}}))}/></div>
              <div><label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:6,letterSpacing:".05em"}}>TO</label><input type="time" value={settings.quietHours.to||"07:00"} onChange={e=>setSettings(p=>({...p,quietHours:{...p.quietHours,to:e.target.value}}))}/></div>
              {settings.quietHours.from&&settings.quietHours.to&&settings.quietHours.from>settings.quietHours.to&&<p style={{fontSize:13,color:"var(--sage3)",gridColumn:"span 2",marginTop:4}}>ℹ️ Spans midnight — silent until {settings.quietHours.to} next morning</p>}
            </div>
          )}
        </div>

        {/* Per member */}
        <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Per Family Member</p>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)"}}>
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
/* --- Morning Text Digest Screen --- */
function DigestScreen({members, user, onBack, toast}) {
  // ── Load persisted prefs from localStorage on mount ──────────────────────
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem("calla_digest") || "{}"); }
    catch(e) { return {}; }
  }
  var prefs = loadPrefs();

  var [enabled,    setEnabled]    = useState(prefs.enabled    || false);
  var [sendTime,   setSendTime]   = useState(prefs.sendTime   || "07:30");
  var [recipients, setRecipients] = useState(prefs.recipients || {});
  var [include,    setInclude]    = useState(prefs.include    || {todayEvents:true, conflicts:true, tomorrowEvents:false, packingList:false});
  var [saving,     setSaving]     = useState(false);
  var [wasSaved,   setWasSaved]   = useState(false);
  var [hasChanges, setHasChanges] = useState(false);

  // Mark unsaved changes whenever anything changes
  function markChanged() { setHasChanges(true); setWasSaved(false); }

  function save() {
    setSaving(true);
    var toSave = { enabled: enabled, sendTime: sendTime, recipients: recipients, include: include };
    localStorage.setItem("calla_digest", JSON.stringify(toSave));
    if (user && user.id) {
      supabase.from("profiles")
        .update({ digest_enabled: enabled, digest_time: sendTime, digest_recipients: JSON.stringify(recipients), digest_include: JSON.stringify(include) })
        .eq("id", user.id)
        .then(function() {
          setSaving(false); setWasSaved(true); setHasChanges(false);
          toast({ icon: "\u2713", title: "Morning Text saved!", color: "var(--sage2)" });
          setTimeout(function() { setWasSaved(false); }, 3000);
        });
    } else {
      setSaving(false); setWasSaved(true); setHasChanges(false);
      toast({ icon: "\u2713", title: "Saved!", color: "var(--sage2)" });
      setTimeout(function() { setWasSaved(false); }, 3000);
    }
  }

  function toggleRecipient(memberId, existingPhone) {
    setRecipients(function(prev) {
      var next = Object.assign({}, prev);
      if (next[memberId] !== undefined) { delete next[memberId]; }
      else { next[memberId] = existingPhone || ""; }
      return next;
    });
    markChanged();
  }

  function updatePhone(memberId, phone) {
    setRecipients(function(prev) {
      var next = Object.assign({}, prev);
      next[memberId] = phone;
      return next;
    });
    markChanged();
  }

  function toggleInclude(key) {
    setInclude(function(prev) {
      var next = Object.assign({}, prev);
      next[key] = !prev[key];
      return next;
    });
    markChanged();
  }

  function fmtTime(t) {
    var parts = t.split(":"); var h = parseInt(parts[0]); var m = parts[1] || "00";
    var ap = h >= 12 ? "PM" : "AM"; var h12 = h % 12 || 12;
    return h12 + ":" + m + " " + ap;
  }

  var anyRecipient = Object.keys(recipients).length > 0;
  var allHavePhone = Object.keys(recipients).every(function(id) { return recipients[id] && recipients[id].trim().length > 5; });
  var canSave = !enabled || (anyRecipient && allHavePhone);
  var TIMES = ["06:00","06:30","07:00","07:30","08:00","08:30","09:00"];
  var TIME_LABELS = {"06:00":"6:00 AM","06:30":"6:30 AM","07:00":"7:00 AM","07:30":"7:30 AM","08:00":"8:00 AM","08:30":"8:30 AM","09:00":"9:00 AM"};
  var INCLUDE_OPTIONS = [
    {key:"todayEvents",    icon:"\ud83d\udcc5", label:"Today\'s events",     desc:"All events scheduled for today"},
    {key:"tomorrowEvents", icon:"\u23ed\ufe0f",  label:"Tomorrow\'s events",  desc:"A heads-up for what\'s coming"},
    {key:"conflicts",      icon:"\u26a1",         label:"Conflicts detected",   desc:"Any scheduling overlaps flagged"},
    {key:"packingList",    icon:"\ud83c\udf92",  label:"Packing reminders",    desc:"Items to bring for today\'s events"},
  ];

  // Build dynamic preview based on selections
  function buildPreview() {
    var lines = ["Good morning! Here\'s your day:",""];
    if (include.todayEvents) { lines.push("Emma: Soccer 3:30 PM @ Riverside Field"); lines.push("Liam: Piano 4:00 PM @ Music Studio"); }
    if (include.tomorrowEvents) { lines.push(""); lines.push("Tomorrow: Team meeting 9:00 AM"); }
    if (include.conflicts) { lines.push(""); lines.push("Conflict: Soccer & Piano overlap 4-4:30 PM"); }
    if (include.packingList) { lines.push(""); lines.push("Bring: Shin guards, water bottle (Emma)"); }
    lines.push(""); lines.push("-- Calla");
    return lines.join("\n");
  }

  return (
    <div>
      <div style={{paddingTop:"calc(env(safe-area-inset-top,44px) + 14px)",marginBottom:4}}><button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--sage)",border:"none",borderRadius:10,color:"#f5f0e8",fontWeight:700,fontSize:14,padding:"9px 16px",boxShadow:"0 2px 8px rgba(26,58,42,.2)"}}><ChevronLeft size={16}/>Back</button></div>

      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:26,fontWeight:700,letterSpacing:"-.3px",fontFamily:"\'Playfair Display\',Georgia,serif",color:"var(--cream)"}}>Morning Text</h2>
        <p style={{fontSize:14,color:"var(--cream3)",marginTop:4,fontWeight:300}}>Daily SMS digest — customise what you receive.</p>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div style={{background:"rgba(160,120,32,.1)",border:"1px solid rgba(160,120,32,.3)",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <p style={{fontSize:13,color:"var(--gold)",fontWeight:600}}>You have unsaved changes</p>
          <button onClick={save} style={{background:"var(--gold)",color:"var(--ink)",border:"none",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save now</button>
        </div>
      )}

      {/* Enable toggle */}
      <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px"}}>
          <div>
            <p style={{fontSize:16,fontWeight:600,color:"var(--cream)"}}>Enable Morning Text</p>
            <p style={{fontSize:13,color:"var(--cream3)",marginTop:2,fontWeight:300}}>Send a daily SMS each morning</p>
          </div>
          <Toggle on={enabled} onChange={function() { setEnabled(function(p){return !p;}); markChanged(); }}/>
        </div>
      </div>

      {enabled && (
        <div>
          {/* Send time */}
          <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Send Time</p>
          <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",padding:"16px 18px",marginBottom:22,boxShadow:"0 1px 4px rgba(45,60,45,.06)"}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
              {TIMES.map(function(t) {
                var isOn = sendTime === t;
                return (
                  <button key={t} onClick={function() { setSendTime(t); markChanged(); }}
                    style={{padding:"8px 14px",borderRadius:99,background:isOn?"var(--sage)":"var(--ink3)",color:isOn?"var(--ink)":"var(--cream3)",fontSize:13,fontWeight:600,border:"1px solid "+(isOn?"transparent":"var(--border2)"),transition:"all .2s"}}>
                    {isOn ? "\u2713 " : ""}{TIME_LABELS[t]}
                  </button>
                );
              })}
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--cream3)",fontWeight:600,display:"block",marginBottom:6,letterSpacing:".05em"}}>CUSTOM TIME</label>
              <input type="time" value={sendTime} onChange={function(e) { setSendTime(e.target.value); markChanged(); }} style={{fontSize:16,padding:"10px 14px",width:"auto"}}/>
            </div>
          </div>

          {/* What to include */}
          <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>What to Include</p>
          <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)",marginBottom:22}}>
            {INCLUDE_OPTIONS.map(function(opt, i) {
              var isOn = include[opt.key];
              return (
                <div key={opt.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:i < INCLUDE_OPTIONS.length-1?"1px solid rgba(240,236,226,.06)":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:20,flexShrink:0}}>{opt.icon}</span>
                    <div>
                      <p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>{opt.label}</p>
                      <p style={{fontSize:12,color:"var(--cream3)",marginTop:1,fontWeight:300}}>{opt.desc}</p>
                    </div>
                  </div>
                  <Toggle on={isOn} onChange={function() { toggleInclude(opt.key); }}/>
                </div>
              );
            })}
          </div>

          {/* Live preview */}
          <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Live Preview</p>
          <div style={{background:"#111",borderRadius:16,padding:16,marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,var(--sage),var(--sage2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>C</div>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.9)"}}>Calla</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>+1 (260) 236-6760</p>
              </div>
            </div>
            <div style={{background:"#3A3A3C",borderRadius:"14px 14px 14px 4px",padding:"10px 14px",maxWidth:"85%"}}>
              <p style={{fontSize:13,color:"rgba(255,255,255,.9)",lineHeight:1.8,whiteSpace:"pre-line"}}>{buildPreview()}</p>
            </div>
          </div>

          {/* Recipients */}
          <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--cream3)",marginBottom:8,paddingLeft:2}}>Who Gets the Text</p>
          <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",boxShadow:"0 1px 4px rgba(45,60,45,.06)",marginBottom:8}}>
            {members.map(function(m, i) {
              var isOn = recipients[m.id] !== undefined;
              var phone = isOn ? recipients[m.id] : (m.phone || "");
              return (
                <div key={m.id} style={{borderBottom:i < members.length - 1 ? "1px solid rgba(240,236,226,.06)" : "none"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:m.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{m.emoji}</div>
                      <div>
                        <p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>{m.name}</p>
                        {isOn && phone && <p style={{fontSize:12,color:"var(--sage3)",marginTop:1}}>{phone}</p>}
                        {isOn && !phone && <p style={{fontSize:12,color:"var(--gold)",marginTop:1}}>Add phone number below</p>}
                      </div>
                    </div>
                    <Toggle on={isOn} onChange={function() { toggleRecipient(m.id, m.phone || ""); }}/>
                  </div>
                  {isOn && (
                    <div style={{padding:"0 18px 14px"}}>
                      <input type="tel" placeholder="+1 (555) 000-0000" value={phone}
                        onChange={function(e) { updatePhone(m.id, e.target.value); }}
                        style={{fontSize:16,padding:"10px 14px"}}/>
                      <p style={{fontSize:12,color:"var(--cream3)",marginTop:6,fontWeight:300}}>Include country code e.g. +1 for Canada/US</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{fontSize:12,color:"var(--cream3)",marginBottom:22,paddingLeft:4,fontWeight:300}}>Tap Save below to confirm phone numbers.</p>
        </div>
      )}

      {/* Save button — always visible */}
      <button onClick={save} disabled={saving || !canSave}
        style={{width:"100%",background:wasSaved?"var(--sage3)":(saving||!canSave)?"var(--ink4)":"linear-gradient(135deg,var(--sage),var(--sage2))",color:(saving||!canSave)&&!wasSaved?"var(--cream3)":"var(--ink)",border:"none",borderRadius:14,padding:"16px",fontFamily:"\'DM Sans\',\'Helvetica Neue\',sans-serif",fontSize:16,fontWeight:700,cursor:(saving||!canSave)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:(saving||!canSave)?"none":"0 4px 16px rgba(45,90,61,.28)",transition:"all .2s"}}>
        {saving ? "Saving..." : wasSaved ? "\u2713 Settings Saved!" : !canSave ? "Add phone numbers to save" : "Save Morning Text Settings"}
      </button>

      {enabled && anyRecipient && allHavePhone && wasSaved && (
        <p style={{textAlign:"center",fontSize:13,color:"var(--sage3)",marginTop:12,fontWeight:500}}>{"\u2713 Text will arrive daily at " + fmtTime(sendTime)}</p>
      )}
    </div>
  );
}

function MoreScreen({members,setMembers,events,user,setUser,paid,trialLeft,onUpgrade,onSignOut,notifSettings,setNotifSettings,saveMember,deleteMember,toast,familyId,sendInvite,requestPermission,topBar}) {
  const fr=useRef();
  const [confirmSignOut,setConfirmSignOut]=useState(false);
  const [sec,setSec]=useState(null),[docs,setDocs]=useState([{id:"d1",name:"Emma's Vaccination Record",memberId:"m3",emoji:"💉",date:addDays(todayStr,-30)},{id:"d2",name:"Soccer Permission Slip",memberId:"m3",emoji:"⚽",date:addDays(todayStr,-5)},{id:"d3",name:"Insurance Card",memberId:null,emoji:"🏥",date:addDays(todayStr,-60)}]);
  const [budget,setBudget]=useState(500),[invite,setInvite]=useState(""),[invited,setInvited]=useState(false),[link,setLink]=useState(""),[inviteLink,setInviteLink]=useState("");
  const gm=id=>id?members.find(m=>m.id===id)||{name:"Family",color:"var(--cream3)",emoji:"👨‍👩‍👧‍👦"}:{name:"Family",color:"var(--cream3)",emoji:"👨‍👩‍👧‍👦"};
  const ce=events.filter(e=>e.cost&&parseFloat(e.cost)>0);
  const tot=ce.reduce((s,e)=>{const c=parseFloat(e.cost)||0;return s+(e.costType==="monthly"?c:e.costType==="session"?c*4:e.costType==="season"?c/3:c);},0);
  const Back=()=>(<div style={{paddingTop:"calc(env(safe-area-inset-top,44px) + 14px)",marginBottom:4}}><button onClick={()=>setSec(null)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--sage)",border:"none",borderRadius:10,color:"#f5f0e8",fontWeight:700,fontSize:14,padding:"9px 16px",boxShadow:"0 2px 8px rgba(26,58,42,.2)"}}><ChevronLeft size={16}/>Back</button></div>);
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
    <div className="screen-enter" style={{paddingBottom:8}}>
      {/* Hero header */}
      <div style={{background:"linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%)",margin:"-20px -18px 16px",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 28px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 24px rgba(30,61,42,.25)"}}>
{topBar}
        <p style={{fontSize:11,fontWeight:600,color:"rgba(245,240,232,.45)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4,fontFamily:"-apple-system,sans-serif"}}>Your account</p>
        <p style={{fontSize:26,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,letterSpacing:"-.4px"}}>{user&&user.family||"My Family"}</p>
        <p style={{fontSize:13,color:"rgba(245,240,232,.55)",marginTop:3,fontFamily:"-apple-system,sans-serif"}}>{user&&user.email||""}</p>
      </div>

      {/* Subscription card */}
      {paid ? (
        <div style={{background:"linear-gradient(135deg,var(--sage),var(--sage2))",borderRadius:16,padding:"18px 20px",marginBottom:24,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:44,height:44,background:"rgba(255,255,255,.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✓</div>
          <div style={{flex:1}}>
            <p style={{fontWeight:700,color:"#f5f0e8",fontSize:16}}>Calla Family · Active</p>
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

      {/* All options — single basket */}
      <div style={{background:"#fff",borderRadius:16,border:"1px solid var(--border2)",overflow:"hidden",marginBottom:24,boxShadow:"0 1px 4px rgba(45,60,45,.06)"}}>
        <Row Icon={Users}      iconBg="rgba(83,136,122,.25)"  label="Family Members"   desc={members.length+" members"}         onTap={()=>setSec("family")}/>
        <Row Icon={Share2}     iconBg="rgba(59,130,246,.2)"   label="Family Sharing"   desc="Invite partner & sync"              onTap={()=>setSec("sharing")}/>
        <Row Icon={Sun}        iconBg="rgba(176,141,82,.25)"  label="Morning Text"     desc="Daily SMS digest"                   onTap={()=>setSec("digest")}/>
        <Row Icon={Folder}     iconBg="rgba(139,92,246,.2)"   label="Document Vault"   desc="Slips, records, cards"              onTap={()=>setSec("vault")}/>
        <Row Icon={DollarSign} iconBg="rgba(16,185,129,.2)"   label="Budget Tracker"   desc={"$"+tot.toFixed(0)+"/mo estimated"} onTap={()=>setSec("budget")}/>
        <Row Icon={Settings}   iconBg="rgba(45,90,61,.15)"    label="Account Settings" desc="Name, email, password"              onTap={()=>setSec("account")}/>
        <Row Icon={Bell}       iconBg="rgba(59,130,246,.2)"   label="Notifications"    desc="Reminders, quiet hours"             onTap={()=>setSec("notif_settings")}/>
        <Row Icon={LogOut}     iconBg="rgba(220,80,80,.15)"   label="Sign Out"         danger                                    onTap={()=>setConfirmSignOut(true)} last/>
      </div>

      {/* Sign out confirm */}
      {confirmSignOut&&(
        <div style={{background:"rgba(200,50,50,.05)",border:"1px solid rgba(200,50,50,.15)",borderRadius:16,padding:"20px 18px",marginBottom:8}}>
          <p style={{fontWeight:700,fontSize:16,color:"var(--rose)",textAlign:"center",marginBottom:6}}>Taking a break?</p>
          <p style={{fontSize:15,color:"rgba(220,130,130,.75)",textAlign:"center",marginBottom:18,fontWeight:400}}>Your session data will be cleared.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setConfirmSignOut(false)} style={{flex:1,padding:13,borderRadius:12,background:"#fff",border:"1.5px solid var(--border2)",fontWeight:600,fontSize:15,color:"var(--cream2)",boxShadow:"0 1px 3px rgba(45,60,45,.06)"}}>Cancel</button>
            <button onClick={()=>onSignOut&&onSignOut()} style={{flex:1,padding:13,borderRadius:12,background:"#c03030",border:"none",fontWeight:700,fontSize:15,color:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><LogOut size={15}/>Sign Out</button>
          </div>
        </div>
      )}

      <p style={{fontSize:15,color:"var(--cream3)",textAlign:"center",marginTop:8,fontWeight:300,opacity:.6}}>Made with care in Canada 🍁 · getcalla.ca</p>
    </div>
  );
  if(sec==="account") return (
    <div>
      <Back/>
      <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",marginBottom:6}}>Account</h1>
      <p style={{fontSize:14,color:"var(--cream3)",marginBottom:24}}>Manage your family name, email and password.</p>

      {/* Family name */}
      <p style={{fontSize:12,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Family Name</p>
      <AccountField
        value={user&&user.family||""}
        placeholder="e.g. The Johnsons"
        onSave={function(val){
          if(!val.trim()) return;
          supabase.from("profiles").update({family_name:val.trim()}).eq("id",user.id).then(function(){});
          supabase.auth.updateUser({data:{family_name:val.trim()}}).then(function(){});
          setUser(function(u){return{...u,family:val.trim()};});
          toast({icon:"✓",title:"Family name updated",color:"var(--sage2)"});
        }}
      />

      {/* Email — read only */}
      <p style={{fontSize:12,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,marginTop:20}}>Email Address</p>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid var(--border2)",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 3px rgba(45,60,45,.05)",opacity:.75}}>
        <span style={{flex:1,fontSize:15,color:"var(--cream2)",fontWeight:500}}>{user&&user.email||""}</span>
        <span style={{fontSize:12,color:"var(--cream3)"}}>Cannot change</span>
      </div>

      {/* Password */}
      <p style={{fontSize:12,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,marginTop:20}}>Change Password</p>
      <PasswordChangeFields toast={toast}/>

      <div style={{marginTop:32,padding:"14px 16px",background:"rgba(45,90,61,.05)",borderRadius:12,border:"1px solid rgba(45,90,61,.12)"}}>
        <p style={{fontSize:13,color:"var(--cream3)",lineHeight:1.6}}>Your account is managed securely by Supabase. Changes to email require confirmation from your new address.</p>
      </div>
    </div>
  );
  if(sec==="family") return <MembersScreen members={members} setMembers={setMembers} events={events} saveMember={saveMember} deleteMember={deleteMember} sendInvite={sendInvite} onBack={()=>setSec(null)}/>;
  if(sec==="digest") return <DigestScreen members={members} onBack={function(){setSec(null);}} user={user} toast={toast}/>;
  if(sec==="notif_settings") return <NotifSettingsScreen settings={notifSettings} setSettings={setNotifSettings} members={members} requestPermission={requestPermission} onBack={()=>setSec(null)}/>;
  if(sec==="vault") return (
    <div><Back/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{fontSize:20,fontWeight:800}}>Document Vault</h2><Btn onClick={()=>fr.current&&fr.current.click()} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",fontSize:15}}><Plus size={13}/>Upload</Btn></div>
      <input ref={fr} type="file" style={{display:"none"}}/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {docs.map(d=>{const m=gm(d.memberId);return(
          <Card key={d.id} style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,background:"var(--ink4)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{d.emoji}</div>
            <div style={{flex:1}}><p style={{fontWeight:700,fontSize:15}}>{d.name}</p><div style={{display:"flex",gap:8,marginTop:3}}><span style={{fontSize:15,color:m.color}}>{m.emoji} {m.name}</span><span style={{fontSize:15,color:"var(--cream3)"}}>{fd(d.date)}</span></div></div>
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
        <p style={{fontSize:15,color:"#2d4a2d",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Monthly Estimate</p>
        <div style={{display:"flex",alignItems:"flex-end",gap:10,marginBottom:10}}>
          <p style={{fontSize:34,fontWeight:800,color:tot>budget?"#DC2626":"var(--sage2)"}}>${tot.toFixed(0)}</p>
          <p style={{fontSize:15,color:"var(--cream3)",marginBottom:6}}>of</p>
          <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:15,fontWeight:700}}>$</span><input type="number" value={budget} onChange={e=>setBudget(Number(e.target.value))} style={{width:76,fontSize:22,fontWeight:800,background:"transparent",border:"none",borderBottom:"1px solid var(--border2)",borderRadius:0,padding:"2px 4px"}}/></div>
        </div>
        <div style={{background:"var(--ink5)",borderRadius:6,height:7,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(tot/budget)*100)+"%",background:tot>budget?"#DC2626":"var(--sage2)",borderRadius:6,transition:"width .5s"}}/></div>
        <p style={{fontSize:15,color:tot>budget?"#DC2626":"var(--sage2)",marginTop:7,fontWeight:600}}>{tot>budget?"$"+(tot-budget).toFixed(0)+" over budget":"$"+(budget-tot).toFixed(0)+" remaining"}</p>
      </Card>
      {ce.length===0&&<div style={{textAlign:"center",padding:"36px 0"}}><DollarSign size={34} color="#D1D5DB" style={{margin:"0 auto 10px"}}/><p style={{color:"var(--cream3)"}}>No costs tracked yet</p></div>}
      {members.map(m=>{const me=ce.filter(e=>e.memberId===m.id);if(!me.length)return null;const mt=me.reduce((s,e)=>{const c=parseFloat(e.cost)||0;return s+(e.costType==="monthly"?c:e.costType==="session"?c*4:e.costType==="season"?c/3:c);},0);return(
        <Card key={m.id} style={{marginBottom:10,borderLeft:"4px solid "+m.color}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{m.emoji}</span><p style={{fontWeight:700}}>{m.name}</p></div><p style={{fontSize:18,fontWeight:800,color:m.color}}>${mt.toFixed(0)}<span style={{fontSize:15,color:"var(--cream3)",fontWeight:400}}>/mo</span></p></div>
          {me.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:"1px solid var(--border2)"}}><p style={{fontSize:15}}>{e.title}</p><p style={{fontSize:15,color:"var(--cream3)"}}>${e.cost}/{e.costType}</p></div>)}
        </Card>
      );})}
    </div>
  );
  if(sec==="sharing") return (
    <div><Back/>
      <h2 style={{fontSize:28,fontWeight:700,letterSpacing:"-.5px",fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",textAlign:"center",marginBottom:20}}>Family Sharing</h2>

      {/* Partner invite */}
      <Card style={{marginBottom:12}}>
        <p style={{fontWeight:700,fontSize:16,marginBottom:4,color:"var(--cream)"}}>Invite Your Partner</p>
        <p style={{fontSize:14,color:"var(--cream3)",marginBottom:14}}>Full access to view &amp; edit your family calendar</p>
        {invited?(
          <div>
            <div style={{background:"rgba(45,90,61,.06)",border:"1px solid rgba(83,136,122,.25)",borderRadius:12,padding:"11px 14px",display:"flex",gap:8,alignItems:"center",marginBottom:inviteLink?10:0}}>
              <Check size={15} color="var(--sage2)"/>
              <p style={{fontWeight:600,color:"var(--sage)",fontSize:14,flex:1}}>Invite created for {invite}</p>
            </div>
            {inviteLink&&(
              <div>
                <p style={{fontSize:12,color:"var(--cream3)",marginBottom:6,marginTop:10}}>Share this link with your partner:</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{flex:1,background:"var(--ink3)",borderRadius:10,padding:"10px 12px",border:"1px solid var(--border2)"}}>
                    <p style={{fontSize:12,color:"var(--sage)",wordBreak:"break-all",lineHeight:1.4}}>{inviteLink}</p>
                  </div>
                  <button onClick={function(){navigator.clipboard&&navigator.clipboard.writeText(inviteLink);toast({icon:"✓",title:"Link copied!",color:"var(--sage2)"});}} style={{background:"var(--sage)",color:"#fff",border:"none",borderRadius:10,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Copy size={16}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        ):(
          <div>
            <div style={{display:"flex",gap:8}}><input placeholder="partner@email.com" type="email" value={invite} onChange={function(e){setInvite(e.target.value);}} style={{flex:1,fontSize:15}}/><Btn onClick={function(){
              if(!invite.includes("@")) return;
              setInvited(true);
              if(sendInvite){
                sendInvite(invite,function(link){setInviteLink(link);},function(){});
              }
            }} style={{padding:"0 16px",flexShrink:0}}>Invite</Btn></div>
          </div>
        )}
      </Card>

      {/* Babysitter link */}
      <Card style={{marginBottom:12}}>
        <p style={{fontWeight:700,fontSize:16,marginBottom:4,color:"var(--cream)"}}>Babysitter / Grandparent</p>
        <p style={{fontSize:14,color:"var(--cream3)",marginBottom:12}}>Read-only · no login · expires 24h</p>
        {!link?<Btn v="ghost" onClick={()=>setLink("https://getcalla.ca/s/"+genId().slice(0,8))} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Link size={13}/>Generate Link</Btn>:<div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{flex:1,background:"var(--ink3)",borderRadius:10,padding:"10px 12px",border:"1px solid var(--border2)"}}><p style={{fontSize:12,color:"var(--sage3)",wordBreak:"break-all"}}>{link}</p></div><button onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(link)} style={{background:"var(--ink4)",border:"1px solid var(--border2)",borderRadius:10,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Copy size={14} color="var(--cream2)"/></button></div>}
      </Card>

      {/* Current access */}
      <Card>
        <p style={{fontWeight:700,marginBottom:12,color:"var(--cream)"}}>Access</p>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"var(--sage4)",border:"2px solid var(--sage2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👤</div>
          <div style={{flex:1}}><p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>{user&&user.name||"You"}</p><p style={{fontSize:13,color:"var(--cream3)"}}>{user&&user.email}</p></div>
          <Pill color="var(--sage)" bg="rgba(45,90,61,.1)">Owner</Pill>
        </div>
        {invited&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:"1px solid var(--border2)"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"var(--ink3)",border:"2px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👤</div>
          <div style={{flex:1}}><p style={{fontWeight:600,fontSize:15,color:"var(--cream)"}}>{invite}</p><p style={{fontSize:13,color:"var(--cream3)"}}>Invite pending</p></div>
          <Pill color="var(--gold)" bg="rgba(160,120,32,.08)">Pending</Pill>
        </div>}
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
  const [plan, setPlan]       = useState("year30");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [payNotice, setPayNotice] = useState("");

  const PLANS = [
    {
      id:    "year20",
      label: "Family Plan",
      price: "$19.99",
      per:   "/ year",
      sub:   "Full access · less than a coffee a month — your whole family, organized.",
      badge: "Only $1.66/mo",
      color: "var(--ink)",
    },
    {
      id:    "year30",
      label: "Family Plan+",
      price: "$29.99",
      per:   "/ year",
      sub:   "Full access + help us build more futuristic tools. Your extra $10 directly funds new smart features.",
      badge: "Most popular",
      color: "var(--sage)",
    },
  ];

  const pay = () => {
    setPayNotice("Subscriptions are coming soon! We'll notify you by email when Calla Family is available.");
  };

  if (done) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--ink2)", padding:32, textAlign:"center" }}>
      <div className="fu">
        <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
        <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-.5px", marginBottom:10 }}>Welcome to Calla Family!</h2>
        <p style={{ fontSize:15, color:"var(--cream3)", lineHeight:1.7, marginBottom:8 }}>Your family is covered for a full year.</p>
        <p style={{ fontSize:15, color:"var(--cream3)" }}>No ads. No data selling. Just your family, organised.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--ink2)" }}>
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
        <p style={{ fontSize:15, fontWeight:700, color:"#1a2e1a", textTransform:"uppercase", letterSpacing:".07em", marginBottom:14 }}>Everything included — no limits</p>
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
            <div key={title} style={{ background:"#fff", border:"1px solid var(--border2)", borderRadius:12, padding:"12px", boxShadow:"0 1px 3px rgba(45,60,45,.05)" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <p style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{title}</p>
              <p style={{ fontSize:15, color:"var(--cream3)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Plan picker */}
        <p style={{ fontSize:15, fontWeight:700, color:"#1a2e1a", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>Choose your plan</p>
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
        <div style={{ background:"rgba(45,90,61,.07)", border:"1px solid rgba(83,136,122,.25)", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
          <Check size={16} color="var(--sage2)" style={{ flexShrink:0 }}/>
          <p style={{ fontSize:15, color:"var(--sage3)", fontWeight:600 }}>
            {"That's $2.50/month — less than a coffee to keep your whole family organised."}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={pay}
          style={{ width:"100%", background:"var(--sage)", color:"var(--cream)", padding:"16px", borderRadius:16, fontWeight:800, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", gap:10, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,.15)", marginBottom:12 }}
        >
          {loading
            ? <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
            : <>Get Calla Family — $30/yr (Coming Soon)</>
          }
        </button>

        {/* Coming soon notice */}
        {payNotice&&<div style={{background:"rgba(45,90,61,.12)",border:"1px solid rgba(45,90,61,.25)",borderRadius:12,padding:"12px 14px",marginBottom:10,textAlign:"center"}}><p style={{fontSize:14,color:"var(--sage2)",fontWeight:600}}>{payNotice}</p></div>}

        {/* Privacy micro-copy */}
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:5 }}>
          <p style={{ fontSize:15, color:"var(--cream3)" }}>Secure payment · Cancel anytime · No auto-renewal surprises</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--sage2)", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={6} color="#fff"/></div>
            <p style={{ fontSize:15, color:"var(--cream3)" }}>No ads · No data selling · Emails deleted after extraction</p>
          </div>
        </div>

        {!hard && onDismiss && (
          <button onClick={onDismiss} style={{ background:"none", border:"none", color:"var(--cream3)", fontSize:15, display:"block", margin:"16px auto 0", padding:"8px" }}>
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
  const urgent = daysLeft <= 7;
  const color  = urgent ? "var(--rose)" : daysLeft <= 14 ? "var(--gold)" : "var(--sage)";
  const bg     = urgent ? "rgba(196,90,90,.08)" : daysLeft <= 14 ? "rgba(160,120,32,.06)" : "rgba(45,90,61,.06)";
  const border = urgent ? "rgba(196,90,90,.2)"  : daysLeft <= 14 ? "rgba(160,120,32,.2)"  : "rgba(45,90,61,.15)";
  return (
    <div style={{background:"#fff",border:"1.5px solid "+border,borderRadius:10,padding:"9px 14px",marginBottom:12,boxShadow:"0 1px 4px rgba(45,60,45,.06)",display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
      <p style={{flex:1,fontSize:13,fontWeight:600,color:"#1a2e1a"}}><span style={{color:color,fontWeight:700}}>{urgent?"Only ":""}{daysLeft} day{daysLeft!==1?"s":""} left</span>{" "}on your free trial</p>
      <button onClick={onUpgrade} style={{background:color,color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700,flexShrink:0}}>Upgrade</button>
      {!urgent&&<button onClick={function(){setDismissed(true);}} style={{background:"none",border:"none",color:"var(--cream3)",display:"flex",padding:2,flexShrink:0}}><X size={12}/></button>}
    </div>
  );
}

/* ─── Morning Text / Digest Screen ─────────────────────────────────────── */
function ListsScreen({members,topBar}) {
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
    <div className="screen-enter">
      <div style={{background:"linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%)",margin:"-20px -18px 16px",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 28px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 24px rgba(30,61,42,.25)"}}>
        {topBar}
        <p style={{fontSize:11,fontWeight:600,color:"rgba(245,240,232,.45)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4,fontFamily:"-apple-system,sans-serif"}}>Family Lists</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <p style={{fontSize:26,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,letterSpacing:"-.4px"}}>Lists</p>
          <button onClick={function(){setAddingList(true);}} style={{width:36,height:36,borderRadius:10,background:"rgba(245,240,232,.18)",border:"1px solid rgba(245,240,232,.3)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"auto",minWidth:"auto"}}><Plus size={16} color="#f5f0e8"/></button>
        </div>
        <p style={{fontSize:13,color:"rgba(245,240,232,.55)",fontFamily:"-apple-system,sans-serif",fontWeight:400}}>{lists.reduce(function(s,l){return s+l.items.filter(function(i){return !i.done;}).length;},0)} items pending across {lists.length} list{lists.length===1?"":"s"}</p>
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
          {members.length>0&&<select value={assignTo} onChange={function(e){setAssignTo(e.target.value);}} style={{background:"transparent",border:"none",fontSize:15,color:"var(--cream3)",padding:0,width:"auto",backgroundImage:"none",minWidth:0}}>
            <option value="">Anyone</option>
            {members.map(function(m){return <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>;})}
          </select>}
        </div>
        <button onClick={addItem} style={{width:46,height:46,borderRadius:12,background:"var(--sage)",display:"flex",alignItems:"center",justifyContent:"center",border:"none",flexShrink:0,minHeight:"auto",minWidth:"auto"}}><Plus size={20} color="#fff"/></button>
      </div>
      {cur.items.length===0&&<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:52,marginBottom:12}}>{cur.icon}</div><p style={{fontWeight:700,fontSize:16,marginBottom:6}}>{cur.name} list is empty</p><p style={{fontSize:15,color:"var(--cream3)"}}>Type above and press Enter to add items.</p></div>}
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
        <button onClick={function(){setShowDone(function(s){return !s;});}} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:"var(--cream3)",fontSize:15,fontWeight:600,padding:"4px 0",marginBottom:8,minHeight:"auto",minWidth:"auto"}}>
          {showDone?<ChevronUp size={14}/>:<ChevronDown size={14}/>}{done.length} completed
          {showDone&&<button onClick={function(e){e.stopPropagation();clearDone();}} style={{marginLeft:8,background:"rgba(220,80,80,.08)",border:"1px solid #FECACA",borderRadius:6,padding:"2px 8px",fontSize:15,fontWeight:600,color:"var(--red)",minHeight:"auto",minWidth:"auto"}}>Clear</button>}
        </button>
        {showDone&&done.map(function(item){return (
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"var(--ink3)",borderRadius:12,border:"1.5px solid #F3F4F6",marginBottom:4,opacity:.7}}>
            <div onClick={function(){toggle(item.id);}} style={{width:24,height:24,borderRadius:8,border:"2px solid "+cur.color,background:cur.color,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><Check size={12} color="#fff"/></div>
            <p style={{flex:1,fontSize:15,color:"var(--cream3)",textDecoration:"line-through"}}>{item.text}</p>
            <button onClick={function(){deleteItem(item.id);}} style={{background:"none",border:"none",color:"var(--border3)",display:"flex",padding:4,minHeight:"auto",minWidth:"auto",flexShrink:0}}><X size={14}/></button>
          </div>
        );})}
      </div>}
      {addingList&&<div style={{position:"fixed",inset:0,background:"rgba(26,46,26,.5)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={function(e){if(e.target===e.currentTarget)setAddingList(false);}}>
        <div className="fu" style={{background:"#f5f0e8",borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",width:"100%"}}>
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
function DiscoverScreen({members,onAdd,user,topBar}) {
  var [city,setCity]=useState(function(){return localStorage.getItem("calla_city")||"";});
  var [hood,setHood]=useState(function(){return localStorage.getItem("calla_hood")||"";});
  var [results,setResults]=useState([]);
  var [loading,setLoading]=useState(false);
  var [error,setError]=useState("");
  var [editLoc,setEditLoc]=useState(false);
  var [lastSearch,setLastSearch]=useState("");
  var [savedCity,setSavedCity]=useState(function(){return localStorage.getItem("calla_city")||"";});
  var [savedHood,setSavedHood]=useState(function(){return localStorage.getItem("calla_hood")||"";});
  var [dataSource,setDataSource]=useState("");   // "cache" | "fresh"
  var [fetchedAt,setFetchedAt]=useState("");     // ISO string from server
  var [pickerItem,setPickerItem]=useState(null); // item awaiting member selection;

  function saveLocation() {
    localStorage.setItem("calla_city", city);
    localStorage.setItem("calla_hood", hood);
    setSavedCity(city);
    setSavedHood(hood);
    setEditLoc(false);
    if(city) search(city, hood);
  }

  function search(c, h) {
    var loc = h ? h+", "+c : c;
    if(!loc.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setDataSource("");
    setFetchedAt("");
    setLastSearch(loc);
    fetch("https://pqvxzsrpifiuovhtxldp.supabase.co/functions/v1/scan-flyer", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+SUPABASE_KEY},
      body:JSON.stringify({type:"discover",location:loc})
    }).then(function(r){return r.json();}).then(function(d){
      // Surface server-side errors immediately
      if(d.error) {
        setError("Server error: "+d.error+(d.raw?" | "+d.raw:""));
        setLoading(false);
        return;
      }
      setDataSource(d.source||"");
      setFetchedAt(d.fetched_at||"");
      var text = d.result||d.text||"";
      if(!text) {
        // Show raw response so we can diagnose
        var keys = Object.keys(d);
        setError("Empty response. Keys: ["+(keys.join(",")||"none")+"] Raw: "+JSON.stringify(d).slice(0,120));
        setLoading(false);
        return;
      }
      try {
        var clean = text.replace(/```json|```/g,"").trim();
        var parsed = JSON.parse(clean);
        if(Array.isArray(parsed) && parsed.length>0) setResults(parsed.map(function(ev){return Object.assign({},ev,{category:normalizeCategory(ev.category)});}));
        else setError("No activities found near "+loc+". Try a larger city name.");
      } catch(e) {
        setError("Parse error: "+e.message+". Raw: "+text.slice(0,80));
      }
      setLoading(false);
    }).catch(function(err){
      setError("Network error: "+err.message);
      setLoading(false);
    });
  }

  function normalizeCategory(cat) {
    if(!cat) return "Other";
    var c = cat.toLowerCase();
    if(c==="soccer"||c.includes("football")||c.includes("rugby")||c.includes("lacrosse")) return "Soccer";
    if(c==="basketball") return "Basketball";
    if(c==="hockey"||c.includes("hockey")) return "Hockey";
    if(c==="swimming"||c.includes("swim")||c.includes("aqua")||c.includes("water polo")||c.includes("diving")) return "Swimming";
    if(c==="music"||c.includes("music")||c.includes("piano")||c.includes("guitar")||c.includes("violin")||c.includes("choir")||c.includes("sing")||c.includes("band")||c.includes("drum")) return "Music";
    if(c==="art"||c.includes("art")||c.includes("paint")||c.includes("draw")||c.includes("craft")||c.includes("pottery")||c.includes("photo")||c.includes("sculpt")) return "Art";
    if(c==="dance"||c.includes("dance")||c.includes("ballet")||c.includes("hip hop")||c.includes("jazz")||c.includes("cheer")) return "Dance";
    if(c==="community"||c.includes("community")||c.includes("festival")||c.includes("cultural")||c.includes("market")||c.includes("fair")||c.includes("family")||c.includes("parade")||c.includes("charity")) return "Community";
    if(c.includes("tennis")||c.includes("baseball")||c.includes("volleyball")||c.includes("cricket")||c.includes("badminton")||c.includes("golf")||c.includes("track")||c.includes("sport")||c.includes("gym")||c.includes("fitness")||c.includes("martial")||c.includes("karate")||c.includes("taekwondo")||c.includes("gymnast")||c.includes("yoga")||c.includes("lacrosse")||c.includes("rugby")) return "Soccer";
    if(c.includes("stem")||c.includes("coding")||c.includes("code")||c.includes("robot")||c.includes("science")||c.includes("tech")||c.includes("math")||c.includes("chess")||c.includes("academic")||c.includes("computer")||c.includes("program")||c.includes("python")||c.includes("scratch")||c.includes("steam")||c.includes("engineer")||c.includes("digital")) return "STEM";
    if(c.includes("outdoor")||c.includes("nature")||c.includes("hike")||c.includes("hiking")||c.includes("camp")||c.includes("garden")||c.includes("environment")||c.includes("park")||c.includes("trail")||c.includes("forest")||c.includes("adventure")) return "Outdoor";
    return "Other";
  }

  function fmtFetchedAt(iso) {
    if(!iso) return "";
    try {
      var d = new Date(iso);
      var now = new Date();
      var diffMs = now - d;
      var diffH = Math.floor(diffMs / 3600000);
      if(diffH < 1) return "just now";
      if(diffH < 24) return diffH+"h ago";
      var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return months[d.getMonth()]+" "+d.getDate()+" at "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
    } catch(e) { return ""; }
  }

  var categories=["All","Soccer","Basketball","Hockey","Swimming","Music","Art","Dance","Community","STEM","Outdoor","Other"];
  var [filter,setFilter]=useState("All");

  var catEmoji={"Soccer":"⚽","Basketball":"🏀","Hockey":"🏒","Swimming":"🏊","Music":"🎵","Art":"🎨","Dance":"💃","Community":"🏘️","STEM":"💻","Outdoor":"🌲","Other":"🎯"};

  function addToCalendar(item, memberId, memberColor) {
    var mid = memberId||(members[0]&&members[0].id)||"";
    var col = memberColor||(members[0]&&members[0].color)||"#2d5a3d";
    onAdd({
      id:Date.now().toString(),
      title:item.title,
      date:item.deadline||item.date||new Date().toISOString().slice(0,10),
      time:"",endTime:"",
      location:item.location||"",
      notes:item.description+(item.url?" | "+item.url:""),
      memberId:mid,
      color:col,
      recurring:false,recurFreq:"weekly",recurEnd:"",
      cost:"",costType:"one-time",packingList:[],
    });
    toast_({icon:"✅",title:"Added to calendar!",body:item.title,color:"var(--sage2)"});
  }

  function handleSaveToCalendar(item) {
    if(members.length > 1) {
      setPickerItem(item);
    } else {
      var mem = members[0]||{id:"",color:"#2d5a3d"};
      addToCalendar(item, mem.id, mem.color);
    }
  }

  function toast_(t){
    var el=document.createElement("div");
    el.style.cssText="position:fixed;top:calc(env(safe-area-inset-top,20px)+60px);left:50%;transform:translateX(-50%);background:var(--ink2);border:1px solid var(--border2);borderRadius:12px;padding:10px 16px;zIndex:9999;fontSize:14px;fontWeight:600;color:var(--cream);boxShadow:0 4px 20px rgba(0,0,0,.15);whiteSpace:nowrap;";
    el.textContent=t.icon+" "+t.title;
    document.body.appendChild(el);
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},2500);
  }

  var filtered = filter==="All" ? results : results.filter(function(r){return r.category===filter;});

  var locSet = savedCity.trim().length > 0;

  useEffect(function(){
    var rafId;
    var t=0;
    var canvases={};
    function initCanvas(el,w,h){
      el.width=w*2;el.height=h*2;
      el.style.width=w+"px";el.style.height=h+"px";
      var ctx=el.getContext("2d");ctx.scale(2,2);return ctx;
    }
    function drawSoccer(ctx,w,h,t){
      for(var s=0;s<7;s++){ctx.fillStyle=s%2===0?"#0d4a1a":"#0a3d15";ctx.fillRect(s*(w/6),0,w/6+1,h);}
      ctx.strokeStyle="rgba(255,255,255,.18)";ctx.lineWidth=1.2;
      ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*0.28,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(w/2,h/2,3,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.25)";ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=1;
      [[0,0.1,w,0.1],[0,0.9,w,0.9],[w/2,0,w/2,h]].forEach(function(l){ctx.beginPath();ctx.moveTo(l[0],l[1]*h);ctx.lineTo(l[2],l[3]*h);ctx.stroke();});
      var sx=w/2+Math.sin(t*0.7)*w*0.22,sy=h/2+Math.cos(t*0.45)*h*0.18;
      var gr=ctx.createRadialGradient(sx,sy,0,sx,sy,60);
      gr.addColorStop(0,"rgba(255,255,200,.2)");gr.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
    }
    function drawSwim(ctx,w,h,t){
      ctx.fillStyle="#0c3d6b";ctx.fillRect(0,0,w,h);
      for(var i=1;i<5;i++){ctx.strokeStyle="rgba(255,255,255,.1)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,i*h/5);ctx.lineTo(w,i*h/5);ctx.stroke();}
      [{a:9,sp:1.1,ph:0,al:.3,y:.35},{a:7,sp:0.8,ph:1.6,al:.22,y:.55},{a:11,sp:1.6,ph:.9,al:.18,y:.72},{a:5,sp:2,ph:2.5,al:.14,y:.45}].forEach(function(wv){
        ctx.beginPath();ctx.moveTo(0,wv.y*h);
        for(var x=0;x<=w;x+=2){ctx.lineTo(x,wv.y*h+Math.sin((x/w)*Math.PI*4+t*wv.sp+wv.ph)*wv.a);}
        ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle="rgba(56,189,248,"+wv.al+")";ctx.fill();
      });
      for(var d=0;d<10;d++){var da=(Math.sin(t*2.5+d)*.5+.5)*.4+.05;ctx.beginPath();ctx.arc((d*41+t*18)%w,(d*27+t*10)%h,1.5,0,Math.PI*2);ctx.fillStyle="rgba(186,230,255,"+da+")";ctx.fill();}
    }
    function drawMusic(ctx,w,h,t){
      ctx.fillStyle="#1e0533";ctx.fillRect(0,0,w,h);
      var vg=ctx.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.7);
      vg.addColorStop(0,"rgba(120,40,210,.35)");vg.addColorStop(1,"rgba(0,0,0,.5)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
      var bars=10,bw=4,gap=(w-bars*bw)/(bars+1);
      for(var b=0;b<bars;b++){
        var bh=(Math.sin(t*2.2+b*.85)*.42+.6)*h*.55,bx=gap+b*(bw+gap),by=h-bh-8;
        var bc=ctx.createLinearGradient(0,by,0,h);
        bc.addColorStop(0,"rgba(216,180,254,.95)");bc.addColorStop(1,"rgba(109,40,217,.35)");
        ctx.fillStyle=bc;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,2);ctx.fill();
      }
      for(var p=0;p<8;p++){var pa=(Math.sin(t*1.8+p)*.5+.5)*.55+.08;ctx.beginPath();ctx.arc((p*47+t*14+p*9)%w,h-((p*31+t*22+p*13)%(h*.85)),2,0,Math.PI*2);ctx.fillStyle="rgba(232,180,255,"+pa+")";ctx.fill();}
    }
    function drawBball(ctx,w,h,t){
      for(var row=0;row<9;row++){
        ctx.fillStyle=row%2===0?"#7c2d12":"#6b2508";ctx.fillRect(0,row*(h/9),w,h/9+1);
        for(var j=0;j<3;j++){var jx=(j+1)*(w/4)+(row%2===0?0:w/8);ctx.strokeStyle="rgba(0,0,0,.18)";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(jx,row*(h/9));ctx.lineTo(jx,(row+1)*(h/9));ctx.stroke();}
      }
      ctx.strokeStyle="rgba(255,220,150,.3)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(w/2,h+8,65,Math.PI,0);ctx.stroke();
      ctx.beginPath();ctx.arc(w/2,h/2,20,0,Math.PI*2);ctx.stroke();
      ctx.save();ctx.translate(w/2,h/2);ctx.rotate(t*.65);
      ctx.strokeStyle="rgba(251,146,60,.55)";ctx.lineWidth=2;ctx.setLineDash([10,7]);
      ctx.beginPath();ctx.arc(0,0,34,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      var sg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,52);
      sg.addColorStop(0,"rgba(255,140,40,.18)");sg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
    }
    function drawHockey(ctx,w,h,t){
      ctx.fillStyle="#e8f4f8";ctx.fillRect(0,0,w,h);
      var ice=ctx.createLinearGradient(0,0,0,h);
      ice.addColorStop(0,"#d4eef8");ice.addColorStop(1,"#b8e0f0");
      ctx.fillStyle=ice;ctx.fillRect(0,0,w,h);
      ctx.strokeStyle="rgba(200,0,0,.35)";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
      ctx.strokeStyle="rgba(0,0,180,.2)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(w/2,h/2,25,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="rgba(0,0,180,.15)";ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(w*.2,h/2,15,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(w*.8,h/2,15,0,Math.PI*2);ctx.stroke();
      ctx.save();ctx.translate(w/2,h/2);ctx.rotate(t*.4);
      ctx.strokeStyle="rgba(0,50,180,.2)";ctx.lineWidth=1.5;ctx.setLineDash([8,6]);
      ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    }
    function drawArt(ctx,w,h,t){
      ctx.fillStyle="#065f46";ctx.fillRect(0,0,w,h);
      [{x:.15,y:.2,r:30,c:"rgba(16,185,129,.4)"},{x:.8,y:.7,r:25,c:"rgba(5,150,105,.5)"},{x:.5,y:.1,r:20,c:"rgba(167,243,208,.2)"},{x:.2,y:.8,r:35,c:"rgba(6,95,70,.6)"}].forEach(function(blob,i){
        var bx=blob.x*w+Math.sin(t*.6+i)*8,by=blob.y*h+Math.cos(t*.5+i)*6;
        ctx.beginPath();ctx.arc(bx,by,blob.r+Math.sin(t+i)*5,0,Math.PI*2);ctx.fillStyle=blob.c;ctx.fill();
      });
      for(var sp=0;sp<12;sp++){var sa=(Math.sin(t*1.5+sp)*.5+.5)*.45+.1;ctx.beginPath();ctx.arc((sp*53+t*9)%w,(sp*37+t*12)%h,2.5,0,Math.PI*2);ctx.fillStyle="rgba(167,243,208,"+sa+")";ctx.fill();}
    }
    function drawDance(ctx,w,h,t){
      ctx.fillStyle="#831843";ctx.fillRect(0,0,w,h);
      var sg=ctx.createRadialGradient(w/2,h/2,5,w/2,h/2,w*.7);
      sg.addColorStop(0,"rgba(236,72,153,.4)");sg.addColorStop(1,"rgba(0,0,0,.3)");
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
      for(var sp=0;sp<8;sp++){
        var angle=t*.9+sp*(Math.PI*2/8),r=25+Math.sin(t*2+sp)*6;
        var sx=w/2+Math.cos(angle)*r,sy=h/2+Math.sin(angle)*r;
        var sa=(Math.sin(t*2+sp)*.5+.5)*.7+.15;
        ctx.beginPath();ctx.arc(sx,sy,3,0,Math.PI*2);ctx.fillStyle="rgba(253,186,218,"+sa+")";ctx.fill();
      }
      var rg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,22+Math.sin(t*3)*4);
      rg.addColorStop(0,"rgba(249,168,212,.25)");rg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=rg;ctx.fillRect(0,0,w,h);
    }
    function drawCommunity(ctx,w,h,t){
      ctx.fillStyle="#78350f";ctx.fillRect(0,0,w,h);
      var sg=ctx.createRadialGradient(w/2,h*.3,5,w/2,h*.3,w*.65);
      sg.addColorStop(0,"rgba(251,191,36,.3)");sg.addColorStop(1,"rgba(0,0,0,.2)");
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
      for(var st=0;st<5;st++){var sa=(Math.sin(t*1.2+st)*.5+.5)*.5+.15;var sr=8+Math.sin(t+st)*2;ctx.beginPath();ctx.arc(w/2+Math.cos(t*.4+st*(Math.PI*2/5))*30,h/2+Math.sin(t*.4+st*(Math.PI*2/5))*20,sr,0,Math.PI*2);ctx.fillStyle="rgba(253,224,71,"+sa+")";ctx.fill();}
      ctx.strokeStyle="rgba(253,224,71,.15)";ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(w/2,h/2,35,0,Math.PI*2);ctx.stroke();
    }
    function drawOther(ctx,w,h,t){
      ctx.fillStyle="#2a1a3a";ctx.fillRect(0,0,w,h);
      var sg=ctx.createRadialGradient(w/2,h/2,5,w/2,h/2,w*.7);
      sg.addColorStop(0,"rgba(124,58,237,.4)");sg.addColorStop(1,"rgba(0,0,0,.3)");
      ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
      for(var s=0;s<7;s++){
        var angle=t*.5+s*(Math.PI*2/7),r=28+Math.sin(t*1.5+s)*8;
        ctx.beginPath();
        ctx.arc(w/2+Math.cos(angle)*r,h/2+Math.sin(angle)*r,2.5+Math.sin(t*2+s),0,Math.PI*2);
        ctx.fillStyle="rgba(196,181,253,"+(Math.sin(t*2+s)*.4+.4)+")";ctx.fill();
      }
      var rg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,20+Math.sin(t*2)*5);
      rg.addColorStop(0,"rgba(167,139,250,.3)");rg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=rg;ctx.fillRect(0,0,w,h);
    }
    function drawSTEM(ctx,w,h,t){
      ctx.fillStyle="#0a1628";ctx.fillRect(0,0,w,h);
      // Grid
      ctx.strokeStyle="rgba(59,130,246,.1)";ctx.lineWidth=0.8;
      for(var gx=0;gx<=w;gx+=w/7){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,h);ctx.stroke();}
      for(var gy=0;gy<=h;gy+=h/5){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();}
      // Network nodes + connecting lines
      var nodes=[{x:.12,y:.25},{x:.5,y:.15},{x:.85,y:.3},{x:.25,y:.65},{x:.6,y:.7},{x:.9,y:.6}];
      var links=[[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5]];
      links.forEach(function(pair,i){
        var a=nodes[pair[0]],b=nodes[pair[1]];
        var pulse=(Math.sin(t*1.5+i)*.5+.5)*.25+.04;
        ctx.strokeStyle="rgba(96,165,250,"+pulse+")";ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(a.x*w,a.y*h);ctx.lineTo(b.x*w,b.y*h);ctx.stroke();
      });
      nodes.forEach(function(n,i){
        var pulse=Math.sin(t*2+i)*.5+.5,nx=n.x*w,ny=n.y*h;
        var ng=ctx.createRadialGradient(nx,ny,0,nx,ny,12+pulse*5);
        ng.addColorStop(0,"rgba(96,165,250,"+(0.7+pulse*.25)+")");ng.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=ng;ctx.fillRect(nx-17,ny-17,34,34);
        ctx.beginPath();ctx.arc(nx,ny,2.5,0,Math.PI*2);ctx.fillStyle="rgba(147,197,253,"+(0.6+pulse*.4)+")";ctx.fill();
      });
      // Floating binary
      for(var b2=0;b2<8;b2++){
        var bx=(b2*43+t*14+b2*11)%w,by=(b2*31+t*7)%(h*.85);
        var ba=(Math.sin(t*2.2+b2)*.4+.4)*.55+.08;
        ctx.fillStyle="rgba(96,165,250,"+ba+")";ctx.font="9px monospace";ctx.fillText(b2%2?"1":"0",bx,by+10);
      }
      // Central glow
      var cg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.45);
      cg.addColorStop(0,"rgba(59,130,246,.14)");cg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cg;ctx.fillRect(0,0,w,h);
    }
    function drawOutdoor(ctx,w,h,t){
      var sky=ctx.createLinearGradient(0,0,0,h*.7);
      sky.addColorStop(0,"#0d2a1a");sky.addColorStop(1,"#1a4a28");
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      // Stars / fireflies
      for(var s=0;s<14;s++){
        var sa=(Math.sin(t*1.6+s)*.5+.5)*.55+.1;
        ctx.beginPath();ctx.arc((s*47+t*5)%w,(s*29)%(h*.6),1.5,0,Math.PI*2);
        ctx.fillStyle="rgba(187,247,208,"+sa+")";ctx.fill();
      }
      // Rolling hill silhouette
      ctx.fillStyle="rgba(8,35,18,.85)";
      ctx.beginPath();ctx.moveTo(0,h);
      for(var hx=0;hx<=w;hx+=3){ctx.lineTo(hx,h*.7+Math.sin(hx/w*Math.PI*3+t*.35)*9);}
      ctx.lineTo(w,h);ctx.closePath();ctx.fill();
      // Floating leaves
      [{x:.18,sp:.7,ph:0},{x:.48,sp:.5,ph:1.3},{x:.72,sp:.9,ph:2.5},{x:.33,sp:.6,ph:.8}].forEach(function(lf,i){
        var lx=lf.x*w+Math.sin(t*lf.sp+lf.ph)*14;
        var ly=h*.08+((t*lf.sp*18+lf.ph*28)%(h*.62));
        var la=Math.sin(t*lf.sp+lf.ph)*.3+.65;
        ctx.save();ctx.translate(lx,ly);ctx.rotate(t*lf.sp+lf.ph);
        ctx.fillStyle="rgba(74,222,128,"+la+")";
        ctx.beginPath();ctx.ellipse(0,0,5,3,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      });
      // Ground glow
      var gg=ctx.createRadialGradient(w/2,h*.75,0,w/2,h*.75,w*.5);
      gg.addColorStop(0,"rgba(34,197,94,.18)");gg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=gg;ctx.fillRect(0,0,w,h);
    }
    var drawFns={"Soccer":drawSoccer,"Basketball":drawBball,"Hockey":drawHockey,"Swimming":drawSwim,"Music":drawMusic,"Art":drawArt,"Dance":drawDance,"Community":drawCommunity,"STEM":drawSTEM,"Outdoor":drawOutdoor,"Other":drawOther};
    function getOrInit(id,w,h){
      if(!canvases[id]){var el=document.getElementById(id);if(!el)return null;canvases[id]=initCanvas(el,w,h);}return canvases[id];
    }
    function tick(){
      t+=0.022;
      filtered.forEach(function(item,i){
        var fn=drawFns[item.category]||drawFns["Other"];if(!fn)return;
        var el=document.getElementById("cvd-"+i);if(!el)return;
        var w=el.offsetWidth||140,h=el.offsetHeight||120;
        var ctx=getOrInit("cvd-"+i,w,h);if(!ctx)return;
        fn(ctx,w,h,t);
      });
      rafId=requestAnimationFrame(tick);
    }
    rafId=requestAnimationFrame(tick);
    return function(){cancelAnimationFrame(rafId);};
  },[filtered]);


  return (
    <div className="screen-enter" style={{paddingBottom:8}}>
      {/* Hero header */}
      <div style={{background:"linear-gradient(160deg,#1e3d2a 0%,#2d5a3d 100%)",margin:"-20px -18px 16px",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 28px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 24px rgba(30,61,42,.25)"}}>
        {topBar}
        <p style={{fontSize:11,fontWeight:600,color:"rgba(245,240,232,.45)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:4,fontFamily:"-apple-system,sans-serif"}}>Local Activities</p>
        <p style={{fontSize:26,fontWeight:800,color:"#f5f0e8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,letterSpacing:"-.4px",marginBottom:6}}>Explore Nearby</p>
        <p style={{fontSize:13,color:"rgba(245,240,232,.55)",fontFamily:"-apple-system,sans-serif",fontWeight:400}}>Kids sports, music, classes &amp; community events</p>
      </div>
      {/* Location bar */}
      <div style={{background:"#fff",borderRadius:16,padding:"14px 16px",marginBottom:14,border:"1px solid rgba(26,46,26,.08)",boxShadow:"0 1px 4px rgba(26,46,26,.06)"}}>
        {!editLoc&&locSet ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Locate size={16} color="var(--sage)"/>
              <div>
                <p style={{fontWeight:700,fontSize:15,color:"var(--cream)"}}>{hood?hood+", ":""}{city}</p>
                <p style={{fontSize:12,color:"var(--cream3)"}}>Your discovery area</p>
              </div>
            </div>
            <button onClick={function(){setEditLoc(true);}} style={{background:"var(--ink3)",border:"1px solid var(--border2)",borderRadius:8,padding:"6px 12px",fontSize:13,fontWeight:600,color:"var(--cream3)"}}>Change</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <p style={{fontWeight:700,fontSize:15,color:"var(--cream)"}}>Set your location</p>
            <input placeholder="City (e.g. Ottawa)" value={city} onChange={function(e){setCity(e.target.value);}} style={{fontSize:15}}/>
            <input placeholder="Neighbourhood (e.g. Riverside South)" value={hood} onChange={function(e){setHood(e.target.value);}} style={{fontSize:15}}/>
            <Btn onClick={saveLocation} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Locate size={14}/>Save & Search
            </Btn>
          </div>
        )}
      </div>

      {/* Search button if location set but no results yet */}
      {locSet&&!editLoc&&results.length===0&&!loading&&!error&&(
        <Btn onClick={function(){search(city,hood);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",marginBottom:14}}>
          <Compass size={15}/>Discover in {hood||city}
        </Btn>
      )}

      {/* Loading */}
      {loading&&(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{width:32,height:32,border:"3px solid var(--border2)",borderTopColor:"var(--sage2)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 16px"}}/>
          <p style={{fontSize:15,color:"var(--cream3)",fontWeight:500}}>Searching {lastSearch}…</p>
          <p style={{fontSize:13,color:"var(--cream3)",marginTop:4}}>Finding registrations & events</p>
        </div>
      )}

      {/* Error */}
      {error&&<div style={{background:"rgba(196,90,90,.08)",border:"1px solid rgba(196,90,90,.2)",borderRadius:12,padding:"14px 16px",marginBottom:14,fontSize:14,color:"var(--rose)"}}>{error}</div>}

      {/* Category filter */}
      {results.length>0&&(
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
          {categories.map(function(c){
            var active=filter===c;
            return (
              <button key={c} onClick={function(){setFilter(c);}} style={{flexShrink:0,padding:"6px 14px",borderRadius:99,background:active?"var(--sage)":"var(--ink2)",color:active?"#f5f0e8":"var(--cream3)",border:"1px solid "+(active?"var(--sage2)":"var(--border2)"),fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>
                {c==="All"?"All":catEmoji[c]+" "+c}
              </button>
            );
          })}
        </div>
      )}

      {/* AI disclaimer + cache freshness banner */}
      {results.length>0&&(
        <div style={{background:"rgba(160,140,60,.1)",border:"1px solid rgba(160,140,60,.2)",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"flex-start",gap:8}}>
          <span style={{fontSize:14,flexShrink:0,marginTop:1}}>🤖</span>
          <p style={{fontSize:12,color:"var(--cream3)",lineHeight:1.5,margin:0}}>
            <strong style={{color:"var(--cream2)"}}>AI-generated suggestions</strong> — always verify dates and details with the organizer before registering.
            {dataSource==="cache"&&fetchedAt&&<span style={{color:"var(--cream3)"}}> · Refreshed {fmtFetchedAt(fetchedAt)}</span>}
            {dataSource==="fresh"&&<span style={{color:"var(--cream3)"}}> · Just fetched fresh results</span>}
          </p>
        </div>
      )}

      {/* Results */}
      {filtered.length>0&&(
        <div>
          <p style={{fontSize:16,fontWeight:800,color:"var(--cream)",fontFamily:"'Playfair Display',Georgia,serif",letterSpacing:"-.3px",marginBottom:12}}>Local Activities</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {filtered.map(function(item,i){
            var emoji=catEmoji[item.category]||"📅";
            var hasDeadline=item.deadline&&item.deadline.length>4;
            var hasDate=item.date&&item.date.length>4;
            var hasRealUrl=item.url&&item.url.length>6&&item.url.startsWith("http");
            // Always provide a URL — use real one if available, Google search otherwise
            var effectiveUrl=hasRealUrl?item.url:"https://www.google.com/search?q="+encodeURIComponent((item.title||"")+" "+(savedCity||city||"")+" registration");
            var hasUrl=true;
            var canId="cvd-"+i;
            var catColors={
              "Soccer":["#0d4a1a","#16a34a"],
              "Basketball":["#7c2d12","#ea580c"],
              "Hockey":["#0f2d55","#3b82f6"],
              "Swimming":["#0c3d6b","#0ea5e9"],
              "Music":["#2e1065","#a855f7"],
              "Art":["#065f46","#10b981"],
              "Dance":["#831843","#ec4899"],
              "Community":["#78350f","#f59e0b"],
              "STEM":["#0a1628","#3b82f6"],
              "Outdoor":["#0d2a1a","#22c55e"],
              "Other":["#2a1a3a","#7c3aed"]
            };
            var colors=catColors[item.category]||catColors["Other"];
            function fmtDate(d){
              if(!d||d.length<8) return "";
              try{
                var parts=d.split("-");
                var dt=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]));
                var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                return months[dt.getMonth()]+" "+dt.getDate();
              }catch(e){return d;}
            }
            return (
              <div key={i} style={{background:"#fff",borderRadius:18,overflow:"hidden",border:"1px solid rgba(26,46,26,.07)",boxShadow:"0 4px 18px rgba(26,46,26,.09)"}}>
                <div style={{height:160,background:colors[0],display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                  <canvas id={canId} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>
                  <span style={{position:"relative",zIndex:2,filter:"drop-shadow(0 4px 14px rgba(0,0,0,.5))",fontSize:72,lineHeight:1}}>{emoji}</span>
                  <div style={{position:"absolute",top:10,left:10,background:"rgba(255,255,255,.18)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.3)",borderRadius:99,padding:"3px 10px",fontSize:10,fontWeight:800,color:"#fff",letterSpacing:".07em",textTransform:"uppercase",zIndex:3}}>
                    {item.category||"Activity"}
                  </div>
                  <div style={{position:"absolute",bottom:10,left:10,right:10,display:"flex",gap:6,flexWrap:"wrap",zIndex:3}}>
                    {hasDate&&(
                      <div style={{background:"rgba(0,0,0,.5)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
                        <span>📅</span>{fmtDate(item.date)}
                      </div>
                    )}
                    {hasDeadline&&(
                      <div style={{background:"rgba(200,50,20,.7)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
                        <span>⏰</span>Deadline {fmtDate(item.deadline)}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{padding:"13px 14px 14px",background:"#fff"}}>
                  <p style={{fontWeight:800,fontSize:15,color:"#1a2e1a",lineHeight:1.3,marginBottom:4,fontFamily:"'Playfair Display',Georgia,serif"}}>{item.title}</p>
                  {item.location&&<p style={{fontSize:12,color:"#8a9a8a",marginBottom:4,display:"flex",alignItems:"center",gap:4}}><MapPin size={11} color="#8a9a8a"/>{item.location}</p>}
                  {item.description&&<p style={{fontSize:12,color:"#6a7a6a",marginBottom:12,lineHeight:1.45}}>{item.description}</p>}
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <button onClick={function(){handleSaveToCalendar(item);}} style={{flex:1,background:"#1a3a2a",color:"#f5f0e8",border:"none",borderRadius:11,padding:"11px 0",fontWeight:700,fontSize:13,fontFamily:"-apple-system,sans-serif",cursor:"pointer",letterSpacing:".01em"}}>
                      + Save to Calendar
                    </button>
                    <button
                      onClick={function(){if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Browser){window.Capacitor.Plugins.Browser.open({url:effectiveUrl});}else{window.open(effectiveUrl,"_blank");}}}
                      style={{width:42,height:42,background:"#f0ebe0",border:"2px solid #1a3a2a",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",opacity:1}}>
                      <ExternalLink size={15} color="#1a3a2a"/>
                    </button>
                  </div>
                  {!hasRealUrl&&<p style={{fontSize:10,color:"#aaa",marginTop:5,textAlign:"center"}}>🔍 Opens Google search for this activity</p>}
                </div>
              </div>
            );
          })}

          </div>
          <button onClick={function(){search(city,hood);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"var(--ink2)",border:"1px solid var(--border2)",borderRadius:10,padding:"10px 0",fontWeight:600,fontSize:14,color:"var(--cream3)",width:"100%",marginTop:12}}>
            <Compass size={14}/>Refresh results
          </button>
        </div>
      )}

      {/* Empty — no location */}
      {!locSet&&!editLoc&&(
        <div style={{textAlign:"center",padding:"48px 20px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🧭</div>
          <p style={{fontWeight:700,fontSize:18,color:"var(--cream)",marginBottom:8}}>Discover local activities</p>
          <p style={{fontSize:15,color:"var(--cream3)",lineHeight:1.6,marginBottom:24}}>Set your city and neighbourhood to find upcoming kids sports, music classes, and community events near you.</p>
          <Btn onClick={function(){setEditLoc(true);}} style={{display:"inline-flex",alignItems:"center",gap:8}}>
            <Locate size={14}/>Set My Location
          </Btn>
        </div>
      )}

      {/* Member picker sheet */}
      {pickerItem&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:600,display:"flex",alignItems:"flex-end"}} onClick={function(){setPickerItem(null);}}>
          <div style={{background:"var(--ink2)",borderRadius:"20px 20px 0 0",padding:"20px 18px calc(24px + env(safe-area-inset-bottom,0px))",width:"100%",boxSizing:"border-box"}} onClick={function(e){e.stopPropagation();}}>
            <div style={{width:36,height:4,background:"var(--border2)",borderRadius:99,margin:"0 auto 18px"}}/>
            <p style={{fontWeight:700,fontSize:16,color:"var(--cream)",marginBottom:4}}>Add to whose calendar?</p>
            <p style={{fontSize:13,color:"var(--cream3)",marginBottom:16,lineHeight:1.4}}>{pickerItem.title}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {members.map(function(mem){
                return (
                  <button key={mem.id} onClick={function(){addToCalendar(pickerItem,mem.id,mem.color);setPickerItem(null);}}
                    style={{display:"flex",alignItems:"center",gap:12,background:"#fff",border:"1px solid var(--border2)",borderRadius:14,padding:"12px 14px",textAlign:"left",cursor:"pointer"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:mem.color||"#2d5a3d",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                      {mem.avatar||mem.name?.[0]||"👤"}
                    </div>
                    <p style={{fontWeight:600,fontSize:15,color:"var(--cream)",margin:0}}>{mem.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Nav({active,setActive,inboxBadge,notifBadge}) {
  var items=[
    {id:"home",  Icon:Home,         label:"Home"},
    {id:"inbox", Icon:Zap,          label:"Catch", badge:inboxBadge},
    {id:"discover",Icon:Compass,      label:"Discover"},
    {id:"lists", Icon:ShoppingCart, label:"Lists"},
    {id:"more",  Icon:Settings,     label:"More"},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#f0ebe0",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:"1px solid var(--border2)",display:"flex",alignItems:"center",padding:"8px 4px",paddingBottom:"calc(12px + env(safe-area-inset-bottom,0px))",zIndex:200,gap:0,boxShadow:"0 -2px 20px rgba(45,60,45,.08)"}}>
      {items.map(function(item){
        var isActive=active===item.id;
        return (
          <button key={item.id} onClick={function(){setActive(item.id);}}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"2px 0",background:"transparent",border:"none",position:"relative"}}
          >
            {/* Wide pill — matches Willow style */}
            <div style={{width:isActive?56:38,height:34,borderRadius:99,background:isActive?"rgba(45,90,61,.14)":"transparent",boxShadow:isActive?"0 1px 3px rgba(45,90,61,.15)":"none",display:"flex",alignItems:"center",justifyContent:"center",transition:"width .3s cubic-bezier(.34,1.56,.64,1),background .22s",position:"relative"}}>
              {isActive&&<div style={{position:"absolute",inset:0,borderRadius:99,border:"1px solid rgba(45,90,61,.2)"}}/>}
              <item.Icon size={21} strokeWidth={isActive?2.2:1.8} color={isActive?"var(--sage)":"rgba(45,60,45,.55)"}/>
              {item.badge>0&&<div style={{position:"absolute",top:0,right:isActive?0:"-2px",background:"var(--red)",color:"#fff",borderRadius:99,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,border:"2px solid var(--ink2)",padding:"0 3px"}}>{item.badge>9?"9+":item.badge}</div>}
            </div>
            <span style={{fontSize:10,fontWeight:isActive?700:500,letterSpacing:".01em",color:isActive?"var(--sage)":"rgba(45,60,45,.65)",transition:"color .2s"}}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}


const DN={enabled:true,reminders:["60","1440"],digest:"daily_morning",quietHours:{enabled:true,from:"22:00",to:"07:00"},mutedMembers:[],perEvent:{}};

export default function App() {
  const [user,setUser]           = useState(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [setupDone,setSetupDone] = useState(false);
  const [tab,setTab]             = useState("home");
  const [globalSel,setGlobalSel] = useState(null);
  const [selectedMemberId,setSelectedMemberId] = useState(null);
  const [members,setMembers]     = useState([]);
  const [events,setEvents]       = useState([]);
  const [notif,setNotif] = useState(function(){
    try{var s=localStorage.getItem("calla_notif");return s?JSON.parse(s):DN;}
    catch(e){return DN;}
  });
  const [toasts,setToasts]       = useState([]);
  const [inboxBadge,setInboxBadge] = useState(0);
  const [showBanner,setShowBanner] = useState(true);
  const [paid,setPaid]           = useState(false);
  const [showPaywall,setShowPaywall] = useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [showVoice,setShowVoice]=useState(false);
  const [showGlobalEv,setShowGlobalEv]=useState(false);
  const [showSearch,setShowSearch]=useState(false);
  const [searchQuery,setSearchQuery]=useState("");
  const [familyId,setFamilyId]   = useState(null);
  const [pendingInvite,setPendingInvite] = useState(null);
  const [showOnboarding,setShowOnboarding] = useState(false);
  const [showCoParentSetup,setShowCoParentSetup] = useState(false);
  const [showAiDisclosure,setShowAiDisclosure] = useState(false);
  const [aiDisclosureSeen] = useState(()=>!!localStorage.getItem("calla_ai_disclosure_seen"));

  // ── Trial scrubber ────────────────────────────────────────────────────────
  const [trialStart,setTrialStart] = useState(null);

  // ── Request push notification permission ─────────────────────────────────
  const requestNotificationPermission=function(){
    if(!("Notification" in window)){
      toast({icon:"⚠️",title:"Notifications not supported on this browser",color:"var(--rose)"});
      return;
    }
    Notification.requestPermission().then(function(permission){
      if(permission!=="granted"){
        toast({icon:"⚠️",title:"Notifications blocked",body:"Enable in your browser settings.",color:"var(--rose)"});
        return;
      }
    const isCapacitorApp = typeof window !== "undefined" && window.location.protocol === "capacitor:";
    if(isCapacitorApp) { toast({icon:"ℹ️",title:"Using native iOS notifications",color:"var(--sage2)"}); return; }
      if(!("serviceWorker" in navigator)){
        toast({icon:"⚠️",title:"Service worker not supported",color:"var(--rose)"});
        return;
      }
      navigator.serviceWorker.register("/firebase-messaging-sw.js").then(function(registration){
        getToken(messaging,{
          vapidKey:"BE2BP72xGAKQ-Tb1jd1ltsbVrXsD4AG8VqdMnvVQ4w2FNhzLrwe-tXnTeGNeD5BjVDZcLsSIzEitwLwdpGAtcxs",
          serviceWorkerRegistration:registration
        }).then(function(currentToken){
          if(currentToken){
            supabase.from("user_push_tokens").upsert({user_id:user.id,token:currentToken}).then(function(){
              toast({icon:"🔔",title:"Notifications enabled!",color:"var(--sage2)"});
            });
          } else {
            toast({icon:"⚠️",title:"Could not get notification token",color:"var(--rose)"});
          }
        }).catch(function(err){
          console.error("getToken failed:",err);
          toast({icon:"⚠️",title:"Notification setup failed",color:"var(--rose)"});
        });
      }).catch(function(err){
        console.error("SW registration failed:",err);
        toast({icon:"⚠️",title:"Service worker failed",color:"var(--rose)"});
      });
    });
  };
  const trial = paid ? null : trialStatus(trialStart || new Date().toISOString());

  const toast=t=>{const id=genId();setToasts(p=>[...p,{...t,id}]);setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),3000);};

  // ── Check for invite token in URL on load ─────────────────────────────────
  useEffect(function(){
    var params=new URLSearchParams(window.location.search);
    var token=params.get("invite");
    if(token) setPendingInvite(token);
  },[]);

  // ── Restore session on page load ──────────────────────────────────────────
  useEffect(function(){
    supabase.auth.getSession().then(function(res){
      if(!res.data.session){
        var seen=localStorage.getItem("calla_onboarding_seen");
        if(!seen) setShowOnboarding(true);
      }
      var session=res.data.session;
      if(session&&session.user){
        var u=session.user;
        var meta=u.user_metadata||{};
        setUser({id:u.id,name:meta.name||"Parent",family:meta.family_name||"My Family",email:u.email});
        supabase.from("profiles").select("setup_done,name,family_name,trial_start,paid,onboarding_seen,catch_prefix").eq("id",u.id).then(function(pr){
          if(pr.data&&pr.data.length>0){
            var profile=pr.data[0];
            var done=profile.setup_done===true||localStorage.getItem("calla_setup_"+u.id)==="true";
            setSetupDone(done);
            if(profile.name) setUser({id:u.id,name:profile.name,family:profile.family_name||"My Family",email:u.email});
            if(profile.trial_start){
              setTrialStart(profile.trial_start);
            } else {
              var now=new Date().toISOString();
              setTrialStart(now);
              supabase.from("profiles").update({trial_start:now}).eq("id",u.id).then(function(){});
            }
            if(profile.paid===true) setPaid(true);
            if(!profile.onboarding_seen) setShowOnboarding(true);
            // Store catch prefix — use family name slug for readability
            var isPureHex=/^[0-9a-f]{10}$/.test(profile.catch_prefix||"");
            if(!profile.catch_prefix||isPureHex){
              var familySlug=(profile.family_name||"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,15);
              var pfx=familySlug.length>=3?familySlug+u.id.replace(/-/g,"").slice(-3):u.id.replace(/-/g,"").slice(0,10);
              supabase.from("profiles").update({catch_prefix:pfx}).eq("id",u.id).then(function(){});
              setUser(function(prev){return Object.assign({},prev,{catchPrefix:pfx});});
            } else {
              setUser(function(prev){return Object.assign({},prev,{catchPrefix:profile.catch_prefix});});
            }
          } else {
            setSetupDone(localStorage.getItem("calla_setup_"+u.id)==="true");
            setShowOnboarding(true);
            // Brand-new profile — generate from family name in metadata
            var familySlug2=(meta.family_name||"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,15);
            var pfx2=familySlug2.length>=3?familySlug2+u.id.replace(/-/g,"").slice(-3):u.id.replace(/-/g,"").slice(0,10);
            supabase.from("profiles").update({catch_prefix:pfx2}).eq("id",u.id).then(function(){});
            setUser(function(prev){return Object.assign({},prev,{catchPrefix:pfx2});});
          }
          loadUserData(u.id);
        }).catch(function(){
          setSetupDone(localStorage.getItem("calla_setup_"+u.id)==="true");
          loadUserData(u.id);
        });
      }
      setAuthLoading(false);
    }).catch(function(){
      setAuthLoading(false);
    });
    var sub=supabase.auth.onAuthStateChange(function(event,session){
      if(event==="SIGNED_OUT"){
        setUser(null);setSetupDone(false);setEvents([]);setMembers([]);setFamilyId(null);setTrialStart(null);
      } else if((event==="SIGNED_IN"||event==="TOKEN_REFRESHED")&&session&&session.user){
        var u=session.user;
        var meta=u.user_metadata||{};
        setUser(function(prev){
          if(prev&&prev.id===u.id) return prev;
          return {id:u.id,name:meta.name||"Parent",family:meta.family_name||"My Family",email:u.email};
        });
      }
    });
    return function(){if(sub&&sub.data&&sub.data.subscription)sub.data.subscription.unsubscribe();};
  },[]);

  // ── Catch inbox badge: poll + Realtime subscription ──────────────────────
  useEffect(function(){
    if(!user||!user.id) return;
    var pfx=user.catchPrefix||user.id.replace(/-/g,"").slice(0,10);

    function refreshBadge(){
      var q=familyId
        ? supabase.from("catch_items").select("id",{count:"exact",head:true}).eq("family_id",familyId).eq("processed",false)
        : supabase.from("catch_items").select("id",{count:"exact",head:true}).eq("catch_prefix",pfx).eq("processed",false);
      q.then(function(res){ setInboxBadge(res.count||0); }).catch(function(){});
    }

    // Initial load + 60s fallback poll
    refreshBadge();
    var iv=setInterval(refreshBadge,60000);

    // Realtime: instant badge bump + toast when a new email arrives
    var filterStr=familyId?"family_id=eq."+familyId:"catch_prefix=eq."+pfx;
    var channel=supabase.channel("catch_items_live_"+user.id)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"catch_items",filter:filterStr},
        function(payload){
          setInboxBadge(function(n){return n+1;});
          var sender=(payload.new&&(payload.new.from_name||payload.new.from_address))||"Someone";
          var subj=(payload.new&&payload.new.subject)||"New email";
          toast({icon:"📬",title:"New email: "+subj,subtitle:"From "+sender,color:"var(--sage2)"});
        })
      .subscribe();

    return function(){
      clearInterval(iv);
      supabase.removeChannel(channel);
    };
  },[user,familyId]);

  // ── Load events + members from Supabase ───────────────────────────────────
  function loadUserData(userId){
    // Check if user belongs to a family
    supabase.from("family_members").select("family_id").eq("user_id",userId).then(function(res){
      if(res.error||!res.data) return;
      if(res.data.length>0){
        var fid=res.data[0].family_id;
        setFamilyId(fid);
        // Load ALL events for the family (both parents)
        supabase.from("events").select("*").eq("family_id",fid).then(function(r){
          if(r.error||!r.data||r.data.length===0) return;
          supabase.from("members").select("*").eq("family_id",fid).then(function(mr){
            var mmap={};
            if(mr.data) mr.data.forEach(function(m){mmap[m.id]=m.color;});
            setEvents(r.data.map(function(e){return{
              id:e.id,title:e.title,memberId:e.member_id,date:e.date,time:e.time,
              endTime:e.end_time,location:e.location,
              color:e.color||(mmap[e.member_id]||"#2d7a52"),
              recurring:e.recurring,
              recurFreq:e.recur_freq,recurEnd:e.recur_end,notes:e.notes,
              cost:e.cost,costType:e.cost_type,packingList:e.packing_list||[],
            };}));
          }).catch(function(){});
        }).catch(function(){});
        supabase.from("members").select("*").eq("family_id",fid).then(function(r){
          if(r.error||!r.data||r.data.length===0) return;
          setMembers(r.data.map(function(m){return{id:m.id,name:m.name,color:m.color,emoji:m.emoji};}));
        }).catch(function(){});
      } else {
        // No family yet — load personal data
        supabase.from("events").select("*").eq("user_id",userId).then(function(r){
          if(r.error||!r.data) return;
          supabase.from("members").select("*").eq("user_id",userId).then(function(mr){
            var mmap={};
            if(mr.data) mr.data.forEach(function(m){mmap[m.id]=m.color;});
            setEvents(r.data.map(function(e){return{
              id:e.id,title:e.title,memberId:e.member_id,date:e.date,time:e.time,
              endTime:e.end_time,location:e.location,
              color:e.color||(mmap[e.member_id]||"#2d7a52"),
              recurring:e.recurring,
              recurFreq:e.recur_freq,recurEnd:e.recur_end,notes:e.notes,
              cost:e.cost,costType:e.cost_type,packingList:e.packing_list||[],
            };}));
          }).catch(function(){});
        }).catch(function(){});
        supabase.from("members").select("*").eq("user_id",userId).then(function(r){
          if(!r.error&&r.data&&r.data.length>0){
            setMembers(r.data.map(function(m){return{id:m.id,name:m.name,color:m.color,emoji:m.emoji};}));
          }
        }).catch(function(){});
      }
    }).catch(function(){});
  }

  // ── Create family + send invite ───────────────────────────────────────────
  var sendingInviteRef=useRef(false);
  function sendInvite(partnerEmail,onSuccess,onError){
    if(!user||!user.id) return;
    if(sendingInviteRef.current) return;
    sendingInviteRef.current=true;
    var doInvite=function(fid){
      var inviteToken=(typeof crypto!=="undefined"&&crypto.randomUUID)?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36);
      supabase.from("invites").insert({
        family_id:fid,
        invited_by:user.id,
        invited_email:partnerEmail.trim().toLowerCase(),
        token:inviteToken,
        status:"pending",
      }).select().then(function(res){
        if(res.error){
          console.error("Invite insert error:",res.error);
          sendingInviteRef.current=false;
          onError&&onError(res.error.message);
          return;
        }
        if(!res.data||res.data.length===0){
          console.error("No data returned from invite insert");
          sendingInviteRef.current=false;
          onError&&onError("No invite data returned");
          return;
        }
        var invite=res.data[0];
        var link=window.location.origin+"?invite="+(invite.token||inviteToken);
        // Send email via Edge Function
        supabase.functions.invoke("send-invite",{
          body:{
            to:partnerEmail.trim(),
            inviterName:user.name||"Your partner",
            inviteLink:link,
            familyName:user.family||"My Family",
          }
        }).then(function(){});
        sendingInviteRef.current=false;
        onSuccess&&onSuccess(link,invite.token||inviteToken);
      });
    };
    if(familyId){
      doInvite(familyId);
    } else {
      // Create family first
      supabase.from("families").insert({
        name:user.family||"My Family",
        created_by:user.id,
      }).select().then(function(res){
        if(res.error){
          console.error("Family insert error:",res.error);
          sendingInviteRef.current=false;
          onError&&onError(res.error.message);
          return;
        }
        var fid=res.data[0].id;
        setFamilyId(fid);
        // Add current user to family
        supabase.from("family_members").insert({family_id:fid,user_id:user.id,role:"parent"}).then(function(){
          // Migrate existing events to family
          supabase.from("events").update({family_id:fid}).eq("user_id",user.id).then(function(){});
          supabase.from("members").update({family_id:fid}).eq("user_id",user.id).then(function(){});
          doInvite(fid);
        });
      });
    }
  }

  // ── Accept invite ─────────────────────────────────────────────────────────
  function acceptInvite(token){
    if(!user||!user.id||!token) return;
    supabase.from("invites").select("*").eq("token",token).eq("status","pending").then(function(res){
      if(!res.data||res.data.length===0){
        toast({icon:"⚠️",title:"Invite not found or expired",color:"var(--rose)"});
        return;
      }
      var invite=res.data[0];
      var fid=invite.family_id;
      // Join the family
      supabase.from("family_members").upsert({family_id:fid,user_id:user.id,role:"parent"}).then(function(){
        // Mark invite as accepted
        supabase.from("invites").update({status:"accepted"}).eq("id",invite.id).then(function(){});
        // Update profile family_id
        supabase.from("profiles").update({family_id:fid}).eq("id",user.id).then(function(){});
        setFamilyId(fid);
        setPendingInvite(null);
        // Clear URL
        window.history.replaceState({},"",window.location.pathname);
        // Reload shared data
        loadUserData(user.id);
        toast({icon:"🎉",title:"You joined the family calendar!",color:"var(--sage2)"});
      });
    });
  }

  // ── Save event to Supabase ─────────────────────────────────────────────────
  const addEvent=function(ev){
    setEvents(function(p){return[...p,ev];});
    toast({icon:"✓",title:"Event added",body:ev.title,color:"var(--sage2)"});
    if(user&&user.id){
      supabase.from("events").upsert({
        id:ev.id,user_id:user.id,family_id:familyId||null,title:ev.title,member_id:ev.memberId,
        date:ev.date,time:ev.time,end_time:ev.endTime,location:ev.location,
        color:ev.color,recurring:ev.recurring,recur_freq:ev.recurFreq,
        recur_end:ev.recurEnd,notes:ev.notes,cost:ev.cost,
        cost_type:ev.costType,packing_list:ev.packingList||[],
      }).then(function(res){
        if(res.error){
          setEvents(function(p){return p.filter(function(e){return e.id!==ev.id;});});
          toast({icon:"✗",title:"Failed to save event",body:"Please try again.",color:"#c0392b"});
        }
      }).catch(function(){
        setEvents(function(p){return p.filter(function(e){return e.id!==ev.id;});});
        toast({icon:"✗",title:"Failed to save event",body:"Please try again.",color:"#c0392b"});
      });
    }
  };

  // ── Delete event from Supabase ─────────────────────────────────────────────
  const delEvent=function(id){
    var removed=null;
    setEvents(function(p){removed=p.find(function(e){return e.id===id;})||null;return p.filter(function(e){return e.id!==id;});});
    if(user&&user.id){
      supabase.from("events").delete().eq("id",id).then(function(res){
        if(res.error){
          if(removed) setEvents(function(p){return[...p,removed];});
          toast({icon:"✗",title:"Failed to delete event",body:"Please try again.",color:"#c0392b"});
        }
      }).catch(function(){
        if(removed) setEvents(function(p){return[...p,removed];});
        toast({icon:"✗",title:"Failed to delete event",body:"Please try again.",color:"#c0392b"});
      });
    }
  };

  // ── Save member to Supabase ───────────────────────────────────────────────
  const saveMember=function(m){
    if(user&&user.id){
      supabase.from("members").upsert({
        id:m.id,user_id:user.id,family_id:familyId||null,name:m.name,color:m.color,emoji:m.emoji,
      }).then(function(res){
        if(res.error) toast({icon:"✗",title:"Failed to save member",body:"Please try again.",color:"#c0392b"});
      }).catch(function(){
        toast({icon:"✗",title:"Failed to save member",body:"Please try again.",color:"#c0392b"});
      });
    }
  };

  // ── Delete member from Supabase ───────────────────────────────────────────
  const deleteMember=function(id){
    setMembers(function(p){return p.filter(function(m){return m.id!==id;});});
    setEvents(function(p){return p.filter(function(e){return e.memberId!==id;});});
    if(user&&user.id){
      supabase.from("members").delete().eq("id",id).then(function(){});
      supabase.from("events").delete().eq("member_id",id).then(function(){});
    }
  };

  // ── Step 0: Loading session ───────────────────────────────────────────────
  if(authLoading) return (
    <><GS/><div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--ink2)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>🌸</div>
        <div style={{width:24,height:24,border:"2px solid var(--border2)",borderTopColor:"var(--sage2)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto"}}/>
      </div>
    </div></>
  );

  // ── Onboarding (shown after session loads, before auth) ───────────────────
  if(showOnboarding && !user) return (
    <><GS/><OnboardingScreen onDone={function(){
      setShowOnboarding(false);
      localStorage.setItem("calla_onboarding_seen","true");
    }}/></>
  );

  // ── Step 0b: Pending invite — user is logged in, invite in URL ────────────
  if(user&&pendingInvite) return (
    <><GS/><Toasts toasts={toasts}/>
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,background:"var(--ink2)",textAlign:"center"}}>
      <div className="fu">
        <div style={{fontSize:52,marginBottom:16}}>👨‍👩‍👧</div>
        <h2 style={{fontSize:26,fontWeight:700,marginBottom:10,fontFamily:"'Playfair Display',Georgia,serif",color:"var(--cream)",letterSpacing:"-.5px"}}>You've been invited!</h2>
        <p style={{fontSize:15,color:"var(--cream3)",marginBottom:28,lineHeight:1.7}}>Someone shared their Calla family calendar with you. Accept to see all their events and stay in sync.</p>
        <Btn onClick={function(){acceptInvite(pendingInvite);}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
          <Check size={16}/>Accept &amp; Join Family
        </Btn>
        <button onClick={function(){setPendingInvite(null);window.history.replaceState({},"",window.location.pathname);}} style={{background:"none",border:"none",color:"var(--cream3)",fontSize:14,cursor:"pointer"}}>
          Decline for now
        </button>
      </div>
    </div></>
  );
  // ── Step 1: Auth ──────────────────────────────────────────────────────────
  if(!user) return (
    <><GS/><Auth onLogin={function(u){
      setUser(u);
      var done=localStorage.getItem("calla_setup_"+u.id);
      setSetupDone(done==="true");
      if(u.id) loadUserData(u.id);
      setTimeout(function(){toast({icon:"👋",title:"Welcome, "+u.name+"! 60 days free.",color:"var(--sage2)"});},400);
    }}/></>
  );
  // ── Step 2: Co-parent setup ───────────────────────────────────────────────
  if(!setupDone) return (
    <><GS/><Toasts toasts={toasts}/><FirstTimeSetup user={user} onDone={function(fname,newMembers){
      localStorage.setItem("calla_setup_"+user.id,"true");
      setSetupDone(true);
      // Regenerate catch prefix now that we have the family name
      if(fname&&user&&user.id){
        var slug=fname.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,15);
        var pfx=slug.length>=3?slug+user.id.replace(/-/g,"").slice(-3):user.id.replace(/-/g,"").slice(0,10);
        supabase.from("profiles").update({catch_prefix:pfx,family_name:fname}).eq("id",user.id).then(function(){});
        setUser(function(u){return{...u,family:fname,catchPrefix:pfx};});
      } else if(fname){
        setUser(function(u){return{...u,family:fname};});
      }
      if(newMembers&&newMembers.length>0) setMembers(newMembers);
      if(!localStorage.getItem("calla_coparent_onboarding_seen")) setShowCoParentSetup(true);
    }}/></>
  );
  // ── Step 2b: Invite co-parent (shown once after first-time setup) ─────────
  if(showCoParentSetup) return (
    <><GS/><Toasts toasts={toasts}/><CoParentSetup user={user}
      onInvite={function(email,cb){sendInvite(email,function(){cb&&cb(true);},function(){cb&&cb(false);});}}
      onDone={function(){
        localStorage.setItem("calla_coparent_onboarding_seen","true");
        setShowCoParentSetup(false);
      }}
    /></>
  );
  // ── Step 3: Hard paywall — trial expired ──────────────────────────────────
  if(!paid && trial && trial.expired) return (
    <><GS/><Toasts toasts={toasts}/><PaywallScreen trialLeft={0} onPay={()=>{setPaid(true);toast({icon:"🎉",title:"You're a Calla Family member!",color:"var(--sage2)"});}} hard={true}/></>
  );
  // ── Step 4: Soft paywall overlay ──────────────────────────────────────────
  if(showPaywall) return (
    <><GS/><Toasts toasts={toasts}/><PaywallScreen trialLeft={trial?trial.left:0} onPay={()=>{setPaid(true);setShowPaywall(false);toast({icon:"🎉",title:"You're a Calla Family member!",color:"var(--sage2)"});}} onDismiss={()=>setShowPaywall(false)}/></>
  );

  const go=t=>{setTab(t);if(t==="inbox")setInboxBadge(0);setShowSearch(false);setSearchQuery("");};
  const upc=events.filter(e=>e.date>=todayStr&&e.date<=addDays(todayStr,2)).length;

  const topBarEl=(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,background:"rgba(245,240,232,.18)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1px solid rgba(245,240,232,.25)"}}>
          <span style={{fontSize:16}}>🌸</span>
        </div>
        <p style={{fontWeight:700,fontSize:16,fontFamily:"'Playfair Display',Georgia,serif",color:"#f5f0e8",lineHeight:1}}>{user.family}</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {members.slice(0,3).map(function(m){return(
          <div key={m.id} onClick={function(){setSelectedMemberId(function(prev){return prev===m.id?null:m.id;});go("home");}}
            style={{width:30,height:30,borderRadius:"50%",background:"rgba(245,240,232,.2)",border:selectedMemberId===m.id?"2.5px solid #f5f0e8":"1.5px solid rgba(245,240,232,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",overflow:"hidden",flexShrink:0}}>
            {m.photo?<img src={m.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={m.name}/>:m.emoji}
          </div>
        );})}
        <button onClick={function(){setShowSearch(true);setSearchQuery("");}} style={{width:32,height:32,background:"rgba(245,240,232,.15)",border:"1px solid rgba(245,240,232,.25)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Search size={15} color="#f5f0e8"/>
        </button>
        <button onClick={function(){go("notif");}} style={{width:32,height:32,background:"rgba(245,240,232,.15)",border:"1px solid rgba(245,240,232,.25)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
          <Bell size={15} color="#f5f0e8"/>
          {upc>0&&<div style={{position:"absolute",top:-3,right:-3,background:"var(--red)",color:"#f5f0e8",borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,border:"1.5px solid var(--sage)"}}>{upc}</div>}
        </button>
      </div>
    </div>
  );


  const screen=()=>{
    if(tab==="home")    return <DashScreen events={selectedMemberId?events.filter(function(e){return e.memberId===selectedMemberId;}):events} members={members} onAdd={addEvent} onDelete={delEvent} showBanner={showBanner} onBannerDismiss={()=>setShowBanner(false)} initialSel={globalSel} onClearSel={()=>setGlobalSel(null)} onShowAdd={()=>setShowAdd(true)} onShowVoice={()=>setShowVoice(true)} onSelectEv={function(ev){setGlobalSel(ev);setShowGlobalEv(true);}} trialExpired={!paid&&trial&&trial.expired} onUpgrade={function(){setShowPaywall(true);}} selectedMemberId={selectedMemberId} onClearMember={function(){setSelectedMemberId(null);}} topBar={topBarEl} familyName={user&&user.family}/>;
    if(tab==="inbox")   return <InboxScreen members={members} onAdd={addEvent} user={user} familyId={familyId} topBar={topBarEl} aiDisclosureSeen={aiDisclosureSeen} onShowAiDisclosure={()=>setShowAiDisclosure(true)}/>;
    if(tab==="discover") return !paid&&trial&&trial.expired ? (
      <div style={{textAlign:"center",padding:"60px 24px"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔒</div>
        <p style={{fontWeight:700,fontSize:18,color:"var(--cream)",marginBottom:8}}>Trial ended</p>
        <p style={{fontSize:15,color:"var(--cream3)",marginBottom:24}}>Subscribe to keep using Discover.</p>
        <Btn onClick={function(){setShowPaywall(true);}}>View Plans</Btn>
      </div>
    ) : <DiscoverScreen members={members} onAdd={addEvent} user={user} topBar={topBarEl}/>;
    if(tab==="lists")   return <ListsScreen members={members} topBar={topBarEl}/>;
    if(tab==="members") return <MembersScreen members={members} setMembers={setMembers} events={events}/>;
    if(tab==="notif")   return <NotifScreen events={events} members={members} onSelectEvent={ev=>{setGlobalSel(ev);setTab("home");}} topBar={topBarEl}/>;
    if(tab==="more")    return <MoreScreen members={members} setMembers={setMembers} events={events} user={user} setUser={setUser} paid={paid} trialLeft={trial?trial.left:null} onUpgrade={()=>setShowPaywall(true)} notifSettings={notif} setNotifSettings={setNotif} saveMember={saveMember} deleteMember={deleteMember} toast={toast} familyId={familyId} sendInvite={sendInvite} requestPermission={requestNotificationPermission} onSignOut={()=>{
  // Sign out from Supabase auth
  supabase.auth.signOut().catch(function(){});
  // Manually clear Supabase session from WKWebView storage
  // (onAuthStateChange is not reliable in Capacitor)
  try {
    Object.keys(localStorage).forEach(function(k){
      if(k.startsWith("sb-")||k.startsWith("supabase")||k.startsWith("calla_setup")) localStorage.removeItem(k);
    });
  } catch(e){}
  // Reset all app state
  setUser(null);
  setSetupDone(false);
  setTab("home");
  setEvents([]);
  setMembers([]);
  setPaid(false);
  setShowPaywall(false);
  setFamilyId(null);
  setTrialStart(null);
  toast({icon:"👋",title:"Signed out",color:"var(--cream3)"});
}} topBar={topBarEl}/>;
  };

  return (
    <>
      <GS/>
      <Toasts toasts={toasts}/>
      <div style={{minHeight:"100dvh",paddingBottom:"calc(90px + env(safe-area-inset-bottom,0px))",background:"#f0ebe0"}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"0 18px 20px"}}>

          {/* Trial countdown banner */}
          {!paid && trial && trial.left <= 30 && (
            <TrialBanner daysLeft={trial.left} onUpgrade={()=>setShowPaywall(true)}/>
          )}

          {showSearch ? (
            <div>
              <div style={{background:"var(--sage)",margin:"-20px -18px 0",padding:"calc(env(safe-area-inset-top,44px) + 10px) 18px 14px",borderRadius:"0 0 20px 20px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,background:"rgba(245,240,232,.18)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(245,240,232,.25)"}}>
                      <span style={{fontSize:16}}>🌸</span>
                    </div>
                    <p style={{fontWeight:700,fontSize:16,fontFamily:"'Playfair Display',Georgia,serif",color:"#f5f0e8",lineHeight:1}}>{user.family}</p>
                  </div>
                  <button onClick={function(){go("notif");}} style={{width:32,height:32,background:"rgba(245,240,232,.15)",border:"1px solid rgba(245,240,232,.25)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
                    <Bell size={15} color="#f5f0e8"/>
                    {upc>0&&<div style={{position:"absolute",top:-3,right:-3,background:"var(--red)",color:"#f5f0e8",borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,border:"1.5px solid var(--sage)"}}>{upc}</div>}
                  </button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(245,240,232,.15)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(245,240,232,.3)"}}>
                  <button onClick={function(){setShowSearch(false);setSearchQuery("");}} style={{background:"none",border:"none",padding:0,display:"flex",alignItems:"center",flexShrink:0,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                    <ChevronLeft size={20} color="#f5f0e8"/>
                  </button>
                  <Search size={14} color="rgba(245,240,232,.55)" style={{flexShrink:0}}/>
                  <input
                    ref={function(el){if(el&&showSearch){var t=setTimeout(function(){el.focus();},100);return function(){clearTimeout(t);};}}}
                    type="search"
                    placeholder="Search events, people, locations…"
                    value={searchQuery}
                    onChange={function(e){setSearchQuery(e.target.value);}}
                    style={{flex:1,background:"transparent",border:"none",padding:0,fontSize:15,color:"#f5f0e8",outline:"none",fontFamily:"-apple-system,sans-serif",WebkitAppearance:"none",appearance:"none",minWidth:0}}
                  />
                  {searchQuery.length>0&&(
                    <button onClick={function(){setSearchQuery("");}} style={{background:"none",border:"none",padding:0,display:"flex",alignItems:"center",flexShrink:0,cursor:"pointer"}}>
                      <X size={15} color="rgba(245,240,232,.6)"/>
                    </button>
                  )}
                  <button onClick={function(){setShowSearch(false);setSearchQuery("");}} style={{background:"none",border:"none",padding:"0 0 0 4px",color:"rgba(245,240,232,.8)",fontSize:13,fontWeight:600,fontFamily:"-apple-system,sans-serif",flexShrink:0}}>Cancel</button>
                </div>
              </div>
              <div style={{marginTop:14}}>
                {searchQuery.trim().length<3 ? (
                  <div style={{textAlign:"center",padding:"40px 0 20px"}}>
                    <p style={{fontSize:36,marginBottom:10}}>🔍</p>
                    <p style={{fontSize:16,color:"var(--cream3)",fontWeight:600}}>Type to search</p>
                    <p style={{fontSize:13,color:"var(--cream3)",marginTop:6,opacity:.7}}>{searchQuery.trim().length===0?"Events, people, locations":((3-searchQuery.trim().length)+" more letter"+(3-searchQuery.trim().length===1?"":"s")+" to search")}</p>
                  </div>
                ) : (function(){
                  var q=searchQuery.toLowerCase().trim();
                  var res=events.filter(function(ev){
                    return ev.title.toLowerCase().includes(q)||
                      (ev.location&&ev.location.toLowerCase().includes(q))||
                      (ev.notes&&ev.notes.toLowerCase().includes(q))||
                      (function(){var mm=members.find(function(m){return m.id===ev.memberId;});return mm&&mm.name.toLowerCase().includes(q);})();
                  }).sort(function(a,b){return a.date.localeCompare(b.date);});
                  if(res.length===0) return (
                    <div style={{textAlign:"center",padding:"40px 0 20px"}}>
                      <p style={{fontSize:15,color:"var(--cream3)",fontWeight:600}}>No results for "{searchQuery}"</p>
                      <p style={{fontSize:13,color:"var(--cream3)",marginTop:6,opacity:.7}}>Try a different name or location</p>
                    </div>
                  );
                  return (
                    <div>
                      <p style={{fontSize:11,fontWeight:700,color:"var(--cream3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{res.length} result{res.length===1?"":"s"}</p>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {res.map(function(ev){
                        var m=members.find(function(mm){return mm.id===ev.memberId;})||{emoji:"👤",color:"var(--cream3)",name:"?"};
                        var isToday=ev.date===todayStr;
                        var isPast=ev.date<todayStr;
                        return (
                          <div key={ev.id} onClick={function(){setGlobalSel(ev);setShowGlobalEv(true);setShowSearch(false);setSearchQuery("");}}
                            style={{background:"#fff",border:"1px solid rgba(26,46,26,.07)",borderLeft:"4px solid "+ev.color,borderRadius:12,padding:"11px 13px",cursor:"pointer",opacity:isPast?.65:1}}
                          >
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{width:32,height:32,borderRadius:9,background:ev.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{m.emoji}</div>
                              <div style={{flex:1,minWidth:0}}>
                                <p style={{fontWeight:700,fontSize:14,color:"var(--cream)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Playfair Display',Georgia,serif",marginBottom:2}}>{ev.title}</p>
                                <p style={{fontSize:12,color:m.color,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}{ev.location?" · "+ev.location:""}</p>
                              </div>
                              <div style={{textAlign:"right",flexShrink:0,marginLeft:4}}>
                                <p style={{fontSize:11,fontWeight:600,color:isToday?"var(--sage2)":"var(--cream3)",background:isToday?"rgba(45,90,61,.1)":"var(--ink4)",borderRadius:99,padding:"2px 8px",whiteSpace:"nowrap"}}>{isToday?"Today":ev.date}</p>
                                {ev.time&&<p style={{fontSize:11,color:"var(--cream3)",marginTop:2}}>{ev.time}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : screen()}

        </div>
      </div>
      <Nav active={tab} setActive={go} inboxBadge={inboxBadge} notifBadge={upc&&notif.enabled?upc:0}/>
      {showGlobalEv&&globalSel&&<EventSheet ev={globalSel} members={members} onClose={function(){setShowGlobalEv(false);setGlobalSel(null);}} onDelete={function(id){delEvent(id);setShowGlobalEv(false);setGlobalSel(null);}} user={user}/> }
      {showAdd&&<AddSheet members={members} events={events} onAdd={function(ev){addEvent(ev);setShowAdd(false);}} onClose={function(){setShowAdd(false);}}/> }
      {showVoice&&<VoiceSheet members={members} onAdd={function(ev){addEvent(ev);}} onClose={function(){setShowVoice(false);}}/> }
      {showAiDisclosure&&<AiDisclosureModal onDone={function(){localStorage.setItem("calla_ai_disclosure_seen","true");setShowAiDisclosure(false);}}/>}
    </>
  );
}
