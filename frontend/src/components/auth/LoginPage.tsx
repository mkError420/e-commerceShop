import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShieldCheck,
  User,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trophy,
  UserPlus,
  LogIn,
  LogOut,
} from "lucide-react";

interface Props {
  initialMode?: "login" | "register";
}

export const LoginPage: React.FC<Props> = ({
  initialMode = "login",
}) => {
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
  } = useStore();

  // Read mode from query param if available
  const queryParams = new URLSearchParams(navigation.path.split("?")[1] || "");
  const modeParam = queryParams.get("mode");

  const [authMode, setAuthMode] = useState<"login" | "register">(
    modeParam === "register" ? "register" : initialMode
  );

  // Unified Sign In Form State (Same for Admin & Customer)
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

  // Feedback & Loading States
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset errors on mode change
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [authMode]);

  // Handle Unified Sign In (Admin & Customer in same field)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setErrorMessage(
        t(
          "Please enter your email address or mobile number",
          "অনুগ্রহ করে আপনার ইমেইল অথবা মোবাইল নম্বর লিখুন"
        )
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        t(
          "Please enter your password",
          "অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন"
        )
      );
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const res = login(identifier, password);
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
      setErrorMessage(
        t("Passwords do not match", "পাসওয়ার্ড দুটি মিলছে না")
      );
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    const res = registerCustomer(regName, regPhone, regEmail, regPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // Quick fill Shop Admin Credentials for instant testing
  const autofillAdmin = () => {
    setIdentifier("mk.rabbani.cse@gmail.com");
    setPassword("sup123456123");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col justify-between">
      {/* Top Bar Header */}
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-[#E0E0E0] flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-[#555555] hover:text-[#1A1A1A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{t("Back to Storefront", "স্টোরফ্রন্টে ফিরে যান")}</span>
        </button>

        {/* Brand Identity */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-center">
            <div className="font-bold text-sm leading-tight text-[#1A1A1A] tracking-wider">
              BENGAL EDITION
            </div>
            <div className="text-[9px] text-[#777777] uppercase tracking-widest font-mono">
              Authentication Portal
            </div>
          </div>
        </div>

        <div className="text-xs text-[#888888] font-mono">
          Dhaka · BD
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">

          {/* If already signed in, show current session status */}
          {isAdminAuthenticated && (
            <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-2xl p-5 text-center shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-200 text-yellow-900 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Signed In as Shop Admin</span>
              </div>
              <p className="text-xs text-yellow-950 font-medium">
                You are currently logged in with Admin privileges.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/admin")}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Go to Admin Dashboard
                </button>
                <button
                  onClick={logoutAdmin}
                  className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {currentUser && !isAdminAuthenticated && (
            <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Signed In as {currentUser.name}</span>
              </div>
              <p className="text-xs text-gray-600">
                Customer account active ({currentUser.phone || currentUser.email})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/customer")}
                  className="flex-1 bg-[#1A1A1A] hover:bg-black text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Go to Customer Dashboard
                </button>
                <button
                  onClick={logoutCustomer}
                  className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Authentication Card */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-xl overflow-hidden">
            {/* Unified Mode Switcher: Sign In vs New Registration */}
            <div className="flex border-b border-[#E0E0E0]">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  authMode === "login"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#666666] hover:bg-gray-50"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{t("Sign In", "লগ ইন")}</span>
              </button>

              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  authMode === "register"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#666666] hover:bg-gray-50"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{t("New Registration", "নতুন রেজিস্ট্রেশন")}</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* UNIFIED SIGN IN FORM (Same fields for Admin & Customer)        */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {authMode === "login" ? (
                <div className="space-y-5">
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg font-bold text-[#1A1A1A]">
                      {t("Welcome Back", "স্বাগতম")}
                    </h2>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {t(
                        "Sign in to access your dashboard (Admin & Customer).",
                        "আপনার ড্যাশবোর্ডে প্রবেশ করতে লগ ইন করুন।"
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Identifier Field: Email or Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                        {t("Email Address or Mobile Number", "ইমেইল বা মোবাইল নম্বর")} *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3 text-[#888888]">
                          {identifier.includes("@") ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="mk.rabbani.cse@gmail.com or 01711223344"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
                          required
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#1A1A1A]">
                          {t("Password", "পাসওয়ার্ড")} *
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white font-mono"
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-[#888888] hover:text-[#1A1A1A]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Sign In Action Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 mt-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isLoading ? t("Verifying...", "যাচাই করা হচ্ছে...") : t("Sign In", "সাইন ইন করুন")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Shop Admin Quick Test Helper Card */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
                          <span>Shop Admin Credentials</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                          Mail: <span className="text-gray-800 font-semibold">mk.rabbani.cse@gmail.com</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Pass: <span className="text-gray-800 font-semibold">sup123456123</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={autofillAdmin}
                        className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-lg text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto shadow-2xs"
                      >
                        Autofill Admin
                      </button>
                    </div>
                  </div>

                  {/* Switch to Registration */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-[#666666]">
                      {t("Don't have a customer account?", "নতুন কাস্টমার?")}{" "}
                      <button
                        type="button"
                        onClick={() => setAuthMode("register")}
                        className="font-bold text-[#1A1A1A] hover:underline"
                      >
                        {t("Register Here →", "রেজিস্ট্রেশন করুন →")}
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* ═══════════════════════════════════════════════════════════════ */
                /* CUSTOMER REGISTRATION FORM                                    */
                /* ═══════════════════════════════════════════════════════════════ */
                <div className="space-y-4">
                  <div className="text-center sm:text-left mb-2">
                    <h2 className="text-lg font-bold text-[#1A1A1A]">
                      {t("Create Customer Account", "নতুন কাস্টমার অ্যাকাউন্ট")}
                    </h2>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {t(
                        "Register to track orders, save addresses, and earn rewards.",
                        "অর্ডার ট্র্যাকিং এবং লয়্যালটি রিওয়ার্ড পেতে অ্যাকাউন্ট খুলুন।"
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleCustomerRegister} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                        {t("Full Name", "আপনার পূর্ণ নাম")} *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Nusrat Jahan / Tanvir Ahmed"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                        {t("Bangladeshi Mobile Number", "বাংলাদেশি মোবাইল নম্বর")} *
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="01711223344"
                          maxLength={11}
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white font-mono"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-[#888888] mt-0.5 block">
                        {t("11 digits starting with 01 (Used for SMS courier delivery tracking)", "১১ ডিজিট (০১ দিয়ে শুরু)")}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                        {t("Email Address (Optional)", "ইমেইল অ্যাড্রেস (ঐচ্ছিক)")}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="your.email@domain.com"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                          {t("Set Password", "পাসওয়ার্ড")} *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                          <input
                            type={showRegPassword ? "text" : "password"}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-3 text-[#888888] hover:text-[#1A1A1A]"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                          {t("Confirm Password", "নিশ্চিত করুন")} *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                          <input
                            type={showRegPassword ? "text" : "password"}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reward Callout */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900">
                      <Trophy className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold">{t("Welcome Reward:", "স্বাগত উপহার:")}</span>{" "}
                        {t("Receive 100 Heritage Loyalty Points instantly upon registration.", "রেজিস্ট্রেশন করলেই ১০০ লয়্যালটি পয়েন্ট পাবেন।")}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 mt-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isLoading ? t("Creating Account...", "অ্যাকাউন্ট তৈরি হচ্ছে...") : t("Create Customer Account", "রেজিস্ট্রেশন সম্পন্ন করুন")}</span>
                    </button>
                  </form>

                  {/* Switch back to Sign In */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-[#666666]">
                      {t("Already have an account?", "ইতিমধ্যেই অ্যাকাউন্ট আছে?")}{" "}
                      <button
                        type="button"
                        onClick={() => setAuthMode("login")}
                        className="font-bold text-[#1A1A1A] hover:underline"
                      >
                        {t("Sign In →", "সাইন ইন করুন →")}
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#888888] border-t border-[#EAEAEA] bg-white">
        © 2026 BENGAL EDITION · Secure Unified Authentication · NBR BIN: 002381940-0101
      </footer>
    </div>
  );
};
