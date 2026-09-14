import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "./ProductCard";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  slug: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug }) => {
  const { categories, products, navigate, t } = useStore();

  // Find category or subcategory
  const categoryMatch = useMemo(() => {
    // 1. Check if slug matches a root category
    const root = categories.find((c) => c.slug === slug);
    if (root) {
      return { category: root, subcategory: null };
    }

    // 2. Check if slug matches a subcategory
    for (const cat of categories) {
      const sub = cat.subcategories?.find((s) => s.slug === slug);
      if (sub) {
        return { category: cat, subcategory: sub };
      }
    }

    return null;
  }, [categories, slug]);

  const activeCategory = categoryMatch?.category;
  const activeSubcategory = categoryMatch?.subcategory;

  // Filter products belonging to this category or subcategory
  const categoryProducts = useMemo(() => {
    if (activeSubcategory) {
      return products.filter((p) => p.subcategorySlug === activeSubcategory.slug);
    }
    if (activeCategory) {
      return products.filter((p) => p.categorySlug === activeCategory.slug);
    }
    return [];
  }, [products, activeCategory, activeSubcategory]);

  if (!categoryMatch) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">Category Not Found</h2>
        <p className="text-xs text-[#555555] mt-2">The category requested does not exist or has moved.</p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-6 inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-2.5 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#555555]">
        <button onClick={() => navigate("/")} className="hover:text-[#1A1A1A] transition-colors">
          {t("Home", "হোম")}
        </button>
        <ChevronRight className="w-3 h-3 text-[#999999]" />
        
        {activeSubcategory ? (
          <>
            <button 
              onClick={() => navigate(`/category/${activeCategory?.slug}`)} 
              className="hover:text-[#1A1A1A] transition-colors"
            >
              {t(activeCategory?.nameEn || "", activeCategory?.nameBn)}
            </button>
            <ChevronRight className="w-3 h-3 text-[#999999]" />
            <span className="font-semibold text-[#1A1A1A]">
              {t(activeSubcategory.nameEn, activeSubcategory.nameBn)}
            </span>
          </>
        ) : (
          <span className="font-semibold text-[#1A1A1A]">
            {t(activeCategory?.nameEn || "", activeCategory?.nameBn)}
          </span>
        )}
      </nav>

      {/* Category Hero Banner */}
      <div className="relative rounded-xl overflow-hidden bg-[#1A1A1A] text-white p-8 sm:p-12 border border-[#333333]">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#999999]">
            {activeSubcategory ? "Specialized Collection" : "Master Category"}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold">
            {activeSubcategory
              ? t(activeSubcategory.nameEn, activeSubcategory.nameBn)
              : t(activeCategory?.nameEn || "", activeCategory?.nameBn)}
          </h1>
          <p className="text-sm text-[#CCCCCC] leading-relaxed">
            {activeSubcategory
              ? t(activeSubcategory.descriptionEn, activeSubcategory.descriptionBn)
              : t(activeCategory?.descriptionEn || "", activeCategory?.descriptionBn)}
          </p>
        </div>
      </div>

      {/* Subcategory Pills Bar (if looking at root category) */}
      {activeCategory?.subcategories && (
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#E0E0E0]">
          <button
            onClick={() => navigate(`/category/${activeCategory.slug}`)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              !activeSubcategory
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E5E5]"
            }`}
          >
            {t("All", "সব")} {t(activeCategory.nameEn, activeCategory.nameBn)} ({products.filter(p => p.categorySlug === activeCategory.slug).length})
          </button>

          {activeCategory.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => navigate(`/category/${sub.slug}`)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeSubcategory?.slug === sub.slug
                  ? "bg-[#1A1A1A] text-white font-semibold"
                  : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E5E5]"
              }`}
            >
              {t(sub.nameEn, sub.nameBn)}
            </button>
          ))}
        </div>
      )}

      {/* Product List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs text-[#555555]">
            {categoryProducts.length} {t("pieces found in stock", "টি পণ্য পাওয়া গেছে")}
          </p>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#F5F5F5] rounded-lg p-8 border border-[#E0E0E0]">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {t("No products currently in stock for this subcategory", "এই সাবক্যাটাগরির পণ্য বর্তমানে স্টক শেষ")}
            </p>
            <p className="text-xs text-[#555555] mt-1">
              {t("Our weavers are working on the next loom batch.", "পরবর্তী ব্যাচ দ্রুত যুক্ত করা হবে।")}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="mt-4 bg-[#1A1A1A] text-white text-xs px-4 py-2 rounded"
            >
              {t("Explore Other Collections", "অন্যান্য কালেকশন দেখুন")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
