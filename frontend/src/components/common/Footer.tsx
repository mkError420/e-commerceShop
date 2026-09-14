import React from "react";
import { useStore } from "../../context/StoreContext";
import { Shield, Truck, RotateCcw, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  const { navigate, t, setIsArchitectureModalOpen, setIsSeoModalOpen } = useStore();

  return (
    <footer className="bg-[#1A1A1A] text-[#E5E5E5] pt-14 pb-8 border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#2A2A2A]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0 border border-[#3A3A3A]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {t("100% Authentic Handloom", "১০০% খাঁটি হস্তশিল্প")}
              </h4>
              <p className="text-xs text-[#999999] mt-1">
                {t("Directly sourced from generational weavers in Narayanganj & Rajshahi.", "রূপগঞ্জ ও রাজশাহীর মূল তাঁতিদের থেকে সংগৃহীত।")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0 border border-[#3A3A3A]">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {t("Express Dhaka Shipping", "ঢাকা সিটিতে দ্রুত ডেলিভারি")}
              </h4>
              <p className="text-xs text-[#999999] mt-1">
                {t("Guaranteed 24-48 hours delivery inside Dhaka for ৳60 BDT.", "মাত্র ৬০ টাকায় ২৪-৪৮ ঘণ্টায় নিশ্চিত ডেলিভারি।")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0 border border-[#3A3A3A]">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {t("7-Day Hassle-Free Exchange", "৭ দিনের সহজ এক্সচেঞ্জ")}
              </h4>
              <p className="text-xs text-[#999999] mt-1">
                {t("Instant size & variant replacement across all 64 districts.", "দেশজুড়ে সাইজ ও কালার পরিবর্তনের সুবিধা।")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0 border border-[#3A3A3A]">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {t("Dedicated BD Support", "২৪/৭ কাস্টমার সাপোর্ট")}
              </h4>
              <p className="text-xs text-[#999999] mt-1">
                {t("Call or WhatsApp: +880 1711-223344 (10 AM - 10 PM).", "হোয়াটসঅ্যাপ ও ফোনে সহায়তা: +৮৮০ ১৭১১-২২৩৩৪৪")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-[#2A2A2A] text-xs">
          {/* Col 1: Brand Atelier */}
          <div className="lg:col-span-2 space-y-4">
            <div className="font-editorial text-2xl text-white font-semibold">
              BENGAL ARCHIVE
            </div>
            <p className="text-[#999999] leading-relaxed max-w-sm">
              {t(
                "An editorial Bangladeshi atelier committed to handloom heritage, Dhakai Jamdani preservation, and modern minimalist menswear crafted in Dhaka.",
                "বাঙালির হাজার বছরের ঐতিহ্যবাহী তাঁতশিল্প, ঢাকাই জামদানি এবং আধুনিক মার্জিত পোশাকের সমাহার।"
              )}
            </p>
            <div className="space-y-1.5 text-[#999999]">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Level 4, House 28, Road 11, Banani, Dhaka-1213, Bangladesh</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>concierge@bengalarchive.com.bd</span>
              </p>
            </div>
          </div>

          {/* Col 2: Women's & Sarees */}
          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              {t("Women's Handloom", "নারীদের পোশাক")}
            </h5>
            <ul className="space-y-2 text-[#999999]">
              <li>
                <button onClick={() => navigate("/category/jamdani-silk-sarees")} className="hover:text-white transition-colors">
                  {t("Dhakai Jamdani Sarees", "ঢাকাই জামদানি শাড়ি")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/category/jamdani-silk-sarees")} className="hover:text-white transition-colors">
                  {t("Rajshahi Mulberry Silk", "রাজশাহী মালবেরি সিল্ক")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/category/cotton-tant-sarees")} className="hover:text-white transition-colors">
                  {t("Tangail Cotton Handloom", "টাঙ্গাইল সুতি তাঁত")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/category/festive-kurtis")} className="hover:text-white transition-colors">
                  {t("Festive Two-Pieces", "উৎসবের কুর্তি")}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Men's Fashion */}
          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              {t("Men's Collection", "পুরুষদের কালেকশন")}
            </h5>
            <ul className="space-y-2 text-[#999999]">
              <li>
                <button onClick={() => navigate("/category/panjabi")} className="hover:text-white transition-colors">
                  {t("Handloom Panjabis", "হ্যান্ডলুম পাঞ্জাবি")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/category/kabli-sets")} className="hover:text-white transition-colors">
                  {t("Executive Kabli Suits", "এক্সিকিউটিভ কাবলি")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/category/polo-shirt")} className="hover:text-white transition-colors">
                  {t("Supima Cotton Polos", "সুপিমা পোলো শার্ট")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/category/footwear")} className="hover:text-white transition-colors">
                  {t("Leather Loafers", "লেদার লোফার")}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Architecture & Specs */}
          <div className="space-y-3">
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Architecture & Dev
            </h5>
            <ul className="space-y-2 text-[#999999]">
              <li>
                <button onClick={() => setIsArchitectureModalOpen(true)} className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400">
                  <span>Prisma & Mongoose Spec</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => setIsArchitectureModalOpen(true)} className="hover:text-white transition-colors">
                  Next.js App Router Tree
                </button>
              </li>
              <li>
                <button onClick={() => setIsSeoModalOpen(true)} className="hover:text-white transition-colors">
                  JSON-LD & Dynamic Sitemap
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/track-order")} className="hover:text-white transition-colors">
                  Courier Tracker Engine
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/admin")} className="hover:text-white transition-colors font-medium text-white">
                  Admin Dashboard Suite →
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Localized Bangladeshi Gateways & Logistics Badges */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#999999] text-[11px] mr-1">Payment Gateways:</span>
            {/* bKash badge */}
            <span className="bg-[#E2136E] text-white px-2 py-1 rounded text-[11px] font-bold tracking-tight">
              bKash
            </span>
            {/* Nagad badge */}
            <span className="bg-[#F7941D] text-white px-2 py-1 rounded text-[11px] font-bold tracking-tight">
              Nagad
            </span>
            {/* SSLCommerz badge */}
            <span className="bg-[#005B94] text-white px-2 py-1 rounded text-[11px] font-bold tracking-tight">
              SSLCommerz
            </span>
            {/* Cash on Delivery */}
            <span className="bg-[#2A2A2A] text-white border border-[#444] px-2 py-1 rounded text-[11px] font-semibold">
              Cash on Delivery (COD)
            </span>
            {/* Cards */}
            <span className="bg-[#2A2A2A] text-[#999999] border border-[#444] px-2 py-1 rounded text-[11px]">
              VISA / Mastercard
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#999999]">
            <span>Delivery Partners:</span>
            <span className="text-white font-medium">Pathao</span>
            <span>•</span>
            <span className="text-white font-medium">Steadfast</span>
            <span>•</span>
            <span className="text-white font-medium">Paperfly</span>
          </div>
        </div>

        <div className="pt-8 text-center text-[11px] text-[#777777]">
          © {new Date().getFullYear()} Bengal Archive Ltd. Designed for Bangladeshi E-Commerce with Next.js App Router Architecture. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
