import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// ── Inline SVG icons (zero extra deps) ───────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22c0 0 4-2 10-8s6-12 6-12-6 2-12 8S2 22 2 22z"/>
    <path d="M2 22l10-10"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// ── Component ────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!email.trim())                    e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Enter a valid email address.";
    if (!password)                        e.password = "Password is required.";
    else if (password.length < 6)         e.password = "Password must be at least 6 characters.";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      // Read users registered via Signup.jsx
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("agri_users") || "[]");
        if (!Array.isArray(users)) users = [];
      } catch { users = []; }

      // Match email (case-insensitive) + password
      const match = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase().trim() &&
          u.password === password
      );

      setLoading(false);

      if (!match) {
        setErrors({ general: "Invalid email or password." });
        return;
      }

      // Save session — compatible with DashboardLayout's "agri_user" key
      const sessionUser = { name: match.name, email: match.email, loggedIn: true };
      remember
        ? localStorage.setItem("agri_user", JSON.stringify(sessionUser))
        : sessionStorage.setItem("agri_user", JSON.stringify(sessionUser));

        window.location.href = "/";
    }, 950);
  };

  const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: "" }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="
      min-h-screen flex items-center justify-center px-4 py-12
      bg-[#0c1510] dark:bg-[#0c1510] relative overflow-hidden
    ">

      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="
        relative w-full max-w-[420px] rounded-2xl overflow-hidden
        border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.6)]
      " style={{ background: "linear-gradient(160deg,#141f14,#0f180f)" }}>

        {/* Top accent bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-green-500 to-transparent" />

        <div className="px-8 pt-9 pb-10">

          {/* ── Branding ───────────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Logo mark */}
            <div className="
              w-[52px] h-[52px] rounded-[14px] mb-4 flex items-center justify-center
              bg-gradient-to-br from-green-500 to-emerald-600
              shadow-[0_8px_24px_rgba(34,197,94,0.35)]
            ">
              <span className="text-[#071a07]"><LeafIcon /></span>
            </div>

            {/* Premium name */}
            <h1
              className="text-[1.65rem] font-bold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #86efac 0%, #d1fae5 45%, #6ee7b7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Melissaa Nektorian
            </h1>

            <p className="mt-1 text-[13px] text-gray-500 tracking-[0.04em]">
              Smart Agriculture AI Dashboard
            </p>

            <div className="mt-5">
              <p className="text-[15px] font-semibold text-white">Welcome back</p>
              <p className="text-xs text-gray-500 mt-0.5">Sign in to continue to your dashboard</p>
            </div>
          </div>

          {/* ── General error (login failure) ──────────────────────────── */}
          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-xl text-[13px] text-center text-red-400 bg-red-500/10 border border-red-500/20">
              {errors.general}
            </div>
          )}

          {/* ── Form ───────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email field */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); clearError("general"); }}
                placeholder="you@example.com"
                autoComplete="email"
                className={`
                  w-full px-4 py-[11px] rounded-xl text-sm text-white
                  placeholder-gray-600 bg-white/[0.04]
                  border transition-all duration-200 outline-none
                  focus:ring-2 focus:ring-green-500/30
                  ${errors.email
                    ? "border-red-500/50 focus:border-red-400"
                    : "border-white/[0.07] focus:border-green-500/50 hover:border-white/[0.12]"
                  }
                `}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[12px] text-green-500 hover:text-green-400 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); clearError("general"); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`
                    w-full px-4 py-[11px] pr-11 rounded-xl text-sm text-white
                    placeholder-gray-600 bg-white/[0.04]
                    border transition-all duration-200 outline-none
                    focus:ring-2 focus:ring-green-500/30
                    ${errors.password
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/[0.07] focus:border-green-500/50 hover:border-white/[0.12]"
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="
                    absolute right-3.5 top-1/2 -translate-y-1/2
                    text-gray-600 hover:text-gray-300 transition-colors
                  "
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div
                role="checkbox"
                aria-checked={remember}
                tabIndex={0}
                onClick={() => setRemember((v) => !v)}
                onKeyDown={(e) => e.key === " " && setRemember((v) => !v)}
                className={`
                  w-[17px] h-[17px] rounded-[5px] border cursor-pointer
                  flex items-center justify-center shrink-0
                  transition-all duration-150 outline-none
                  focus:ring-2 focus:ring-green-500/40
                  ${remember
                    ? "bg-green-500 border-green-500"
                    : "bg-white/[0.04] border-white/[0.10] hover:border-green-500/40"
                  }
                `}
              >
                {remember && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.3 6L8 1" stroke="#071a07"
                          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                className="text-[13px] text-gray-400 cursor-pointer select-none"
                onClick={() => setRemember((v) => !v)}
              >
                Remember me
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full mt-1 py-[11px] rounded-xl text-[14px] font-semibold
                text-[#071a07] tracking-wide
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-400 hover:to-emerald-400
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-[0_4px_20px_rgba(34,197,94,0.3)]
                hover:shadow-[0_4px_28px_rgba(34,197,94,0.45)]
                focus:outline-none focus:ring-2 focus:ring-green-500/50
              "
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><SpinnerIcon /> Signing in…</span>
                : "Sign In"
              }
            </button>
          </form>

          {/* ── Divider ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-gray-600 tracking-wide">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* ── Google button (UI only) ─────────────────────────────────── */}
          <button
            type="button"
            className="
              w-full flex items-center justify-center gap-2.5
              py-[10px] rounded-xl text-[13px] text-gray-300
              border border-white/[0.07] bg-white/[0.03]
              hover:bg-white/[0.07] hover:border-white/[0.13]
              transition-all duration-200
            "
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          {/* ── Sign up link ─────────────────────────────────────────────── */}
          <p className="text-center text-[13px] text-gray-500 mt-7">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-500 hover:text-green-400 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 text-[11px] text-gray-700 text-center w-full select-none">
        © {new Date().getFullYear()} Melissaa Nektorian · Smart Agriculture AI
      </p>
    </div>
  );
}