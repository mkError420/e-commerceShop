import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Coupon } from "../../types";
import { Tag, Plus, Check, X, Percent, DollarSign } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">
            Discount Vouchers & Campaign Codes
          </h2>
          <p className="text-xs text-[#555555]">
            Manage Eid, Pohela Boishakh, and first-order discount codes for Bangladeshi shoppers.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold bg-[#F5F5F5] border border-[#E0E0E0] px-2.5 py-1 rounded text-[#1A1A1A]">
                {coupon.code}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                coupon.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
              }`}>
                {coupon.isActive ? "ACTIVE" : "EXPIRED"}
              </span>
            </div>

            <div className="text-xl font-bold text-[#1A1A1A]">
              {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `৳${coupon.value} Flat OFF`}
            </div>

            <div className="text-xs text-[#555555] space-y-1">
              <p>Min Order: {formatPrice(coupon.minOrderBDT)}</p>
              <p>Total Redemptions: <strong className="text-[#1A1A1A]">{coupon.usageCount} times</strong></p>
            </div>
          </div>
        ))}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E0E0E0]">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <h3 className="font-bold text-sm text-[#1A1A1A]">Create Promotional Coupon</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Coupon Code (e.g. EID2026) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EID2026"
                  className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                >
                  <option value="PERCENTAGE">Percentage Discount (%)</option>
                  <option value="FIXED_BDT">Flat Discount (BDT ৳)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    {type === "PERCENTAGE" ? "Discount %" : "Discount BDT ৳"}
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Min Order (BDT)</label>
                  <input
                    type="number"
                    required
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A1A] text-white rounded font-semibold hover:bg-black"
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
