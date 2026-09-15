import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { CustomerAddress } from "../../types";
import { BANGLADESH_DIVISIONS, calculateShippingFee } from "../../data/bangladeshData";
import { Plus, Edit2, Trash2, Star, MapPin, Home, Briefcase, X, Check, Truck } from "lucide-react";

const LABEL_ICONS: Record<string, React.ElementType> = {
  Home: Home,
  Office: Briefcase,
  Other: MapPin,
};
const LABEL_COLORS: Record<string, string> = {
  Home:   "bg-green-100 text-green-700 border-green-200",
  Office: "bg-blue-100 text-blue-700 border-blue-200",
  Other:  "bg-gray-100 text-gray-700 border-gray-200",
};

interface AddressFormData {
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  division: string;
  district: string;
  thana: string;
  streetLine: string;
  isDefault: boolean;
}

const DEFAULT_FORM: AddressFormData = {
  label: "Home",
  fullName: "",
  phone: "",
  division: "Dhaka",
  district: "Dhaka City",
  thana: "Dhanmondi",
  streetLine: "",
  isDefault: false,
};

export const CustomerAddresses: React.FC = () => {
  const {
    currentUser, addCustomerAddress, updateCustomerAddress, deleteCustomerAddress,
    setDefaultAddress, t, language
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  if (!currentUser) return null;

  const divisionObj = useMemo(
    () => BANGLADESH_DIVISIONS.find((d) => d.name === form.division) || BANGLADESH_DIVISIONS[0],
    [form.division]
  );
  const districtObj = useMemo(
    () => divisionObj.districts.find((d) => d.name === form.district) || divisionObj.districts[0],
    [divisionObj, form.district]
  );
  const shippingInfo = useMemo(
    () => calculateShippingFee(form.division, form.district),
    [form.division, form.district]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...DEFAULT_FORM, fullName: currentUser.name, phone: currentUser.phone });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (addr: CustomerAddress) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      division: addr.division,
      district: addr.district,
      thana: addr.thana,
      streetLine: addr.streetLine,
      isDefault: addr.isDefault,
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Partial<AddressFormData> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required" as any;
    if (!form.phone.trim() || form.phone.length < 11) e.phone = "Valid 11-digit phone required" as any;
    if (!form.streetLine.trim()) e.streetLine = "Street address is required" as any;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editingId) {
      updateCustomerAddress(editingId, form);
    } else {
      addCustomerAddress(form);
    }
    setShowForm(false);
  };

  const addresses = currentUser.savedAddresses;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t("Saved Addresses", "ঠিকানা বুক")}</h2>
          <p className="text-sm text-[#777777] mt-0.5">{t("Manage your delivery locations across Bangladesh", "বাংলাদেশে ডেলিভারির ঠিকানা পরিচালনা করুন")}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-black transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("Add Address", "ঠিকানা যোগ করুন")}
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-12 text-center shadow-sm">
          <MapPin className="w-10 h-10 text-[#DDDDDD] mx-auto mb-3" />
          <div className="text-sm font-semibold text-[#1A1A1A] mb-2">{t("No saved addresses", "কোনো ঠিকানা নেই")}</div>
          <p className="text-xs text-[#888888] mb-5">{t("Add your first delivery address to speed up checkout", "চেকআউট দ্রুত করতে প্রথম ডেলিভারি ঠিকানা যোগ করুন")}</p>
          <button onClick={openAdd} className="bg-[#1A1A1A] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-black">
            {t("Add First Address", "প্রথম ঠিকানা যোগ করুন")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const LabelIcon = LABEL_ICONS[addr.label] || MapPin;
            const labelColor = LABEL_COLORS[addr.label] || LABEL_COLORS.Other;
            const shipping = calculateShippingFee(addr.division, addr.district);
            return (
              <div key={addr.id} className={`bg-white border rounded-xl p-4 shadow-sm relative ${
                addr.isDefault ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E0E0E0]"
              }`}>
                {addr.isDefault && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#1A1A1A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    DEFAULT
                  </div>
                )}
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-3 ${labelColor}`}>
                  <LabelIcon className="w-3 h-3" />
                  {addr.label}
                </div>
                <div className="font-semibold text-sm text-[#1A1A1A]">{addr.fullName}</div>
                <div className="text-xs text-[#777777] font-mono">{addr.phone}</div>
                <div className="text-xs text-[#555555] mt-1.5 leading-relaxed">
                  {addr.streetLine}
                  <br />{addr.thana}, {addr.district}
                  <br />{addr.division}, Bangladesh
                </div>
                <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  shipping.zone === "INSIDE_DHAKA" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                }`}>
                  <Truck className="w-3 h-3" />
                  Shipping ৳{shipping.fee} · {shipping.zone === "INSIDE_DHAKA" ? "Inside Dhaka" : "Outside Dhaka"}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F5F5F5]">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[11px] font-semibold text-[#555555] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3 h-3" />
                      {t("Set Default", "ডিফল্ট করুন")}
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 text-[#888888] hover:text-[#1A1A1A] hover:bg-gray-100 rounded transition-colors"
                    title="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(addr)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Card */}
          <button
            onClick={openAdd}
            className="border-2 border-dashed border-[#E0E0E0] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#1A1A1A] hover:bg-gray-50 transition-all text-[#AAAAAA] hover:text-[#1A1A1A] min-h-[160px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-semibold">{t("Add New Address", "নতুন ঠিকানা")}</span>
          </button>
        </div>
      )}

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="font-bold text-[#1A1A1A]">{editingId ? t("Edit Address", "ঠিকানা সম্পাদনা") : t("Add New Address", "নতুন ঠিকানা")}</div>
              <button onClick={() => setShowForm(false)} className="text-[#AAAAAA] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">{t("Address Label", "ঠিকানার ধরন")}</label>
                <div className="flex gap-2">
                  {(["Home", "Office", "Other"] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        form.label === lbl ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#555555] border-[#E0E0E0] hover:border-[#1A1A1A]"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Full Name", "পূর্ণ নাম")} *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#1A1A1A] transition-colors ${errors.fullName ? "border-red-400" : "border-[#E0E0E0]"}`}
                    placeholder="Recipient Name"
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 mt-0.5">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Phone", "ফোন")} *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#1A1A1A] font-mono transition-colors ${errors.phone ? "border-red-400" : "border-[#E0E0E0]"}`}
                    placeholder="01711223344"
                    maxLength={11}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* Division */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Division", "বিভাগ")}</label>
                <select
                  value={form.division}
                  onChange={(e) => {
                    const div = BANGLADESH_DIVISIONS.find((d) => d.name === e.target.value) || BANGLADESH_DIVISIONS[0];
                    setForm((f) => ({ ...f, division: e.target.value, district: div.districts[0].name, thana: div.districts[0].thanas[0] }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                >
                  {BANGLADESH_DIVISIONS.map((d) => <option key={d.id} value={d.name}>{d.name} ({d.nameBn})</option>)}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("District", "জেলা")}</label>
                <select
                  value={form.district}
                  onChange={(e) => {
                    const dist = divisionObj.districts.find((d) => d.name === e.target.value) || divisionObj.districts[0];
                    setForm((f) => ({ ...f, district: e.target.value, thana: dist.thanas[0] }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                >
                  {divisionObj.districts.map((d) => <option key={d.name} value={d.name}>{d.name} ({d.nameBn})</option>)}
                </select>
              </div>

              {/* Thana */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Thana / Upazila", "থানা / উপজেলা")}</label>
                <select
                  value={form.thana}
                  onChange={(e) => setForm((f) => ({ ...f, thana: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                >
                  {districtObj.thanas.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Shipping Fee indicator */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                shippingInfo.zone === "INSIDE_DHAKA" ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}>
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>Estimated Shipping: ৳{shippingInfo.fee} · {shippingInfo.zone === "INSIDE_DHAKA" ? "Inside Dhaka (24–48 hrs)" : "Outside Dhaka (2–4 days)"}</span>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">{t("Street Address", "রাস্তার ঠিকানা")} *</label>
                <textarea
                  rows={2}
                  value={form.streetLine}
                  onChange={(e) => setForm((f) => ({ ...f, streetLine: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#1A1A1A] resize-none transition-colors ${errors.streetLine ? "border-red-400" : "border-[#E0E0E0]"}`}
                  placeholder="House/Flat No., Road, Area"
                />
                {errors.streetLine && <p className="text-[10px] text-red-500 mt-0.5">{errors.streetLine}</p>}
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                  className={`w-10 h-5.5 rounded-full relative transition-colors ${form.isDefault ? "bg-[#1A1A1A]" : "bg-gray-200"}`}
                  style={{ height: "22px" }}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${form.isDefault ? "translate-x-4" : ""}`}
                    style={{ width: "18px", height: "18px" }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#1A1A1A]">{t("Set as default delivery address", "ডিফল্ট ডেলিভারি ঠিকানা হিসেবে সেট করুন")}</span>
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-[#E0E0E0] hover:bg-gray-50 transition-colors"
                >
                  {t("Cancel", "বাতিল")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#1A1A1A] text-white hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? t("Save Changes", "পরিবর্তন সংরক্ষণ") : t("Save Address", "ঠিকানা সংরক্ষণ")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="font-bold text-[#1A1A1A] mb-2">{t("Remove Address?", "ঠিকানা মুছে ফেলবেন?")}</div>
            <p className="text-xs text-[#555555] mb-4">
              {deleteTarget.label} — {deleteTarget.streetLine}, {deleteTarget.district}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 text-xs font-semibold rounded-lg border border-[#E0E0E0] hover:bg-gray-50">
                {t("Cancel", "বাতিল")}
              </button>
              <button
                onClick={() => { deleteCustomerAddress(deleteTarget.id); setDeleteTarget(null); }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {t("Remove", "মুছে ফেলুন")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
