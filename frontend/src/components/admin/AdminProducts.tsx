import React, { useState, useMemo, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { Product, ProductVariant } from "../../types";
import { uploadService } from "../../services/uploadService";
import {
  Plus,
  Trash2,
  Search,
  Flame,
  X,
  Package,
  Pencil,
  AlertTriangle,
  Star,
  ArrowUpDown,
  Filter,
  ImageIcon,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Link2,
  Layers,
  RefreshCw,
} from "lucide-react";

/* ─── helpers ─── */
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function generateSKU(categorySlug?: string) {
  const prefix = categorySlug ? categorySlug.slice(0, 3).toUpperCase() : "BD";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

export interface FormVariant {
  id: string;
  title: string;
  size: string;
  stockQuantity: number;
  priceAdjustmentBDT: number;
  colorHex?: string;
}

const EMPTY_FORM = {
  sku: "",
  nameEn: "",
  nameBn: "",
  descriptionEn: "",
  descriptionBn: "",
  categorySlug: "",
  subcategorySlug: "",
  priceBDT: 0,
  compareAtPriceBDT: 0,
  costPriceBDT: 0,
  stockQuantity: 10,
  lowStockAlert: 5,
  fabricType: "",
  craftsmanship: "",
  imageUrl: "",
  isFeatured: false,
  isFlashDeal: false,
  tags: "",
  variants: [] as FormVariant[],
};
type FormState = typeof EMPTY_FORM;

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
    {children} {required && <span className="text-rose-500">*</span>}
  </label>
);

const FInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all placeholder:text-gray-400 ${props.className ?? ""}`}
  />
);

const FTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all resize-none placeholder:text-gray-400 ${props.className ?? ""}`}
  />
);

const FSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={`w-full py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-medium transition-all ${props.className ?? ""}`}
  />
);

/* ─── component ─── */
export const AdminProducts: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, formatPrice, showToast } = useStore();

  /* filter */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [sortBy, setSortBy] = useState<"nameEn" | "priceBDT" | "stockQuantity">("nameEn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /* modal */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  /* Image Upload State (Free Storage System) */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [dragActive, setDragActive] = useState(false);
  const [storageInfo, setStorageInfo] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadService.uploadProductImage(file);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, imageUrl: res.url }));
        setStorageInfo(
          res.storage === "IMAGEKIT_FREE_CDN"
            ? "ImageKit Cloud CDN"
            : res.storage === "CLOUDINARY_FREE_CDN"
              ? "Cloudinary Free CDN"
              : res.storage === "LOCAL_SERVER_STORAGE"
                ? "Free Server Storage (/uploads)"
                : "Offline Image Store"
        );
        showToast("Image uploaded & saved properly!");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to upload image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleUrlImport = async (inputUrl: string) => {
    if (!inputUrl || !inputUrl.startsWith("http")) {
      showToast("Please enter a valid HTTP/HTTPS image URL", "error");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadService.uploadProductImageUrl(inputUrl);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, imageUrl: res.url }));
        setStorageInfo(
          res.storage === "IMAGEKIT_FREE_CDN"
            ? "ImageKit Cloud CDN"
            : res.storage === "CLOUDINARY_FREE_CDN"
              ? "Cloudinary Free CDN"
              : "Free Server Storage"
        );
        showToast("Image imported & saved to ImageKit.io!");
      }
    } catch (err: any) {
      showToast(err?.message || "URL Import failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  /* counts */
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stockQuantity === 0).length,
    [products]
  );

  /* filtered & sorted products */
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameBn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabricType.toLowerCase().includes(q)
      );
    }
    if (selectedCategoryFilter) {
      list = list.filter((p) => p.categorySlug === selectedCategoryFilter);
    }
    if (stockFilter === "low") {
      list = list.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert);
    } else if (stockFilter === "out") {
      list = list.filter((p) => p.stockQuantity === 0);
    }
    list.sort((a, b) => {
      const av = a[sortBy] ?? 0;
      const bv = b[sortBy] ?? 0;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [products, selectedCategoryFilter, stockFilter, searchQuery, sortBy, sortDir]);

  /* subcategories for selected cat in form */
  const subcats = useMemo(
    () => categories.find((c) => c.slug === form.categorySlug)?.subcategories ?? [],
    [categories, form.categorySlug]
  );

  /* Variant helpers */
  const addQuickVariant = (sz: string) => {
    setForm((prev) => {
      const existing = prev.variants.find((v) => v.size.toLowerCase() === sz.toLowerCase());
      let updatedVariants: FormVariant[];
      if (existing) {
        updatedVariants = prev.variants.map((v) =>
          v.size.toLowerCase() === sz.toLowerCase()
            ? { ...v, stockQuantity: v.stockQuantity + 5 }
            : v
        );
      } else {
        updatedVariants = [
          ...prev.variants,
          {
            id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: sz,
            size: sz,
            stockQuantity: 5,
            priceAdjustmentBDT: 0,
          },
        ];
      }
      const sumStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
      return {
        ...prev,
        variants: updatedVariants,
        stockQuantity: sumStock > 0 ? sumStock : prev.stockQuantity,
      };
    });
  };

  const addCustomVariant = () => {
    setForm((prev) => {
      const newVar: FormVariant = {
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: "Standard",
        size: "M",
        stockQuantity: 5,
        priceAdjustmentBDT: 0,
      };
      const updated = [...prev.variants, newVar];
      const sumStock = updated.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
      return {
        ...prev,
        variants: updated,
        stockQuantity: sumStock > 0 ? sumStock : prev.stockQuantity,
      };
    });
  };

  const updateVariantField = (index: number, field: keyof FormVariant, value: any) => {
    setForm((prev) => {
      const updated = prev.variants.map((v, idx) => {
        if (idx !== index) return v;
        const next = { ...v, [field]: value };
        if (field === "size") {
          next.title = String(value);
        }
        return next;
      });
      const sumStock = updated.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
      return {
        ...prev,
        variants: updated,
        stockQuantity: sumStock > 0 ? sumStock : prev.stockQuantity,
      };
    });
  };

  const removeVariant = (index: number) => {
    setForm((prev) => {
      const updated = prev.variants.filter((_, idx) => idx !== index);
      const sumStock = updated.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
      return {
        ...prev,
        variants: updated,
        stockQuantity: updated.length > 0 ? sumStock : prev.stockQuantity,
      };
    });
  };

  /* open add */
  const openAdd = () => {
    const defaultCat = categories[0]?.slug ?? "";
    setForm({
      ...EMPTY_FORM,
      sku: generateSKU(defaultCat),
      categorySlug: defaultCat,
      variants: [
        {
          id: `v-${Date.now()}-1`,
          title: "Free Size",
          size: "Free Size",
          stockQuantity: 10,
          priceAdjustmentBDT: 0,
        },
      ],
      stockQuantity: 10,
    });
    setEditingProduct(null);
    setStorageInfo(null);
    setIsUploading(false);
    setUploadMode("file");
    setIsModalOpen(true);
  };

  /* open edit */
  const openEdit = (p: Product) => {
    const firstImg = p.images[0] ?? "";
    const loadedVariants: FormVariant[] =
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => ({
            id: v.id || `v-${Math.random().toString(36).slice(2, 7)}`,
            title: v.title || v.size || "Standard",
            size: v.size || v.title || "Free Size",
            stockQuantity: Number(v.stockQuantity) || 0,
            priceAdjustmentBDT: Number(v.priceAdjustmentBDT) || 0,
            colorHex: v.colorHex || "",
          }))
        : [
            {
              id: `v-${Date.now()}`,
              title: "Free Size",
              size: "Free Size",
              stockQuantity: p.stockQuantity || 10,
              priceAdjustmentBDT: 0,
            },
          ];

    setForm({
      sku: p.sku || generateSKU(p.categorySlug),
      nameEn: p.nameEn,
      nameBn: p.nameBn,
      descriptionEn: p.descriptionEn,
      descriptionBn: p.descriptionBn,
      categorySlug: p.categorySlug,
      subcategorySlug: p.subcategorySlug ?? "",
      priceBDT: p.priceBDT,
      compareAtPriceBDT: p.compareAtPriceBDT ?? 0,
      costPriceBDT: p.costPriceBDT ?? 0,
      stockQuantity: p.stockQuantity,
      lowStockAlert: p.lowStockAlert || 5,
      fabricType: p.fabricType || "",
      craftsmanship: p.craftsmanship || "",
      imageUrl: firstImg,
      isFeatured: p.isFeatured || false,
      isFlashDeal: p.isFlashDeal || false,
      tags: p.tags.join(", "),
      variants: loadedVariants,
    });
    setEditingProduct(p);
    setStorageInfo(
      firstImg.includes("imagekit.io")
        ? "ImageKit Cloud CDN"
        : firstImg.includes("/uploads/")
          ? "Free Server Storage"
          : firstImg.includes("cloudinary")
            ? "Cloudinary Free CDN"
            : firstImg.startsWith("data:image")
              ? "Direct Offline Image"
              : "External Image URL"
    );
    setIsUploading(false);
    setUploadMode(firstImg.startsWith("http") && !firstImg.includes("/uploads/") && !firstImg.includes("cloudinary") && !firstImg.includes("imagekit.io") ? "url" : "file");
    setIsModalOpen(true);
  };

  /* save */
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn.trim() || form.priceBDT <= 0) {
      showToast("Product name and valid price are required", "error");
      return;
    }
    const catObj = categories.find((c) => c.slug === form.categorySlug);
    const subObj = catObj?.subcategories?.find((s) => s.slug === form.subcategorySlug);
    const tagArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const finalVariants: ProductVariant[] =
      form.variants.length > 0
        ? form.variants.map((v) => ({
            id: v.id,
            title: v.title || v.size || "Standard",
            size: v.size || v.title || "Free Size",
            stockQuantity: Number(v.stockQuantity) || 0,
            priceAdjustmentBDT: Number(v.priceAdjustmentBDT) || 0,
            colorHex: v.colorHex || undefined,
          }))
        : [
            {
              id: `v-${Date.now()}`,
              title: "Standard",
              size: "Free Size",
              stockQuantity: Number(form.stockQuantity),
              priceAdjustmentBDT: 0,
            },
          ];

    const sumVariantStock = finalVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
    const effectiveStock = form.variants.length > 0 ? sumVariantStock : Number(form.stockQuantity);
    const effectiveSku = form.sku.trim() || generateSKU(form.categorySlug);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        sku: effectiveSku,
        nameEn: form.nameEn.trim(),
        nameBn: form.nameBn.trim() || form.nameEn.trim(),
        slug: slugify(form.nameEn.trim()),
        descriptionEn: form.descriptionEn.trim() || editingProduct.descriptionEn,
        descriptionBn: form.descriptionBn.trim() || editingProduct.descriptionBn,
        categorySlug: form.categorySlug,
        categoryNameEn: catObj?.nameEn ?? editingProduct.categoryNameEn,
        categoryNameBn: catObj?.nameBn ?? editingProduct.categoryNameBn,
        subcategorySlug: subObj?.slug,
        subcategoryNameEn: subObj?.nameEn,
        subcategoryNameBn: subObj?.nameBn,
        priceBDT: Number(form.priceBDT),
        compareAtPriceBDT: Number(form.compareAtPriceBDT) || undefined,
        costPriceBDT: Number(form.costPriceBDT) || undefined,
        stockQuantity: effectiveStock,
        lowStockAlert: Number(form.lowStockAlert) || 5,
        fabricType: form.fabricType,
        craftsmanship: form.craftsmanship,
        images: [form.imageUrl || editingProduct.images[0] || "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg"],
        isFeatured: form.isFeatured,
        isFlashDeal: form.isFlashDeal,
        tags: tagArr.length ? tagArr : editingProduct.tags,
        variants: finalVariants,
      });
    } else {
      addProduct({
        id: `prod-${Date.now()}`,
        sku: effectiveSku,
        nameEn: form.nameEn.trim(),
        nameBn: form.nameBn.trim() || form.nameEn.trim(),
        slug: slugify(form.nameEn.trim()),
        descriptionEn: form.descriptionEn.trim() || "Artisanal handloom piece crafted in Bangladesh.",
        descriptionBn: form.descriptionBn.trim() || "হাতে তৈরি বাংলাদেশি পণ্য।",
        categorySlug: form.categorySlug,
        categoryNameEn: catObj?.nameEn ?? "Fashion",
        categoryNameBn: catObj?.nameBn ?? "ফ্যাশন",
        subcategorySlug: subObj?.slug,
        subcategoryNameEn: subObj?.nameEn,
        subcategoryNameBn: subObj?.nameBn,
        priceBDT: Number(form.priceBDT),
        compareAtPriceBDT: Number(form.compareAtPriceBDT) || undefined,
        costPriceBDT: Number(form.costPriceBDT) || Math.round(Number(form.priceBDT) * 0.55),
        stockQuantity: effectiveStock,
        lowStockAlert: Number(form.lowStockAlert) || 5,
        fabricType: form.fabricType || "Handloom Cotton",
        craftsmanship: form.craftsmanship || "Handcrafted in Bangladesh",
        images: [
          form.imageUrl ||
          "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg",
        ],
        isFeatured: form.isFeatured,
        isFlashDeal: form.isFlashDeal,
        rating: 5.0,
        reviewsCount: 0,
        tags: tagArr.length ? tagArr : ["New Arrival"],
        variants: finalVariants,
        reviews: [],
      });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  /* inline stock ± */
  const adjustStock = (p: Product, delta: number) => {
    updateProduct({ ...p, stockQuantity: Math.max(0, p.stockQuantity + delta) });
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("asc"); }
  };

  /* ═══════════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5 text-yellow-500" />
            <span>Inventory System</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-gray-900">Product Catalog &amp; Stock</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {products.length} products · {lowStockCount} low stock · {outOfStockCount} out of stock
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, fabric..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
            {(["all", "low", "out"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStockFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  stockFilter === s
                    ? "bg-white text-gray-950 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {s === "all" ? "All Stock" : s === "low" ? `Low (${lowStockCount})` : `Out (${outOfStockCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-yellow-600"
                  onClick={() => toggleSort("nameEn")}
                >
                  <span className="flex items-center gap-1">Product Details <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="py-3.5 px-3">Category</th>
                <th
                  className="py-3.5 px-3 cursor-pointer hover:text-yellow-600"
                  onClick={() => toggleSort("priceBDT")}
                >
                  <span className="flex items-center gap-1">Price <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th
                  className="py-3.5 px-3 cursor-pointer hover:text-yellow-600 whitespace-nowrap"
                  onClick={() => toggleSort("stockQuantity")}
                >
                  <span className="flex items-center gap-1">Total Stock <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="py-3.5 px-3">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No products found</p>
                    <p className="text-[11px] mt-1">Adjust filters or add a new product.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert;
                  const isOut = p.stockQuantity === 0;
                  return (
                    <tr key={p.id} className="hover:bg-yellow-50/40 transition-colors group">
                      {/* Name & SKU & Variants */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {p.images[0] ? (
                              <img src={p.images[0]} alt={p.nameEn} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{p.nameEn}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                {p.sku}
                              </span>
                              {p.fabricType && (
                                <span className="text-[10px] text-gray-400 italic truncate max-w-[120px]">{p.fabricType}</span>
                              )}
                            </div>
                            {/* Dynamic Variants / Sizes Badges */}
                            {p.variants && p.variants.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                {p.variants.map((v) => (
                                  <span
                                    key={v.id}
                                    className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-md bg-yellow-50 text-yellow-900 border border-yellow-200 font-medium"
                                    title={`${v.size || v.title}: ${v.stockQuantity} in stock${v.priceAdjustmentBDT ? ` (৳${v.priceAdjustmentBDT > 0 ? '+' : ''}${v.priceAdjustmentBDT})` : ''}`}
                                  >
                                    <span className="font-bold">{v.size || v.title}</span>
                                    <span className="text-gray-400 font-mono">({v.stockQuantity})</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-700">
                          {p.categoryNameEn}
                        </span>
                        {p.subcategoryNameEn && (
                          <div className="text-[10px] text-gray-400 mt-0.5">{p.subcategoryNameEn}</div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-gray-900">{formatPrice(p.priceBDT)}</div>
                        {p.compareAtPriceBDT && (
                          <div className="text-[11px] text-gray-400 line-through font-mono">{formatPrice(p.compareAtPriceBDT)}</div>
                        )}
                      </td>

                      {/* Stock ± */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => adjustStock(p, -1)}
                            className="w-6 h-6 bg-gray-100 hover:bg-yellow-400 hover:text-gray-950 text-gray-700 rounded-md text-xs font-bold flex items-center justify-center transition-colors"
                          >−</button>
                          <span
                            className={`font-mono font-bold text-xs min-w-[36px] text-center py-1 rounded-md ${isOut
                              ? "text-rose-900 bg-rose-100 border border-rose-300"
                              : isLowStock
                                ? "text-yellow-900 bg-yellow-100 border border-yellow-300"
                                : "text-gray-900 bg-gray-50 border border-gray-200"
                              }`}
                          >{p.stockQuantity}</span>
                          <button
                            onClick={() => adjustStock(p, 1)}
                            className="w-6 h-6 bg-gray-100 hover:bg-yellow-400 hover:text-gray-950 text-gray-700 rounded-md text-xs font-bold flex items-center justify-center transition-colors"
                          >+</button>
                        </div>
                        {isLowStock && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-600" />
                            <span className="text-[10px] text-yellow-800 font-bold">Low</span>
                          </div>
                        )}
                        {isOut && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span className="text-[10px] text-rose-800 font-bold">Out</span>
                          </div>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => updateProduct({ ...p, isFlashDeal: !p.isFlashDeal })}
                            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-all ${p.isFlashDeal
                              ? "bg-yellow-100 border-yellow-300 text-yellow-900 font-bold"
                              : "bg-white border-gray-200 text-gray-400 hover:border-yellow-300"
                              }`}
                          >
                            <Flame className={`w-3 h-3 ${p.isFlashDeal ? "fill-yellow-600 text-yellow-600" : "text-gray-300"}`} />
                            {p.isFlashDeal ? "Flash" : "Normal"}
                          </button>
                          <button
                            onClick={() => updateProduct({ ...p, isFeatured: !p.isFeatured })}
                            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-all ${p.isFeatured
                              ? "bg-blue-50 border-blue-200 text-blue-800 font-bold"
                              : "bg-white border-gray-200 text-gray-400 hover:border-blue-200"
                              }`}
                          >
                            <Star className={`w-3 h-3 ${p.isFeatured ? "fill-blue-500 text-blue-500" : "text-gray-300"}`} />
                            {p.isFeatured ? "Featured" : "Standard"}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-md text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════ Add / Edit Modal (Compact & Dynamic) ══════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-800">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-base sm:text-lg font-bold text-gray-900">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      SKU: {form.sku || "AUTO"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {editingProduct ? editingProduct.nameEn : "Fill details, sizes, pricing and free image upload"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - 2-Column Grid Layout for Decreased Height */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* ── Left Column: Basic Info, Pricing & Variants (7 cols) ── */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* Basic Information */}
                  <div className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        1 — Identification &amp; Category
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* SKU with Auto-gen */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                            SKU <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, sku: generateSKU(prev.categorySlug) }))}
                            className="text-[10px] text-yellow-700 hover:text-yellow-900 font-semibold flex items-center gap-0.5 hover:underline"
                            title="Generate unique SKU"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Auto
                          </button>
                        </div>
                        <FInput
                          required
                          value={form.sku}
                          onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                          placeholder="BA-1024"
                          className="font-mono font-bold uppercase"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <FieldLabel required>Category</FieldLabel>
                        <FSelect
                          value={form.categorySlug}
                          onChange={(e) => setForm({ ...form, categorySlug: e.target.value, subcategorySlug: "" })}
                        >
                          <option value="">— Select —</option>
                          {categories.map((c) => <option key={c.id} value={c.slug}>{c.nameEn}</option>)}
                        </FSelect>
                      </div>

                      {/* Subcategory */}
                      <div>
                        <FieldLabel>Subcategory</FieldLabel>
                        <FSelect
                          value={form.subcategorySlug}
                          onChange={(e) => setForm({ ...form, subcategorySlug: e.target.value })}
                        >
                          <option value="">— None —</option>
                          {subcats.map((s) => <option key={s.id} value={s.slug}>{s.nameEn}</option>)}
                        </FSelect>
                      </div>
                    </div>

                    {/* Product Names */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <FieldLabel required>Product Name (English)</FieldLabel>
                        <FInput
                          required
                          value={form.nameEn}
                          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                          placeholder="Traditional Jamdani Saree"
                        />
                      </div>
                      <div>
                        <FieldLabel>Product Name (বাংলা)</FieldLabel>
                        <FInput
                          value={form.nameBn}
                          onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                          placeholder="ঐতিহ্যবাহী জামদানি শাড়ি"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <FieldLabel>Description (English)</FieldLabel>
                        <FTextarea
                          rows={2}
                          value={form.descriptionEn}
                          onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                          placeholder="Artisanal handwoven saree..."
                        />
                      </div>
                      <div>
                        <FieldLabel>Description (বাংলা)</FieldLabel>
                        <FTextarea
                          rows={2}
                          value={form.descriptionBn}
                          onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })}
                          placeholder="হাতে বোনা খাঁটি জামদানি শাড়ি..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      2 — Pricing &amp; Inventory
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <div>
                        <FieldLabel required>Retail Price (৳)</FieldLabel>
                        <FInput
                          type="number"
                          min={1}
                          required
                          value={form.priceBDT || ""}
                          onChange={(e) => setForm({ ...form, priceBDT: Number(e.target.value) })}
                          className="font-mono font-bold text-yellow-900"
                        />
                      </div>
                      <div>
                        <FieldLabel>Compare (৳)</FieldLabel>
                        <FInput
                          type="number"
                          min={0}
                          value={form.compareAtPriceBDT || ""}
                          onChange={(e) => setForm({ ...form, compareAtPriceBDT: Number(e.target.value) })}
                          className="font-mono text-gray-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <FieldLabel>Cost (৳)</FieldLabel>
                        <FInput
                          type="number"
                          min={0}
                          value={form.costPriceBDT || ""}
                          onChange={(e) => setForm({ ...form, costPriceBDT: Number(e.target.value) })}
                          className="font-mono text-gray-500"
                          placeholder="Cost"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                            Total Stock
                          </label>
                        </div>
                        <FInput
                          type="number"
                          min={0}
                          required
                          value={form.stockQuantity}
                          onChange={(e) => setForm({ ...form, stockQuantity: Math.max(0, Number(e.target.value)) })}
                          className="font-mono font-bold"
                          title="Total in-stock pieces across all sizes"
                        />
                      </div>
                      <div>
                        <FieldLabel>Low Alert</FieldLabel>
                        <FInput
                          type="number"
                          min={1}
                          value={form.lowStockAlert}
                          onChange={(e) => setForm({ ...form, lowStockAlert: Number(e.target.value) })}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Variants / Sizes Section */}
                  <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-yellow-600" />
                          Product Variants / Sizes ({form.variants.length})
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Sizes are dynamic and selectable by customers on storefront
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                        Stock Sum: {form.variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0)} pcs
                      </span>
                    </div>

                    {/* Quick Add Size Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium mr-0.5">Quick Add:</span>
                      {["Free Size", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44"].map((sz) => {
                        const alreadyAdded = form.variants.some((v) => v.size.toLowerCase() === sz.toLowerCase());
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => addQuickVariant(sz)}
                            className={`text-[10px] px-2 py-0.5 rounded border font-medium transition-colors ${
                              alreadyAdded
                                ? "bg-yellow-200/70 border-yellow-400 text-yellow-900 font-bold"
                                : "bg-white border-gray-200 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50"
                            }`}
                          >
                            +{sz}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={addCustomVariant}
                        className="text-[10px] px-2 py-0.5 rounded border border-dashed border-yellow-500/70 bg-white text-yellow-800 hover:bg-yellow-50 font-semibold transition-colors ml-auto"
                      >
                        + Custom
                      </button>
                    </div>

                    {/* Variant items list */}
                    {form.variants.length === 0 ? (
                      <div className="p-2 text-center bg-white rounded-lg border border-dashed border-gray-200 text-[11px] text-gray-400">
                        No individual sizes added. Product will use Free Size by default.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {form.variants.map((v, idx) => (
                          <div
                            key={v.id}
                            className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-2xs"
                          >
                            <div className="w-28 shrink-0">
                              <input
                                type="text"
                                value={v.size}
                                onChange={(e) => updateVariantField(idx, "size", e.target.value)}
                                placeholder="Size (e.g. M)"
                                className="w-full py-1 px-2 text-xs bg-gray-50 border border-gray-200 rounded font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                              />
                            </div>
                            <div className="flex-1 min-w-[70px]">
                              <div className="flex items-center">
                                <span className="text-[10px] text-gray-400 mr-1">Qty:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={v.stockQuantity}
                                  onChange={(e) => updateVariantField(idx, "stockQuantity", Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-full py-1 px-1.5 text-xs bg-gray-50 border border-gray-200 rounded font-mono font-bold text-gray-900 text-center focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-[85px]">
                              <div className="flex items-center">
                                <span className="text-[10px] text-gray-400 mr-1">±৳:</span>
                                <input
                                  type="number"
                                  value={v.priceAdjustmentBDT}
                                  onChange={(e) => updateVariantField(idx, "priceAdjustmentBDT", parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full py-1 px-1.5 text-xs bg-gray-50 border border-gray-200 rounded font-mono text-gray-900 text-center focus:outline-none focus:ring-1 focus:ring-yellow-400"
                                  title="Price adjustment for this size (e.g. +200 or 0)"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                              title="Remove size"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Right Column: Media, Craftsmanship & Badges (5 cols) ── */}
                <div className="lg:col-span-5 space-y-3.5">
                  {/* Media Upload */}
                  <div className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        3 — Product Image
                      </span>
                      <div className="flex items-center gap-1 bg-gray-200/80 p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setUploadMode("file")}
                          className={`px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                            uploadMode === "file"
                              ? "bg-white text-gray-900 shadow-2xs font-semibold"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          <UploadCloud className="w-3 h-3 text-yellow-600" /> Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("url")}
                          className={`px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                            uploadMode === "url"
                              ? "bg-white text-gray-900 shadow-2xs font-semibold"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          <Link2 className="w-3 h-3 text-blue-500" /> URL
                        </button>
                      </div>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                    />

                    {/* Compact Image Preview / Drop Zone */}
                    {form.imageUrl ? (
                      <div className="p-2.5 bg-white border border-gray-200 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={form.imageUrl}
                            alt="preview"
                            className="w-14 h-16 object-cover rounded-lg border border-emerald-300 shadow-2xs bg-white shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Ready &amp; Saved</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate font-mono">
                              {form.imageUrl}
                            </p>
                            {storageInfo && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ⚡ {storageInfo}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] text-yellow-700 hover:text-yellow-800 font-semibold"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                            className="text-[10px] text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : uploadMode === "file" ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          dragActive
                            ? "border-yellow-500 bg-yellow-50/60"
                            : "border-gray-300 hover:border-yellow-400 bg-white hover:bg-yellow-50/20"
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-2 py-2 text-yellow-800">
                            <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                            <span className="text-[11px] font-medium">Uploading to ImageKit CDN...</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="w-5 h-5 mx-auto text-yellow-600" />
                            <p className="text-[11px] font-semibold text-gray-800">Click or drag image here</p>
                            <p className="text-[10px] text-gray-400">PNG, JPG, WebP up to 10MB (Free Storage)</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FInput
                          type="url"
                          placeholder="https://ik.imagekit.io/.../image.jpg"
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => handleUrlImport(form.imageUrl)}
                          disabled={isUploading || !form.imageUrl}
                          className="w-full py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                        >
                          {isUploading ? "Importing..." : "Import to ImageKit"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fabric & Craftsmanship */}
                  <div className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      4 — Craftsmanship &amp; Tags
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>Fabric / Material</FieldLabel>
                        <FInput
                          value={form.fabricType}
                          onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
                          placeholder="84-Count Cotton"
                        />
                      </div>
                      <div>
                        <FieldLabel>Origin / Craft</FieldLabel>
                        <FInput
                          value={form.craftsmanship}
                          onChange={(e) => setForm({ ...form, craftsmanship: e.target.value })}
                          placeholder="Tangail Weave"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Tags (comma-separated)</FieldLabel>
                      <FInput
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="Jamdani, Eid Special, Bestseller"
                      />
                    </div>
                  </div>

                  {/* Promotions Checkboxes */}
                  <div className="flex items-center gap-4 bg-gray-50/60 border border-gray-200/80 rounded-xl px-3 py-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFlashDeal}
                        onChange={(e) => setForm({ ...form, isFlashDeal: e.target.checked })}
                        className="w-3.5 h-3.5 rounded border-gray-300 accent-yellow-400"
                      />
                      <span className="font-semibold text-gray-700 flex items-center gap-1 text-[11px]">
                        <Flame className="w-3 h-3 text-yellow-500" /> Flash Deal
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="w-3.5 h-3.5 rounded border-gray-300 accent-yellow-400"
                      />
                      <span className="font-semibold text-gray-700 flex items-center gap-1 text-[11px]">
                        <Star className="w-3 h-3 text-blue-500" /> Featured
                      </span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Modal Sticky Footer */}
              <div className="sticky bottom-0 -mx-4 -mb-5 sm:-mx-5 sm:-mb-5 mt-4 px-5 py-3 border-t border-gray-100 bg-white/95 backdrop-blur-xs flex items-center justify-between">
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-800">{form.sku || "AUTO-SKU"}</span>
                  <span>·</span>
                  <span>{form.stockQuantity} total stock</span>
                  <span>·</span>
                  <span>{form.variants.length} variant{form.variants.length === 1 ? "" : "s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ Delete Confirm Modal ══════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-gray-900">Delete Product?</h3>
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-semibold text-gray-900">{deleteTarget.nameEn}</span> will be permanently removed.
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
