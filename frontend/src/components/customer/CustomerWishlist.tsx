import React from "react";
import { useStore } from "../../context/StoreContext";
import { Heart, ShoppingBag, Trash2, Star, Package } from "lucide-react";

export const CustomerWishlist: React.FC = () => {
  const { products, wishlist, toggleWishlist, addToCart, formatPrice, navigate, t } = useStore();

  const wishlisted = products.filter((p) => wishlist.includes(p.id));

  if (wishlisted.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t("My Wishlist", "পছন্দের তালিকা")}</h2>
          <p className="text-sm text-[#777777] mt-0.5">{t("Heritage pieces you'd love to own", "আপনার পছন্দের হেরিটেজ পিস")}</p>
        </div>
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-14 text-center shadow-sm">
          <Heart className="w-12 h-12 text-[#DDDDDD] mx-auto mb-4" />
          <div className="text-base font-semibold text-[#1A1A1A] mb-2">{t("Your wishlist is empty", "পছন্দের তালিকা খালি")}</div>
          <p className="text-sm text-[#777777] mb-5">
            {t("Tap the ♥ icon on any product to save it here for later.", "যেকোনো পণ্যে ♥ আইকন ট্যাপ করে এখানে সংরক্ষণ করুন।")}
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
          >
            {t("Explore Collection", "কালেকশন দেখুন")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t("My Wishlist", "পছন্দের তালিকা")}</h2>
          <p className="text-sm text-[#777777] mt-0.5">{wishlisted.length} {t("saved items", "সংরক্ষিত পণ্য")}</p>
        </div>
        <button
          onClick={() => navigate("/shop")}
          className="text-xs font-semibold text-[#555555] hover:text-[#1A1A1A] border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:border-[#1A1A1A] transition-all"
        >
          {t("Continue Shopping", "শপিং চালিয়ে যান")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlisted.map((product) => {
          const discountPct = product.compareAtPriceBDT
            ? Math.round(((product.compareAtPriceBDT - product.priceBDT) / product.compareAtPriceBDT) * 100)
            : 0;
          const isLowStock = product.stockQuantity <= product.lowStockAlert;

          return (
            <div
              key={product.id}
              className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#1A1A1A] transition-all group"
            >
              {/* Product Image */}
              <div
                onClick={() => navigate(`/product/${product.slug}`)}
                className="relative aspect-[4/5] bg-gray-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {discountPct > 0 && (
                  <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                    {discountPct}% OFF
                  </div>
                )}
                {isLowStock && (
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="bg-[#1A1A1A]/80 text-white text-[9px] px-2 py-0.5 rounded-sm backdrop-blur-sm">
                      {t(`Only ${product.stockQuantity} left`, `মাত্র ${product.stockQuantity}টি আছে`)}
                    </span>
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="text-[10px] text-[#888888] uppercase tracking-wider font-mono mb-0.5">
                  {t(product.subcategoryNameEn || product.categoryNameEn, product.subcategoryNameBn || product.categoryNameBn)}
                </div>
                <div
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-snug cursor-pointer hover:underline mb-1.5"
                >
                  {t(product.nameEn, product.nameBn)}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3 h-3 fill-[#1A1A1A] text-[#1A1A1A]" />
                  <span className="text-[10px] font-semibold">{product.rating}</span>
                  <span className="text-[10px] text-[#AAAAAA]">({product.reviewsCount})</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-sm font-bold text-[#1A1A1A]">{formatPrice(product.priceBDT)}</span>
                  {product.compareAtPriceBDT && (
                    <span className="text-[10px] text-[#AAAAAA] line-through font-mono">{formatPrice(product.compareAtPriceBDT)}</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => addToCart(product, product.variants[0])}
                    className="flex-1 flex items-center justify-center gap-1 bg-[#1A1A1A] text-white py-2 rounded-lg text-[11px] font-semibold hover:bg-black transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {t("Add to Bag", "ব্যাগে যোগ করুন")}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="w-8 h-8 flex items-center justify-center border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
