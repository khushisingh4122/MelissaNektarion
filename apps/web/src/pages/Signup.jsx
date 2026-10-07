import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiServerClient } from "../lib/apiServerClient.js";
import loginImage from "../../login.png";

// ── Inline SVG icons ─────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LeafIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 22c0 0 4-2 10-8s6-12 6-12-6 2-12 8S2 22 2 22z" />
    <path d="M2 22l10-10" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    className="animate-spin w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6-8 10-8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

// ── Reusable field component ─────────────────────────────────────────────────

function Field({ label, error, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#718446] uppercase tracking-widest mb-1.5">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon />}
          {label}
        </span>
      </label>

      {children}

      {error && (
        <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Password strength meter ──────────────────────────────────────────────────

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const textColors = [
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-blue-400",
    "text-green-400",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-white/[0.07]"
            }`}
          />
        ))}
      </div>

      <p
        className={`text-[10px] font-medium ${
          textColors[score - 1] || "text-gray-600"
        }`}
      >
        {score > 0 ? labels[score - 1] : ""}
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};

    if (!name.trim()) {
      e.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = "Enter a valid email address.";
    }

    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }

    if (!confirm) {
      e.confirm = "Please confirm your password.";
    } else if (confirm !== password) {
      e.confirm = "Passwords do not match.";
    }

    return e;
  };

  const clearError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await apiServerClient.fetch(
        "/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = "Unable to create account.";

        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((error) => error.msg)
            .filter(Boolean)
            .join(", ");
        }

        setErrors({
          general: message,
        });

        return;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Signup error:", error);

      setErrors({
        general:
          "Cannot connect to the server. Please make sure the backend is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Input class helper ─────────────────────────────────────────────────────

  const inputCls = (field) => `
    w-full px-4 py-[11px] rounded-xl text-sm text-[#183d2d]
    placeholder-slate-400 bg-white/70
    border transition-all duration-200 outline-none
    focus:ring-2 focus:ring-green-500/30
    ${
      errors[field]
        ? "border-red-500/50 focus:border-red-400"
        : "border-[#cbd8c5] focus:border-green-500/50 hover:border-[#9bb697]"
    }
  `;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#dfe8d7] px-3 py-3 sm:px-6 lg:px-10"
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,223,157,0.12),transparent_35%)]" />

      <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1400px] overflow-hidden rounded-[34px] bg-[#f4f7f1] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <section
          className="relative hidden w-[46%] flex-col justify-between overflow-hidden p-8 text-white md:flex lg:p-12"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(12,48,30,0.08), rgba(8,38,23,0.72)), url('${loginImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8df9d] text-[#183d2d]"><LeafIcon /></div>
            <div>
              <p className="text-lg font-bold">Mellisanectorian</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/70">Smart agriculture</p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#c8df9d]">Start growing</p>
            <h2 className="max-w-sm text-4xl font-bold leading-[1.05] tracking-[-0.04em] lg:text-5xl">Build a better tomorrow.</h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">Bring intelligent crop care and field insight closer to every growing season.</p>
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/20 pt-5 text-[10px] text-white/75">
              <span>Smart farming</span><span>Crop health</span><span>Better yield</span>
            </div>
          </div>
        </section>

      {/* Card */}
      <div
        className="relative w-full max-w-[440px] overflow-hidden bg-[#f8f7f1] md:w-[54%]"
      >
        {/* Top accent bar */}
        <div className="h-[2px] w-full bg-[#1f5d3d]" />

        <div className="px-8 pt-9 pb-10">
          {/* Branding */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="
                w-[52px] h-[52px] rounded-[14px] mb-4 flex items-center justify-center
                bg-[#1f5d3d]
              "
            >
              <span className="text-[#071a07]">
                <LeafIcon />
              </span>
            </div>

            <h1
              className="text-[1.65rem] font-bold tracking-tight"
              style={{
                color: "#183d2d",
              }}
            >
              Mellisanectorian
            </h1>

            <p className="mt-1 text-[13px] text-[#718446] tracking-[0.04em]">
              Smart farming. Smarter decisions.
            </p>

            <div className="mt-4">
              <p className="text-[15px] font-semibold text-[#183d2d]">
                Create your account
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Join the smart farming revolution
              </p>
            </div>
          </div>

          {/* Success banner */}
          {success && (
            <div
              className="
                mb-5 px-4 py-3 rounded-xl text-sm text-center font-medium
                bg-green-500/10 border border-green-500/25 text-green-400
                flex items-center justify-center gap-2
              "
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>

              Account created! Redirecting to login…
            </div>
          )}

          {/* General/backend error */}
          {errors.general && (
            <div
              className="
                mb-5 px-4 py-3 rounded-xl text-sm text-center
                text-red-400 bg-red-500/10 border border-red-500/20
              "
            >
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <Field label="Full Name" error={errors.name} icon={UserIcon}>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                placeholder="Jane Doe"
                autoComplete="name"
                className={inputCls("name")}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email} icon={MailIcon}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputCls("email")}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password} icon={LockIcon}>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={inputCls("password") + " pr-11"}
                />

                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1f5d3d] transition-colors"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <PasswordStrength password={password} />
            </Field>

            {/* Confirm Password */}
            <Field
              label="Confirm Password"
              error={errors.confirm}
              icon={CheckShieldIcon}
            >
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    clearError("confirm");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={inputCls("confirm") + " pr-11"}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1f5d3d] transition-colors"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Match indicator */}
              {confirm && !errors.confirm && confirm === password && (
                <p className="mt-1 text-[11px] text-green-400 flex items-center gap-1">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Passwords match
                </p>
              )}
            </Field>

            {/* Terms notice */}
            <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
              By creating an account you agree to our{" "}
              <span className="text-green-500 cursor-pointer hover:text-green-400 transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-green-500 cursor-pointer hover:text-green-400 transition-colors">
                Privacy Policy
              </span>
              .
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="
                w-full mt-1 py-[11px] rounded-xl text-[14px] font-semibold
                text-[#071a07] tracking-wide
                bg-[#1f5d3d] hover:bg-[#184a31]
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-[0_6px_18px_rgba(31,93,61,0.18)]
                focus:outline-none focus:ring-2 focus:ring-green-500/50
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon />
                  Creating account…
                </span>
              ) : success ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Account Created!
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-slate-400 tracking-wide">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Google button */}
          <button
            type="button"
            className="
              w-full flex items-center justify-center gap-2.5
              py-[10px] rounded-xl text-[13px] text-slate-600
              border border-[#cbd8c5] bg-white/55
              hover:bg-white/85 hover:border-[#9bb697]
              transition-all duration-200
            "
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          {/* Sign in link */}
          <p className="text-center text-[13px] text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-500 hover:text-green-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 text-[11px] text-gray-700 text-center w-full select-none">
        © {new Date().getFullYear()} Melissaa Nektorian · Smart Agriculture AI
      </p>
      </div>
    </div>
  );
}