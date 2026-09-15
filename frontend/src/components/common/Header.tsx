import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShoppingBag,
  Search,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  Package,
  Phone,
  HelpCircle,
  Truck
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    navigation,
    navigate,
    language,
    setLanguage,
    t,
    cartCount,
    setIsCartDrawerOpen,
    categories,
    searchQuery,
    setSearchQuery,
    products,
    currentUser,
  } = useStore();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({
    "womens-fashion": true,
    "mens-fashion": true
  });
  const [isDesktopSearchActive, setIsDesktopSearchActive] = useState(false);

  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Focus mobile input when search is opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
    }
  }, [isMobileSearchOpen]);

  // Quick live search matching
  const searchResults = searchQuery.trim()
    ? products.filter((p) =>
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameBn.includes(searchQuery) ||
      p.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsDesktopSearchActive(false);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/shop", { q: searchQuery.trim() });
    }
  };

  const toggleMobileCategory = (catSlug: string) => {
    setExpandedMobileCategories(prev => ({
      ...prev,
      [catSlug]: !prev[catSlug]
    }));
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E0E0E0] select-none">
      {/* 1. Editorial Top Bar */}
      <div className="bg-[#1A1A1A] text-[#F5F5F5] text-xs py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-end">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#2A2A2A] rounded p-0.5 border border-[#444444]">
            <button
              onClick={() => setLanguage("en")}
              className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded transition-colors ${language === "en"
                ? "bg-white text-[#1A1A1A] font-bold"
                : "text-[#CCCCCC] hover:text-white"
                }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium rounded transition-colors ${language === "bn"
                ? "bg-white text-[#1A1A1A] font-bold"
                : "text-[#CCCCCC] hover:text-white"
                }`}
              aria-label="Switch to Bengali"
            >
              বাং
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 flex-nowrap">
        {/* Left Side: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile menu button (min 44x44px touch target) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-1 text-[#1A1A1A] hover:bg-[#F5F5F5] active:bg-[#EAEAEA] rounded-md transition-colors flex items-center justify-center"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo - Monochromatic Editorial Typographic Identity */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex flex-col group py-1 select-none"
          >
            <div className="flex items-center whitespace-nowrap">
              <span className="font-editorial text-xl sm:text-2xl lg:text-3xl tracking-tight text-[#1A1A1A] font-semibold leading-none group-hover:opacity-85 transition-opacity">
                BENGAL
              </span>
              <span className="font-sans font-light text-[10px] sm:text-xs tracking-widest uppercase border border-[#1A1A1A] px-1 py-0.5 ml-1.5 rounded-xs leading-none">
                EDITION
              </span>
            </div>
            <span className="hidden xs:inline-block text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-[#555555] uppercase font-mono mt-0.5 whitespace-nowrap">
              DHAKA • HERITAGE ATELIER
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links & Mega Menu (Strict single-row, no wrapping) */}
        <nav className="hidden lg:flex items-center flex-nowrap shrink-0 gap-2.5 xl:gap-5 2xl:gap-6 text-xs xl:text-sm font-medium text-[#1A1A1A] whitespace-nowrap">
          {/* All Categories Mega Menu Dropdown */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button
              className={`flex items-center gap-1.5 py-2 px-2 rounded whitespace-nowrap transition-colors ${isMegaMenuOpen ? "bg-[#F5F5F5] text-[#1A1A1A]" : "hover:text-[#555555]"
                }`}
            >
              <span className="font-semibold whitespace-nowrap">{t("All Categories", "সকল ক্যাটাগরি")}</span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Menu Flyout Panel */}
            {isMegaMenuOpen && (
              <div className="absolute top-full left-0 w-[680px] bg-white border border-[#E0E0E0] shadow-xl p-6 rounded-md grid grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-150 z-50">
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-2.5">
                    <button
                      onClick={() => {
                        setIsMegaMenuOpen(false);
                        navigate(`/category/${cat.slug}`);
                      }}
                      className="text-left font-semibold text-[#1A1A1A] hover:underline flex items-center justify-between w-full border-b border-[#E5E5E5] pb-1.5"
                    >
                      <span>{t(cat.nameEn, cat.nameBn)}</span>
                      <ArrowRight className="w-3 h-3 text-[#555555]" />
                    </button>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-[#555555]">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => {
                                setIsMegaMenuOpen(false);
                                navigate(`/category/${sub.slug}`);
                              }}
                              className="hover:text-[#1A1A1A] hover:underline transition-colors block text-left w-full py-0.5"
                            >
                              {t(sub.nameEn, sub.nameBn)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primary Nav Links */}
          <button
            onClick={() => navigate("/")}
            className={`py-2 px-1 whitespace-nowrap shrink-0 transition-colors ${navigation.path === "/" ? "font-semibold border-b-2 border-[#1A1A1A]" : "hover:text-[#555555]"}`}
          >
            {t("Home", "হোম")}
          </button>

          <button
            onClick={() => navigate("/shop")}
            className={`py-2 px-1 whitespace-nowrap shrink-0 transition-colors ${navigation.path === "/shop" ? "font-semibold border-b-2 border-[#1A1A1A]" : "hover:text-[#555555]"}`}
          >
            {t("Shop", "শপ")}
          </button>

          {/* Highlighted Category: Women's Fashion (Includes Jamdani & Silk Sarees) */}
          <div className="relative group shrink-0">
            <button
              onClick={() => navigate("/category/womens-fashion")}
              className="py-2 px-1 flex items-center gap-1 whitespace-nowrap hover:text-[#555555] transition-colors"
            >
              <span className="whitespace-nowrap">{t("Women's Fashion", "নারীদের ফ্যাশন")}</span>
              <ChevronDown className="w-3 h-3 shrink-0 text-[#555555] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block w-56 bg-white border border-[#E0E0E0] shadow-lg rounded py-2 z-50">
              <button
                onClick={() => navigate("/category/jamdani-silk-sarees")}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F5F5] flex items-center justify-between"
              >
                <span>{t("Jamdani & Silk Sarees", "জামদানি ও সিল্ক শাড়ি")}</span>
                <span className="text-[10px] bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded font-mono">BD Special</span>
              </button>
              <button
                onClick={() => navigate("/category/cotton-tant-sarees")}
                className="w-full text-left px-4 py-2 text-xs text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]"
              >
                {t("Cotton & Tant Sarees", "সুতি ও তাঁতের শাড়ি")}
              </button>
              <button
                onClick={() => navigate("/category/festive-kurtis")}
                className="w-full text-left px-4 py-2 text-xs text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]"
              >
                {t("Festive Kurtis", "কুর্তি ও কামিজ")}
              </button>
            </div>
          </div>

          {/* Highlighted Category: Men's Fashion (Includes Panjabi, Polo Shirt) */}
          <div className="relative group shrink-0">
            <button
              onClick={() => navigate("/category/mens-fashion")}
              className="py-2 px-1 flex items-center gap-1 whitespace-nowrap hover:text-[#555555] transition-colors"
            >
              <span className="whitespace-nowrap">{t("Men's Fashion", "পুরুষদের ফ্যাশন")}</span>
              <ChevronDown className="w-3 h-3 shrink-0 text-[#555555] group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block w-56 bg-white border border-[#E0E0E0] shadow-lg rounded py-2 z-50">
              <button
                onClick={() => navigate("/category/panjabi")}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F5F5] flex items-center justify-between"
              >
                <span>{t("Panjabi", "পাঞ্জাবি")}</span>
                <span className="text-[10px] bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded font-mono">Festive</span>
              </button>
              <button
                onClick={() => navigate("/category/polo-shirt")}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#F5F5F5] flex items-center justify-between"
              >
                <span>{t("Polo Shirt", "পোলো শার্ট")}</span>
                <span className="text-[10px] bg-[#E5E5E5] text-[#1A1A1A] px-1.5 py-0.5 rounded font-mono">Supima</span>
              </button>
              <button
                onClick={() => navigate("/category/kabli-sets")}
                className="w-full text-left px-4 py-2 text-xs text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]"
              >
                {t("Kabli Sets", "কাবলি সেট")}
              </button>
            </div>
          </div>

          {/* More Categories Dropdown */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setIsMoreMenuOpen(true)}
            onMouseLeave={() => setIsMoreMenuOpen(false)}
          >
            <button
              className="py-2 px-1 flex items-center gap-1 whitespace-nowrap hover:text-[#555555] transition-colors"
            >
              <span className="whitespace-nowrap">{t("More", "অন্যান্য")}</span>
              <ChevronDown className={`w-3 h-3 shrink-0 text-[#555555] transition-transform ${isMoreMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute top-full right-0 w-48 bg-white border border-[#E0E0E0] shadow-lg rounded py-2 z-50">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    navigate("/category/footwear");
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#F5F5F5]"
                >
                  {t("Footwear (Leather Loafers)", "জুতো ও লোফার")}
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    navigate("/category/accessories");
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#F5F5F5]"
                >
                  {t("Accessories & Wallets", "এক্সেসরিজ ও ওয়ালেট")}
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    navigate("/category/kids");
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#F5F5F5]"
                >
                  {t("Kids Festive", "শিশুদের পোশাক")}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side: Desktop Search & Interactive Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 xl:gap-3 shrink-0">
          {/* Desktop Search Input (Hidden on mobile / tablet < md) */}
          <div className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={desktopSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDesktopSearchActive(true)}
                placeholder={t("Search Jamdani, Panjabi...", "জামদানি, পাঞ্জাবি খুঁজুন...")}
                className="w-36 lg:w-44 xl:w-56 pl-8 pr-7 py-1.5 text-xs bg-[#F5F5F5] border border-[#E0E0E0] rounded-full focus:outline-none focus:border-[#1A1A1A] focus:bg-white focus:w-44 lg:focus:w-52 xl:focus:w-64 transition-all text-[#1A1A1A] placeholder-[#666666]"
              />
              <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-[#666666] hover:text-[#1A1A1A]"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Debounced live search drop-down for Desktop */}
            {isDesktopSearchActive && searchQuery.trim().length > 0 && (
              <div
                className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white border border-[#E0E0E0] shadow-xl rounded-lg p-3 z-50"
                onMouseLeave={() => setIsDesktopSearchActive(false)}
              >
                <div className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-2">
                  {searchResults.length > 0 ? t("Search Results", "ফলাফল") : t("No results found", "কোনো পণ্য পাওয়া যায়নি")}
                </div>
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsDesktopSearchActive(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="flex items-center gap-3 p-1.5 hover:bg-[#F5F5F5] rounded cursor-pointer transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.nameEn}
                        className="w-10 h-12 object-cover rounded border border-[#E0E0E0]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1A1A1A] truncate">
                          {t(product.nameEn, product.nameBn)}
                        </p>
                        <p className="text-[11px] text-[#555555] font-mono">
                          ৳{product.priceBDT.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {searchResults.length > 0 && (
                  <button
                    onClick={() => {
                      setIsDesktopSearchActive(false);
                      navigate("/shop", { q: searchQuery.trim() });
                    }}
                    className="w-full mt-2 pt-2 border-t border-[#E5E5E5] text-center text-xs font-semibold text-[#1A1A1A] hover:underline"
                  >
                    {t("View all in catalog →", "সবগুলো দেখুন →")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Icon Toggle (Visible only < md) */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-[#1A1A1A] hover:bg-[#F5F5F5] active:bg-[#EAEAEA] rounded-full transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            aria-label="Toggle Search"
            title="Search products"
          >
            {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Customer Account Portal Button */}
          <button
            onClick={() => navigate("/customer")}
            className={`p-2 rounded-full transition-colors flex items-center justify-center min-w-[40px] min-h-[40px] ${
              navigation.path.startsWith("/customer") || navigation.path.startsWith("/account")
                ? "bg-[#1A1A1A] text-white"
                : "text-[#1A1A1A] hover:bg-[#F5F5F5] active:bg-[#EAEAEA]"
            }`}
            title={currentUser ? `${currentUser.name} (${currentUser.loyaltyTier} Member)` : t("Customer Portal", "কাস্টমার পোর্টাল")}
            aria-label="Customer Account"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Account / Order Track Link */}
          <button
            onClick={() => navigate("/track-order")}
            className="p-2 text-[#1A1A1A] hover:bg-[#F5F5F5] active:bg-[#EAEAEA] rounded-full transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            title={t("Track Bangladeshi Courier Delivery", "কুরিয়ার ডেলিভারি ট্র্যাক")}
            aria-label="Track Courier Order"
          >
            <Package className="w-5 h-5" />
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="p-2 text-[#1A1A1A] hover:bg-[#F5F5F5] active:bg-[#EAEAEA] rounded-full transition-colors relative flex items-center justify-center min-w-[40px] min-h-[40px]"
            title={t("Shopping Bag", "শপিং ব্যাগ")}
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-[#1A1A1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard Quick Button (hidden on narrow screens, accessible in drawer) */}
          <button
            onClick={() => navigate("/admin")}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all border ${navigation.path.startsWith("/admin")
              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
              : "bg-[#F5F5F5] text-[#1A1A1A] border-[#E0E0E0] hover:bg-[#1A1A1A] hover:text-white"
              }`}
            title="Access Admin Dashboard Suite"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Responsive Search Bar (Toggled when user clicks search icon on mobile) */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-[#E0E0E0] bg-[#F9F9F9] p-3 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search Jamdani, Panjabi, Loafers...", "জামদানি, পাঞ্জাবি, জুতো খুঁজুন...")}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#CCCCCC] rounded-lg focus:outline-none focus:border-[#1A1A1A] shadow-xs"
            />
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-[#777777] hover:text-[#1A1A1A] p-0.5"
              >
                ✕
              </button>
            ) : null}
          </form>

          {/* Mobile Search Instant Suggestions */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-2 bg-white rounded-lg border border-[#E0E0E0] shadow-lg divide-y divide-[#F0F0F0] overflow-hidden max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsMobileSearchOpen(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#F5F5F5] active:bg-[#EAEAEA] cursor-pointer"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.nameEn}
                        className="w-9 h-11 object-cover rounded border border-[#E0E0E0] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                          {t(product.nameEn, product.nameBn)}
                        </p>
                        <p className="text-[11px] text-[#555555] font-mono">
                          ৳{product.priceBDT.toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#999999] shrink-0" />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setIsMobileSearchOpen(false);
                      navigate("/shop", { q: searchQuery.trim() });
                    }}
                    className="w-full py-2 px-3 text-center text-xs font-bold text-[#1A1A1A] hover:bg-[#F5F5F5] block"
                  >
                    {t(`View all results for "${searchQuery}" →`, `"${searchQuery}" এর সকল ফলাফল →`)}
                  </button>
                </>
              ) : (
                <div className="p-3 text-center text-xs text-[#777777]">
                  {t("No products found matching your keyword", "কোনো পণ্য পাওয়া যায়নি")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Full Mobile Slide-Over Navigation Drawer with Accordion & Localized Controls */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          {/* Semi-transparent Backdrop Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="absolute inset-y-0 left-0 max-w-[320px] sm:max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between bg-[#FBFBFB]">
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/");
                }}
                className="cursor-pointer flex flex-col"
              >
                <div className="flex items-center">
                  <span className="font-editorial text-lg font-bold tracking-tight text-[#1A1A1A]">
                    BENGAL
                  </span>
                  <span className="font-sans font-light text-[9px] tracking-widest uppercase border border-[#1A1A1A] px-1 py-0.5 ml-1 rounded-xs">
                    EDITION
                  </span>
                </div>
                <span className="text-[8px] tracking-[0.2em] text-[#666666] uppercase font-mono">
                  DHAKA ATELIER
                </span>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-1 text-[#1A1A1A] hover:bg-[#EAEAEA] rounded-full transition-colors flex items-center justify-center"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F0F0F0]">
              {/* Primary Quick Links */}
              <div className="p-3 space-y-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${navigation.path === "/" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-[#F5F5F5]"
                    }`}
                >
                  <span>{t("Home Page", "হোম পেজ")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/shop");
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${navigation.path === "/shop" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-[#F5F5F5]"
                    }`}
                >
                  <span>{t("Browse Full Catalog", "সম্পূর্ণ ক্যাটালগ")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/track-order");
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${navigation.path === "/track-order" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-[#F5F5F5]"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>{t("Track Courier Delivery", "কুরিয়ার ট্র্যাকিং")}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Categories & Subcategories Accordion */}
              <div className="p-3 space-y-2">
                <div className="px-2 py-1 text-[11px] font-bold text-[#777777] uppercase tracking-wider">
                  {t("Collections & Handlooms", "কালেকশন ও হ্যান্ডলুম")}
                </div>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isExpanded = !!expandedMobileCategories[cat.slug];
                    return (
                      <div key={cat.id} className="border border-[#EEEEEE] rounded-lg overflow-hidden">
                        {/* Parent Category Header */}
                        <div className="flex items-center justify-between bg-[#FAFAFA] p-2.5">
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              navigate(`/category/${cat.slug}`);
                            }}
                            className="flex-1 text-left text-xs font-bold text-[#1A1A1A] hover:underline"
                          >
                            {t(cat.nameEn, cat.nameBn)}
                          </button>
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <button
                              onClick={() => toggleMobileCategory(cat.slug)}
                              className="p-1 text-[#666666] hover:text-[#1A1A1A] hover:bg-[#EAEAEA] rounded"
                              aria-label={`Toggle ${cat.nameEn} subcategories`}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                  }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Subcategories Accordion List */}
                        {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="p-2 bg-white space-y-1 border-t border-[#EEEEEE]">
                            {cat.subcategories.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  navigate(`/category/${sub.slug}`);
                                }}
                                className="w-full text-left py-1.5 px-2.5 text-xs text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] rounded flex items-center justify-between"
                              >
                                <span>{t(sub.nameEn, sub.nameBn)}</span>
                                <ChevronRight className="w-3 h-3 text-[#BBBBBB]" />
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                navigate(`/category/${cat.slug}`);
                              }}
                              className="w-full text-left py-1.5 px-2.5 text-[11px] font-semibold text-[#1A1A1A] hover:underline border-t border-[#F5F5F5] pt-2"
                            >
                              {t(`View all ${cat.nameEn} →`, `${cat.nameBn} এর সবগুলো →`)}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin & Developer Utilities */}
              <div className="p-3 space-y-1.5">
                <div className="px-2 py-1 text-[11px] font-bold text-[#777777] uppercase tracking-wider">
                  {t("Atelier Management", "ম্যানেজমেন্ট")}
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/customer");
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold bg-[#F5F5F5] hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center justify-between text-[#1A1A1A]"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>{t("Customer Account", "কাস্টমার পোর্টাল")}</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                    {currentUser?.loyaltyTier || "Member"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/admin");
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold bg-[#F5F5F5] hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center justify-between text-[#1A1A1A]"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Admin Dashboard</span>
                  </span>
                  <span className="text-[10px] bg-[#E0E0E0] text-[#1A1A1A] px-1.5 py-0.5 rounded font-mono">
                    Staff
                  </span>
                </button>
              </div>

              {/* Support & Dhaka Atelier Details */}
              <div className="p-4 bg-[#FBFBFB] space-y-2 text-xs text-[#666666]">
                <div className="flex items-center gap-2 text-[#1A1A1A] font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  <a href="tel:01711223344" className="hover:underline font-mono">
                    +880 1711-223344
                  </a>
                </div>
                <p className="text-[11px]">
                  {t(
                    "Dhaka Atelier Support: 10:00 AM - 10:00 PM (Daily)",
                    "ঢাকা সেবা কেন্দ্র: সকাল ১০টা - রাত ১০টা (প্রতিদিন)"
                  )}
                </p>
              </div>
            </div>

            {/* Drawer Footer with Mobile Language Toggle */}
            <div className="p-4 border-t border-[#E0E0E0] bg-[#FAFAFA]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-[#555555]">
                  {t("Language", "ভাষা")}:
                </div>
                <div className="flex items-center bg-white rounded border border-[#CCCCCC] p-0.5">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${language === "en" ? "bg-[#1A1A1A] text-white" : "text-[#555555]"
                      }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("bn")}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${language === "bn" ? "bg-[#1A1A1A] text-white" : "text-[#555555]"
                      }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

