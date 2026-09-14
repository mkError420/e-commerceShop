import React, { useState } from "react";
import { Product } from "../../types";
import { useStore } from "../../context/StoreContext";
import { ShoppingBag, Star, Eye } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, formatPrice, addToCart, t } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = isHovered && product.images.length > 1 ? product.images[1] : product.images[0];

  return (
    <div 
      className="group flex flex-col bg-white border border-[#E0E0E0] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#1A1A1A]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div 
        onClick={() => navigate(`/product/${product.slug}`)}
        className="relative w-full aspect-[4/5] bg-[#F5F5F5] overflow-hidden cursor-pointer"
      >
        <img
          src={displayImage}
          alt={product.nameEn}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFlashDeal && (
            <span className="bg-[#1A1A1A] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
              {t("Flash Deal", "ফ্ল্যাশ ডিল")}
            </span>
          )}
          {product.compareAtPriceBDT && product.compareAtPriceBDT > product.priceBDT && (
            <span className="bg-white text-[#1A1A1A] border border-[#1A1A1A] text-[10px] font-semibold px-2 py-0.5 rounded-sm">
              {Math.round(((product.compareAtPriceBDT - product.priceBDT) / product.compareAtPriceBDT) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Stock Alert Badge */}
        {product.stockQuantity <= product.lowStockAlert && (
          <div className="absolute bottom-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-sm">
            {t(`Only ${product.stockQuantity} left in Dhaka Hub`, `ঢাকা হাবে মাত্র ${product.stockQuantity}টি আছে`)}
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white text-[#1A1A1A] text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {t("View Details", "বিস্তারিত দেখুন")}
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Fabric Subtitle */}
          <div className="flex items-center justify-between text-[11px] text-[#555555] mb-1">
            <span className="uppercase tracking-wider font-mono">
              {t(product.subcategoryNameEn || product.categoryNameEn, product.subcategoryNameBn || product.categoryNameBn)}
            </span>
            <div className="flex items-center gap-1 text-[#1A1A1A]">
              <Star className="w-3 h-3 fill-[#1A1A1A]" />
              <span className="font-semibold text-xs">{product.rating}</span>
              <span className="text-[#777777]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => navigate(`/product/${product.slug}`)}
            className="text-sm font-semibold text-[#1A1A1A] hover:underline cursor-pointer line-clamp-2 leading-snug"
          >
            {t(product.nameEn, product.nameBn)}
          </h3>

          {/* Craftsmanship Note */}
          <p className="text-[11px] text-[#555555] mt-1 line-clamp-1 italic">
            {product.craftsmanship}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#F5F5F5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#1A1A1A] font-sans">
              {formatPrice(product.priceBDT)}
            </span>
            {product.compareAtPriceBDT && (
              <span className="text-xs text-[#888888] line-through font-mono">
                {formatPrice(product.compareAtPriceBDT)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, product.variants[0])}
            className="p-2 rounded bg-[#1A1A1A] text-white hover:bg-black transition-colors"
            title={t("Add to Shopping Bag", "ব্যাগে যোগ করুন")}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
