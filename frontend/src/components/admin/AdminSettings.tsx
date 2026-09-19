import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Save, Check, Truck, CreditCard, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";

export const AdminSettings: React.FC = () => {
  const { showToast, autoAdminNewUsers, setAutoAdminNewUsers } = useStore();

  const [insideDhakaFee, setInsideDhakaFee] = useState(60);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(130);
  const [bkashMerchant, setBkashMerchant] = useState("01711223344");
  const [nagadMerchant, setNagadMerchant] = useState("01811334455");
  const [sslStoreId, setSslStoreId] = useState("bengalarchive_live");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    showToast("Store settings and configuration updated!");
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5 text-yellow-500" />
          <span>System Configuration</span>
        </div>
        <h2 className="font-editorial text-2xl font-bold text-gray-900">
          Store Operations, Admin Privileges &amp; Payment Gateway Settings
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure division delivery thresholds, Pathao courier webhooks, MFS accounts, and user admin access defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* User Onboarding & Admin Privilege Configuration */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                User Onboarding &amp; Admin Privileges
              </h3>
              <p className="text-[11px] text-gray-500">
                Manage automated Shop Admin role assignment and registration synchronization
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-yellow-50/50 to-orange-50/50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-xs">
                  Auto-Provision Every New User As Shop Admin
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  autoAdminNewUsers ? "bg-amber-200 text-amber-900" : "bg-gray-200 text-gray-700"
                }`}>
                  {autoAdminNewUsers ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                When enabled, every profile that registers via email, mobile, or Google OAuth will automatically be granted full Shop Admin permissions (all 8 dashboard modules) and routed to the Shop Admin Dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !autoAdminNewUsers;
                setAutoAdminNewUsers(nextVal);
                showToast(
                  nextVal
                    ? "Enabled: All new profiles will be assigned Shop Admin role!"
                    : "Disabled: New registrations will default to Customer profiles."
                );
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoAdminNewUsers ? "bg-amber-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  autoAdminNewUsers ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Admin Dashboard Sync:</strong> Every user registered into the store is continuously synchronized into both Customer CRM and Shop Admin modules with full privilege control, credential updates, and password resets.
            </span>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-800">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Delivery Zone Flat Rates (BDT ৳)
              </h3>
              <p className="text-[11px] text-gray-500">Automated courier rates applied during checkout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Inside Dhaka Zone Fee (৳)
              </label>
              <input
                type="number"
                value={insideDhakaFee}
                onChange={(e) => setInsideDhakaFee(Number(e.target.value))}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Standard: ৳60 BDT (24-48 Hours delivery via Pathao)</span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Outside Dhaka (63 Districts) Fee (৳)
              </label>
              <input
                type="number"
                value={outsideDhakaFee}
                onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Standard: ৳130 BDT (3-5 Days delivery via Steadfast)</span>
            </div>
          </div>
        </div>

        {/* MFS Gateways */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-800">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                MFS & Digital Payment Gateways
              </h3>
              <p className="text-[11px] text-gray-500">Bangladeshi local mobile wallets and card settlement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">bKash Merchant Account Number</label>
              <input
                type="text"
                value={bkashMerchant}
                onChange={(e) => setBkashMerchant(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Nagad Merchant Account Number</label>
              <input
                type="text"
                value={nagadMerchant}
                onChange={(e) => setNagadMerchant(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-gray-700 block mb-1">SSLCommerz Live Store ID</label>
              <input
                type="text"
                value={sslStoreId}
                onChange={(e) => setSslStoreId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? "Saved Successfully" : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
