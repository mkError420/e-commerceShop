import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
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
    showToast,
    currentUser,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isCartDrawerOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E0E0E0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
            <h3 className="font-semibold text-base text-[#1A1A1A]">
              {t("Shopping Bag", "শপিং ব্যাগ")} ({cartCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1 rounded-full hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#F0F0F0]">
          {cart.length > 0 ? (
            cart.map((item) => {
              const unitPrice = item.product.priceBDT + (item.variant?.priceAdjustmentBDT || 0);
              return (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.nameEn}
                    className="w-20 h-24 object-cover rounded bg-[#F5F5F5] border border-[#E0E0E0] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-[#1A1A1A] line-clamp-2">
                          {t(item.product.nameEn, item.product.nameBn)}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#999999] hover:text-[#1A1A1A] transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variant && (
                        <p className="text-[11px] text-[#555555] mt-0.5 font-mono">
                          {item.variant.title}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E0E0E0] rounded">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 text-xs flex items-center justify-center hover:bg-[#F5F5F5]"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 text-xs flex items-center justify-center hover:bg-[#F5F5F5]"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#1A1A1A] font-sans">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#CCCCCC]" />
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {t("Your shopping bag is empty", "আপনার ব্যাগ খালি")}
              </p>
              <p className="text-xs text-[#777777]">
                {t("Explore handcrafted Jamdani & Panjabis to start.", "জামদানি ও পাঞ্জাবি কালেকশন ঘুরে দেখুন।")}
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate("/shop");
                }}
                className="mt-2 bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-2 rounded"
              >
                {t("Start Shopping", "কেনাকাটা শুরু করুন")}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#E0E0E0] bg-[#FDFDFD] space-y-4">
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon '{appliedCoupon.code}' (-{formatPrice(discountAmountBDT)})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-emerald-900 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t("Voucher Code (Try: EID2026)", "ভাউচার কোড (যেমন: EID2026)")}
                    className="flex-1 text-xs px-3 py-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A] uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-black"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponFeedback && !appliedCoupon && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Subtotal Breakdown */}
            <div className="space-y-1.5 text-xs text-[#555555]">
              <div className="flex justify-between">
                <span>{t("Bag Subtotal", "মোট মূল্য")}</span>
                <span className="font-mono font-medium text-[#1A1A1A]">{formatPrice(cartSubtotalBDT)}</span>
              </div>
              {discountAmountBDT > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>{t("Voucher Discount", "ভাউচার ডিসকাউন্ট")}</span>
                  <span className="font-mono font-medium">-{formatPrice(discountAmountBDT)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-[#777777]">
                <span>{t("Shipping Fee", "ডেলিভারি চার্জ")}</span>
                <span>{t("Calculated at checkout (৳60 / ৳130)", "চেকআউটে নির্ধারিত হবে")}</span>
              </div>
              <div className="pt-2 border-t border-[#E0E0E0] flex justify-between text-sm font-bold text-[#1A1A1A]">
                <span>{t("Estimated Total", "মোট প্রদেয়")}</span>
                <span className="font-sans">{formatPrice(finalTotalBDT)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  if (!currentUser) {
                    showToast(t("Please login to proceed to checkout", "চেকআউট করতে লগইন করুন"), "info");
                    navigate("/login?redirect=/checkout");
                  } else {
                    navigate("/checkout");
                  }
                }}
                className="w-full bg-[#1A1A1A] text-white text-xs font-bold py-3.5 px-4 rounded hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t("Proceed to Bangladeshi Checkout", "চেকআউট সম্পন্ন করুন")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate("/cart");
                }}
                className="w-full text-center text-xs text-[#555555] hover:text-[#1A1A1A] hover:underline py-1"
              >
                {t("View Full Cart Page", "সম্পূর্ণ কার্ট পেজ দেখুন")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
