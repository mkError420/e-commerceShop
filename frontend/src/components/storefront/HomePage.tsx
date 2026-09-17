import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "./ProductCard";
import { 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { products, categories, banners, navigate, t, formatPrice } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamically maintain banners from Admin Dashboard
  const activeBanners = useMemo(() => {
    const active = banners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    return active.length > 0 ? active : banners;
  }, [banners]);

  // Ensure currentSlide is within bounds
  useEffect(() => {
    if (currentSlide >= activeBanners.length) {
      setCurrentSlide(0);
    }
  }, [activeBanners.length, currentSlide]);

  // Auto carousel slide interval (6 seconds)
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const featuredProducts = products.filter((p) => p.isFeatured);
  const flashDeals = products.filter((p) => p.isFlashDeal);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Dynamic Editorial Hero Carousel (Managed from Admin Dashboard) */}
      <section className="relative w-full h-[520px] sm:h-[620px] bg-[#1A1A1A] overflow-hidden">
        {activeBanners.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Dark Vignette Overlay */}
            <img
              src={slide.bgImage}
              alt={slide.titleEn}
              className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-10000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

            {/* Slide Content */}
            <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-start text-white">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                {slide.tag}
              </span>

              <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight max-w-2xl leading-tight">
                {t(slide.titleEn, slide.titleBn)}
              </h1>

              <p className="text-sm sm:text-lg text-[#E5E5E5] mt-4 max-w-xl font-light leading-relaxed">
                {t(slide.subtitleEn, slide.subtitleBn)}
              </p>

              <div className="mt-8 flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate(slide.link)}
                  className="bg-white text-[#1A1A1A] font-semibold text-sm px-6 py-3.5 rounded hover:bg-[#F5F5F5] transition-all flex items-center gap-2 shadow-lg active:scale-95"
                >
                  <span>{t(slide.ctaEn, slide.ctaBn)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(slide.secondaryLink || "/shop")}
                  className="bg-transparent text-white border border-white/40 hover:border-white font-medium text-sm px-6 py-3.5 rounded transition-all"
                >
                  {t(slide.secondaryCtaEn || "Browse All", slide.secondaryCtaBn || "সব কালেকশন")}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 left-6 sm:left-12 z-20 flex items-center gap-2">
            {activeBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "w-8 bg-yellow-400" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Carousel Controls */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* 2. Category Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[#E0E0E0] gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#555555] font-mono">
              Curated Collections
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
              {t("Explore by Category", "ক্যাটাগরি ভিত্তিক কেনাকাটা")}
            </h2>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="text-xs font-semibold text-[#1A1A1A] hover:underline flex items-center gap-1"
          >
            <span>{t("View All Collections", "সকল কালেকশন দেখুন")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group relative h-80 rounded-lg overflow-hidden cursor-pointer border border-[#E0E0E0] shadow-sm"
            >
              <img
                src={cat.image}
                alt={cat.nameEn}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-5 text-white w-full">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#E5E5E5]">
                  {cat.subcategories ? `${cat.subcategories.length} Subcategories` : "Artisanal"}
                </span>
                <h3 className="font-editorial text-xl font-bold mt-1 text-white">
                  {t(cat.nameEn, cat.nameBn)}
                </h3>
                <p className="text-xs text-[#CCCCCC] mt-1 line-clamp-1">
                  {t(cat.descriptionEn, cat.descriptionBn)}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium mt-3 text-white group-hover:underline">
                  <span>{t("Explore Category", "ক্যাটাগরি দেখুন")}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Flash Deals & Limited Hub Stock */}
      {flashDeals.length > 0 && (
        <section className="bg-[#F5F5F5] py-14 border-y border-[#E0E0E0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">
                    {t("Limited Hub Flash Deals", "সীমিত সময়ের বিশেষ অফার")}
                  </h2>
                  <p className="text-xs text-[#555555]">
                    {t("Direct weaver pieces with limited Dhaka hub stock.", "ঢাকা হাবে সংরক্ষিত বিশেষ হস্তশিল্প।")}
                  </p>
                </div>
              </div>

              {/* Countdown badge simulation */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-[#E0E0E0] text-xs font-mono text-[#1A1A1A]">
                <Clock className="w-4 h-4 text-[#555555]" />
                <span className="font-semibold">Ends in: 14h 28m 05s</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {flashDeals.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Bangladeshi Heritage Masterpieces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-[#E0E0E0] gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#555555] font-mono">
              Artisan Spotlight
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
              {t("Featured Heritage Products", "বাছাইকৃত ঐতিহ্যবাহী পোশাক")}
            </h2>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="text-xs font-semibold text-[#1A1A1A] hover:underline flex items-center gap-1"
          >
            <span>{t("View All Products", "সকল পণ্য দেখুন")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Editorial Heritage Narrative Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#1A1A1A] text-white rounded-xl p-8 sm:p-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#999999] border-b border-[#333333] pb-1 inline-block">
              Since 1984 • Dhaka Weaving Atelier
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold leading-tight">
              {t(
                "Preserving the 500-Year Dhakai Jamdani Heritage",
                "৫০০ বছরের ঢাকাই জামদানি ঐতিহ্যের সংরক্ষণ"
              )}
            </h2>
            <p className="text-sm text-[#CCCCCC] leading-relaxed">
              {t(
                "Jamdani is declared an Intangible Cultural Heritage of Humanity by UNESCO. We work directly with over 140 generational weaving families in Rupganj, Narayanganj, ensuring fair artisan compensation, 84-count pure khadi cotton thread, and authentic geometric jaal patterns.",
                "ইউনেস্কো স্বীকৃত ঢাকাই জামদানি আমাদের অহংকার। নারায়ণগঞ্জের রূপগঞ্জের তাঁতি পরিবারের নিখুঁত হস্তশিল্পকে আমরা পৌঁছে দিচ্ছি সরাসরি আপনার ঘরে।"
              )}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/category/jamdani-silk-sarees")}
                className="bg-white text-[#1A1A1A] px-6 py-3 rounded text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
              >
                {t("Shop Dhakai Jamdani", "ঢাকাই জামদানি কিনুন")}
              </button>
              <button
                onClick={() => navigate("/category/panjabi")}
                className="border border-[#555555] text-white px-6 py-3 rounded text-xs font-semibold hover:border-white transition-colors"
              >
                {t("Men's Handloom Panjabi", "হ্যান্ডলুম পাঞ্জাবি")}
              </button>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#333333]">
            <img
              src="https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg"
              alt="Jamdani Weaving Loom"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-black/80 px-3 py-1 rounded text-[11px] font-mono text-[#E5E5E5]">
              Rupganj, Narayanganj
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
