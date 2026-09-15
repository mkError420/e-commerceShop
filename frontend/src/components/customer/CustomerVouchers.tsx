import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Tag, Copy, CheckCircle2, Trophy, Zap } from "lucide-react";

const TIER_POINTS: Record<string, { min: number; max: number; benefit: string }> = {
  Bronze:   { min: 0,    max: 500,   benefit: "5% loyalty discount on next order" },
  Silver:   { min: 500,  max: 1000,  benefit: "8% loyalty discount + Free gift packaging" },
  Gold:     { min: 1000, max: 2500,  benefit: "12% loyalty discount + Priority courier" },
  Platinum: { min: 2500, max: 9999,  benefit: "20% loyalty discount + Free express shipping + Dedicated concierge" },
};

export const CustomerVouchers: React.FC = () => {
  const { coupons, currentUser, t } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!currentUser) return null;

  const activeCoupons = coupons.filter((c) => c.isActive);
  const tierInfo = TIER_POINTS[currentUser.loyaltyTier] || TIER_POINTS.Bronze;
  const nextTier = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum", Platinum: "Platinum" }[currentUser.loyaltyTier] || "Platinum";
  const progress = Math.min((currentUser.loyaltyPoints / tierInfo.max) * 100, 100);
  const ptsToNext = Math.max(0, tierInfo.max - currentUser.loyaltyPoints);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{t("Vouchers & Rewards", "ভাউচার ও পুরস্কার")}</h2>
        <p className="text-sm text-[#777777] mt-0.5">{t("Exclusive discount codes and your loyalty progress", "এক্সক্লুসিভ ডিসকাউন্ট কোড ও লয়্যালটি অগ্রগতি")}</p>
      </div>

      {/* Loyalty Tier Card */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A] text-white rounded-2xl p-5 shadow-xl mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Loyalty Tier</div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <div className="text-xl font-bold text-yellow-300">{currentUser.loyaltyTier}</div>
              </div>
              <div className="text-xs text-white/60 mt-0.5">{tierInfo.benefit}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{currentUser.loyaltyPoints.toLocaleString()}</div>
              <div className="text-xs text-white/50">points</div>
            </div>
          </div>

          {currentUser.loyaltyTier !== "Platinum" && (
            <>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40">
                <span>{currentUser.loyaltyPoints} pts</span>
                <span>{ptsToNext} pts to {nextTier} tier</span>
              </div>
            </>
          )}
          {currentUser.loyaltyTier === "Platinum" && (
            <div className="text-xs text-yellow-300/80">💎 Maximum tier achieved — enjoy all exclusive benefits!</div>
          )}

          {/* Tier benefits breakdown */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Tier Benefits</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TIER_POINTS).map(([tier, info]) => {
                const isActive = tier === currentUser.loyaltyTier;
                const isPast = ["Bronze", "Silver", "Gold", "Platinum"].indexOf(tier) <= ["Bronze", "Silver", "Gold", "Platinum"].indexOf(currentUser.loyaltyTier);
                return (
                  <div key={tier} className={`rounded-lg px-2.5 py-1.5 ${isActive ? "bg-yellow-300/20 border border-yellow-300/30" : isPast ? "bg-white/5" : "bg-white/5 opacity-40"}`}>
                    <div className={`text-[10px] font-bold ${isActive ? "text-yellow-300" : "text-white/70"}`}>{tier} {isActive ? "← You" : isPast ? "✓" : ""}</div>
                    <div className="text-[9px] text-white/40">{info.min}–{info.max} pts</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Points Conversion Guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <div className="text-xs font-bold text-amber-800">{t("Points Earning Guide", "পয়েন্ট অর্জনের গাইড")}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-amber-700">
          <div className="bg-white rounded-lg px-2.5 py-1.5 border border-amber-100">
            <div className="font-bold">৳100 spent</div>
            <div className="text-amber-500">= 10 points</div>
          </div>
          <div className="bg-white rounded-lg px-2.5 py-1.5 border border-amber-100">
            <div className="font-bold">Write a review</div>
            <div className="text-amber-500">= 25 points</div>
          </div>
          <div className="bg-white rounded-lg px-2.5 py-1.5 border border-amber-100">
            <div className="font-bold">100 points</div>
            <div className="text-amber-500">= ৳10 voucher</div>
          </div>
        </div>
      </div>

      {/* Active Coupons */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-[#1A1A1A]" />
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">{t("Available Vouchers", "উপলব্ধ ভাউচার")} ({activeCoupons.length})</h3>
        </div>

        {activeCoupons.length === 0 ? (
          <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 text-center">
            <Tag className="w-8 h-8 text-[#DDDDDD] mx-auto mb-2" />
            <div className="text-sm text-[#888888]">{t("No active vouchers available", "কোনো সক্রিয় ভাউচার নেই")}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCoupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              const discountText = coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `৳${coupon.value} OFF`;
              return (
                <div key={coupon.code} className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex">
                    {/* Left Colored Strip */}
                    <div className="w-2 bg-gradient-to-b from-[#1A1A1A] to-[#444444] flex-shrink-0" />

                    {/* Coupon Body */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-lg font-bold text-[#1A1A1A] font-mono tracking-wide">{coupon.code}</span>
                            <span className="bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {discountText}
                            </span>
                          </div>
                          <div className="text-xs text-[#555555]">{coupon.description}</div>
                          {coupon.minSpendBDT > 0 && (
                            <div className="text-[10px] text-[#AAAAAA] mt-1">
                              Min. spend: ৳{coupon.minSpendBDT.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                            isCopied
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-[#F5F5F5] text-[#1A1A1A] border border-[#E0E0E0] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A]"
                          }`}
                        >
                          {isCopied ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> Copy</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Dashed divider + right stub */}
                    <div className="flex flex-col justify-center px-2 border-l border-dashed border-[#E0E0E0]">
                      <div className="text-center">
                        <div className="text-[10px] font-mono font-bold text-[#1A1A1A] writing-mode-vertical whitespace-nowrap" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
                          BENGAL EDITION
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
