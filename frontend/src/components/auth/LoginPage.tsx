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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trophy,
  UserPlus,
  LogIn,
} from "lucide-react";

interface Props {
  initialTab?: "customer" | "admin";
  initialMode?: "login" | "register";
}

export const LoginPage: React.FC<Props> = ({
  initialTab = "customer",
  initialMode = "login",
}) => {
  const {
    loginAdmin,
    loginCustomer,
    registerCustomer,
    demoCustomers,
    navigate,
    navigation,
    t,
    language,
    isAdminAuthenticated,
    currentUser,
  } = useStore();

  // Read tab/mode from query param if available
  const queryParams = new URLSearchParams(navigation.path.split("?")[1] || "");
  const tabParam = queryParams.get("tab");
  const modeParam = queryParams.get("mode");

  const [activeTab, setActiveTab] = useState<"customer" | "admin">(
    tabParam === "admin" ? "admin" : initialTab
  );
  const [customerMode, setCustomerMode] = useState<"login" | "register">(
    modeParam === "register" ? "register" : initialMode
  );

  // Customer Login Form State
  const [customerIdentifier, setCustomerIdentifier] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  // Customer Register Form State
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Shop Admin Login Form State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Feedback & Loading States
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync tab with URL if changed externally
  useEffect(() => {
    if (tabParam === "admin") {
      setActiveTab("admin");
    } else if (tabParam === "customer") {
      setActiveTab("customer");
    }
  }, [tabParam]);

  // If already logged in, show status or auto-redirect
  useEffect(() => {
    if (activeTab === "admin" && isAdminAuthenticated) {
      navigate("/admin");
    }
  }, [isAdminAuthenticated, activeTab, navigate]);

  // Handle Customer Login
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!customerIdentifier.trim()) {
      setErrorMessage(
        t(
          "Please enter your mobile number or email address",
          "অনুগ্রহ করে আপনার মোবাইল নম্বর বা ইমেইল লিখুন"
        )
      );
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = loginCustomer(customerIdentifier, customerPassword);
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
    await new Promise((r) => setTimeout(r, 500));
    const res = registerCustomer(regName, regPhone, regEmail, regPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // Handle Shop Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setErrorMessage(
        t(
          "Admin email and password are required",
          "অ্যাডমিন ইমেইল এবং পাসওয়ার্ড আবশ্যক"
        )
      );
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    const res = loginAdmin(adminEmail, adminPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // One-click autofill for Shop Admin Demo Credentials
  const autofillAdminCredentials = () => {
    setAdminEmail("mk.rabbani.cse@gmail.com");
    setAdminPassword("sup123456123");
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
          <span>{t("Back to Heritage Storefront", "স্টোরফ্রন্টে ফিরে যান")}</span>
        </button>

        {/* Brand Identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-yellow-400 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
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

      {/* Main Form Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          {/* Role Tab Selector (Customer vs Shop Admin) */}
          <div className="bg-gray-200/80 p-1 rounded-xl flex gap-1 mb-6 shadow-inner">
            <button
              onClick={() => {
                setActiveTab("customer");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "customer"
                  ? "bg-white text-[#1A1A1A] shadow-md"
                  : "text-[#555555] hover:text-[#1A1A1A]"
              }`}
            >
              <User className="w-4 h-4 text-[#1A1A1A]" />
              <span>{t("Customer Account", "কাস্টমার অ্যাকাউন্ট")}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("admin");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "admin"
                  ? "bg-[#1A1A1A] text-white shadow-md"
                  : "text-[#555555] hover:text-[#1A1A1A]"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>{t("Shop Admin Portal", "শপ অ্যাডমিন পোর্টাল")}</span>
            </button>
          </div>

          {/* Feedback Alert Messages */}
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

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: CUSTOMER PORTAL                                           */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "customer" && (
            <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-xl overflow-hidden">
              {/* Customer Sub-tabs: Sign In vs Register */}
              <div className="flex border-b border-[#E0E0E0]">
                <button
                  onClick={() => {
                    setCustomerMode("login");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    customerMode === "login"
                      ? "bg-[#1A1A1A] text-white"
                      : "text-[#666666] hover:bg-gray-50"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t("Customer Sign In", "লগ ইন করুন")}</span>
                </button>

                <button
                  onClick={() => {
                    setCustomerMode("register");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    customerMode === "register"
                      ? "bg-[#1A1A1A] text-white"
                      : "text-[#666666] hover:bg-gray-50"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t("New Registration", "নতুন রেজিস্ট্রেশন")}</span>
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {/* ─── Customer Login Form ──────────────────────────────────── */}
                {customerMode === "login" ? (
                  <form onSubmit={handleCustomerLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                        {t("Mobile Number or Email", "মোবাইল নম্বর বা ইমেইল")} *
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                        <input
                          type="text"
                          value={customerIdentifier}
                          onChange={(e) => setCustomerIdentifier(e.target.value)}
                          placeholder="01711223344 or name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#1A1A1A]">
                          {t("Password (Optional for Demo)", "পাসওয়ার্ড")}
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                        <input
                          type={showCustomerPassword ? "text" : "password"}
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                          className="absolute right-3.5 top-3 text-[#888888] hover:text-[#1A1A1A]"
                        >
                          {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 mt-2"
                    >
                      <span>{isLoading ? t("Authenticating...", "যাচাই করা হচ্ছে...") : t("Sign In to My Account", "অ্যাকাউন্টে প্রবেশ করুন")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* ─── Customer Register Form ─────────────────────────────── */
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
                            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
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
                            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#CCCCCC] rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reward Callout */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900">
                      <Trophy className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold">{t("Registration Welcome Gift:", "স্বাগত উপহার:")}</span>{" "}
                        {t("Instantly receive 100 Heritage Loyalty Points upon sign up.", "রেজিস্ট্রেশন করলেই ১০০ লয়্যালটি পয়েন্ট পাবেন।")}
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
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: SHOP ADMIN PORTAL                                         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === "admin" && (
            <div className="bg-[#1A1A1A] text-white border border-[#333333] rounded-2xl shadow-2xl overflow-hidden">
              {/* Admin Card Header */}
              <div className="p-6 bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] border-b border-white/10 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Staff Only</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {t("Shop Admin Portal", "শপ অ্যাডমিন পোর্টাল")}
                </h2>
                <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                  {t(
                    "Sign in to manage inventory, catalog, fulfillment, orders, and courier tracking.",
                    "ইনভেন্টরি, ক্যাটালগ ও কুরিয়ার ডেলিভারি ম্যানেজ করতে লগ ইন করুন।"
                  )}
                </p>
              </div>

              {/* Admin Login Form */}
              <div className="p-6 sm:p-8 space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      {t("Admin Email Address", "অ্যাডমিন ইমেইল")} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="mk.rabbani.cse@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-white/80">
                        {t("Admin Secret Password", "অ্যাডমিন পাসওয়ার্ড")} *
                      </label>
                      <span className="text-[10px] text-white/40 font-mono">
                        Protected Session
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-3 text-white/40 hover:text-white"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-gray-950 font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 mt-2"
                  >
                    <KeyRound className="w-4 h-4 text-gray-950" />
                    <span>
                      {isLoading
                        ? t("Verifying Credentials...", "ভেরিফাই করা হচ্ছে...")
                        : t("Unlock Admin Dashboard", "অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন")}
                    </span>
                  </button>
                </form>

                {/* 1-Click Autofill Admin Credentials Card */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-yellow-300 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3" />
                        <span>Shop Admin Credentials</span>
                      </div>
                      <div className="text-[10px] text-white/60 font-mono mt-0.5 truncate">
                        Mail: <span className="text-white">mk.rabbani.cse@gmail.com</span>
                      </div>
                      <div className="text-[10px] text-white/60 font-mono">
                        Pass: <span className="text-white">sup123456123</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={autofillAdminCredentials}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold transition-all whitespace-nowrap self-start sm:self-auto"
                    >
                      Fill Admin Credentials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#888888] border-t border-[#EAEAEA] bg-white">
        © 2026 BENGAL EDITION · Secure Atelier E-Commerce System · NBR BIN: 002381940-0101
      </footer>
    </div>
  );
};
