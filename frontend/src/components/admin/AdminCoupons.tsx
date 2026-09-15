import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Tag, Plus, X, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle } from "lucide-react";

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, toggleCouponActive, deleteCoupon, formatPrice, showToast } = useStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_BDT">("PERCENTAGE");
  const [value, setValue] = useState(15);
  const [minSpend, setMinSpend] = useState(3000);
  const [description, setDescription] = useState("");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const upperCode = code.trim().toUpperCase();
    if (coupons.some((c) => c.code === upperCode)) {
      showToast(`Coupon code "${upperCode}" already exists!`);
      return;
    }

    addCoupon({
      code: upperCode,
      type,
      value: Number(value),
      minSpendBDT: Number(minSpend),
      description: description.trim() || `${value}${type === "PERCENTAGE" ? "% OFF" : "৳ Flat OFF"} on orders above ৳${minSpend}`,
      isActive: true,
    });

    showToast(`Voucher ${upperCode} created successfully!`, "success");
    setIsCreateOpen(false);
    setCode("");
    setValue(15);
    setMinSpend(3000);
    setDescription("");
    setType("PERCENTAGE");
  };

  const handleToggle = (couponCode: string, currentStatus: boolean) => {
    toggleCouponActive(couponCode);
    showToast(`Coupon ${couponCode} ${currentStatus ? "deactivated" : "activated"}`);
  };

  const handleDelete = (couponCode: string) => {
    if (window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) {
      deleteCoupon(couponCode);
      showToast(`Coupon ${couponCode} deleted`);
    }
  };

  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalCoupons = coupons.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5 text-yellow-500" />
            <span>Promotion Engine</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-gray-900">
            Discount Vouchers &amp; Campaign Codes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage Eid, Pohela Boishakh, and first-order discount codes for Bangladeshi shoppers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center hidden sm:block">
            <div className="text-2xl font-extrabold text-gray-900">{activeCoupons}</div>
            <div className="text-[10px] text-gray-500 font-medium">Active / {totalCoupons} Total</div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {coupons.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No vouchers yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first coupon code to run a promotion.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2 rounded-lg transition-all"
          >
            + Create Coupon
          </button>
        </div>
      )}

      {/* Coupon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden transition-all ${
              coupon.isActive
                ? "border-yellow-300 hover:border-yellow-400"
                : "border-gray-200 opacity-70"
            }`}
          >
            {/* Status stripe */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                coupon.isActive ? "bg-gradient-to-r from-yellow-400 to-amber-500" : "bg-gray-200"
              }`}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-sm font-extrabold bg-gray-100 border border-gray-200 px-3 py-1 rounded-md text-gray-900 tracking-wider">
                {coupon.code}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  coupon.isActive
                    ? "bg-yellow-50 text-yellow-900 border-yellow-300"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {coupon.isActive ? (
                  <><CheckCircle className="w-3 h-3" /> ACTIVE</>
                ) : (
                  <><XCircle className="w-3 h-3" /> INACTIVE</>
                )}
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-gray-900 font-sans">
                {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `৳${coupon.value} Flat OFF`}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {coupon.description || `Eligible on purchases above ${formatPrice(coupon.minSpendBDT)}`}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Min. order: <strong className="text-gray-700">{formatPrice(coupon.minSpendBDT)}</strong>
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggle(coupon.code, coupon.isActive)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  coupon.isActive
                    ? "bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700"
                    : "bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
                }`}
              >
                {coupon.isActive ? (
                  <><ToggleRight className="w-4 h-4" /> Deactivate</>
                ) : (
                  <><ToggleLeft className="w-4 h-4" /> Activate</>
                )}
              </button>

              <button
                onClick={() => handleDelete(coupon.code)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all"
                title="Delete coupon"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
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
                  onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED_BDT")}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                >
                  <option value="PERCENTAGE">Percentage Discount (%)</option>
                  <option value="FIXED_BDT">Flat Discount (৳ BDT)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    {type === "PERCENTAGE" ? "Discount %" : "Discount (৳ BDT)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={type === "PERCENTAGE" ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Min. Order (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`e.g. Eid Special - ${value}% OFF`}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                />
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

