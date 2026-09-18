import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface Props {
  initialMode?: "login" | "register";
}

export const LoginPage: React.FC<Props> = ({ initialMode = "login" }) => {
  const {
    login,
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

  // Feedback & Loading States
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset errors on mode change
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [authMode]);

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

  // Handle Social Login simulation
  const handleSocialLogin = (provider: string) => {
    if (addToast) {
      addToast(`${provider} login: Authenticating with secure token...`, "info");
    }
    // Auto-fill a guest demo or customer login for convenience
    setIdentifier(`${provider.toLowerCase()}.user@fashion.com`);
    setPassword("fashion2026");
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
          className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{t("Back to Store", "স্টোরে ফিরে যান")}</span>
        </button>

        {/* Quick Demo Helper Button */}
        <button
          type="button"
          onClick={autofillAdmin}
          className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white bg-black/50 hover:bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md transition-all shadow-sm"
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
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1.5 px-3 rounded-[2px] text-xs transition-colors"
              >
                Go to Admin Dashboard
              </button>
              <button
                onClick={logoutAdmin}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium py-1.5 px-3 rounded-[2px] text-xs transition-colors flex items-center gap-1"
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
                className="flex-1 bg-white hover:bg-gray-100 text-black font-semibold py-1.5 px-3 rounded-[2px] text-xs transition-colors"
              >
                Customer Dashboard
              </button>
              <button
                onClick={logoutCustomer}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium py-1.5 px-3 rounded-[2px] text-xs transition-colors flex items-center gap-1"
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
                  {/* Solid Filled White Padlock Icon matching reference */}
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
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 transition"
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
                  className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Social Login Divider */}
              <div className="text-center my-6">
                <span className="text-gray-300/80 text-xs sm:text-sm tracking-wider">
                  or login with
                </span>
              </div>

              {/* Social Buttons: facebook, twitter, linkedin */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Facebook")}
                  className="py-2 px-1.5 border border-white/40 hover:border-white text-gray-200 hover:text-white bg-black/20 hover:bg-white/10 text-xs flex items-center justify-center gap-1.5 transition-all rounded-[2px] cursor-pointer"
                >
                  <span className="font-bold text-sm leading-none">f</span>
                  <span className="font-normal text-[11px] sm:text-xs">facebook</span>
                </button>

                {/* Twitter Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Twitter")}
                  className="py-2 px-1.5 border border-white/40 hover:border-white text-gray-200 hover:text-white bg-black/20 hover:bg-white/10 text-xs flex items-center justify-center gap-1.5 transition-all rounded-[2px] cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                  <span className="font-normal text-[11px] sm:text-xs">twitter</span>
                </button>

                {/* LinkedIn Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("LinkedIn")}
                  className="py-2 px-1.5 border border-white/40 hover:border-white text-gray-200 hover:text-white bg-black/20 hover:bg-white/10 text-xs flex items-center justify-center gap-1.5 transition-all rounded-[2px] cursor-pointer"
                >
                  <span className="font-bold text-xs lowercase leading-none">in</span>
                  <span className="font-normal text-[11px] sm:text-xs">linkedin</span>
                </button>
              </div>

              {/* Switch to Registration */}
              <div className="text-center pt-5 mt-2 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  {t("Don't have an account?", "নতুন গ্রাহক?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="text-white hover:text-[#ff4c4c] underline transition-colors"
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
                    className="text-[11px] text-gray-400 hover:text-white transition"
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

              {/* Switch back to Login */}
              <div className="text-center pt-5 mt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  {t("Already have an account?", "ইতিমধ্যেই অ্যাকাউন্ট আছে?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-white hover:text-[#ff4c4c] underline transition-colors"
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1f1f1f] border border-white/20 p-6 rounded-[2px] shadow-2xl text-white relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
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
                  className="w-full bg-[#ff4c4c] text-white py-2.5 rounded-[2px] text-sm hover:bg-[#f23d3d] transition"
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
                    className="flex-1 border border-white/30 text-gray-300 hover:text-white py-2.5 rounded-[2px] text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#ff4c4c] text-white py-2.5 rounded-[2px] text-xs hover:bg-[#f23d3d] transition font-medium"
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
