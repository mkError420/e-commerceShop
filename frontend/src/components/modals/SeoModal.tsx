import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Copy, Check, Globe, Search, Share2, Tag } from "lucide-react";

export const SeoModal: React.FC = () => {
  const { isSeoModalOpen, setIsSeoModalOpen, products, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<"jsonld" | "opengraph" | "sitemap">("jsonld");
  const [hasCopied, setHasCopied] = useState(false);

  if (!isSeoModalOpen) return null;

  const sampleProduct = products[0];

  const jsonLdCode = `{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "${sampleProduct?.nameEn || "Traditional Dhakai Jamdani Saree"}",
  "image": [
    "${sampleProduct?.images[0] || "https://images.unsplash.com/..."}"
  ],
  "description": "Authentic 84-count pure khadi handloom Dhakai Jamdani saree hand-woven in Rupganj, Narayanganj.",
  "sku": "${sampleProduct?.sku || "JAM-84-01"}",
  "brand": {
    "@type": "Brand",
    "name": "Bengal Archive"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://bengalarchive.com.bd/product/${sampleProduct?.slug || "dhakai-jamdani"}",
    "priceCurrency": "BDT",
    "price": "${sampleProduct?.priceBDT || 14500}",
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Bengal Archive Dhaka Atelier"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "60",
        "currency": "BDT"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "BD"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" }
      }
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "28"
  }
}`;

  const openGraphCode = `<!-- Open Graph & Meta Tags for High-CTR Social Sharing -->
<title>Traditional Dhakai Jamdani Saree | Bengal Archive Bangladesh</title>
<meta name="description" content="Discover handloom 84-count Jamdani sarees and tailored Panjabis crafted in Dhaka. Nationwide 24-48h delivery." />
<link rel="canonical" href="https://bengalarchive.com.bd/product/traditional-dhakai-jamdani-saree" />

<!-- Facebook & LinkedIn OpenGraph -->
<meta property="og:type" content="product" />
<meta property="og:site_name" content="Bengal Archive" />
<meta property="og:title" content="Traditional Dhakai Jamdani Saree" />
<meta property="og:description" content="Hand-woven in Rupganj, Narayanganj. Cash on Delivery across all 64 districts in Bangladesh." />
<meta property="og:url" content="https://bengalarchive.com.bd/product/traditional-dhakai-jamdani-saree" />
<meta property="og:image" content="https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg" />
<meta property="product:price:amount" content="14500" />
<meta property="product:price:currency" content="BDT" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Traditional Dhakai Jamdani Saree" />
<meta name="twitter:description" content="Authentic UNESCO heritage Bangladeshi handloom piece." />`;

  const sitemapCode = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bengalarchive.com.bd/</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bengalarchive.com.bd/shop</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bengalarchive.com.bd/category/womens-fashion</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bengalarchive.com.bd/category/jamdani-silk-sarees</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bengalarchive.com.bd/category/mens-fashion</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bengalarchive.com.bd/category/panjabi</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bengalarchive.com.bd/product/traditional-dhakai-jamdani-saree</loc>
    <lastmod>2026-09-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    showToast("Copied SEO payload to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] text-[#E5E5E5] rounded-xl max-w-3xl w-full h-[80vh] flex flex-col border border-[#333333] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#222222]">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-editorial text-base font-bold text-white">
                Search Engine Optimization & Social Sharing Suite
              </h3>
              <p className="text-[11px] text-[#999999]">
                Verified Schema.org JSON-LD microdata, OpenGraph rich cards, and sitemap.xml.
              </p>
            </div>
          </div>
          <button onClick={() => setIsSeoModalOpen(false)} className="p-1 rounded text-[#CCCCCC] hover:bg-[#333333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#333333] bg-[#1E1E1E] text-xs font-mono">
          <button
            onClick={() => setActiveTab("jsonld")}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "jsonld" ? "border-blue-400 text-white bg-[#262626]" : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Product JSON-LD (Schema.org)</span>
          </button>
          <button
            onClick={() => setActiveTab("opengraph")}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "opengraph" ? "border-blue-400 text-white bg-[#262626]" : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>OpenGraph & Twitter Cards</span>
          </button>
          <button
            onClick={() => setActiveTab("sitemap")}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "sitemap" ? "border-blue-400 text-white bg-[#262626]" : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>sitemap.xml</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#111111] font-mono text-xs text-[#E0E0E0]">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => {
                const text = activeTab === "jsonld" ? jsonLdCode : activeTab === "opengraph" ? openGraphCode : sitemapCode;
                handleCopy(text);
              }}
              className="flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333333] text-white px-3 py-1 rounded text-[11px]"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            {activeTab === "jsonld" && jsonLdCode}
            {activeTab === "opengraph" && openGraphCode}
            {activeTab === "sitemap" && sitemapCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
