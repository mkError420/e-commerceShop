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
  LayoutGrid,
  List,
  Copy,
  Check,
  TrendingUp,
  Tag,
  DollarSign,
  AlertCircle,
  Eye,
  SlidersHorizontal,
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
  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
    {children} {required && <span className="text-rose-500">*</span>}
  </label>
);

const FInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all placeholder:text-gray-400 ${props.className ?? ""}`}
  />
);

const FTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all resize-none placeholder:text-gray-400 ${props.className ?? ""}`}
  />
);

const FSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={`w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-medium transition-all ${props.className ?? ""}`}
  />
);

export const AdminProducts: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, formatPrice, showToast } = useStore();

  /* View Mode: Table vs Grid */
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  /* Filter states */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low" | "out">("all");
  const [flagFilter, setFlagFilter] = useState<"all" | "featured" | "flash">("all");
  const [sortBy, setSortBy] = useState<"nameEn" | "priceBDT" | "stockQuantity">("nameEn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  /* Modal state */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"basic" | "pricing" | "variants" | "media" | "attributes">("basic");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  /* Image Upload State */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [dragActive, setDragActive] = useState(false);
  const [storageInfo, setStorageInfo] = useState<string | null>(null);

  /* KPI calculations */
  const totalStockUnits = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0),
    [products]
  );
  const catalogValuationBDT = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.priceBDT) || 0) * (Number(p.stockQuantity) || 0), 0),
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stockQuantity === 0).length,
    [products]
  );
  const inStockCount = useMemo(
    () => products.filter((p) => p.stockQuantity > p.lowStockAlert).length,
    [products]
  );
  const featuredCount = useMemo(
    () => products.filter((p) => p.isFeatured).length,
    [products]
  );
  const flashCount = useMemo(
    () => products.filter((p) => p.isFlashDeal).length,
    [products]
  );

  /* Copy SKU handler */
  const handleCopySku = (sku: string) => {
    if (!sku) return;
    navigator.clipboard?.writeText(sku);
    setCopiedSku(sku);
    showToast(`Copied SKU: ${sku}`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  /* Upload helper */
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
        showToast("Image uploaded & saved to ImageKit.io!");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to upload image", "error");
    } finally {
      setIsUploading(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
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

  /* Filtered & sorted products */
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameBn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabricType.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategoryFilter) {
      list = list.filter((p) => p.categorySlug === selectedCategoryFilter);
    }
    if (stockFilter === "low") {
      list = list.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert);
    } else if (stockFilter === "out") {
      list = list.filter((p) => p.stockQuantity === 0);
    } else if (stockFilter === "in_stock") {
      list = list.filter((p) => p.stockQuantity > p.lowStockAlert);
    }
    if (flagFilter === "featured") {
      list = list.filter((p) => p.isFeatured);
    } else if (flagFilter === "flash") {
      list = list.filter((p) => p.isFlashDeal);
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
  }, [products, selectedCategoryFilter, stockFilter, flagFilter, searchQuery, sortBy, sortDir]);

  /* Subcategories for form category */
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

  /* Open Add Modal */
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
    setModalTab("basic");
    setIsModalOpen(true);
  };

  /* Open Edit Modal */
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
      tags: p.tags ? p.tags.join(", ") : "",
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
    setUploadMode(
      firstImg.startsWith("http") &&
        !firstImg.includes("/uploads/") &&
        !firstImg.includes("cloudinary") &&
        !firstImg.includes("imagekit.io")
        ? "url"
        : "file"
    );
    setModalTab("basic");
    setIsModalOpen(true);
  };

  /* Save Handler */
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn.trim() || form.priceBDT <= 0) {
      showToast("Product name and valid retail price are required", "error");
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
        subcategorySlug: form.subcategorySlug || undefined,
        subcategoryNameEn: subObj?.nameEn,
        subcategoryNameBn: subObj?.nameBn,
        priceBDT: form.priceBDT,
        compareAtPriceBDT: form.compareAtPriceBDT || undefined,
        costPriceBDT: form.costPriceBDT || undefined,
        stockQuantity: effectiveStock,
        lowStockAlert: form.lowStockAlert || 5,
        fabricType: form.fabricType.trim(),
        craftsmanship: form.craftsmanship.trim(),
        images: form.imageUrl ? [form.imageUrl] : editingProduct.images,
        isFeatured: form.isFeatured,
        isFlashDeal: form.isFlashDeal,
        tags: tagArr,
        variants: finalVariants,
      });
      showToast("Product updated successfully!");
    } else {
      addProduct({
        sku: effectiveSku,
        nameEn: form.nameEn.trim(),
        nameBn: form.nameBn.trim() || form.nameEn.trim(),
        slug: slugify(form.nameEn.trim()),
        descriptionEn: form.descriptionEn.trim(),
        descriptionBn: form.descriptionBn.trim(),
        categorySlug: form.categorySlug,
        categoryNameEn: catObj?.nameEn ?? "Uncategorized",
        categoryNameBn: catObj?.nameBn ?? "অশ্রেণীবদ্ধ",
        subcategorySlug: form.subcategorySlug || undefined,
        subcategoryNameEn: subObj?.nameEn,
        subcategoryNameBn: subObj?.nameBn,
        priceBDT: form.priceBDT,
        compareAtPriceBDT: form.compareAtPriceBDT || undefined,
        costPriceBDT: form.costPriceBDT || undefined,
        stockQuantity: effectiveStock,
        lowStockAlert: form.lowStockAlert || 5,
        fabricType: form.fabricType.trim(),
        craftsmanship: form.craftsmanship.trim(),
        images: form.imageUrl
          ? [form.imageUrl]
          : ["https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg"],
        isFeatured: form.isFeatured,
        isFlashDeal: form.isFlashDeal,
        tags: tagArr,
        variants: finalVariants,
        reviews: [],
      });
      showToast("New product created successfully!");
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  /* Inline Stock Stepper */
  const adjustStock = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stockQuantity + delta);
    updateProduct({ ...p, stockQuantity: newStock });
  };

  /* Sort toggle */
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── 1. Top Header & Primary Action ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-300 text-gray-950 flex items-center justify-center shadow-sm shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Product Catalog &amp; Stock
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                Live Inventory
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Control Bangladeshi handloom sarees, panjabis, variants, and ImageKit.io CDN assets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={openAdd}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Interactive KPI Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Products */}
        <div
          onClick={() => {
            setStockFilter("all");
            setFlagFilter("all");
          }}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-yellow-100 text-gray-700 group-hover:text-yellow-800 flex items-center justify-center transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">{products.length}</span>
            <span className="text-[11px] text-gray-500 font-medium">Items</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            <span>{categories.length} Categories</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">{inStockCount} In Stock</span>
          </div>
        </div>

        {/* Card 2: Total Units In Stock */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Stock Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              {totalStockUnits.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Pieces</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            <span>Valuation:</span>
            <span className="font-mono font-bold text-gray-800">{formatPrice(catalogValuationBDT)}</span>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts (Clickable filter) */}
        <div
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
            stockFilter === "low"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40"
              : "bg-white border-gray-200 shadow-2xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Low Stock Warning
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 tracking-tight">{lowStockCount}</span>
            <span className="text-[11px] text-amber-700 font-medium">Need Restock</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100 text-[10px] text-amber-700">
            <span>Threshold &le; alert limit</span>
            <span className="font-bold underline group-hover:text-amber-900">
              {stockFilter === "low" ? "Active Filter" : "Filter List &rarr;"}
            </span>
          </div>
        </div>

        {/* Card 4: Out of Stock Alerts (Clickable filter) */}
        <div
          onClick={() => setStockFilter(stockFilter === "out" ? "all" : "out")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
            stockFilter === "out"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/40"
              : "bg-white border-gray-200 shadow-2xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900 tracking-tight">{outOfStockCount}</span>
            <span className="text-[11px] text-rose-700 font-medium">Unavailable</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-100 text-[10px] text-rose-700">
            <span>0 remaining items</span>
            <span className="font-bold underline group-hover:text-rose-900">
              {stockFilter === "out" ? "Active Filter" : "Filter List &rarr;"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Filter, Search & Layout Control Toolbar ─── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, বাংলা নাম, SKU, Jamdani, silk, cotton..."
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder:text-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 min-w-[210px]">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Categories ({products.length})</option>
              {categories.map((c) => {
                const count = products.filter((p) => p.categorySlug === c.slug).length;
                return (
                  <option key={c.id} value={c.slug}>
                    {c.nameEn} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 min-w-[190px]">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split("-") as [any, any];
                setSortBy(sb);
                setSortDir(sd);
              }}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="nameEn-asc">Name: A to Z</option>
              <option value="nameEn-desc">Name: Z to A</option>
              <option value="priceBDT-asc">Price: Low to High</option>
              <option value="priceBDT-desc">Price: High to Low</option>
              <option value="stockQuantity-desc">Stock: High to Low</option>
              <option value="stockQuantity-asc">Stock: Low to High</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                viewMode === "table"
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                viewMode === "grid"
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Visual Cards Grid"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Sub-Filters: Stock Pills & Flag Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Stock Status:
            </span>
            {(
              [
                { key: "all", label: "All Items", count: products.length },
                { key: "in_stock", label: "In Stock", count: inStockCount },
                { key: "low", label: "Low Stock", count: lowStockCount },
                { key: "out", label: "Out of Stock", count: outOfStockCount },
              ] as const
            ).map((s) => (
              <button
                key={s.key}
                onClick={() => setStockFilter(s.key)}
                className={`text-[11px] px-3 py-1 rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                  stockFilter === s.key
                    ? "bg-gray-900 text-white shadow-xs font-bold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{s.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({s.count})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Flags:
            </span>
            <button
              onClick={() => setFlagFilter(flagFilter === "featured" ? "all" : "featured")}
              className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 border transition-all ${
                flagFilter === "featured"
                  ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
            >
              <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
              <span>Featured ({featuredCount})</span>
            </button>
            <button
              onClick={() => setFlagFilter(flagFilter === "flash" ? "all" : "flash")}
              className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 border transition-all ${
                flagFilter === "flash"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-900 font-bold"
                  : "bg-white border-gray-200 text-gray-600 hover:border-yellow-300"
              }`}
            >
              <Flame className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>Flash Deals ({flashCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4A. Table View ─── */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/90 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-yellow-700 select-none"
                    onClick={() => toggleSort("nameEn")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product &amp; SKU</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Category</th>
                  <th
                    className="py-3.5 px-3 cursor-pointer hover:text-yellow-700 select-none"
                    onClick={() => toggleSort("priceBDT")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Price (BDT)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-3 cursor-pointer hover:text-yellow-700 select-none"
                    onClick={() => toggleSort("stockQuantity")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Inventory / Stepper</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Badges &amp; Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-2.5 text-gray-300" />
                      <p className="font-bold text-sm text-gray-700">No products match your search or filter</p>
                      <p className="text-xs text-gray-400 mt-1">Try resetting the stock filter or search query.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategoryFilter("");
                          setStockFilter("all");
                          setFlagFilter("all");
                        }}
                        className="mt-3 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert;
                    const isOut = p.stockQuantity === 0;
                    const isImageKit = p.images[0]?.includes("imagekit.io");
                    return (
                      <tr key={p.id} className="hover:bg-yellow-50/30 transition-colors group">
                        {/* 1. Image, Name & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/90 shrink-0 relative group/img">
                              {p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.nameEn}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                              {isImageKit && (
                                <span
                                  title="Hosted on ImageKit.io CDN"
                                  className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900 truncate max-w-[220px] sm:max-w-[280px]">
                                  {p.nameEn}
                                </p>
                              </div>
                              {p.nameBn && (
                                <p className="text-[11px] text-gray-500 font-medium truncate max-w-[220px]">
                                  {p.nameBn}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopySku(p.sku)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-100 border border-gray-200 text-[10px] font-mono font-bold text-gray-700 transition-colors"
                                  title="Click to copy SKU"
                                >
                                  {copiedSku === p.sku ? (
                                    <>
                                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                                      <span className="text-emerald-700">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-2.5 h-2.5 text-gray-400" />
                                      <span>{p.sku}</span>
                                    </>
                                  )}
                                </button>
                                {p.fabricType && (
                                  <span className="text-[10px] text-gray-400 truncate max-w-[110px]">
                                    · {p.fabricType}
                                  </span>
                                )}
                              </div>

                              {/* Variants pills */}
                              {p.variants && p.variants.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                  {p.variants.slice(0, 4).map((v) => (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-md bg-yellow-50 text-yellow-900 border border-yellow-200 font-semibold"
                                      title={`${v.size || v.title}: ${v.stockQuantity} pcs in stock`}
                                    >
                                      <span>{v.size || v.title}</span>
                                      <span className="text-gray-400 font-mono">({v.stockQuantity})</span>
                                    </span>
                                  ))}
                                  {p.variants.length > 4 && (
                                    <span className="text-[9px] text-gray-400 font-medium">
                                      +{p.variants.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Category & Subcategory */}
                        <td className="py-3.5 px-3">
                          <span className="inline-block bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg text-[11px] font-bold text-gray-800">
                            {p.categoryNameEn}
                          </span>
                          {p.subcategoryNameEn && (
                            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                              {p.subcategoryNameEn}
                            </div>
                          )}
                        </td>

                        {/* 3. Pricing */}
                        <td className="py-3.5 px-3">
                          <div className="font-mono font-bold text-sm text-gray-900">
                            {formatPrice(p.priceBDT)}
                          </div>
                          {p.compareAtPriceBDT && p.compareAtPriceBDT > p.priceBDT && (
                            <div className="text-[10px] text-gray-400 line-through font-mono">
                              {formatPrice(p.compareAtPriceBDT)}
                            </div>
                          )}
                        </td>

                        {/* 4. Stock Stepper & Health Bar */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => adjustStock(p, -1)}
                              className="w-6 h-6 bg-gray-100 hover:bg-yellow-400 hover:text-gray-950 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center transition-colors active:scale-90"
                              title="Decrease Stock"
                            >
                              -
                            </button>
                            <span
                              className={`font-mono font-bold text-xs min-w-[40px] text-center py-1 rounded-lg border ${
                                isOut
                                  ? "text-rose-900 bg-rose-100 border-rose-300 font-black"
                                  : isLowStock
                                    ? "text-amber-900 bg-amber-100 border-amber-300 font-bold"
                                    : "text-gray-900 bg-gray-50 border-gray-200"
                              }`}
                            >
                              {p.stockQuantity}
                            </span>
                            <button
                              onClick={() => adjustStock(p, 1)}
                              className="w-6 h-6 bg-gray-100 hover:bg-yellow-400 hover:text-gray-950 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center transition-colors active:scale-90"
                              title="Increase Stock"
                            >
                              +
                            </button>
                          </div>
                          {/* Visual stock progress line */}
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOut ? "w-0" : isLowStock ? "bg-amber-400 w-1/3" : "bg-emerald-500 w-full"
                              }`}
                            />
                          </div>
                          <div className="text-[9px] font-semibold mt-0.5">
                            {isOut ? (
                              <span className="text-rose-600">Out of Stock</span>
                            ) : isLowStock ? (
                              <span className="text-amber-700">Low Stock (&le; {p.lowStockAlert})</span>
                            ) : (
                              <span className="text-emerald-700">Healthy Stock</span>
                            )}
                          </div>
                        </td>

                        {/* 5. Badges & Toggle */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => updateProduct({ ...p, isFlashDeal: !p.isFlashDeal })}
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                                p.isFlashDeal
                                  ? "bg-yellow-100 border-yellow-300 text-yellow-900 font-bold"
                                  : "bg-white border-gray-200 text-gray-400 hover:border-yellow-300"
                              }`}
                            >
                              <Flame
                                className={`w-3 h-3 ${p.isFlashDeal ? "fill-yellow-600 text-yellow-600" : "text-gray-300"}`}
                              />
                              {p.isFlashDeal ? "Flash Deal" : "Normal"}
                            </button>
                            <button
                              onClick={() => updateProduct({ ...p, isFeatured: !p.isFeatured })}
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                                p.isFeatured
                                  ? "bg-blue-50 border-blue-200 text-blue-800 font-bold"
                                  : "bg-white border-gray-200 text-gray-400 hover:border-blue-200"
                              }`}
                            >
                              <Star
                                className={`w-3 h-3 ${p.isFeatured ? "fill-blue-500 text-blue-500" : "text-gray-300"}`}
                              />
                              {p.isFeatured ? "Featured" : "Standard"}
                            </button>
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-yellow-400 hover:border-yellow-400 text-gray-700 hover:text-gray-950 transition-all shadow-2xs"
                              title="Edit Product"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-gray-400 hover:text-rose-600 transition-all shadow-2xs"
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
      )}

      {/* ─── 4B. Visual Card Grid View ─── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
              <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-gray-700">No products match this filter</p>
              <p className="text-xs text-gray-400 mt-1">Try changing stock filters or keywords</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert;
              const isOut = p.stockQuantity === 0;
              const isImageKit = p.images[0]?.includes("imagekit.io");
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      {isImageKit && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/80 backdrop-blur-xs text-emerald-300 border border-emerald-400/30 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> ImageKit
                        </span>
                      )}
                      {p.isFlashDeal && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-400 text-gray-950 flex items-center gap-0.5 shadow-xs">
                          <Flame className="w-2.5 h-2.5 fill-gray-950" /> Flash
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 text-white flex items-center gap-0.5 shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-white" /> Featured
                        </span>
                      )}
                    </div>

                    {/* Stock status pill on bottom image */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleCopySku(p.sku)}
                        className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white font-bold flex items-center gap-1 border border-white/20 hover:bg-black"
                      >
                        <Copy className="w-2.5 h-2.5 text-yellow-400" />
                        <span>{p.sku}</span>
                      </button>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-xs ${
                          isOut
                            ? "bg-rose-500/90 text-white"
                            : isLowStock
                              ? "bg-amber-500/90 text-white"
                              : "bg-emerald-500/90 text-white"
                        }`}
                      >
                        {isOut ? "Out of Stock" : `${p.stockQuantity} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                        <span className="font-bold text-gray-700">{p.categoryNameEn}</span>
                        {p.fabricType && <span className="italic truncate">{p.fabricType}</span>}
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{p.nameEn}</h3>
                      {p.nameBn && (
                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{p.nameBn}</p>
                      )}
                    </div>

                    {/* Price & Stepper */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <div className="font-mono font-black text-base text-gray-900">
                          {formatPrice(p.priceBDT)}
                        </div>
                        {p.compareAtPriceBDT && p.compareAtPriceBDT > p.priceBDT && (
                          <div className="text-[10px] text-gray-400 line-through font-mono">
                            {formatPrice(p.compareAtPriceBDT)}
                          </div>
                        )}
                      </div>

                      {/* Stock Stepper */}
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-xl">
                        <button
                          onClick={() => adjustStock(p, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-yellow-400 hover:text-gray-950 font-bold text-xs flex items-center justify-center transition-colors shadow-2xs"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs px-2 text-center text-gray-800">
                          {p.stockQuantity}
                        </span>
                        <button
                          onClick={() => adjustStock(p, 1)}
                          className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-yellow-400 hover:text-gray-950 font-bold text-xs flex items-center justify-center transition-colors shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex-1 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Product</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── 5. Add / Edit Modal (Compact 2-Column Workflow) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-400 text-gray-950 flex items-center justify-center shadow-xs shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {editingProduct ? "Edit Product Details" : "Create New Catalog Product"}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-200/80 text-gray-800">
                      SKU: {form.sku || "AUTO"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Configure names, Bengali translations, ImageKit.io photo, variants, and stock
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* ── Left Column (7 cols): Basic Info, Pricing & Sizes ── */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* Section 1: Identification & Taxonomy */}
                  <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3.5 space-y-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      1 — Taxonomy &amp; Naming
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* SKU */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <FieldLabel required>SKU</FieldLabel>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, sku: generateSKU(prev.categorySlug) }))
                            }
                            className="text-[10px] text-yellow-700 hover:text-yellow-900 font-bold flex items-center gap-0.5"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Gen
                          </button>
                        </div>
                        <FInput
                          required
                          value={form.sku}
                          onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                          placeholder="JAM-1024"
                          className="font-mono font-bold uppercase"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <FieldLabel required>Category</FieldLabel>
                        <FSelect
                          value={form.categorySlug}
                          onChange={(e) =>
                            setForm({ ...form, categorySlug: e.target.value, subcategorySlug: "" })
                          }
                        >
                          <option value="">— Select Category —</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.nameEn}
                            </option>
                          ))}
                        </FSelect>
                      </div>

                      {/* Subcategory */}
                      <div>
                        <FieldLabel>Subcategory</FieldLabel>
                        <FSelect
                          value={form.subcategorySlug}
                          onChange={(e) => setForm({ ...form, subcategorySlug: e.target.value })}
                        >
                          <option value="">— Optional —</option>
                          {subcats.map((s) => (
                            <option key={s.id} value={s.slug}>
                              {s.nameEn}
                            </option>
                          ))}
                        </FSelect>
                      </div>
                    </div>

                    {/* Dual-Language Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <FieldLabel required>Product Title (English)</FieldLabel>
                        <FInput
                          required
                          value={form.nameEn}
                          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                          placeholder="Dhakai Muslin Jamdani"
                        />
                      </div>
                      <div>
                        <FieldLabel>Product Title (বাংলা)</FieldLabel>
                        <FInput
                          value={form.nameBn}
                          onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                          placeholder="ঢাকাই মসলিন জামদানি"
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
                          placeholder="Authentic handwoven collection from Sonargaon weavers..."
                        />
                      </div>
                      <div>
                        <FieldLabel>Description (বাংলা)</FieldLabel>
                        <FTextarea
                          rows={2}
                          value={form.descriptionBn}
                          onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })}
                          placeholder="সোনারগাঁয়ের ঐতিহ্যবাহী তাঁতিদের হাতে বোনা..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Pricing & Inventory */}
                  <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      2 — Pricing &amp; Inventory Counters
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <div>
                        <FieldLabel required>Price (৳)</FieldLabel>
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
                          placeholder="Regular"
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
                          placeholder="Buying"
                        />
                      </div>
                      <div>
                        <FieldLabel required>Total Stock</FieldLabel>
                        <FInput
                          type="number"
                          min={0}
                          required
                          value={form.stockQuantity}
                          onChange={(e) =>
                            setForm({ ...form, stockQuantity: Math.max(0, Number(e.target.value)) })
                          }
                          className="font-mono font-bold"
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

                  {/* Section 3: Variants / Sizes */}
                  <div className="bg-amber-50/40 border border-amber-200/90 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-yellow-600" />
                          Sizes &amp; Multi-Variants ({form.variants.length})
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Sizes are dynamically selectable by customers on storefront
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded-lg border border-gray-200 shadow-2xs">
                        Sum: {form.variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0)} pcs
                      </span>
                    </div>

                    {/* Quick Add Size Buttons */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-gray-500 font-semibold mr-1">Quick Add:</span>
                      {["Free Size", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44"].map((sz) => {
                        const added = form.variants.some((v) => v.size.toLowerCase() === sz.toLowerCase());
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => addQuickVariant(sz)}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                              added
                                ? "bg-yellow-300 border-yellow-500 text-gray-950 font-bold"
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
                        className="text-[10px] px-2 py-0.5 rounded-lg border border-dashed border-yellow-500 bg-white text-yellow-900 hover:bg-yellow-50 font-bold transition-all ml-auto"
                      >
                        + Custom
                      </button>
                    </div>

                    {/* Variant list */}
                    {form.variants.length === 0 ? (
                      <div className="p-2.5 text-center bg-white rounded-xl border border-dashed border-gray-200 text-[11px] text-gray-400">
                        No sizes added. Will default to Free Size.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {form.variants.map((v, idx) => (
                          <div
                            key={v.id}
                            className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs"
                          >
                            <input
                              type="text"
                              value={v.size}
                              onChange={(e) => updateVariantField(idx, "size", e.target.value)}
                              placeholder="Size (e.g. XL)"
                              className="w-24 py-1 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900"
                            />
                            <div className="flex items-center flex-1">
                              <span className="text-[10px] text-gray-400 mr-1">Stock:</span>
                              <input
                                type="number"
                                min={0}
                                value={v.stockQuantity}
                                onChange={(e) =>
                                  updateVariantField(
                                    idx,
                                    "stockQuantity",
                                    Math.max(0, parseInt(e.target.value) || 0)
                                  )
                                }
                                className="w-full py-1 px-1 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-center"
                              />
                            </div>
                            <div className="flex items-center flex-1">
                              <span className="text-[10px] text-gray-400 mr-1">±৳:</span>
                              <input
                                type="number"
                                value={v.priceAdjustmentBDT}
                                onChange={(e) =>
                                  updateVariantField(
                                    idx,
                                    "priceAdjustmentBDT",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-full py-1 px-1 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono text-center"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Right Column (5 cols): ImageKit CDN & Craftsmanship ── */}
                <div className="lg:col-span-5 space-y-3.5">
                  {/* Media Upload Box */}
                  <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        3 — Photo &amp; ImageKit CDN
                      </span>
                      <div className="flex items-center gap-1 bg-gray-200/80 p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setUploadMode("file")}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                            uploadMode === "file" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500"
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("url")}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                            uploadMode === "url" ? "bg-white text-gray-950 shadow-xs" : "text-gray-500"
                          }`}
                        >
                          URL
                        </button>
                      </div>
                    </div>

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

                    {/* Image preview / Dropzone */}
                    {form.imageUrl ? (
                      <div className="p-2.5 bg-white border border-gray-200 rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={form.imageUrl}
                            alt="preview"
                            className="w-16 h-18 object-cover rounded-xl border border-emerald-300 shadow-xs bg-white shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Live on ImageKit.io</span>
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
                            className="text-[10px] text-yellow-800 hover:underline font-bold"
                          >
                            Replace Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
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
                        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                          dragActive
                            ? "border-yellow-500 bg-yellow-50/70 scale-[0.99]"
                            : "border-gray-300 hover:border-yellow-400 bg-white"
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-2 py-2 text-yellow-800">
                            <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                            <span className="text-[11px] font-bold">Uploading to ImageKit CDN...</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="w-6 h-6 mx-auto text-yellow-600" />
                            <p className="text-xs font-bold text-gray-800">Click or drop image</p>
                            <p className="text-[10px] text-gray-400">PNG, JPG, WebP up to 10MB</p>
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
                          className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isUploading ? "Importing..." : "Import to ImageKit"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Bangladeshi Craftsmanship & Attributes */}
                  <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      4 — Craftsmanship &amp; Heritage
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>Fabric / Weave</FieldLabel>
                        <FInput
                          value={form.fabricType}
                          onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
                          placeholder="100-Count Khadi / Silk"
                        />
                      </div>
                      <div>
                        <FieldLabel>Region / Craft</FieldLabel>
                        <FInput
                          value={form.craftsmanship}
                          onChange={(e) => setForm({ ...form, craftsmanship: e.target.value })}
                          placeholder="Sonargaon / Tangail"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Tags (comma-separated)</FieldLabel>
                      <FInput
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="Jamdani, Eid Special, Handloom, Silk"
                      />
                    </div>
                  </div>

                  {/* Section 5: Merchandising Badges */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isFlashDeal}
                        onChange={(e) => setForm({ ...form, isFlashDeal: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 accent-yellow-400"
                      />
                      <span className="font-bold text-gray-800 flex items-center gap-1 text-xs">
                        <Flame className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
                        Flash Deal
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 accent-yellow-400"
                      />
                      <span className="font-bold text-gray-800 flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                        Featured
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
                  <span>{form.variants.length} size{form.variants.length === 1 ? "" : "s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    {editingProduct ? "Save Product Changes" : "Publish to Catalog"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. Delete Confirmation Dialog ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Remove Product?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove{" "}
                <strong className="text-gray-900">{deleteTarget.nameEn}</strong>? This will remove
                it from the storefront catalog and stock ledger.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteTarget.id);
                  setDeleteTarget(null);
                  showToast("Product deleted successfully");
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
