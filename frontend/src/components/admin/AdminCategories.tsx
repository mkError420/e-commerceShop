import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Category } from "../../types";
import {
  FolderTree,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Star,
  ExternalLink,
  X,
  RefreshCw,
  FolderPlus,
  Info,
  CheckCircle2,
} from "lucide-react";

/* ─── Helpers ─── */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_CATEGORY_IMG =
  "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg";

export const AdminCategories: React.FC = () => {
  const {
    categories,
    products,
    refreshCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured">("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((c) => {
      initial[c.id || c.slug] = true;
    });
    return initial;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    category?: Category;
  }>({ isOpen: false, mode: "create" });

  const [subcategoryModal, setSubcategoryModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    parentId: string;
    parentName: string;
    subcategory?: Category;
  }>({ isOpen: false, mode: "create", parentId: "", parentName: "" });

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "subcategory";
    categoryId: string;
    categoryName: string;
    subId?: string;
  } | null>(null);

  // Form States for Category Modal
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameBn, setCatNameBn] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescEn, setCatDescEn] = useState("");
  const [catDescBn, setCatDescBn] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catIsFeatured, setCatIsFeatured] = useState(false);

  // Form States for Subcategory Modal
  const [subNameEn, setSubNameEn] = useState("");
  const [subNameBn, setSubNameBn] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subDescEn, setSubDescEn] = useState("");
  const [subDescBn, setSubDescBn] = useState("");
  const [subImage, setSubImage] = useState("");
  const [subIsFeatured, setSubIsFeatured] = useState(false);

  // Toggle Category Accordion
  const toggleExpand = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    categories.forEach((c) => {
      all[c.id || c.slug] = true;
    });
    setExpandedCategories(all);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Metrics
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + (cat.subcategories?.length || 0),
    0
  );
  const totalFeatured = categories.filter((c) => c.isFeatured).length;

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (filterFeatured === "featured" && !cat.isFeatured) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCat =
          cat.nameEn.toLowerCase().includes(q) ||
          cat.nameBn?.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          cat.descriptionEn?.toLowerCase().includes(q);

        const matchSub = cat.subcategories?.some(
          (sub) =>
            sub.nameEn.toLowerCase().includes(q) ||
            sub.nameBn?.toLowerCase().includes(q) ||
            sub.slug.toLowerCase().includes(q)
        );

        return matchCat || matchSub;
      }

      return true;
    });
  }, [categories, searchQuery, filterFeatured]);

  // Open Category Modal (Add / Edit)
  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setCategoryModal({ isOpen: true, mode: "edit", category: cat });
      setCatNameEn(cat.nameEn);
      setCatNameBn(cat.nameBn || "");
      setCatSlug(cat.slug);
      setCatDescEn(cat.descriptionEn || "");
      setCatDescBn(cat.descriptionBn || "");
      setCatImage(cat.image || "");
      setCatIsFeatured(Boolean(cat.isFeatured));
    } else {
      setCategoryModal({ isOpen: true, mode: "create" });
      setCatNameEn("");
      setCatNameBn("");
      setCatSlug("");
      setCatDescEn("");
      setCatDescBn("");
      setCatImage("");
      setCatIsFeatured(false);
    }
  };

  // Open Subcategory Modal (Add / Edit)
  const openSubcategoryModal = (parentCat: Category, sub?: Category) => {
    const parentId = parentCat.id || parentCat.slug;
    if (sub) {
      setSubcategoryModal({
        isOpen: true,
        mode: "edit",
        parentId,
        parentName: parentCat.nameEn,
        subcategory: sub,
      });
      setSubNameEn(sub.nameEn);
      setSubNameBn(sub.nameBn || "");
      setSubSlug(sub.slug);
      setSubDescEn(sub.descriptionEn || "");
      setSubDescBn(sub.descriptionBn || "");
      setSubImage(sub.image || "");
      setSubIsFeatured(Boolean(sub.isFeatured));
    } else {
      setSubcategoryModal({
        isOpen: true,
        mode: "create",
        parentId,
        parentName: parentCat.nameEn,
      });
      setSubNameEn("");
      setSubNameBn("");
      setSubSlug("");
      setSubDescEn("");
      setSubDescBn("");
      setSubImage("");
      setSubIsFeatured(false);
    }
  };

  // Handle Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameEn.trim()) {
      showToast("Category name in English is required", "error");
      return;
    }

    const finalSlug = catSlug.trim() ? slugify(catSlug) : slugify(catNameEn);

    if (categoryModal.mode === "create") {
      const newCat: Category = {
        id: `cat-${finalSlug}`,
        nameEn: catNameEn.trim(),
        nameBn: catNameBn.trim() || catNameEn.trim(),
        slug: finalSlug,
        descriptionEn:
          catDescEn.trim() ||
          "Curated collection of authentic Bangladeshi heritage handlooms.",
        descriptionBn: catDescBn.trim() || "ঐতিহ্যবাহী বাংলাদেশী হস্তশিল্প ও পোশাক সংগ্রহ।",
        image: catImage.trim() || DEFAULT_CATEGORY_IMG,
        isFeatured: catIsFeatured,
        subcategories: [],
      };
      await addCategory(newCat);
      setExpandedCategories((prev) => ({ ...prev, [newCat.id]: true }));
    } else if (categoryModal.category) {
      const updated: Category = {
        ...categoryModal.category,
        nameEn: catNameEn.trim(),
        nameBn: catNameBn.trim() || catNameEn.trim(),
        slug: finalSlug,
        descriptionEn: catDescEn.trim(),
        descriptionBn: catDescBn.trim(),
        image: catImage.trim() || categoryModal.category.image,
        isFeatured: catIsFeatured,
      };
      await updateCategory(updated);
    }

    setCategoryModal({ isOpen: false, mode: "create" });
  };

  // Handle Save Subcategory
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subNameEn.trim()) {
      showToast("Subcategory name in English is required", "error");
      return;
    }

    const finalSlug = subSlug.trim() ? slugify(subSlug) : slugify(subNameEn);

    if (subcategoryModal.mode === "create") {
      const newSub: Category = {
        id: `sub-${finalSlug}-${Date.now().toString().slice(-4)}`,
        nameEn: subNameEn.trim(),
        nameBn: subNameBn.trim() || subNameEn.trim(),
        slug: finalSlug,
        descriptionEn: subDescEn.trim(),
        descriptionBn: subDescBn.trim(),
        image: subImage.trim() || DEFAULT_CATEGORY_IMG,
        isFeatured: subIsFeatured,
        parentSlug: subcategoryModal.parentId,
      };
      await addSubcategory(subcategoryModal.parentId, newSub);
      setExpandedCategories((prev) => ({
        ...prev,
        [subcategoryModal.parentId]: true,
      }));
    } else if (subcategoryModal.subcategory) {
      const updated: Category = {
        ...subcategoryModal.subcategory,
        nameEn: subNameEn.trim(),
        nameBn: subNameBn.trim() || subNameEn.trim(),
        slug: finalSlug,
        descriptionEn: subDescEn.trim(),
        descriptionBn: subDescBn.trim(),
        image: subImage.trim() || subcategoryModal.subcategory.image,
        isFeatured: subIsFeatured,
        parentSlug: subcategoryModal.parentId,
      };
      await updateSubcategory(subcategoryModal.parentId, updated);
    }

    setSubcategoryModal({ isOpen: false, mode: "create", parentId: "", parentName: "" });
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "category") {
      await deleteCategory(deleteTarget.categoryId);
    } else if (deleteTarget.type === "subcategory" && deleteTarget.subId) {
      await deleteSubcategory(deleteTarget.categoryId, deleteTarget.subId);
    }

    setDeleteTarget(null);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshCategories();
    setIsRefreshing(false);
    showToast("Categories synchronized with MongoDB database");
  };

  return (
    <div className="space-y-6">
      {/* ══════ Top Header & Quick Actions ══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <FolderTree className="w-3.5 h-3.5 text-yellow-500" />
            <span>Taxonomy & Navigation</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-gray-900">
            Category & Sub-Category Catalog
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize store hierarchy, manage English/Bengali names, featured flags, and subcategories linked with database.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-gray-200"
            title="Sync with MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-yellow-600" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
          </button>

          <button
            onClick={() => openCategoryModal()}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* ══════ Metrics Cards ══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Top Categories</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCategories}</p>
            <span className="text-[10px] text-gray-400">Primary collections</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sub-Categories</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalSubcategories}</p>
            <span className="text-[10px] text-gray-400">Nested branches</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Featured Hubs</span>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{totalFeatured}</p>
            <span className="text-[10px] text-gray-400">Highlighted on homepage</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600">
            <Star className="w-5 h-5 fill-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Products</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
            <span className="text-[10px] text-gray-400">Distributed in catalog</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ══════ Search & Filter Toolbar ══════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category, subcategory (English or বাংলা), or slug..."
            className="w-full text-xs p-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as any)}
            className="text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium"
          >
            <option value="all">All Categories ({categories.length})</option>
            <option value="featured">Featured Only ({totalFeatured})</option>
          </select>

          <button
            onClick={expandAll}
            className="text-[11px] px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-[11px] px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ══════ Categories Tree / Cards ══════ */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto text-yellow-600">
              <FolderTree className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-gray-900">No categories found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No categories match your search filters. Try clearing your search or add a new category.
            </p>
            <button
              onClick={() => openCategoryModal()}
              className="mt-2 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Category</span>
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const catKey = cat.id || cat.slug;
            const isExpanded = Boolean(expandedCategories[catKey]);
            const subList = cat.subcategories || [];
            const productCount = products.filter(
              (p) => p.categorySlug === cat.slug || p.categorySlug === cat.id
            ).length;

            return (
              <div
                key={catKey}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-gray-300"
              >
                {/* ── Category Header Row ── */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleExpand(catKey)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                      title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-700" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    <img
                      src={cat.image || DEFAULT_CATEGORY_IMG}
                      alt={cat.nameEn}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-200 bg-gray-100 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-950 text-sm sm:text-base truncate">
                          {cat.nameEn}
                        </h3>
                        {cat.nameBn && (
                          <span className="text-xs text-gray-500 font-bangla">
                            ({cat.nameBn})
                          </span>
                        )}
                        {cat.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-yellow-500" /> Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap font-mono">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                          slug: {cat.slug}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-[11px] text-gray-600 font-sans">
                          {subList.length} sub-categories
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-[11px] text-gray-600 font-sans">
                          {productCount} products
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => openSubcategoryModal(cat)}
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-yellow-700" />
                      <span>Add Sub-category</span>
                    </button>

                    <button
                      onClick={() => openCategoryModal(cat)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: "category",
                          categoryId: cat.id || cat.slug,
                          categoryName: cat.nameEn,
                        })
                      }
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── Subcategories List / Accordion ── */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-white space-y-3">
                    {subList.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-xs text-gray-500">
                          No sub-categories created under <span className="font-semibold">{cat.nameEn}</span> yet.
                        </p>
                        <button
                          onClick={() => openSubcategoryModal(cat)}
                          className="mt-2 text-xs text-yellow-700 hover:text-yellow-800 font-bold inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add First Sub-category
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subList.map((sub) => {
                          const subId = sub.id || sub.slug;
                          const subProductCount = products.filter(
                            (p) => p.subcategorySlug === sub.slug || p.subcategorySlug === subId
                          ).length;

                          return (
                            <div
                              key={subId}
                              className="p-3.5 bg-gray-50 hover:bg-yellow-50/30 border border-gray-200 hover:border-yellow-200 rounded-xl transition-all flex items-start justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                {sub.image ? (
                                  <img
                                    src={sub.image}
                                    alt={sub.nameEn}
                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-100 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-200/80 border border-gray-300 flex items-center justify-center text-gray-500 shrink-0">
                                    <Layers className="w-4 h-4" />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-semibold text-gray-900 text-xs truncate">
                                      {sub.nameEn}
                                    </h4>
                                    {sub.isFeatured && (
                                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    )}
                                  </div>

                                  {sub.nameBn && (
                                    <p className="text-[11px] text-gray-500 font-bangla truncate">
                                      {sub.nameBn}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-gray-500">
                                    <span className="text-gray-400">slug: {sub.slug}</span>
                                    <span>·</span>
                                    <span className="font-sans text-gray-600">{subProductCount} items</span>
                                  </div>
                                </div>
                              </div>

                              {/* Subcategory Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openSubcategoryModal(cat, sub)}
                                  className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                                  title="Edit Sub-category"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "subcategory",
                                      categoryId: cat.id || cat.slug,
                                      categoryName: cat.nameEn,
                                      subId: sub.id || sub.slug,
                                    })
                                  }
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Delete Sub-category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ══════ ADD / EDIT CATEGORY MODAL ══════ */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-gray-900">
                  {categoryModal.mode === "create" ? "Add New Category" : "Edit Category"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure top-level taxonomy, bilingual names, and storefront visibility.
                </p>
              </div>
              <button
                onClick={() => setCategoryModal({ isOpen: false, mode: "create" })}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Category Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={catNameEn}
                    onChange={(e) => {
                      setCatNameEn(e.target.value);
                      if (categoryModal.mode === "create" && !catSlug) {
                        setCatSlug(slugify(e.target.value));
                      }
                    }}
                    placeholder="e.g. Women's Fashion"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Category Name (Bangla)
                  </label>
                  <input
                    type="text"
                    value={catNameBn}
                    onChange={(e) => setCatNameBn(e.target.value)}
                    placeholder="যেমন: নারীদের ফ্যাশন"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-bangla"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  URL Slug (Auto-generated or custom) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(slugify(e.target.value))}
                  placeholder="e.g. womens-fashion"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Description (English)</label>
                  <textarea
                    rows={3}
                    value={catDescEn}
                    onChange={(e) => setCatDescEn(e.target.value)}
                    placeholder="Brief description for SEO and catalog headers..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 resize-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Description (Bangla)</label>
                  <textarea
                    rows={3}
                    value={catDescBn}
                    onChange={(e) => setCatDescBn(e.target.value)}
                    placeholder="বাংলা বিবরণ..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 resize-none font-bangla"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Category Image URL</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-mono text-[11px]"
                />
                {catImage && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={catImage}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-[11px] text-gray-400">Live image preview</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="catFeaturedCheck"
                  checked={catIsFeatured}
                  onChange={(e) => setCatIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-yellow-400 rounded border-gray-300 focus:ring-yellow-400 accent-yellow-400"
                />
                <label htmlFor="catFeaturedCheck" className="font-medium text-gray-700 cursor-pointer">
                  Feature this category in homepage highlights and top navigation banner
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, mode: "create" })}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-lg font-bold shadow-sm transition-all"
                >
                  {categoryModal.mode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ══════ ADD / EDIT SUBCATEGORY MODAL ══════ */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {subcategoryModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-gray-900">
                  {subcategoryModal.mode === "create" ? "Add New Sub-category" : "Edit Sub-category"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parent category: <span className="font-semibold text-gray-900">{subcategoryModal.parentName}</span>
                </p>
              </div>
              <button
                onClick={() =>
                  setSubcategoryModal({ isOpen: false, mode: "create", parentId: "", parentName: "" })
                }
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Sub-category Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subNameEn}
                    onChange={(e) => {
                      setSubNameEn(e.target.value);
                      if (subcategoryModal.mode === "create" && !subSlug) {
                        setSubSlug(slugify(e.target.value));
                      }
                    }}
                    placeholder="e.g. Jamdani & Silk Sarees"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Sub-category Title (Bangla)
                  </label>
                  <input
                    type="text"
                    value={subNameBn}
                    onChange={(e) => setSubNameBn(e.target.value)}
                    placeholder="যেমন: জামদানি ও সিল্ক শাড়ি"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-bangla"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Sub-category Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subSlug}
                  onChange={(e) => setSubSlug(slugify(e.target.value))}
                  placeholder="e.g. jamdani-silk-sarees"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    value={subDescEn}
                    onChange={(e) => setSubDescEn(e.target.value)}
                    placeholder="Subcategory description..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 resize-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Description (Bangla)</label>
                  <textarea
                    rows={2}
                    value={subDescBn}
                    onChange={(e) => setSubDescBn(e.target.value)}
                    placeholder="বাংলা বিবরণ..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 resize-none font-bangla"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Subcategory Image URL</label>
                <input
                  type="url"
                  value={subImage}
                  onChange={(e) => setSubImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 font-mono text-[11px]"
                />
                {subImage && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={subImage}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-[11px] text-gray-400">Live image preview</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="subFeaturedCheck"
                  checked={subIsFeatured}
                  onChange={(e) => setSubIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-yellow-400 rounded border-gray-300 focus:ring-yellow-400 accent-yellow-400"
                />
                <label htmlFor="subFeaturedCheck" className="font-medium text-gray-700 cursor-pointer">
                  Feature this sub-category in quick filters
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSubcategoryModal({ isOpen: false, mode: "create", parentId: "", parentName: "" })
                  }
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-lg font-bold shadow-sm transition-all"
                >
                  {subcategoryModal.mode === "create" ? "Create Sub-category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ══════ DELETE CONFIRMATION MODAL ══════ */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-gray-900">
                Delete {deleteTarget.type === "category" ? "Category" : "Sub-category"}?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {deleteTarget.type === "category" ? (
                  <>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">{deleteTarget.categoryName}</span> and all its
                    nested subcategories?
                  </>
                ) : (
                  <>Are you sure you want to delete this sub-category?</>
                )}
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
                onClick={confirmDelete}
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
