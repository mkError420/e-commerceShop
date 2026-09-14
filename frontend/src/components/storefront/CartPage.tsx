import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from "lucide-react";

export const CartPage: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotalBDT,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    navigate,
    t,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Coupon discount calculation
  let discountAmountBDT = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmountBDT = Math.round((cartSubtotalBDT * appliedCoupon.value) / 100);
    } else {
      discountAmountBDT = appliedCoupon.value;
    }
  }

  const finalTotalBDT = Math.max(0, cartSubtotalBDT - discountAmountBDT);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) setCouponInput("");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 mx-auto text-[#CCCCCC]" />
        <h2 className="font-editorial text-3xl font-bold text-[#1A1A1A]">
          {t("Your Shopping Cart is Empty", "আপনার শপিং কার্ট খালি")}
        </h2>
        <p className="text-xs text-[#555555] max-w-sm mx-auto">
          {t(
            "Discover authentic Dhakai Jamdani sarees, tailored Panjabis, and Supima polos crafted in Bangladesh.",
            "আমাদের ঐতিহ্যবাহী জামদানি ও পাঞ্জাবি কালেকশন ঘুরে দেখুন।"
          )}
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-4 bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-3 rounded hover:bg-black transition-colors"
        >
          {t("Continue Shopping", "কেনাকাটা করুন")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="border-b border-[#E0E0E0] pb-4">
        <h1 className="font-editorial text-3xl font-bold text-[#1A1A1A]">
          {t("Shopping Cart", "শপিং কার্ট")} ({cartCount} {t("items", "টি পণ্য")})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-lg divide-y divide-[#F0F0F0]">
            {cart.map((item) => {
              const unitPrice = item.product.priceBDT + (item.variant?.priceAdjustmentBDT || 0);
              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.nameEn}
                      className="w-20 h-24 object-cover rounded bg-[#F5F5F5] border border-[#E0E0E0] shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-[#1A1A1A]">
                        {t(item.product.nameEn, item.product.nameBn)}
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-[#555555] mt-1 font-mono">
                          {item.variant.title}
                        </p>
                      )}
                      <p className="text-xs text-[#777777] mt-0.5">
                        Unit Price: {formatPrice(unitPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                    {/* Qty Stepper */}
                    <div className="flex items-center border border-[#E0E0E0] rounded bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-[#F5F5F5]"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-[#F5F5F5]"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-bold text-[#1A1A1A] font-sans">
                      {formatPrice(unitPrice * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#888888] hover:text-rose-600 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              onClick={() => navigate("/shop")}
              className="text-[#555555] hover:text-[#1A1A1A] hover:underline"
            >
              ← {t("Continue Shopping", "আরও কেনাকাটা করুন")}
            </button>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
              {t("Order Summary", "অর্ডার বিবরণী")}
            </h2>

            {/* Voucher code input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs">
                  <span className="font-medium text-emerald-800">
                    Coupon '{appliedCoupon.code}' Applied
                  </span>
                  <button onClick={removeCoupon} className="font-bold text-emerald-900 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Voucher (e.g. EID2026)"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-[#E0E0E0] rounded uppercase font-mono"
                  />
                  <button type="submit" className="bg-[#1A1A1A] text-white text-xs px-4 py-2 rounded font-semibold">
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#555555]">
              <div className="flex justify-between">
                <span>{t("Subtotal", "সাবটোটাল")}</span>
                <span className="font-mono text-[#1A1A1A]">{formatPrice(cartSubtotalBDT)}</span>
              </div>
              {discountAmountBDT > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{t("Discount", "ছাড়")}</span>
                  <span className="font-mono">-{formatPrice(discountAmountBDT)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t("Shipping to BD", "ডেলিভারি চার্জ")}</span>
                <span className="text-[#1A1A1A]">{t("Inside Dhaka ৳60 / Outside ৳130", "ঢাকা ৬০ / বাইরে ১৩০")}</span>
              </div>
              <div className="pt-3 border-t border-[#E0E0E0] flex justify-between text-base font-bold text-[#1A1A1A]">
                <span>{t("Estimated Subtotal", "সর্বমোট প্রদেয়")}</span>
                <span className="font-sans">{formatPrice(finalTotalBDT)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-[#1A1A1A] text-white text-xs font-bold py-3.5 px-4 rounded hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{t("Proceed to Checkout", "চেকআউটে এগিয়ে যান")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg text-xs space-y-2 text-[#555555]">
            <div className="flex items-center gap-2 text-[#1A1A1A] font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bangladeshi Buyer Protection</span>
            </div>
            <p>Every piece is authenticated at our Dhaka atelier before courier dispatch. Cash on Delivery available nationwide.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
