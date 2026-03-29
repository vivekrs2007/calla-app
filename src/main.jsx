import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── Platform Detection ───────────────────────────────────────────────────────
var isNative   = false;
var isIOS      = false;
var isAndroid  = false;

if (
  typeof window !== "undefined" &&
  window.Capacitor &&
  window.Capacitor.isNativePlatform &&
  window.Capacitor.isNativePlatform()
) {
  isNative  = true;
  isIOS     = window.Capacitor.getPlatform() === "ios";
  isAndroid = window.Capacitor.getPlatform() === "android";
}

// Add platform classes to <body> so CSS can target them
if (isIOS)     document.body.classList.add("ios-platform");
if (isAndroid) document.body.classList.add("android-platform");
if (isNative)  document.body.classList.add("native-platform");

// ─── StatusBar (iOS only) ─────────────────────────────────────────────────────
// Requires: npm install @capacitor/status-bar && npx cap sync ios
function initStatusBar() {
  if (!isIOS) return;
  Promise.resolve().then(function() {
    return import("@capacitor/status-bar");
  }).then(function(module) {
    var StatusBar = module.StatusBar;
    var Style     = module.Style;
    StatusBar.setOverlaysWebView({ overlay: true }).then(function() {
      return StatusBar.setStyle({ style: Style.Default });
    }).then(function() {
      return StatusBar.setBackgroundColor({ color: "#00000000" });
    }).catch(function(err) {
      console.warn("[Calla] StatusBar init failed:", err);
    });
  }).catch(function(err) {
    console.warn("[Calla] StatusBar plugin not available:", err);
  });
}

// ─── Keyboard (native only) ───────────────────────────────────────────────────
// Requires: npm install @capacitor/keyboard && npx cap sync ios
function initKeyboard() {
  if (!isNative) return;
  Promise.resolve().then(function() {
    return import("@capacitor/keyboard");
  }).then(function(module) {
    var Keyboard = module.Keyboard;
    Keyboard.addListener("keyboardWillShow", function() {
      setTimeout(function() {
        var activeEl = document.activeElement;
        if (activeEl && typeof activeEl.scrollIntoView === "function") {
          activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    });
  }).catch(function(err) {
    console.warn("[Calla] Keyboard plugin not available:", err);
  });
}

// ─── Android Back Button ──────────────────────────────────────────────────────
function initAppEvents() {
  if (!isAndroid) return;
  Promise.resolve().then(function() {
    return import("@capacitor/app");
  }).then(function(module) {
    var CapApp = module.App;
    CapApp.addListener("backButton", function(data) {
      if (data.canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  }).catch(function(err) {
    console.warn("[Calla] App plugin not available:", err);
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
function boot() {
  initStatusBar();
  initKeyboard();
  initAppEvents();
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (isNative) {
  document.addEventListener("deviceready", boot);
  // Fallback if deviceready already fired
  setTimeout(function() {
    var root = document.getElementById("root");
    if (root && !root.hasChildNodes()) boot();
  }, 1000);
} else {
  boot();
}
