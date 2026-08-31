import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Bot,
  Plane,
  Leaf,
  Bug,
  TrendingUp,
  FileText,
  Bell,
  User,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  Mic,
  MicOff,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. TRANSLATIONS  (EN ↔ HI — no external library)
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  EN: {
    appName: "Smart Agriculture AI",
    appSub: "Dashboard",
    voiceCommands: "Voice Commands",
    menuItems: {
      "/":                 "Dashboard Overview",
      "/farm-map":         "Farm Map",
      "/ai-chatbot":       "AI Chatbot",
      "/drone-monitoring": "Drone Monitoring",
      "/crop-health":      "Crop Health Analysis",
      "/pollination":      "Pollination Monitoring",
      "/yield-prediction": "Yield Prediction",
      "/schemes":          "Government Schemes",
      "/alerts":           "Alerts & Notifications",
    },
    myProfile:     "My Profile",
    farmerSupport: "Farmer Support",
    settings:      "Settings",
    logout:        "Logout",
    notifications: "Notifications",
    noNotif:       "No new notifications",
    notifItems: [
      "🌧️ Rain expected tomorrow in your region.",
      "🌿 Crop health dropped to 72% — check Field B.",
      "🚁 Drone battery low — please recharge.",
    ],
    voiceNotSupported: "Voice recognition is not supported in your browser.",
    voiceResult:       "You said",
  },
  HI: {
    appName: "स्मार्ट कृषि AI",
    appSub: "डैशबोर्ड",
    voiceCommands: "वॉयस कमांड",
    menuItems: {
      "/":                 "डैशबोर्ड अवलोकन",
      "/farm-map":         "फार्म मैप",
      "/ai-chatbot":       "AI चैटबॉट",
      "/drone-monitoring": "ड्रोन निगरानी",
      "/crop-health":      "फसल स्वास्थ्य विश्लेषण",
      "/pollination":      "परागण निगरानी",
      "/yield-prediction": "उपज पूर्वानुमान",
      "/schemes":          "सरकारी योजनाएं",
      "/alerts":           "अलर्ट और सूचनाएं",
    },
    myProfile:     "मेरी प्रोफ़ाइल",
    farmerSupport: "किसान सहायता",
    settings:      "सेटिंग्स",
    logout:        "लॉग आउट",
    notifications: "सूचनाएं",
    noNotif:       "कोई नई सूचना नहीं",
    notifItems: [
      "🌧️ कल आपके क्षेत्र में बारिश की संभावना है।",
      "🌿 फसल स्वास्थ्य 72% तक गिरी — फील्ड B जांचें।",
      "🚁 ड्रोन बैटरी कम है — कृपया चार्ज करें।",
    ],
    voiceNotSupported: "आपका ब्राउज़र वॉयस पहचान का समर्थन नहीं करता।",
    voiceResult:       "आपने कहा",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MENU CONFIG  (paths stay the same — labels come from translation)
// ─────────────────────────────────────────────────────────────────────────────
const MENU = [
  { path: "/",                 icon: LayoutDashboard },
  { path: "/farm-map",         icon: Map             },
  { path: "/ai-chatbot",       icon: Bot             },
  { path: "/drone-monitoring", icon: Plane           },
  { path: "/crop-health",      icon: Leaf            },
  { path: "/pollination",      icon: Bug             },
  { path: "/yield-prediction", icon: TrendingUp      },
  { path: "/schemes",          icon: FileText        },
  { path: "/alerts",           icon: Bell            },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DashboardLayout = ({ children }) => {
  const location = useLocation();

  // 1. Language
  const [lang, setLang] = useState("EN");
  const t = TRANSLATIONS[lang];

  // 2. Dark mode — persisted in localStorage, applied via class on <html>
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agri-dark") === "true";
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("agri-dark", dark);
  }, [dark]);

  // 3. Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // 4. Notifications dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // 5. Voice recognition
  const [listening, setListening] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Voice handler ──────────────────────────────────────────────────────────
  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert(t.voiceNotSupported);
      return;
    }
    if (listening) return; // prevent double-start

    const recognition = new SR();
    recognition.lang = lang === "HI" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);

    recognition.onresult = (e) => {
      const said = e.results[0][0].transcript;
      alert(`${t.voiceResult}: "${said}"`);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col justify-between">

        <div>
          {/* Logo */}
          <div className="p-5 border-b dark:border-gray-700">
            <h1 className="font-bold text-lg dark:text-white">🌱 {t.appName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.appSub}</p>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2">
            {MENU.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              const label = t.menuItems[item.path] || item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                    ${active
                      ? "bg-green-500 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Links */}
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
          >
            <User size={18} /> {t.myProfile}
          </Link>
          <Link
            to="/farmer-support"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
          >
            <HelpCircle size={18} /> {t.farmerSupport}
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
          >
            <Settings size={18} /> {t.settings}
          </Link>
        </div>

      </div>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 relative z-10">

          {/* Voice Commands */}
          <button
            onClick={handleVoice}
            className={`flex items-center gap-2 border dark:border-gray-600 px-3 py-1 rounded-lg text-sm transition
              ${listening
                ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 border-red-300"
                : "dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            title={listening ? "Listening…" : t.voiceCommands}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            {t.voiceCommands}
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-4">

            {/* Language toggle */}
            <button
              onClick={() => setLang((l) => (l === "EN" ? "HI" : "EN"))}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition cursor-pointer select-none"
              title="Switch language"
            >
              <Globe size={18} />
              {lang}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="text-gray-600 dark:text-yellow-300 hover:text-green-600 dark:hover:text-yellow-400 transition cursor-pointer"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* ── Notifications Bell ─────────────────────────────────── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition cursor-pointer"
                title={t.notifications}
              >
                <Bell size={18} />
                {/* Unread dot */}
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-72 p-3 z-50 border dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {t.notifications}
                  </p>
                  {t.notifItems.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 px-1">{t.noNotif}</p>
                  ) : (
                    <ul className="space-y-2">
                      {t.notifItems.map((n, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 leading-snug"
                        >
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* ── Profile Icon + Dropdown ────────────────────────────── */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
                title={t.myProfile}
              >
                <User size={20} />
              </div>

              {profileOpen && (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-48 p-2 z-50 border dark:border-gray-700">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {t.myProfile}
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {t.settings}
                  </Link>
                  <Link
                    to="/farmer-support"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {t.farmerSupport}
                  </Link>
                  <hr className="my-2 dark:border-gray-600" />
                  <button
                    className="text-red-500 w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => setProfileOpen(false)}
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 dark:bg-gray-900 dark:text-white">
          {children}
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;