import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { authService } from "../../services/authService";
import { Smartphone, Mail, Eye, EyeOff, ArrowRight, Sparkles, UserPlus, Lock } from "lucide-react";

export const CustomerAuthCard: React.FC = () => {
  const { loginCustomer, registerCustomer, switchDemoCustomer, demoCustomers, t, navigate } = useStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) { setError("Please enter your mobile number or email."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = loginCustomer(identifier.trim(), password.trim() || undefined);
    setLoading(false);
    if (!result.success) setError(result.message);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) { setError("Name and phone number are required."); return; }
    setLoading(true);
    const result = await registerCustomer(name.trim(), phone.trim(), email.trim() || undefined, password.trim() || undefined);
    setLoading(false);
    if (!result.success) setError(result.message);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex flex-col items-center group mb-6">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-bold text-3xl tracking-tight text-[#1A1A1A]">BENGAL</span>
              <span className="text-xs tracking-[0.25em] uppercase border border-[#1A1A1A] px-1 py-0.5 rounded-sm leading-none">EDITION</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] text-[#555555] uppercase font-mono">DHAKA · HERITAGE ATELIER</span>
          </button>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
            {mode === "login" ? t("Welcome Back", "আবার স্বাগতম") : t("Create Account", "নতুন অ্যাকাউন্ট")}
          </h1>
          <p className="text-sm text-[#555555]">
            {mode === "login"
              ? t("Sign in with your Bangladeshi mobile number or email", "বাংলাদেশি মোবাইল নম্বর বা ইমেইল দিয়ে লগ ইন করুন")
              : t("Join and get exclusive access to heritage collections", "হেরিটেজ কালেকশনে এক্সক্লুসিভ অ্যাক্সেস পান")
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#E0E0E0]">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mode === "login" ? "bg-[#1A1A1A] text-white" : "text-[#555555] hover:bg-gray-50"}`}
            >
              {t("Sign In", "লগ ইন")}
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${mode === "register" ? "bg-[#1A1A1A] text-white" : "text-[#555555] hover:bg-gray-50"}`}
            >
              <UserPlus className="w-4 h-4" />
              {t("Register", "রেজিস্ট্রেশন")}
            </button>
          </div>

          <div className="p-6">
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    {t("Mobile Number or Email", "মোবাইল নম্বর বা ইমেইল")}
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-[#999]" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="01711223344 or email@example.com"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    {t("Password (Optional for Demo)", "পাসওয়ার্ড")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#999]" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-2.5 text-[#999] hover:text-[#1A1A1A]"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {t("Sign In Securely", "নিরাপদে লগ ইন করুন")}
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Full Name", "পূর্ণ নাম")} *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Md. Your Name"
                    className="w-full px-4 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    {t("Bangladeshi Mobile Number", "বাংলাদেশি মোবাইল নম্বর")} *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-gray-100 border border-[#E0E0E0] rounded-lg px-3 text-sm text-[#555555] font-mono flex-shrink-0">
                      +880
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01711223344"
                      maxLength={11}
                      className="flex-1 px-4 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    {t("Email (Optional)", "ইমেইল (ঐচ্ছিক)")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#999]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    {t("Password", "পাসওয়ার্ড")} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#999]" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-2.5 text-[#999] hover:text-[#1A1A1A]"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{t("Create My Account", "অ্যাকাউন্ট তৈরি করুন")} <ArrowRight className="w-4 h-4 ml-auto" /></>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Demo Login */}
          <div className="border-t border-[#E0E0E0] bg-[#F9F9F7] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                {t("Quick Demo Access", "ডেমো অ্যাকাউন্ট")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {demoCustomers.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => switchDemoCustomer(demo.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-[#E0E0E0] hover:border-[#1A1A1A] hover:shadow-sm transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-gray-900 font-bold text-sm flex-shrink-0">
                    {demo.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#1A1A1A] truncate">{demo.name}</div>
                    <div className="text-[10px] text-[#777777] font-mono">{demo.phone} · {demo.loyaltyTier}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#AAAAAA] group-hover:text-[#1A1A1A] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#999999] mt-5">
          {t("By continuing, you agree to Bengal Edition's Terms of Service and Privacy Policy.", "চালিয়ে যাওয়ার মাধ্যমে আপনি শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত।")}
        </p>
      </div>
    </div>
  );
};
