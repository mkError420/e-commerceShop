import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "./ProductCard";
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronDown, 
  Search,
  RotateCcw
} from "lucide-react";

export const ShopPage: React.FC = () => {
  const { products, categories, navigation, navigate, t, formatPrice } = useStore();

  // URL / State filter parameters
  const initialCategory = navigation.params?.category || "";
  const initialSubcategory = navigation.params?.subcategory || "";
  const initialQuery = navigation.params?.q || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategory);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFabric, setSelectedFabric] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(18000);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [localSearch, setLocalSearch] = useState<string>(initialQuery);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Available filter options
  const allSizes = ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "Free Size (12 Haat)", "40", "41", "42", "43"];
  const allFabrics = [
    "84-Count Pure Cotton Khadi",
    "100% Rajshahi Mulberry Silk",
    "Premium Cotton-Silk Blend (120 GSM)",
    "220 GSM 100% Supima Cotton Piqué",
    "Full-Grain Vegetable Tanned Leather",
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory && p.categorySlug !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory && p.subcategorySlug !== selectedSubcategory) {
        return false;
      }
      // Search query filter
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase().trim();
        const matchesName = p.nameEn.toLowerCase().includes(q) || p.nameBn.includes(q);
        const matchesTag = p.tags.some(t => t.toLowerCase().includes(q));
        const matchesFabric = p.fabricType.toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesFabric) return false;
      }
      // Price filter
      if (p.priceBDT > maxPrice) {
        return false;
      }
      // In-stock only filter
      if (inStockOnly && p.stockQuantity <= 0) {
        return false;
      }
      // Size filter
      if (selectedSize) {
        const hasSize = p.variants.some((v) => v.size?.includes(selectedSize));
        if (!hasSize) return false;
      }
      // Fabric filter
      if (selectedFabric && !p.fabricType.includes(selectedFabric)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low-high") return a.priceBDT - b.priceBDT;
      if (sortBy === "price-high-low") return b.priceBDT - a.priceBDT;
      if (sortBy === "rating") return b.rating - a.rating;
      // Default: newest
      return 0;
    });
  }, [products, selectedCategory, selectedSubcategory, localSearch, maxPrice, inStockOnly, selectedSize, selectedFabric, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedSize("");
    setSelectedFabric("");
    setInStockOnly(false);
    setMaxPrice(18000);
    setLocalSearch("");
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedSubcategory || selectedSize || selectedFabric || inStockOnly || maxPrice < 18000 || localSearch
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Editorial Catalog Header */}
      <div className="pb-6 mb-8 border-b border-[#E0E0E0] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-[#555555] uppercase tracking-wider font-mono">
            {t("Storefront Catalog", "প্রোডাক্ট ক্যাটালগ")}
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.nameEn || "Products"
              : t("All Curated Bangladeshi Products", "সকল বাংলাদেশী পোশাক ও সামগ্রী")}
          </h1>
          <p className="text-xs text-[#555555] mt-1">
            {t(
              `Showing ${filteredProducts.length} handcrafted items available in Dhaka hub`,
              `ঢাকা হাবে মোট ${filteredProducts.length}টি পণ্য রয়েছে`
            )}
          </p>
        </div>

        {/* Controls: Search, Sort, Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#F5F5F5] border border-[#E0E0E0] text-xs font-semibold text-[#1A1A1A] py-2 pl-3 pr-8 rounded focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              <option value="newest">{t("Sort: Featured & Newest", "ক্রমানুসার: নতুন")}</option>
              <option value="price-low-high">{t("Price: Low to High", "দাম: কম থেকে বেশি")}</option>
              <option value="price-high-low">{t("Price: High to Low", "দাম: বেশি থেকে কম")}</option>
              <option value="rating">{t("Highest Rated", "সর্বোচ্চ রেটিং")}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#555555] absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 bg-[#1A1A1A] text-white text-xs font-semibold py-2 px-3 rounded"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t("Filters", "ফিল্টার")}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Panel (Desktop) */}
        <aside className="hidden lg:block space-y-6 pr-4 border-r border-[#E0E0E0]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t("Filter Products", "ফিল্টারসমূহ")}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#555555] hover:text-[#1A1A1A] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t("Reset", "রিসেট")}</span>
              </button>
            )}
          </div>

          {/* Search Query within Catalog */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
              {t("Search Keyword", "শব্দ দিয়ে খুঁজুন")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Jamdani, Silk, Polo..."
                className="w-full text-xs bg-[#F5F5F5] border border-[#E0E0E0] rounded py-1.5 pl-7 pr-2 focus:outline-none focus:border-[#1A1A1A]"
              />
              <Search className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories & Subcategories Tree */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
              {t("Categories", "ক্যাটাগরি")}
            </label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                }}
                className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors flex items-center justify-between ${
                  !selectedCategory ? "bg-[#1A1A1A] text-white font-semibold" : "text-[#555555] hover:bg-[#F5F5F5]"
                }`}
              >
                <span>{t("All Categories", "সকল ক্যাটাগরি")}</span>
                <span>{products.length}</span>
              </button>

              {categories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setSelectedSubcategory("");
                    }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug && !selectedSubcategory
                        ? "bg-[#1A1A1A] text-white font-semibold"
                        : "text-[#1A1A1A] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    <span>{t(cat.nameEn, cat.nameBn)}</span>
                    <span className="text-[11px] text-[#777777]">
                      {products.filter((p) => p.categorySlug === cat.slug).length}
                    </span>
                  </button>

                  {/* Subcategories */}
                  {cat.subcategories && cat.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setSelectedSubcategory(sub.slug);
                      }}
                      className={`w-full text-left text-xs py-1 pl-6 pr-2 rounded transition-colors flex items-center justify-between ${
                        selectedSubcategory === sub.slug
                          ? "bg-[#E5E5E5] text-[#1A1A1A] font-bold"
                          : "text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]"
                      }`}
                    >
                      <span>• {t(sub.nameEn, sub.nameBn)}</span>
                      <span className="text-[10px] text-[#777777]">
                        {products.filter((p) => p.subcategorySlug === sub.slug).length}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[#1A1A1A]">{t("Max Price (BDT)", "সর্বোচ্চ মূল্য")}</span>
              <span className="font-mono font-bold text-[#1A1A1A]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={18000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1A1A1A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#555555] font-mono mt-1">
              <span>{formatPrice(1000)}</span>
              <span>{formatPrice(18000)}</span>
            </div>
          </div>

          {/* Sizes Chips */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
              {t("Sizes", "সাইজ")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    selectedSize === size
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] font-semibold"
                      : "bg-white text-[#1A1A1A] border-[#E0E0E0] hover:border-[#1A1A1A]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Checkbox */}
          <div className="pt-2 border-t border-[#E0E0E0]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#1A1A1A] rounded"
              />
              <span className="text-xs font-medium text-[#1A1A1A]">
                {t("In-Stock in Dhaka Hub Only", "শুধুমাত্র ঢাকা হাবে ইন-স্টক")}
              </span>
            </label>
          </div>
        </aside>

        {/* Right Content Area: Product Grid */}
        <main className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#F5F5F5] rounded-xl p-8 border border-[#E0E0E0]">
              <h3 className="font-editorial text-xl font-bold text-[#1A1A1A]">
                {t("No products matched your active filters", "কোনো পণ্য পাওয়া যায়নি")}
              </h3>
              <p className="text-xs text-[#555555] mt-2 max-w-sm mx-auto">
                {t(
                  "Try clearing search keywords or raising the price slider to discover our full collection.",
                  "ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।"
                )}
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-2.5 rounded hover:bg-black transition-colors"
              >
                {t("Reset All Filters", "সকল ফিল্টার রিসেট করুন")}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-80 max-w-[85vw] bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <span className="font-semibold text-sm text-[#1A1A1A]">Filters</span>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1">
                <X className="w-5 h-5 text-[#1A1A1A]" />
              </button>
            </div>

            {/* Mobile Filter Controls */}
            <div>
              <label className="text-xs font-semibold block mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.nameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2">
                Max Price: {formatPrice(maxPrice)}
              </label>
              <input
                type="range"
                min={1000}
                max={18000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            <div className="pt-4 border-t border-[#E0E0E0] flex gap-2">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold border border-[#1A1A1A] rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold bg-[#1A1A1A] text-white rounded"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
