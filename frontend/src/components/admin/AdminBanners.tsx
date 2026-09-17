import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { HeroBanner } from "../../types";
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  ExternalLink,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Layers,
  Image as ImageIcon,
  Sliders,
  AlertTriangle,
  Play,
  Flame,
  Tag,
  Check
} from "lucide-react";

const CURATED_BANNER_PRESETS = [
  {
    name: "Dhakai Jamdani Heritage",
    url: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg",
    tag: "Heritage Craft",
  },
  {
    name: "Festive Embroidered Panjabi",
    url: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_5_6MGtON9rj.jpg",
    tag: "Eid 2026 Edition",
  },
  {
    name: "Supima Cotton Polo",
    url: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_7_W2RWoB8Tz.jpg",
    tag: "Wardrobe Essentials",
  },
  {
    name: "Rajshahi Silk Sarees",
    url: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_2_00U4iyWPC.jpg",
    tag: "Mulberry Silk",
  },
  {
    name: "Artisan Leather Crafts",
    url: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_4_fR0PqHkL2.jpg",
    tag: "Handcrafted Leather",
  },
];

export const AdminBanners: React.FC = () => {
  const {
    banners,
    refreshBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    showToast,
    navigate,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isSyncing, setIsSyncing] = useState(false);

  // Active slide preview
  const [previewSlideId, setPreviewSlideId] = useState<string | null>(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitleBn, setSubtitleBn] = useState("");
  const [ctaEn, setCtaEn] = useState("Explore Collection");
  const [ctaBn, setCtaBn] = useState("কালেকশন দেখুন");
  const [link, setLink] = useState("/shop");
  const [secondaryCtaEn, setSecondaryCtaEn] = useState("Browse All");
  const [secondaryCtaBn, setSecondaryCtaBn] = useState("সব দেখুন");
  const [secondaryLink, setSecondaryLink] = useState("/shop");
  const [bgImage, setBgImage] = useState("");
  const [tag, setTag] = useState("Featured Collection");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit Modal State
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [editTitleEn, setEditTitleEn] = useState("");
  const [editTitleBn, setEditTitleBn] = useState("");
  const [editSubtitleEn, setEditSubtitleEn] = useState("");
  const [editSubtitleBn, setEditSubtitleBn] = useState("");
  const [editCtaEn, setEditCtaEn] = useState("");
  const [editCtaBn, setEditCtaBn] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editSecondaryCtaEn, setEditSecondaryCtaEn] = useState("");
  const [editSecondaryCtaBn, setEditSecondaryCtaBn] = useState("");
  const [editSecondaryLink, setEditSecondaryLink] = useState("");
  const [editBgImage, setEditBgImage] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSortOrder, setEditSortOrder] = useState<number>(1);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete State
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with MongoDB
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refreshBanners();
      showToast("Home banners synchronized with MongoDB Atlas!", "success");
    } catch {
      showToast("Synchronized with active banners", "info");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered & Sorted Banners
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          b.titleEn.toLowerCase().includes(q) ||
          (b.titleBn && b.titleBn.toLowerCase().includes(q)) ||
          b.subtitleEn.toLowerCase().includes(q) ||
          b.tag.toLowerCase().includes(q) ||
          b.link.toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && b.isActive) ||
          (statusFilter === "INACTIVE" && !b.isActive);

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [banners, searchQuery, statusFilter]);

  // Active banners
  const activeBannersCount = banners.filter((b) => b.isActive).length;
  const inactiveBannersCount = banners.filter((b) => !b.isActive).length;

  // Selected preview slide
  const currentPreviewBanner = useMemo(() => {
    if (previewSlideId) {
      const found = banners.find((b) => b.id === previewSlideId);
      if (found) return found;
    }
    return banners.find((b) => b.isActive) || banners[0] || null;
  }, [banners, previewSlideId]);

  // Open Edit Modal
  const handleOpenEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setEditTitleEn(banner.titleEn);
    setEditTitleBn(banner.titleBn || "");
    setEditSubtitleEn(banner.subtitleEn);
    setEditSubtitleBn(banner.subtitleBn || "");
    setEditCtaEn(banner.ctaEn);
    setEditCtaBn(banner.ctaBn || "");
    setEditLink(banner.link);
    setEditSecondaryCtaEn(banner.secondaryCtaEn || "Browse All");
    setEditSecondaryCtaBn(banner.secondaryCtaBn || "সব দেখুন");
    setEditSecondaryLink(banner.secondaryLink || "/shop");
    setEditBgImage(banner.bgImage);
    setEditTag(banner.tag);
    setEditIsActive(banner.isActive);
    setEditSortOrder(banner.sortOrder);
    setEditError("");
  };

  // Submit Add Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!titleEn.trim() || !subtitleEn.trim() || !bgImage.trim()) {
      setAddError("English Title, Subtitle, and Background Image URL are required.");
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await addBanner({
        titleEn: titleEn.trim(),
        titleBn: titleBn.trim() || undefined,
        subtitleEn: subtitleEn.trim(),
        subtitleBn: subtitleBn.trim() || undefined,
        ctaEn: ctaEn.trim() || "Explore Collection",
        ctaBn: ctaBn.trim() || "কালেকশন দেখুন",
        link: link.trim() || "/shop",
        secondaryCtaEn: secondaryCtaEn.trim() || "Browse All",
        secondaryCtaBn: secondaryCtaBn.trim() || "সব দেখুন",
        secondaryLink: secondaryLink.trim() || "/shop",
        bgImage: bgImage.trim(),
        tag: tag.trim() || "Featured Collection",
        isActive,
        sortOrder: Number(sortOrder) || banners.length + 1,
      });

      if (!res.success) {
        setAddError(res.message);
        setIsSubmittingAdd(false);
        return;
      }

      setShowAddModal(false);
      setTitleEn("");
      setTitleBn("");
      setSubtitleEn("");
      setSubtitleBn("");
      setBgImage("");
      setTag("Featured Collection");
      setSortOrder(banners.length + 2);
    } catch (err: any) {
      setAddError(err?.message || "Failed to create banner.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Submit Edit Banner
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setEditError("");

    if (!editTitleEn.trim() || !editSubtitleEn.trim() || !editBgImage.trim()) {
      setEditError("Title, Subtitle, and Background Image are required.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await updateBanner(editingBanner.id, {
        titleEn: editTitleEn.trim(),
        titleBn: editTitleBn.trim() || undefined,
        subtitleEn: editSubtitleEn.trim(),
        subtitleBn: editSubtitleBn.trim() || undefined,
        ctaEn: editCtaEn.trim(),
        ctaBn: editCtaBn.trim() || undefined,
        link: editLink.trim(),
        secondaryCtaEn: editSecondaryCtaEn.trim(),
        secondaryCtaBn: editSecondaryCtaBn.trim() || undefined,
        secondaryLink: editSecondaryLink.trim(),
        bgImage: editBgImage.trim(),
        tag: editTag.trim(),
        isActive: editIsActive,
        sortOrder: Number(editSortOrder) || editingBanner.sortOrder,
      });

      if (!res.success) {
        setEditError(res.message);
        setIsSavingEdit(false);
        return;
      }

      setEditingBanner(null);
    } catch (err: any) {
      setEditError(err?.message || "Failed to update banner.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Move Order Up / Down
  const handleMoveOrder = async (banner: HeroBanner, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;

    const targetSortOrder = direction === "up" ? Math.max(1, banner.sortOrder - 1) : banner.sortOrder + 1;
    await updateBanner(banner.id, { sortOrder: targetSortOrder });
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBanner(bannerToDelete.id);
      setBannerToDelete(null);
    } catch (err: any) {
      showToast(err?.message || "Failed to delete banner", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-yellow-400/10 text-yellow-600 rounded-xl border border-yellow-400/20">
              <ImageIcon className="w-5 h-5 text-gray-950" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Home Page Banner &amp; Hero Slider
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Maintain and dynamically control the high-impact hero carousel slides, headlines, promotional
            imagery, and call-to-action buttons displayed on your storefront homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all disabled:opacity-50"
            title="Synchronize banners with MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-yellow-600" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync MongoDB"}</span>
          </button>

          <button
            onClick={() => {
              setAddError("");
              setSortOrder(banners.length + 1);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-950 hover:bg-black text-yellow-400 hover:text-yellow-300 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
            <Layers className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Banners</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
              {banners.length}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">Created Slides</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shrink-0">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-emerald-700 font-medium">Active on Homepage</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
              {activeBannersCount}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Rotating Carousel
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <EyeOff className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Draft / Hidden</div>
            <div className="text-xl sm:text-2xl font-black text-gray-700 font-mono">
              {inactiveBannersCount}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">Inactive in Rotation</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200/50 flex items-center justify-center text-yellow-600 shrink-0">
            <Sliders className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-xs text-yellow-700 font-medium">Slide Interval</div>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mt-0.5 font-mono">
              6.0 Seconds
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Smooth Auto-Play</div>
          </div>
        </div>
      </div>

      {/* Live Interactive Preview Box */}
      {currentPreviewBanner && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Live Storefront Mockup Preview — {currentPreviewBanner.titleEn}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              Order #{currentPreviewBanner.sortOrder} · {currentPreviewBanner.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          <div className="relative w-full h-[280px] sm:h-[340px] bg-[#1A1A1A] rounded-xl overflow-hidden shadow-inner border border-gray-300">
            <img
              src={currentPreviewBanner.bgImage}
              alt={currentPreviewBanner.titleEn}
              className="w-full h-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center items-start text-white max-w-xl">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full mb-2">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                {currentPreviewBanner.tag}
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight">
                {currentPreviewBanner.titleEn}
              </h2>
              {currentPreviewBanner.titleBn && (
                <p className="text-xs text-yellow-300 font-medium mt-0.5">{currentPreviewBanner.titleBn}</p>
              )}
              <p className="text-xs sm:text-sm text-gray-300 mt-2 line-clamp-2 font-light">
                {currentPreviewBanner.subtitleEn}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="bg-white text-gray-950 font-semibold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow-md">
                  <span>{currentPreviewBanner.ctaEn}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                {currentPreviewBanner.secondaryCtaEn && (
                  <div className="bg-transparent border border-white/40 text-white font-medium text-xs px-3.5 py-2 rounded">
                    {currentPreviewBanner.secondaryCtaEn}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, headline, tag, or target link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Banners ({banners.length})</option>
              <option value="ACTIVE">Active on Homepage ({activeBannersCount})</option>
              <option value="INACTIVE">Hidden / Drafts ({inactiveBannersCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
              previewSlideId === banner.id
                ? "border-yellow-400 ring-2 ring-yellow-400/20"
                : "border-gray-200"
            }`}
          >
            {/* Banner Media Header */}
            <div className="relative h-44 bg-gray-950 overflow-hidden group">
              <img
                src={banner.bgImage}
                alt={banner.titleEn}
                className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Tag & Order Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-yellow-300 text-[10px] font-bold font-mono">
                  Order #{banner.sortOrder}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-medium">
                  {banner.tag}
                </span>
              </div>

              {/* Status Switch */}
              <button
                onClick={() => toggleBannerActive(banner.id)}
                className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-sm ${
                  banner.isActive
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                title={banner.isActive ? "Click to deactivate" : "Click to activate"}
              >
                {banner.isActive ? "ACTIVE" : "HIDDEN"}
              </button>

              {/* Title & Preview inside media */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-sm truncate">{banner.titleEn}</h3>
                {banner.titleBn && <p className="text-[11px] text-yellow-300 truncate">{banner.titleBn}</p>}
              </div>
            </div>

            {/* Banner Details Body */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {banner.subtitleEn}
                </p>

                <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] space-y-1 font-medium">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>CTA Button:</span>
                    <strong className="text-gray-900">{banner.ctaEn}</strong>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Target URL:</span>
                    <span className="font-mono text-yellow-700 truncate max-w-[140px]">{banner.link}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(banner, "up")}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900"
                    title="Move slide order up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(banner, "down")}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900"
                    title="Move slide order down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewSlideId(banner.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900"
                    title="Preview in hero viewer above"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="px-3 py-1 bg-gray-100 hover:bg-yellow-400 text-gray-800 hover:text-gray-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setBannerToDelete(banner)}
                    disabled={banners.length <= 1}
                    className="p-1.5 hover:bg-rose-100 rounded-lg text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-30"
                    title={banners.length <= 1 ? "Cannot delete only remaining banner" : "Delete banner"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* ADD BANNER MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-950 text-yellow-400 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Home Hero Banner</h2>
                <p className="text-xs text-gray-500">
                  Publish a new hero slide to dynamically display on the storefront home page
                </p>
              </div>
            </div>

            {addError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBanner} className="space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Headline (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Dhakai Jamdani Revival"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Headline (Bangla)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ঐতিহ্যবাহী ঢাকাই জামদানি"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Subtitle (English) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 84-Count Pure Khadi Handloom Woven in Rupganj, Narayanganj"
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Subtitle (Bangla)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. রূপগঞ্জের তাঁতিদের হাতে বোনা খাঁটি খাদি জামদানি"
                    value={subtitleBn}
                    onChange={(e) => setSubtitleBn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                  />
                </div>
              </div>

              {/* Tag & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tag / Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Heritage Craft / Eid 2026 Collection"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Slide Sequence / Sort Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Background Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://ik.imagekit.io/... or your CDN banner image"
                  value={bgImage}
                  onChange={(e) => setBgImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {/* Preset Chips */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-400">Sample Presets:</span>
                  {CURATED_BANNER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setBgImage(preset.url);
                        if (!tag || tag === "Featured Collection") setTag(preset.tag);
                      }}
                      className="text-[10px] bg-gray-100 hover:bg-yellow-200 text-gray-700 hover:text-gray-950 px-2 py-0.5 rounded-md font-medium transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Real-time preview */}
                {bgImage && (
                  <div className="mt-2.5 relative h-24 rounded-xl overflow-hidden border border-gray-300">
                    <img src={bgImage} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                      Image Loaded
                    </span>
                  </div>
                )}
              </div>

              {/* Call-to-Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Primary CTA Text &amp; Destination
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Button text (e.g. Explore Sarees)"
                      value={ctaEn}
                      onChange={(e) => setCtaEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Destination Link (e.g. /category/jamdani-silk-sarees)"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Secondary CTA (Optional)
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Button text (e.g. Browse All)"
                      value={secondaryCtaEn}
                      onChange={(e) => setSecondaryCtaEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Destination Link (e.g. /shop)"
                      value={secondaryLink}
                      onChange={(e) => setSecondaryLink(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <div className="text-xs font-bold text-gray-800">Publish to Homepage</div>
                  <div className="text-[11px] text-gray-500">
                    Immediately enable this banner inside the Home hero carousel
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isActive ? "ACTIVE" : "DRAFT"}
                </button>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2.5 bg-gray-950 hover:bg-black text-yellow-400 hover:text-yellow-300 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {isSubmittingAdd && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingAdd ? "Saving..." : "Publish Banner to Home"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT BANNER MODAL */}
      {/* ======================================================== */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setEditingBanner(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-gray-950 flex items-center justify-center">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Banner Details</h2>
                <p className="text-xs text-gray-500">
                  Update content, destination links, or background imagery
                </p>
              </div>
            </div>

            {editError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Headline (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitleEn}
                    onChange={(e) => setEditTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Headline (Bangla)
                  </label>
                  <input
                    type="text"
                    value={editTitleBn}
                    onChange={(e) => setEditTitleBn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Subtitle (English)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editSubtitleEn}
                    onChange={(e) => setEditSubtitleEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Subtitle (Bangla)
                  </label>
                  <textarea
                    rows={2}
                    value={editSubtitleBn}
                    onChange={(e) => setEditSubtitleBn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tag / Badge Label
                  </label>
                  <input
                    type="text"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Background Image URL
                </label>
                <input
                  type="url"
                  required
                  value={editBgImage}
                  onChange={(e) => setEditBgImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                />
                {editBgImage && (
                  <div className="mt-2 relative h-24 rounded-xl overflow-hidden border border-gray-300">
                    <img src={editBgImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Primary CTA (Text &amp; Link)
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editCtaEn}
                      onChange={(e) => setEditCtaEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Secondary CTA (Text &amp; Link)
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editSecondaryCtaEn}
                      onChange={(e) => setEditSecondaryCtaEn(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={editSecondaryLink}
                      onChange={(e) => setEditSecondaryLink(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <div className="text-xs font-bold text-gray-800">Carousel Active State</div>
                  <div className="text-[11px] text-gray-500">
                    {editIsActive ? "Currently rotating on storefront Home page" : "Hidden from storefront Home page"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    editIsActive ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {editIsActive ? "ACTIVE" : "DRAFT"}
                </button>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
                >
                  {isSavingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingEdit ? "Saving..." : "Save Banner Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Remove Home Banner?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <strong className="text-gray-900">{bannerToDelete.titleEn}</strong>?
                This slide will be immediately removed from the Home page hero slider.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
