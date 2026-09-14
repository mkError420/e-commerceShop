import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Check, 
  X, 
  Search,
  Flame,
  ArrowUpDown
} from "lucide-react";

export const AdminProducts: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, formatPrice, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newTitleBn, setNewTitleBn] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("womens-fashion");
  const [newSubcategorySlug, setNewSubcategorySlug] = useState("jamdani-silk-sarees");
  const [newPriceBDT, setNewPriceBDT] = useState(6500);
  const [newComparePriceBDT, setNewComparePriceBDT] = useState(7800);
  const [newStock, setNewStock] = useState(12);
  const [newFabric, setNewFabric] = useState("84-Count Pure Cotton Khadi");
  const [newCraftsmanship, setNewCraftsmanship] = useState("Woven by master artisans in Narayanganj");
  const [newImageUrl, setNewImageUrl] = useState("https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop");
  const [newIsFlashDeal, setNewIsFlashDeal] = useState(false);

  const filteredProducts = products.filter((p) => {
    if (selectedCategoryFilter && p.categorySlug !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.nameEn.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleEn.trim()) return;

    const catObj = categories.find((c) => c.slug === newCategorySlug);
    const subObj = catObj?.subcategories?.find((s) => s.slug === newSubcategorySlug);

    const created = addProduct({
      nameEn: newTitleEn.trim(),
      nameBn: newTitleBn.trim() || newTitleEn.trim(),
      descriptionEn: "Artisanal handloom piece crafted in Bangladesh with authentic hand-woven heritage techniques.",
      descriptionBn: "ঐতিহ্যবাহী নকশায় তৈরি খাঁটি হস্তশিল্প পণ্য।",
      sku: `BA-BD-${Math.floor(100 + Math.random() * 900)}`,
      categorySlug: newCategorySlug,
      categoryNameEn: catObj?.nameEn || "Fashion",
      categoryNameBn: catObj?.nameBn || "ফ্যাশন",
      subcategorySlug: newSubcategorySlug,
      subcategoryNameEn: subObj?.nameEn,
      subcategoryNameBn: subObj?.nameBn,
      priceBDT: Number(newPriceBDT),
      compareAtPriceBDT: newComparePriceBDT ? Number(newComparePriceBDT) : undefined,
      costPriceBDT: Math.round(Number(newPriceBDT) * 0.55),
      stockQuantity: Number(newStock),
      lowStockAlert: 5,
      images: [newImageUrl],
      fabricType: newFabric,
      craftsmanship: newCraftsmanship,
      isFeatured: true,
      isFlashDeal: newIsFlashDeal,
      rating: 5.0,
      reviewsCount: 1,
      tags: ["New Arrival", "Dhaka Hub"],
      variants: [
        { id: `v-${Date.now()}-1`, title: "Standard Size", size: "Free Size", stock: Number(newStock), priceAdjustmentBDT: 0 },
      ],
      reviews: [],
    });

    setIsAddModalOpen(false);
    showToast("New handloom product added to Dhaka inventory!");
    setNewTitleEn("");
    setNewTitleBn("");
  };

  const handleStockAdjust = (product: Product, delta: number) => {
    const updatedStock = Math.max(0, product.stockQuantity + delta);
    updateProduct(product.id, { stockQuantity: updatedStock });
    showToast(`Stock updated to ${updatedStock}`);
  };

  const handleToggleFlashDeal = (product: Product) => {
    updateProduct(product.id, { isFlashDeal: !product.isFlashDeal });
    showToast(product.isFlashDeal ? "Removed from Flash Deals" : "Added to Flash Deals!");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">
            Product Catalog & Stock Management
          </h2>
          <p className="text-xs text-[#555555]">
            Manage SKUs, Dhaka warehouse inventory levels, and flash deal promotions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-[#E0E0E0]">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product title or SKU..."
            className="w-full text-xs p-2 pl-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
          />
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="text-xs p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A] w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.nameEn}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-[#555555] border-b border-[#E0E0E0]">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price (BDT)</th>
                <th className="py-3 px-3">Dhaka Hub Stock</th>
                <th className="py-3 px-3">Promotions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {filteredProducts.map((p) => {
                const isLowStock = p.stockQuantity <= p.lowStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.nameEn}
                          className="w-12 h-14 object-cover rounded bg-[#F5F5F5] border border-[#E0E0E0]"
                        />
                        <div>
                          <p className="font-semibold text-[#1A1A1A] line-clamp-1">{p.nameEn}</p>
                          <p className="text-[11px] text-[#777777] font-mono">SKU: {p.sku}</p>
                          <span className="text-[10px] text-[#888888] italic">{p.fabricType}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="bg-[#F0F0F0] px-2 py-0.5 rounded text-[11px] font-medium text-[#333333]">
                        {p.categoryNameEn}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[#1A1A1A]">
                      {formatPrice(p.priceBDT)}
                    </td>

                    {/* Quick Stock Modifier */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockAdjust(p, -1)}
                          className="w-5 h-5 bg-[#F0F0F0] hover:bg-[#E0E0E0] rounded text-xs font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className={`font-mono font-bold text-xs min-w-[24px] text-center ${
                          isLowStock ? "text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" : "text-[#1A1A1A]"
                        }`}>
                          {p.stockQuantity}
                        </span>
                        <button
                          onClick={() => handleStockAdjust(p, 1)}
                          className="w-5 h-5 bg-[#F0F0F0] hover:bg-[#E0E0E0] rounded text-xs font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      {isLowStock && (
                        <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                          Low Stock Alert
                        </span>
                      )}
                    </td>

                    {/* Promotion toggle */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleFlashDeal(p)}
                        className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors ${
                          p.isFlashDeal
                            ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                            : "bg-white border-[#E0E0E0] text-[#777777] hover:border-[#1A1A1A]"
                        }`}
                      >
                        <Flame className={`w-3 h-3 ${p.isFlashDeal ? "fill-amber-600 text-amber-600" : ""}`} />
                        <span>{p.isFlashDeal ? "Active Deal" : "Normal"}</span>
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${p.nameEn}?`)) {
                            deleteProduct(p.id);
                            showToast("Product deleted from catalog");
                          }
                        }}
                        className="text-[#888888] hover:text-rose-600 p-1.5 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#E0E0E0] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#1A1A1A]">
                Add New Bangladeshi Handloom Product
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#777777] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    placeholder="e.g. Traditional Dhakai Jamdani Saree"
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Product Title (Bangla)</label>
                  <input
                    type="text"
                    value={newTitleBn}
                    onChange={(e) => setNewTitleBn(e.target.value)}
                    placeholder="যেমন: ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি"
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-bangla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Subcategory</label>
                  <select
                    value={newSubcategorySlug}
                    onChange={(e) => setNewSubcategorySlug(e.target.value)}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                  >
                    <option value="jamdani-silk-sarees">Jamdani & Silk Sarees</option>
                    <option value="panjabi">Panjabi</option>
                    <option value="polo-shirt">Polo Shirt</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Retail Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newPriceBDT}
                    onChange={(e) => setNewPriceBDT(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Compare At Price (BDT)</label>
                  <input
                    type="number"
                    value={newComparePriceBDT}
                    onChange={(e) => setNewComparePriceBDT(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Initial Stock (Dhaka Hub)</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Fabric & Material Spec</label>
                <input
                  type="text"
                  value={newFabric}
                  onChange={(e) => setNewFabric(e.target.value)}
                  placeholder="e.g. 84-Count Pure Cotton Khadi"
                  className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Craftsmanship Note</label>
                <input
                  type="text"
                  value={newCraftsmanship}
                  onChange={(e) => setNewCraftsmanship(e.target.value)}
                  placeholder="e.g. Hand-embroidered in Rupganj"
                  className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">High-Res Image URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="flashDealCheck"
                  checked={newIsFlashDeal}
                  onChange={(e) => setNewIsFlashDeal(e.target.checked)}
                  className="accent-[#1A1A1A]"
                />
                <label htmlFor="flashDealCheck" className="font-medium cursor-pointer">
                  Feature in "Limited Hub Flash Deals" section
                </label>
              </div>

              <div className="pt-4 border-t border-[#E0E0E0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#CCCCCC] rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A1A] text-white rounded font-semibold hover:bg-black"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
