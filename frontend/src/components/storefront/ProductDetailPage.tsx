import React, { useState } from "react";
import { Product, ProductVariant } from "../../types";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "./ProductCard";
import { 
  ShoppingBag, 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  Share2, 
  Heart,
  Sparkles,
  Camera,
  MessageSquare
} from "lucide-react";

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { products, addToCart, navigate, formatPrice, t, showToast } = useStore();

  const product = products.find((p) => p.slug === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "craftsmanship" | "reviews">("details");
  const [userReviewText, setUserReviewText] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">Product Not Found</h2>
        <p className="text-xs text-[#555555] mt-2">The product you are looking for is unavailable.</p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-6 bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-2.5 rounded"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const currentPriceBDT = product.priceBDT + (selectedVariant?.priceAdjustmentBDT || 0);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;

    product.reviews.unshift({
      id: `rev-${Date.now()}`,
      author: "Verified Shopper (Dhaka)",
      rating: userRating,
      date: "Just now",
      comment: userReviewText.trim(),
      isVerified: true,
    });
    product.reviewsCount += 1;
    setUserReviewText("");
    showToast(t("Review submitted successfully!", "আপনার রিভিউ জমা নেওয়া হয়েছে!"));
  };

  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#555555]">
        <button onClick={() => navigate("/")} className="hover:text-[#1A1A1A]">
          {t("Home", "হোম")}
        </button>
        <ChevronRight className="w-3 h-3 text-[#999999]" />
        <button onClick={() => navigate("/shop")} className="hover:text-[#1A1A1A]">
          {t("Shop", "শপ")}
        </button>
        <ChevronRight className="w-3 h-3 text-[#999999]" />
        <button 
          onClick={() => navigate(`/category/${product.categorySlug}`)}
          className="hover:text-[#1A1A1A]"
        >
          {t(product.categoryNameEn, product.categoryNameBn)}
        </button>
        {product.subcategorySlug && (
          <>
            <ChevronRight className="w-3 h-3 text-[#999999]" />
            <button 
              onClick={() => navigate(`/category/${product.subcategorySlug}`)}
              className="hover:text-[#1A1A1A]"
            >
              {t(product.subcategoryNameEn || "", product.subcategoryNameBn)}
            </button>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-[#999999]" />
        <span className="font-semibold text-[#1A1A1A] truncate max-w-xs">
          {t(product.nameEn, product.nameBn)}
        </span>
      </nav>

      {/* 2. Main PDP Grid (Gallery + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Multi-Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded overflow-hidden border-2 transition-all shrink-0 ${
                  activeImageIndex === idx ? "border-[#1A1A1A] opacity-100 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="relative flex-1 aspect-[4/5] bg-[#F5F5F5] rounded-lg overflow-hidden border border-[#E0E0E0]">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.nameEn}
              className="w-full h-full object-cover"
            />
            {product.isFlashDeal && (
              <span className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded">
                Flash Deal
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded font-mono">
              Hover to Zoom
            </div>
          </div>
        </div>

        {/* Right Column: Product Meta, Variants, & Purchase */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#555555]">
              SKU: {product.sku}
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1 leading-snug">
              {t(product.nameEn, product.nameBn)}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex items-center text-[#1A1A1A]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-[#1A1A1A]" : "text-[#CCCCCC]"}`} 
                  />
                ))}
              </div>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-[#555555]">({product.reviewsCount} {t("reviews", "রিভিউ")})</span>
              <span className="text-[#999999]">•</span>
              <span className="text-emerald-700 font-medium">100% Verified Buyers</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-[#1A1A1A] font-sans">
                {formatPrice(currentPriceBDT)}
              </span>
              {product.compareAtPriceBDT && (
                <span className="text-sm text-[#777777] line-through ml-2.5 font-mono">
                  {formatPrice(product.compareAtPriceBDT)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {t(`In Stock (${product.stockQuantity} in Dhaka Hub)`, `ইন-স্টক (ঢাকা হাবে ${product.stockQuantity}টি)`)}
              </span>
            </div>
          </div>

          {/* Variant Selectors (Sizes, Fabrics, Colors) */}
          {product.variants.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[#E0E0E0]">
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
                  {t("Select Variant / Size", "ভ্যারিয়েন্ট / সাইজ নির্বাচন করুন")}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-3 py-2 rounded border transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A] font-semibold shadow-sm"
                            : "bg-white text-[#1A1A1A] border-[#E0E0E0] hover:border-[#1A1A1A]"
                        }`}
                      >
                        {v.colorHex && (
                          <span 
                            className="w-3 h-3 rounded-full border border-black/20 shrink-0" 
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        <span>{v.title}</span>
                        {v.priceAdjustmentBDT > 0 && (
                          <span className="text-[10px] opacity-80">
                            (+{formatPrice(v.priceAdjustmentBDT)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Bag Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E0E0E0] rounded bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-10 flex items-center justify-center text-sm font-semibold hover:bg-[#F5F5F5] transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-10 flex items-center justify-center text-sm font-semibold hover:bg-[#F5F5F5] transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, selectedVariant, quantity)}
                className="flex-1 bg-[#1A1A1A] text-white text-xs font-semibold py-3 px-6 rounded hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t("Add to Shopping Bag", "ব্যাগে যোগ করুন")}</span>
              </button>

              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  showToast(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className={`w-10 h-10 border rounded flex items-center justify-center transition-colors ${
                  isWishlisted ? "border-rose-500 text-rose-500 bg-rose-50" : "border-[#E0E0E0] text-[#555555] hover:border-[#1A1A1A]"
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            {/* Direct Buy Now (Instant Checkout) */}
            <button
              onClick={() => {
                addToCart(product, selectedVariant, quantity);
                navigate("/checkout");
              }}
              className="w-full bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] text-xs font-bold py-3 px-6 rounded hover:bg-[#F5F5F5] transition-colors"
            >
              {t("Buy Now (Fast BD Checkout)", "সরাসরি কিনুন (দ্রুত চেকআউট)")}
            </button>
          </div>

          {/* Bangladeshi Local Shipping Guarantee Callout */}
          <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg space-y-2.5 text-xs text-[#555555]">
            <div className="flex items-center gap-2 text-[#1A1A1A] font-semibold">
              <Truck className="w-4 h-4" />
              <span>{t("Local Shipping Estimator", "ডেলিভারি তথ্য")}</span>
            </div>
            <p className="flex items-center justify-between">
              <span>{t("Inside Dhaka City (Tejgaon Hub)", "ঢাকা সিটি (তেজগাঁও হাব)")}:</span>
              <span className="font-mono font-bold text-[#1A1A1A]">৳60 • 24-48 Hours</span>
            </p>
            <p className="flex items-center justify-between">
              <span>{t("Outside Dhaka (All 63 Districts)", "ঢাকার বাইরে (সারাদেশে)")}:</span>
              <span className="font-mono font-bold text-[#1A1A1A]">৳130 • 3-5 Days</span>
            </p>
            <p className="pt-2 border-t border-[#F0F0F0] text-[11px] text-[#777777] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("Cash on Delivery (COD) & bKash available at checkout", "ক্যাশ অন ডেলিভারি ও বিকাশ গ্রহণ করা হয়")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Detailed Tabs: Specification, Heritage Weaving, Customer Reviews */}
      <div className="pt-8 border-t border-[#E0E0E0]">
        <div className="flex border-b border-[#E0E0E0] gap-8 text-sm">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "details"
                ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A]"
                : "text-[#777777] hover:text-[#1A1A1A]"
            }`}
          >
            {t("Product Description & Specs", "পণ্যের বিবরণ ও স্পেসিফিকেশন")}
          </button>
          <button
            onClick={() => setActiveTab("craftsmanship")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "craftsmanship"
                ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A]"
                : "text-[#777777] hover:text-[#1A1A1A]"
            }`}
          >
            {t("Handloom Heritage & Craft", "তাঁতশিল্পের ঐতিহ্য")}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-semibold transition-colors relative ${
              activeTab === "reviews"
                ? "text-[#1A1A1A] border-b-2 border-[#1A1A1A]"
                : "text-[#777777] hover:text-[#1A1A1A]"
            }`}
          >
            {t("Customer Reviews", "গ্রাহক মতামত")} ({product.reviews.length})
          </button>
        </div>

        <div className="py-6">
          {activeTab === "details" && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-[#444444] leading-relaxed">
              <p>{t(product.descriptionEn, product.descriptionBn)}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E5E5] text-xs">
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Fabric Material:</span>
                  <span>{product.fabricType}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Craftsmanship Origin:</span>
                  <span>{product.craftsmanship}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Care Instructions:</span>
                  <span>Dry clean only for handloom silks; mild liquid detergent for khadi.</span>
                </div>
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Dispatch Hub:</span>
                  <span>Dhaka Central Logistics Warehouse</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "craftsmanship" && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-[#444444] leading-relaxed">
              <h4 className="font-editorial text-lg font-bold text-[#1A1A1A]">
                {product.craftsmanship}
              </h4>
              <p>
                Each thread in this piece is meticulously prepared using traditional wooden pit looms or hand-spinning wheels in rural Bangladeshi artisan clusters. We uphold strict fair-wage ethics, guaranteeing artisans receive 40% above prevailing master-weaver rates.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8 max-w-3xl">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A1A1A]">{rev.author}</span>
                        {rev.isVerified && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[#888888] font-mono">{rev.date}</span>
                    </div>

                    <div className="flex items-center text-[#1A1A1A]">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < rev.rating ? "fill-[#1A1A1A]" : "text-[#CCCCCC]"}`} 
                        />
                      ))}
                    </div>

                    <p className="text-xs text-[#444444]">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add New Review Form */}
              <form onSubmit={handleReviewSubmit} className="p-5 bg-white border border-[#E0E0E0] rounded-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  {t("Leave a Verified Buyer Review", "আপনার মতামত দিন")}
                </h4>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#555555]">{t("Rating", "রেটিং")}:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1"
                      >
                        <Star 
                          className={`w-4 h-4 ${star <= userRating ? "fill-[#1A1A1A] text-[#1A1A1A]" : "text-[#CCCCCC]"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  placeholder={t("Write your feedback on fit, fabric texture, and Dhaka delivery...", "ফিটিং ও কাপড়ের মান সম্পর্কে মতামত লিখুন...")}
                  className="w-full text-xs p-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                  required
                />

                <button
                  type="submit"
                  className="bg-[#1A1A1A] text-white text-xs font-semibold px-5 py-2.5 rounded hover:bg-black transition-colors"
                >
                  {t("Submit Review", "রিভিউ জমা দিন")}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 4. Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-[#E0E0E0]">
          <h3 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-6">
            {t("Related Bangladeshi Collections", "অনুরূপ কালেকশন")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Sticky Mobile Buy Now Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E0E0] p-3 px-4 flex items-center justify-between gap-3 sm:hidden shadow-lg">
        <div>
          <span className="text-xs text-[#555555] block">Price</span>
          <span className="text-sm font-bold text-[#1A1A1A] font-sans">
            {formatPrice(currentPriceBDT)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addToCart(product, selectedVariant, quantity)}
            className="bg-[#F5F5F5] text-[#1A1A1A] border border-[#1A1A1A] text-xs font-semibold px-4 py-2.5 rounded"
          >
            {t("Bag", "ব্যাগ")}
          </button>
          <button
            onClick={() => {
              addToCart(product, selectedVariant, quantity);
              navigate("/checkout");
            }}
            className="bg-[#1A1A1A] text-white text-xs font-semibold px-5 py-2.5 rounded"
          >
            {t("Buy Now", "কিনুন")}
          </button>
        </div>
      </div>
    </div>
  );
};
