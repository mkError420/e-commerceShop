import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Tag, Plus, X, Percent, DollarSign, Sparkles } from "lucide-react";

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, formatPrice, showToast } = useStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_BDT">("PERCENTAGE");
  const [value, setValue] = useState(15);
  const [minOrder, setMinOrder] = useState(3000);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minOrderBDT: Number(minOrder),
      usageCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setIsCreateOpen(false);
    showToast(`Voucher ${code.toUpperCase()} successfully created!`);
    setCode("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5 text-yellow-500" />
            <span>Promotion Engine</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-gray-900">
            Discount Vouchers & Campaign Codes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage Eid, Pohela Boishakh, and first-order discount codes for Bangladeshi shoppers.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 hover:border-yellow-400 transition-all admin-card-hover relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold bg-gray-100 border border-gray-200 px-3 py-1 rounded-md text-gray-900 tracking-wider">
                {coupon.code}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                coupon.isActive 
                  ? "bg-yellow-50 text-yellow-900 border-yellow-300" 
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {coupon.isActive ? "ACTIVE" : "EXPIRED"}
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-gray-900 font-sans">
                {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `৳${coupon.value} Flat OFF`}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Eligible on purchases above {formatPrice(coupon.minOrderBDT)}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span>Total Usage</span>
              <strong className="text-gray-900 font-mono">{coupon.usageCount} orders redeemed</strong>
            </div>
          </div>
        ))}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-editorial text-lg font-bold text-gray-900">Create Promotional Coupon</h3>
                <p className="text-[11px] text-gray-500">Add a promotional code for marketing campaigns.</p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Coupon Code (e.g. EID2026) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EID2026"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                >
                  <option value="PERCENTAGE">Percentage Discount (%)</option>
                  <option value="FIXED_BDT">Flat Discount (BDT ৳)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    {type === "PERCENTAGE" ? "Discount %" : "Discount BDT ৳"}
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Min Order (BDT)</label>
                  <input
                    type="number"
                    required
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-lg font-bold shadow-sm transition-all"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
