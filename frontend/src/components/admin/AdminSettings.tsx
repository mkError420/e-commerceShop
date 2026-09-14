import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Save, Check, Truck, CreditCard, Shield, Globe } from "lucide-react";

export const AdminSettings: React.FC = () => {
  const { showToast } = useStore();

  const [insideDhakaFee, setInsideDhakaFee] = useState(60);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(130);
  const [bkashMerchant, setBkashMerchant] = useState("01711223344");
  const [nagadMerchant, setNagadMerchant] = useState("01811334455");
  const [sslStoreId, setSslStoreId] = useState("bengalarchive_live");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    showToast("Bangladeshi shipping & gateway settings updated!");
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">
          Bangladeshi Logistics & Payment Gateway Settings
        </h2>
        <p className="text-xs text-[#555555]">
          Configure division delivery thresholds, Pathao courier webhooks, and local mobile banking accounts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Shipping Rates */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
            <Truck className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="font-bold uppercase tracking-wider text-[#1A1A1A]">
              Delivery Zone Flat Rates (BDT ৳)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">
                Inside Dhaka Zone Fee (৳)
              </label>
              <input
                type="number"
                value={insideDhakaFee}
                onChange={(e) => setInsideDhakaFee(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono font-bold"
              />
              <span className="text-[10px] text-[#777777] mt-0.5 block">Standard: ৳60 BDT (24-48 Hours delivery)</span>
            </div>

            <div>
              <label className="font-semibold block mb-1">
                Outside Dhaka (63 Districts) Fee (৳)
              </label>
              <input
                type="number"
                value={outsideDhakaFee}
                onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono font-bold"
              />
              <span className="text-[10px] text-[#777777] mt-0.5 block">Standard: ৳130 BDT (3-5 Days delivery)</span>
            </div>
          </div>
        </div>

        {/* MFS Gateways */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
            <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="font-bold uppercase tracking-wider text-[#1A1A1A]">
              MFS & Digital Payment Gateways
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">bKash Merchant Account Number</label>
              <input
                type="text"
                value={bkashMerchant}
                onChange={(e) => setBkashMerchant(e.target.value)}
                className="w-full p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Nagad Merchant Account Number</label>
              <input
                type="text"
                value={nagadMerchant}
                onChange={(e) => setNagadMerchant(e.target.value)}
                className="w-full p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold block mb-1">SSLCommerz Live Store ID</label>
              <input
                type="text"
                value={sslStoreId}
                onChange={(e) => setSslStoreId(e.target.value)}
                className="w-full p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-3 rounded-lg hover:bg-black transition-colors flex items-center gap-2 shadow-xs"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? "Saved Successfully" : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
