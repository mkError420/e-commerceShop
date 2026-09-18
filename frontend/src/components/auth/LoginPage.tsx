import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import fashionBg from "../../assets/images/fashion_login_bg.jpg";
import {
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  LogOut,
  X,
  Smartphone,
  Mail,
  UserPlus,
  ChevronRight,
  Settings,
  Sparkles,
} from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

interface Props {
  initialMode?: "login" | "register";
}

export const LoginPage: React.FC<Props> = ({ initialMode = "login" }) => {
  const {
    login,
    loginWithGoogle,
    registerCustomer,
    navigate,
    navigation,
    t,
    isAdminAuthenticated,
    currentUser,
    logoutAdmin,
    logoutCustomer,
    addToast,
  } = useStore();

  // Read mode from query param if available
  const queryParams = new URLSearchParams(navigation.path.split("?")[1] || "");
  const modeParam = queryParams.get("mode");

  const [authMode, setAuthMode] = useState<"login" | "register">(
    modeParam === "register" ? "register" : initialMode
  );

  // Unified Sign In Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Customer Register Form State
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Google Sign In Modal & Loading State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  // Feedback & Loading States
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Google GIS Button Ref
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState(false);

  // Reset errors on mode change
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [authMode]);

  // Decode JWT helper for Google Identity Services Credential response
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.warn("JWT parse error:", e);
      return null;
    }
  };

  // Callback executed when real Google GIS popup/One-Tap returns an ID token
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      const payload = parseJwt(response.credential);
      const email = payload?.email;
      const name = payload?.name || email?.split("@")[0] || "Google User";
      const picture = payload?.picture;
      const id = payload?.sub;

      if (!email) {
        setErrorMessage("Could not retrieve email from your Google account.");
        return;
      }

      const res = await loginWithGoogle({
        name,
        email,
        picture,
        id,
        credential: response.credential,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setShowGoogleModal(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Google authentication failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Check if a real Google Client ID is configured
  const realClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasRealClientId =
    !!realClientId &&
    realClientId !== "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com" &&
    realClientId.endsWith(".apps.googleusercontent.com");

  // Initialize Google Identity Services (GIS) — only when real Client ID exists
  useEffect(() => {
    if (!hasRealClientId) return; // skip GIS init in demo/offline mode

    const initGis = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: realClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true, // use FedCM if available (Chrome)
          });
          setGisLoaded(true);

          // Render the official Google button inside our hidden ref container
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: "outline",
              size: "large",
              width: 320,
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
            });
          }
        } catch (e) {
          console.warn("Google GIS initialization note:", e);
        }
      }
    };

    const google = (window as any).google;
    if (google?.accounts?.id) {
      initGis();
    } else {
      const timer = setInterval(() => {
        const g = (window as any).google;
        if (g?.accounts?.id) {
          clearInterval(timer);
          initGis();
        }
      }, 400);
      return () => clearInterval(timer);
    }
  }, [authMode, hasRealClientId]);

  // Handle Sign In (both Admin & Customer)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setErrorMessage(
        t(
          "Please enter your username, email or mobile number",
          "অনুগ্রহ করে আপনার ব্যবহারকারীর নাম, ইমেইল অথবা মোবাইল নম্বর লিখুন"
        )
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        t("Please enter your password", "অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন")
      );
      return;
    }

    setIsLoading(true);
    const res = await login(identifier, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // Handle Customer Registration
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!regName.trim() || !regPhone.trim()) {
      setErrorMessage(
        t("Full name and mobile number are required", "পূর্ণ নাম এবং মোবাইল নম্বর আবশ্যক")
      );
      return;
    }

    const cleanPhone = regPhone.trim();
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      setErrorMessage(
        t(
          "Please provide a valid 11-digit Bangladeshi mobile number (e.g. 01711223344)",
          "১১ ডিজিটের সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: ০১৭১১২২৩৩৪৪)"
        )
      );
      return;
    }

    if (regPassword && regPassword.length < 6) {
      setErrorMessage(
        t("Password must be at least 6 characters", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      );
      return;
    }

    if (regPassword && regPassword !== regConfirmPassword) {
      setErrorMessage(t("Passwords do not match", "পাসওয়ার্ড দুটি মিলছে না"));
      return;
    }

    setIsLoading(true);
    const res = await registerCustomer(regName, regPhone, regEmail, regPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // Quick fill Shop Admin Credentials for instant testing
  const autofillAdmin = () => {
    setAuthMode("login");
    setIdentifier("mk.rabbani.cse@gmail.com");
    setPassword("sup123456123");
    setErrorMessage("");
    if (addToast) {
      addToast("Admin credentials loaded into form", "info");
    }
  };

  // Trigger Google Login
  const handleGoogleSignInClick = () => {
    if (hasRealClientId) {
      // ── REAL MODE: trigger the actual Google One-Tap / popup via GIS ──
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          // prompt() shows One-Tap or falls back to the popup
          google.accounts.id.prompt((notification: any) => {
            // If One-Tap is suppressed (e.g. user dismissed it before),
            // click the hidden native Google button as a fallback popup
            if (
              notification.isNotDisplayed() ||
              notification.isSkippedMoment()
            ) {
              const btn = googleBtnContainerRef.current?.querySelector(
                "[role='button'], iframe"
              ) as HTMLElement | null;
              if (btn) btn.click();
              else {
                // Last resort: open demo modal so user isn't stuck
                setShowGoogleModal(true);
              }
            }
          });
        } catch (_) {
          setShowGoogleModal(true);
        }
      } else {
        // GIS not yet loaded — wait a moment and retry
        setTimeout(() => handleGoogleSignInClick(), 800);
      }
    } else {
      // ── DEMO / OFFLINE MODE: open the account chooser modal ──
      setShowGoogleModal(true);
    }
  };

  // User selects an account or demo Google profile
  const handleSelectGoogleAccount = async (account: {
    name: string;
    email: string;
    picture?: string;
  }) => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      const res = await loginWithGoogle(account);
      setShowGoogleModal(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const name = customGoogleName.trim() || customGoogleEmail.split("@")[0];
    await handleSelectGoogleAccount({
      name,
      email: customGoogleEmail.trim(),
    });
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between bg-cover bg-center bg-no-repeat selection:bg-[#ff4c4c] selection:text-white"
      style={{
        backgroundImage: `url(${fashionBg})`,
        backgroundColor: "#111111",
      }}
    >
      {/* Dark Translucent Vignette / Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75 backdrop-blur-[1px] pointer-events-none" />

      {/* Top Floating Navigation Header */}
      <header className="relative z-20 px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{t("Back to Store", "স্টোরে ফিরে যান")}</span>
        </button>

        {/* Quick Demo Helper Button */}
        <button
          type="button"
          onClick={autofillAdmin}
          className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white bg-black/50 hover:bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md transition-all shadow-sm cursor-pointer"
          title="Autofill Admin Credentials"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
          <span>Admin Demo</span>
        </button>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Top Header: FASHION LOGIN FORM */}
        <h1 className="text-2xl sm:text-3xl md:text-[34px] font-normal tracking-[0.22em] text-white text-center uppercase mb-7 drop-shadow-lg font-sans">
          FASHION LOGIN FORM
        </h1>

        {/* Existing Active Session Alert (if already logged in) */}
        {isAdminAuthenticated && (
          <div className="w-full max-w-[420px] mb-4 bg-black/75 border border-yellow-500/40 rounded-xs p-3.5 text-center text-white backdrop-blur-md animate-in fade-in">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Signed In as Shop Admin</span>
            </div>
            <p className="text-[11px] text-gray-300 mb-2.5">
              You have administrative privileges active.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin")}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1.5 px-3 rounded-[2px] text-xs transition-colors cursor-pointer"
              >
                Go to Admin Dashboard
              </button>
              <button
                onClick={logoutAdmin}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium py-1.5 px-3 rounded-[2px] text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {currentUser && !isAdminAuthenticated && (
          <div className="w-full max-w-[420px] mb-4 bg-black/75 border border-emerald-500/40 rounded-xs p-3.5 text-center text-white backdrop-blur-md animate-in fade-in">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
              <User className="w-4 h-4" />
              <span>Signed In as {currentUser.name}</span>
            </div>
            <p className="text-[11px] text-gray-300 mb-2.5">
              Customer account active ({currentUser.phone || currentUser.email})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/customer")}
                className="flex-1 bg-white hover:bg-gray-100 text-black font-semibold py-1.5 px-3 rounded-[2px] text-xs transition-colors cursor-pointer"
              >
                Customer Dashboard
              </button>
              <button
                onClick={logoutCustomer}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium py-1.5 px-3 rounded-[2px] text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="w-full max-w-[420px] mb-4 p-3 bg-red-950/80 border border-red-500/60 rounded-[2px] flex items-start gap-2.5 text-red-200 text-xs backdrop-blur-md animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="w-full max-w-[420px] mb-4 p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-[2px] flex items-start gap-2.5 text-emerald-200 text-xs backdrop-blur-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* Centered Login Card                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-[420px] bg-[#1e1e1e]/90 sm:bg-[#1a1a1a]/92 backdrop-blur-md border border-white/10 p-7 sm:p-9 shadow-2xl rounded-[2px]">
          {authMode === "login" ? (
            /* ────────────────────── LOGIN FORM ────────────────────── */
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-[22px] font-normal text-white tracking-wide">
                  {t("Login to your site", "লগ ইন করুন")}
                </h2>
                <div className="text-white">
                  {/* Solid Filled White Padlock Icon */}
                  <svg
                    className="w-5 h-5 fill-white text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Username Input */}
                <div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Coral Red Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ff4c4c] hover:bg-[#f23d3d] active:bg-[#db2f2f] text-white font-normal py-3 rounded-[2px] text-sm tracking-wide transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? t("Logging in...", "লগ ইন হচ্ছে...") : t("Login", "লগ ইন")}
                </button>
              </form>

              {/* Forgot password */}
              <div className="text-center mt-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Social Login Divider */}
              <div className="text-center my-5">
                <span className="text-gray-300/80 text-xs sm:text-sm tracking-wider">
                  or login with
                </span>
              </div>

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* GOOGLE AUTHENTICATION BUTTON (Full Function)                     */}
              {/* ════════════════════════════════════════════════════════════════ */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 rounded-[2px] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md disabled:opacity-70 group"
                >
                  {/* Official Google 4-color SVG Icon */}
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="font-medium">
                    {isGoogleLoading ? "Connecting to Google..." : "Login with Google Account"}
                  </span>
                </button>

                {/* Hidden container for Google GIS native button iframe if loaded */}
                <div ref={googleBtnContainerRef} className="hidden" />
              </div>

              {/* Switch to Registration */}
              <div className="text-center pt-5 mt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  {t("Don't have an account?", "নতুন গ্রাহক?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="text-white hover:text-[#ff4c4c] underline transition-colors cursor-pointer"
                  >
                    {t("Register here", "রেজিস্ট্রেশন করুন")}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ────────────────── REGISTRATION FORM ────────────────── */
            <div>
              {/* Registration Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-[22px] font-normal text-white tracking-wide">
                  {t("Create Account", "অ্যাকাউন্ট তৈরি করুন")}
                </h2>
                <UserPlus className="w-5 h-5 text-white" />
              </div>

              <form onSubmit={handleCustomerRegister} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Mobile Number (e.g. 01711223344)"
                    maxLength={11}
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition font-mono"
                    required
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address (Optional)"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password (Min 6)"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-3.5 py-2.5 rounded-[2px] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition font-mono"
                    required
                  />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-3.5 py-2.5 rounded-[2px] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c] border-0 transition font-mono"
                    required
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-[11px] text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    {showRegPassword ? "Hide passwords" : "Show passwords"}
                  </button>
                </div>

                {/* Coral Red Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ff4c4c] hover:bg-[#f23d3d] active:bg-[#db2f2f] text-white font-normal py-3 rounded-[2px] text-sm tracking-wide transition-all shadow cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isLoading ? t("Creating Account...", "তৈরি হচ্ছে...") : t("Register Account", "রেজিস্ট্রেশন করুন")}
                </button>
              </form>

              {/* Google Sign-in on Registration Form as well */}
              <div className="text-center my-4">
                <span className="text-gray-300/80 text-xs tracking-wider">
                  or register with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 rounded-[2px] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md disabled:opacity-70"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-medium">
                  {isGoogleLoading ? "Connecting to Google..." : "Sign up with Google Account"}
                </span>
              </button>

              {/* Switch back to Login */}
              <div className="text-center pt-5 mt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  {t("Already have an account?", "ইতিমধ্যেই অ্যাকাউন্ট আছে?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-white hover:text-[#ff4c4c] underline transition-colors cursor-pointer"
                  >
                    {t("Login to your site", "লগ ইন করুন")}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer matching reference design */}
      <footer className="relative z-10 text-center py-6 px-4 text-xs text-white/70 tracking-wide font-light">
        © 2026 Fashion Login Form. All rights reserved | Bengal Edition
      </footer>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* GOOGLE ACCOUNT CHOOSER & REGISTRATION MODAL                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden text-gray-800 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 transition p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100 text-center">
              <div className="inline-flex justify-center mb-2.5">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Sign in with Google
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Choose or enter an account to continue to Bengal Edition Fashion
              </p>
            </div>

            {/* Account List */}
            <div className="p-3 space-y-1.5 max-h-[340px] overflow-y-auto">
              {/* Account 1: Shop Admin */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount({
                    name: "Shop Admin (Golam Rabbani)",
                    email: "mk.rabbani.cse@gmail.com",
                  })
                }
                disabled={isGoogleLoading}
                className="w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 rounded-md transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    GR
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <span>Shop Admin (Golam Rabbani)</span>
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                        Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      mk.rabbani.cse@gmail.com
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
              </button>

              {/* Account 2: Customer demo */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount({
                    name: "Tanvir Ahmed",
                    email: "tanvir.fashion@gmail.com",
                  })
                }
                disabled={isGoogleLoading}
                className="w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 rounded-md transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    TA
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <span>Tanvir Ahmed</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                        Customer
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      tanvir.fashion@gmail.com
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
              </button>

              {/* Account 3: Customer demo 2 */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount({
                    name: "Nusrat Jahan",
                    email: "nusrat.jahan@gmail.com",
                  })
                }
                disabled={isGoogleLoading}
                className="w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 rounded-md transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    NJ
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <span>Nusrat Jahan</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                        Customer
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      nusrat.jahan@gmail.com
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
              </button>

              {/* Custom Google Account Input Toggle */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition flex items-center gap-3 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Use another Google account</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomGoogleSubmit}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2.5 animate-in fade-in"
                >
                  <div className="text-xs font-semibold text-gray-700">
                    Enter your Google Account details:
                  </div>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Full Name (e.g. Shakib Al Hasan)"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="your.account@gmail.com"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="flex-1 text-xs py-1.5 text-gray-600 hover:bg-gray-200 rounded transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGoogleLoading}
                      className="flex-1 text-xs py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition cursor-pointer"
                    >
                      {isGoogleLoading ? "Connecting..." : "Sign in / Create Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Auto-creates Customer Account with 100 Welcome Points</span>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1f1f1f] border border-white/20 p-6 rounded-[2px] shadow-2xl text-white relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-[#ff4c4c]" />
              <h3 className="text-lg font-normal">Reset Password</h3>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-[2px] text-emerald-200 text-xs leading-relaxed">
                  A password reset verification code has been sent to{" "}
                  <span className="font-semibold text-white">{forgotInput}</span>.
                  Please check your SMS or inbox.
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full bg-[#ff4c4c] text-white py-2.5 rounded-[2px] text-sm hover:bg-[#f23d3d] transition cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-gray-300">
                  Enter your registered mobile number or email address. We will
                  send you an OTP code to verify your identity.
                </p>
                <div>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="Mobile number or email"
                    className="w-full bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 rounded-[2px] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4c4c]"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 border border-white/30 text-gray-300 hover:text-white py-2.5 rounded-[2px] text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#ff4c4c] text-white py-2.5 rounded-[2px] text-xs hover:bg-[#f23d3d] transition font-medium cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
