import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { User, Phone, Mail, Calendar, Edit2, Save, X, Bell, MessageCircle, Tag, Shield } from "lucide-react";

export const CustomerProfile: React.FC = () => {
  const { currentUser, updateCustomerProfile, t } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    gender: currentUser?.gender || "" as "male" | "female" | "other" | "",
    birthday: currentUser?.birthday || "",
  });
  const [notifPrefs, setNotifPrefs] = useState({
    smsOrderAlerts: currentUser?.notificationPrefs.smsOrderAlerts ?? true,
    whatsappTracking: currentUser?.notificationPrefs.whatsappTracking ?? false,
    promotionalEmails: currentUser?.notificationPrefs.promotionalEmails ?? false,
  });
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name: form.name.trim() || currentUser.name,
      phone: form.phone.trim() || currentUser.phone,
      email: form.email.trim() || undefined,
      gender: form.gender || undefined,
      birthday: form.birthday || undefined,
      notificationPrefs: notifPrefs,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex w-10 h-5.5 rounded-full transition-colors flex-shrink-0 focus:outline-none ${checked ? "bg-[#1A1A1A]" : "bg-gray-200"}`}
      style={{ height: "22px" }}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
        style={{ width: "18px", height: "18px" }}
      />
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t("Profile Settings", "প্রোফাইল সেটিংস")}</h2>
          <p className="text-sm text-[#777777] mt-0.5">{t("Manage your personal information and preferences", "আপনার ব্যক্তিগত তথ্য পরিচালনা করুন")}</p>
        </div>
        {!editing ? (
          <button
            onClick={() => { setEditing(true); setSaved(false); }}
            className="flex items-center gap-1.5 text-xs font-semibold border border-[#E0E0E0] px-3 py-2 rounded-lg hover:border-[#1A1A1A] hover:bg-gray-50 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {t("Edit Profile", "সম্পাদনা করুন")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-xs font-semibold border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <X className="w-3.5 h-3.5" />
              {t("Cancel", "বাতিল")}
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
          ✓ {t("Profile updated successfully!", "প্রোফাইল সফলভাবে আপডেট হয়েছে!")}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-[#555555]" />
            </div>
            <div className="font-semibold text-sm text-[#1A1A1A]">{t("Personal Information", "ব্যক্তিগত তথ্য")}</div>
          </div>

          {/* Avatar Preview */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-gray-900 font-bold text-2xl shadow-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[#1A1A1A]">{currentUser.name}</div>
              <div className="text-xs text-[#777777] font-mono">{currentUser.phone}</div>
              <div className="text-[11px] text-[#AAAAAA] mt-0.5">{t("Member since", "সদস্যপদ থেকে")} {new Date(currentUser.joinedDate).toLocaleDateString("en-BD", { month: "long", year: "numeric" })}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Full Name", "পূর্ণ নাম")}</label>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                />
              ) : (
                <div className="text-sm text-[#1A1A1A] px-3 py-2 bg-gray-50 rounded-lg">{currentUser.name}</div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                <Phone className="inline w-3 h-3 mr-1" />{t("Mobile Number", "মোবাইল")}
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  maxLength={11}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] font-mono"
                />
              ) : (
                <div className="text-sm text-[#1A1A1A] px-3 py-2 bg-gray-50 rounded-lg font-mono">{currentUser.phone}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                <Mail className="inline w-3 h-3 mr-1" />{t("Email (Optional)", "ইমেইল (ঐচ্ছিক)")}
              </label>
              {editing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                />
              ) : (
                <div className="text-sm text-[#1A1A1A] px-3 py-2 bg-gray-50 rounded-lg">
                  {currentUser.email || <span className="text-[#AAAAAA] italic">Not provided</span>}
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Gender", "লিঙ্গ")}</label>
              {editing ? (
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male / পুরুষ</option>
                  <option value="female">Female / মহিলা</option>
                  <option value="other">Other / অন্যান্য</option>
                </select>
              ) : (
                <div className="text-sm text-[#1A1A1A] px-3 py-2 bg-gray-50 rounded-lg capitalize">
                  {currentUser.gender || <span className="text-[#AAAAAA] italic">Not specified</span>}
                </div>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                <Calendar className="inline w-3 h-3 mr-1" />{t("Birthday (Optional)", "জন্মদিন (ঐচ্ছিক)")}
              </label>
              {editing ? (
                <input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                />
              ) : (
                <div className="text-sm text-[#1A1A1A] px-3 py-2 bg-gray-50 rounded-lg">
                  {currentUser.birthday ? new Date(currentUser.birthday).toLocaleDateString("en-BD", { day: "numeric", month: "long" }) : <span className="text-[#AAAAAA] italic">Not provided</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#555555]" />
            </div>
            <div className="font-semibold text-sm text-[#1A1A1A]">{t("Notification Preferences", "নোটিফিকেশন সেটিংস")}</div>
          </div>

          <div className="space-y-3">
            {[
              { key: "smsOrderAlerts", icon: Phone, label: t("SMS Order Alerts", "SMS অর্ডার আপডেট"), desc: t("Receive order confirmations and delivery updates via SMS", "SMS-এ অর্ডার নিশ্চিতকরণ ও ডেলিভারি আপডেট") },
              { key: "whatsappTracking", icon: MessageCircle, label: t("WhatsApp Tracking", "WhatsApp ট্র্যাকিং"), desc: t("Live courier updates via WhatsApp", "WhatsApp-এ লাইভ কুরিয়ার আপডেট") },
              { key: "promotionalEmails", icon: Tag, label: t("Promotional Deals", "প্রমোশনাল অফার"), desc: t("Festival offers, flash deals, and new arrivals", "উৎসব অফার, ফ্ল্যাশ ডিল ও নতুন পণ্য") },
            ].map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-[#E0E0E0] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#555555]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#1A1A1A]">{label}</div>
                  <div className="text-[10px] text-[#888888]">{desc}</div>
                </div>
                <ToggleSwitch
                  checked={notifPrefs[key as keyof typeof notifPrefs]}
                  onChange={() => setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifPrefs] }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#555555]" />
            </div>
            <div className="font-semibold text-sm text-[#1A1A1A]">{t("Security", "নিরাপত্তা")}</div>
          </div>
          <div className="text-xs text-[#555555] bg-gray-50 rounded-lg px-3 py-2.5">
            🔒 {t("Your account is protected with Bangladeshi mobile OTP verification. Change your account mobile number to update your login.", "আপনার অ্যাকাউন্ট বাংলাদেশি মোবাইল OTP দিয়ে সুরক্ষিত।")}
          </div>
        </div>

        {editing && (
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-3 rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-lg"
          >
            <Save className="w-4 h-4" />
            {t("Save All Changes", "সব পরিবর্তন সংরক্ষণ করুন")}
          </button>
        )}
      </form>
    </div>
  );
};
