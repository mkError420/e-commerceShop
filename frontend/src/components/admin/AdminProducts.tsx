import React, { useState, useMemo, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
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
} from "lucide-react";

/* ─── helpers ─── */
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = {
  nameEn: "",
  nameBn: "",
  descriptionEn: "",
  descriptionBn: "",
  categorySlug: "",
  subcategorySlug: "",
  priceBDT: 0,
  compareAtPriceBDT: 0,
  costPriceBDT: 0,
  stockQuantity: 0,
  lowStockAlert: 5,
  fabricType: "",
  craftsmanship: "",
  imageUrl: "",
  isFeatured: false,
  isFlashDeal: false,
  tags: "",
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
    className={`w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all placeholder:text-gray-400 ${props.className ?? ""}`}
  />
);

const FTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all resize-none placeholder:text-gray-400 ${props.className ?? ""}`}
  />
);

const FSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={`w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-medium transition-all ${props.className ?? ""}`}
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

  const handleUrlImport = async (urlToImport: string) => {
    if (!urlToImport.trim()) return;
    setIsUploading(true);
    try {
      const res = await uploadService.uploadProductImageUrl(urlToImport.trim());
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
      showToast(err?.message || "Failed to import image from URL", "error");
    } finally {
      setIsUploading(false);
    }
  };

  /* derived */
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategoryFilter) list = list.filter((p) => p.categorySlug === selectedCategoryFilter);
    if (stockFilter === "low") list = list.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockAlert);
    if (stockFilter === "out") list = list.filter((p) => p.stockQuantity === 0);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryNameEn.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [products, selectedCategoryFilter, stockFilter, searchQuery, sortBy, sortDir]);

  /* subcategories for selected cat in form */
  const subcats = useMemo(
    () => categories.find((c) => c.slug === form.categorySlug)?.subcategories ?? [],
    [categories, form.categorySlug]
  );

  /* open add */
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, categorySlug: categories[0]?.slug ?? "" });
    setEditingProduct(null);
    setStorageInfo(null);
    setIsUploading(false);
    setUploadMode("file");
    setIsModalOpen(true);
  };

  /* open edit */
  const openEdit = (p: Product) => {
    const firstImg = p.images[0] ?? "";
    setForm({
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
      lowStockAlert: p.lowStockAlert,
      fabricType: p.fabricType,
      craftsmanship: p.craftsmanship,
      imageUrl: firstImg,
      isFeatured: p.isFeatured,
      isFlashDeal: p.isFlashDeal,
      tags: p.tags.join(", "),
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

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
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
        stockQuantity: Number(form.stockQuantity),
        lowStockAlert: Number(form.lowStockAlert),
        fabricType: form.fabricType,
        craftsmanship: form.craftsmanship,
        images: [form.imageUrl || editingProduct.images[0]],
        isFeatured: form.isFeatured,
        isFlashDeal: form.isFlashDeal,
        tags: tagArr.length ? tagArr : editingProduct.tags,
      });
    } else {
      addProduct({
        id: `prod-${Date.now()}`,
        sku: `BA-${Math.floor(1000 + Math.random() * 9000)}`,
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
        stockQuantity: Number(form.stockQuantity),
        lowStockAlert: Number(form.lowStockAlert) || 5,
        fabricType: form.fabricType || "Handloom Cotton",
        craftsmanship: form.craftsmanship || "Handcrafted in Bangladesh",
        images: [
          form.imageUrl ||
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
        ],
        isFeatured: form.isFeatured,
        isFlashDeal: form.isFlashDeal,
        rating: 5.0,
        reviewsCount: 0,
        tags: tagArr.length ? tagArr : ["New Arrival"],
        variants: [
          { id: `v-${Date.now()}`, title: "Standard", size: "Free Size", stockQuantity: Number(form.stockQuantity), priceAdjustmentBDT: 0 },
        ],
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products", val: products.length, cls: "text-gray-900 bg-white" },
          { label: "Featured", val: products.filter((p) => p.isFeatured).length, cls: "text-blue-800 bg-blue-50" },
          { label: "Flash Deals", val: products.filter((p) => p.isFlashDeal).length, cls: "text-yellow-900 bg-yellow-50" },
          { label: "Low / Out of Stock", val: `${lowStockCount} / ${outOfStockCount}`, cls: "text-rose-700 bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border border-gray-200 px-4 py-3 shadow-xs ${s.cls}`}>
            <div className="text-xl font-bold font-mono">{s.val}</div>
            <div className="text-[11px] font-medium text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or category…"
            className="w-full text-xs p-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 font-medium w-full sm:w-48 transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.nameEn}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
          className="text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 font-medium w-full sm:w-40 transition-all"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock ⚠</option>
          <option value="out">Out of Stock 🚫</option>
        </select>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">{filteredProducts.length} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Item &amp; SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th
                  className="py-3.5 px-3 cursor-pointer hover:text-yellow-600 whitespace-nowrap"
                  onClick={() => toggleSort("priceBDT")}
                >
                  <span className="flex items-center gap-1">Price <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th
                  className="py-3.5 px-3 cursor-pointer hover:text-yellow-600 whitespace-nowrap"
                  onClick={() => toggleSort("stockQuantity")}
                >
                  <span className="flex items-center gap-1">Stock <ArrowUpDown className="w-3 h-3" /></span>
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
                      {/* Name */}
                      <td className="py-3.5 px-4">
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
                            <p className="font-semibold text-gray-900 line-clamp-1 max-w-[180px]">{p.nameEn}</p>
                            <p className="text-[11px] text-gray-500 font-mono">SKU: {p.sku}</p>
                            <p className="text-[10px] text-gray-400 italic">{p.fabricType}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700">
                          {p.categoryNameEn}
                        </span>
                        {p.subcategoryNameEn && (
                          <div className="text-[10px] text-gray-400 mt-0.5">{p.subcategoryNameEn}</div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-gray-900">{formatPrice(p.priceBDT)}</div>
                        {p.compareAtPriceBDT && (
                          <div className="text-[11px] text-gray-400 line-through font-mono">{formatPrice(p.compareAtPriceBDT)}</div>
                        )}
                      </td>

                      {/* Stock ± */}
                      <td className="py-3.5 px-3">
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
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1.5">
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* ══════ Add / Edit Modal ══════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-editorial text-xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingProduct ? `Editing: ${editingProduct.nameEn}` : "All starred fields are required"}
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
              {/* Section 1: Basic */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">1 — Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <FieldLabel required>Name (English)</FieldLabel>
                    <FInput required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Traditional Dhakai Jamdani Saree" />
                  </div>
                  <div>
                    <FieldLabel>Name (বাংলা)</FieldLabel>
                    <FInput value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} placeholder="ঢাকাই জামদানি শাড়ি" />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Description (English)</FieldLabel>
                    <FTextarea rows={2} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Artisanal description…" />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Description (বাংলা)</FieldLabel>
                    <FTextarea rows={2} value={form.descriptionBn} onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })} placeholder="পণ্যের বিস্তারিত…" />
                  </div>
                </div>
              </div>

              {/* Section 2: Category */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">2 — Category</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <FSelect value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value, subcategorySlug: "" })}>
                      <option value="">— Select Category —</option>
                      {categories.map((c) => <option key={c.id} value={c.slug}>{c.nameEn}</option>)}
                    </FSelect>
                  </div>
                  <div>
                    <FieldLabel>Subcategory</FieldLabel>
                    <FSelect value={form.subcategorySlug} onChange={(e) => setForm({ ...form, subcategorySlug: e.target.value })}>
                      <option value="">— None —</option>
                      {subcats.map((s) => <option key={s.id} value={s.slug}>{s.nameEn}</option>)}
                    </FSelect>
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing & Stock */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">3 — Pricing &amp; Stock</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div>
                    <FieldLabel required>Retail Price (৳)</FieldLabel>
                    <FInput type="number" min={1} required value={form.priceBDT} onChange={(e) => setForm({ ...form, priceBDT: Number(e.target.value) })} className="font-mono font-bold" />
                  </div>
                  <div>
                    <FieldLabel>Compare Price (৳)</FieldLabel>
                    <FInput type="number" min={0} value={form.compareAtPriceBDT} onChange={(e) => setForm({ ...form, compareAtPriceBDT: Number(e.target.value) })} className="font-mono" />
                  </div>
                  <div>
                    <FieldLabel>Cost Price (৳)</FieldLabel>
                    <FInput type="number" min={0} value={form.costPriceBDT} onChange={(e) => setForm({ ...form, costPriceBDT: Number(e.target.value) })} className="font-mono" />
                  </div>
                  <div>
                    <FieldLabel required>Stock Quantity</FieldLabel>
                    <FInput type="number" min={0} required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} className="font-mono font-bold" />
                  </div>
                  <div>
                    <FieldLabel>Low Stock Alert Threshold</FieldLabel>
                    <FInput type="number" min={1} value={form.lowStockAlert} onChange={(e) => setForm({ ...form, lowStockAlert: Number(e.target.value) })} className="font-mono" />
                  </div>
                </div>
              </div>

              {/* Section 4: Craft & Media */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">4 — Craft &amp; Media</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <FieldLabel>Fabric / Material</FieldLabel>
                    <FInput value={form.fabricType} onChange={(e) => setForm({ ...form, fabricType: e.target.value })} placeholder="84-Count Cotton Khadi" />
                  </div>
                  <div>
                    <FieldLabel>Craftsmanship Note</FieldLabel>
                    <FInput value={form.craftsmanship} onChange={(e) => setForm({ ...form, craftsmanship: e.target.value })} placeholder="Woven in Narayanganj" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel required>Product Image</FieldLabel>
                      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                        <button
                          type="button"
                          onClick={() => setUploadMode("file")}
                          className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                            uploadMode === "file"
                              ? "bg-white text-gray-900 shadow-xs font-semibold"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          <UploadCloud className="w-3 h-3 text-yellow-600" />
                          Upload File (Free)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("url")}
                          className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                            uploadMode === "url"
                              ? "bg-white text-gray-900 shadow-xs font-semibold"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          <Link2 className="w-3 h-3 text-blue-500" />
                          Paste URL
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
                          e.target.value = ""; // reset
                        }
                      }}
                    />

                    {uploadMode === "file" ? (
                      <div>
                        {form.imageUrl ? (
                          <div className="relative flex items-center gap-4 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                            <img
                              src={form.imageUrl}
                              alt="Product preview"
                              className="w-20 h-24 object-cover rounded-lg border border-emerald-300 shadow-xs bg-white shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop";
                              }}
                            />
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Image Saved &amp; Ready</span>
                              </div>
                              <p className="text-[11px] text-gray-500 truncate font-mono">
                                {form.imageUrl.startsWith("data:") ? "Offline Embedded Image (Data URL)" : form.imageUrl}
                              </p>
                              {storageInfo && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ⚡ {storageInfo}
                                </span>
                              )}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploading}
                                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 underline flex items-center gap-1"
                                >
                                  {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                  Replace Image
                                </button>
                                <span className="text-gray-300">·</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm((prev) => ({ ...prev, imageUrl: "" }));
                                    setStorageInfo(null);
                                  }}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                              dragActive
                                ? "border-yellow-500 bg-yellow-50/50"
                                : "border-gray-200 hover:border-yellow-400 bg-gray-50 hover:bg-yellow-50/20"
                            }`}
                          >
                            {isUploading ? (
                              <div className="py-2 flex flex-col items-center justify-center space-y-2">
                                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                                <div className="text-xs font-bold text-gray-700">Uploading &amp; saving image...</div>
                                <div className="text-[11px] text-gray-400">Storing to free local / CDN storage</div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mx-auto text-yellow-600">
                                  <UploadCloud className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-semibold text-gray-800">
                                  <span className="text-yellow-600 font-bold hover:underline">Click to upload</span> or drag and drop image
                                </div>
                                <p className="text-[11px] text-gray-400">
                                  PNG, JPG, WebP, GIF up to 10MB · 100% Free Storage
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <FInput
                            type="url"
                            value={form.imageUrl}
                            onChange={(e) => {
                              setForm({ ...form, imageUrl: e.target.value });
                              setStorageInfo(e.target.value.includes("imagekit.io") ? "ImageKit Cloud CDN" : "External Web URL");
                            }}
                            placeholder="https://images.unsplash.com/…"
                            className="font-mono text-[11px] flex-1"
                          />
                          {form.imageUrl && !form.imageUrl.includes("imagekit.io") && (
                            <button
                              type="button"
                              onClick={() => handleUrlImport(form.imageUrl)}
                              disabled={isUploading}
                              className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                            >
                              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                              Save to ImageKit
                            </button>
                          )}
                        </div>

                        {form.imageUrl && (
                          <div className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                            form.imageUrl.includes("imagekit.io") ? "bg-emerald-50/70 border-emerald-300" : "bg-gray-50 border-gray-200"
                          }`}>
                            <div className="flex items-center gap-3">
                              <img
                                src={form.imageUrl}
                                alt="preview"
                                className="w-12 h-14 object-cover rounded-lg border border-gray-200 bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <div>
                                <div className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                                  {form.imageUrl.includes("imagekit.io") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  {form.imageUrl.includes("imagekit.io") ? "Stored in ImageKit.io" : "External Web Image"}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate max-w-xs font-mono">
                                  {form.imageUrl}
                                </div>
                              </div>
                            </div>
                            {form.imageUrl.includes("imagekit.io") ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                ⚡ ImageKit Cloud CDN
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUrlImport(form.imageUrl)}
                                disabled={isUploading}
                                className="text-[11px] text-yellow-700 hover:text-yellow-800 font-bold underline shrink-0"
                              >
                                Upload to ImageKit
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Tags (comma-separated)</FieldLabel>
                    <FInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="New Arrival, Eid Special, Bestseller" />
                  </div>
                </div>
              </div>

              {/* Promotions */}
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFlashDeal} onChange={(e) => setForm({ ...form, isFlashDeal: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-yellow-400" />
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-yellow-500" /> Flash Deal
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-yellow-400" />
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-blue-500" /> Featured Product
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                  className="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
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

