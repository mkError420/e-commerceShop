import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { ShopAdminUser, AdminPermission, AdminRole } from "../../types";
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  KeyRound,
  UserCheck,
  UserX,
  Database,
  Sliders,
  X,
  AlertTriangle,
  Copy,
  Check,
  Info,
  Layers,
  Sparkles,
  ChevronDown
} from "lucide-react";

const ALL_PERMISSIONS: { key: AdminPermission; label: string; description: string }[] = [
  { key: "dashboard", label: "Executive Dashboard", description: "View financial analytics, revenue charts, and KPIs" },
  { key: "products", label: "Product Catalog", description: "Create, edit, price, and manage product inventory & variants" },
  { key: "categories", label: "Categories & Taxonomy", description: "Manage categories, sub-categories, and seasonal collections" },
  { key: "orders", label: "Orders & Fulfillment", description: "Process customer orders, update delivery status, assign couriers" },
  { key: "customers", label: "Customer Accounts & CRM", description: "Access customer profiles, order history, and account status" },
  { key: "coupons", label: "Marketing & Vouchers", description: "Create promo codes, discount vouchers, and campaign rules" },
  { key: "settings", label: "Logistics & Gateways", description: "Configure courier fees, bKash/Nagad gateways, and store settings" },
  { key: "admins", label: "Shop Admin Management", description: "Invite, manage, and configure permissions for staff administrators" },
];

export const AdminShopAdmins: React.FC = () => {
  const {
    shopAdmins,
    refreshShopAdmins,
    createShopAdmin,
    updateShopAdmin,
    deleteShopAdmin,
    toggleShopAdminStatus,
    showToast,
    adminUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | AdminRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addRole, setAddRole] = useState<AdminRole>("ADMIN");
  const [addPermissions, setAddPermissions] = useState<AdminPermission[]>([
    "dashboard",
    "products",
    "categories",
    "orders",
    "customers",
    "coupons",
    "settings",
    "admins",
  ]);
  const [showAddPass, setShowAddPass] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState<ShopAdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("ADMIN");
  const [editPermissions, setEditPermissions] = useState<AdminPermission[]>([]);
  const [editPassword, setEditPassword] = useState("");
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Admin State
  const [adminToDelete, setAdminToDelete] = useState<ShopAdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Details Drawer/Modal State
  const [viewingAdmin, setViewingAdmin] = useState<ShopAdminUser | null>(null);

  // Copy feedback
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refreshShopAdmins();
      showToast("Shop administrators synchronized with MongoDB Atlas!", "success");
    } catch {
      showToast("Synchronized with active store data", "info");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    return shopAdmins.filter((admin) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        admin.name.toLowerCase().includes(q) ||
        admin.phone.includes(q) ||
        (admin.email && admin.email.toLowerCase().includes(q)) ||
        admin.id.toLowerCase().includes(q);

      const matchesRole = roleFilter === "ALL" || admin.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && !admin.isBlocked) ||
        (statusFilter === "BLOCKED" && admin.isBlocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [shopAdmins, searchQuery, roleFilter, statusFilter]);

  // Quick stats
  const totalAdminsCount = shopAdmins.length;
  const superAdminsCount = shopAdmins.filter((a) => a.role === "ADMIN").length;
  const managersCount = shopAdmins.filter((a) => a.role === "MANAGER").length;
  const activeAdminsCount = shopAdmins.filter((a) => !a.isBlocked).length;
  const blockedAdminsCount = shopAdmins.filter((a) => a.isBlocked).length;

  // Open Edit Modal
  const handleOpenEdit = (admin: ShopAdminUser) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditPhone(admin.phone);
    setEditEmail(admin.email || "");
    setEditRole(admin.role);
    setEditPermissions(admin.permissions || ["dashboard", "products", "categories", "orders", "customers", "coupons"]);
    setEditPassword("");
    setEditIsBlocked(admin.isBlocked);
    setEditError("");
  };

  // Submit Add Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!addName.trim()) {
      setAddError("Full Name is required.");
      return;
    }
    const cleanPhone = addPhone.trim();
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      setAddError("Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 01711223344).");
      return;
    }
    if (addPassword && addPassword.length < 6) {
      setAddError("Password must be at least 6 characters long.");
      return;
    }
    if (addPassword && addPassword !== addConfirmPassword) {
      setAddError("Passwords do not match. Please verify.");
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await createShopAdmin({
        name: addName.trim(),
        phone: cleanPhone,
        email: addEmail.trim() || undefined,
        password: addPassword.trim() || "admin123",
        role: addRole,
        permissions: addPermissions,
      });

      if (!res.success) {
        setAddError(res.message);
        setIsSubmittingAdd(false);
        return;
      }

      setShowAddModal(false);
      setAddName("");
      setAddPhone("");
      setAddEmail("");
      setAddPassword("");
      setAddConfirmPassword("");
      setAddRole("ADMIN");
      setAddPermissions(["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]);
    } catch (err: any) {
      setAddError(err?.message || "Failed to create shop administrator.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Submit Edit Admin
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditError("");

    if (!editName.trim()) {
      setEditError("Full Name is required.");
      return;
    }
    const cleanPhone = editPhone.trim();
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      setEditError("Phone number must be a valid 11-digit Bangladeshi mobile number (e.g. 01800000001).");
      return;
    }
    if (editPassword && editPassword.length < 6) {
      setEditError("New password must be at least 6 characters.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await updateShopAdmin(editingAdmin.id, {
        name: editName.trim(),
        phone: cleanPhone,
        email: editEmail.trim() || undefined,
        role: editRole,
        permissions: editPermissions,
        isBlocked: editIsBlocked,
        password: editPassword ? editPassword.trim() : undefined,
      });

      if (!res.success) {
        setEditError(res.message);
        setIsSavingEdit(false);
        return;
      }

      setEditingAdmin(null);
    } catch (err: any) {
      setEditError(err?.message || "Failed to update administrator.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteShopAdmin(adminToDelete.id);
      if (!res.success) {
        showToast(res.message, "error");
      }
      setAdminToDelete(null);
    } catch (err: any) {
      showToast(err?.message || "Error deleting administrator", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Single Permission
  const togglePermission = (
    key: AdminPermission,
    current: AdminPermission[],
    setter: (perms: AdminPermission[]) => void
  ) => {
    if (current.includes(key)) {
      if (current.length === 1) {
        showToast("An administrator must have at least one permission.", "info");
        return;
      }
      setter(current.filter((k) => k !== key));
    } else {
      setter([...current, key]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-yellow-400/10 text-yellow-600 rounded-xl border border-yellow-400/20">
              <ShieldCheck className="w-5 h-5 text-gray-950" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shop Administrators &amp; Staff
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Authorize team access, assign role permissions, and control operational credentials for
            the storefront, orders, catalog, and MongoDB persistence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all disabled:opacity-50"
            title="Fetch live records from MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-yellow-600" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync MongoDB"}</span>
          </button>

          <button
            onClick={() => {
              setAddError("");
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-950 hover:bg-black text-yellow-400 hover:text-yellow-300 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Shop Admin</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Shop Staff</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
              {totalAdminsCount}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              {superAdminsCount} Admins · {managersCount} Managers
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-emerald-700 font-medium">Active Accounts</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
              {activeAdminsCount}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Access Granted
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/50 flex items-center justify-center text-rose-600 shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-rose-700 font-medium">Suspended Accounts</div>
            <div className="text-xl sm:text-2xl font-black text-rose-900 font-mono">
              {blockedAdminsCount}
            </div>
            <div className="text-[11px] text-rose-600 font-medium">
              Access Restricted
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200/50 flex items-center justify-center text-yellow-600 shrink-0">
            <Database className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-xs text-yellow-700 font-medium">Database Storage</div>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>MongoDB Atlas</span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              Synchronized &amp; Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone (01...), email, or admin ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all placeholder:text-gray-400"
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

          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Roles ({totalAdminsCount})</option>
              <option value="ADMIN">Super Admins ({superAdminsCount})</option>
              <option value="MANAGER">Store Managers ({managersCount})</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="BLOCKED">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Role &amp; Title</th>
                <th className="py-3.5 px-4">Permissions Scope</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-gray-300" />
                      <div className="text-sm font-semibold text-gray-600">No shop administrators found</div>
                      <p className="text-xs text-gray-400 max-w-sm">
                        {searchQuery
                          ? `No admins matching "${searchQuery}". Try changing your search filters.`
                          : "No administrators configured. Click 'Add Shop Admin' to create one."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isCurrentLoggedIn = adminUser?.email && admin.email?.toLowerCase() === adminUser.email.toLowerCase();
                  const initials = admin.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border ${
                              admin.role === "ADMIN"
                                ? "bg-yellow-400 text-gray-950 border-yellow-500/30"
                                : "bg-sky-100 text-sky-800 border-sky-200"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{admin.name}</span>
                              {isCurrentLoggedIn && (
                                <span className="text-[10px] bg-yellow-400/20 text-yellow-800 border border-yellow-400/40 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                              <span>ID: {admin.id.substring(0, 16)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="font-mono font-bold text-gray-800">{admin.phone}</span>
                            <button
                              onClick={() => handleCopy(admin.phone, admin.id)}
                              className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
                              title="Copy mobile number"
                            >
                              {copiedPhone === admin.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {admin.email && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[180px]">{admin.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            admin.role === "ADMIN"
                              ? "bg-gray-950 text-yellow-400 border border-gray-800"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{admin.role === "ADMIN" ? "Super Administrator" : "Store Manager"}</span>
                        </span>
                      </td>

                      {/* Permissions Scope */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {admin.role === "ADMIN" ? (
                            <span className="px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 text-[10px] font-bold">
                              Full Store Authority (All 8 Modules)
                            </span>
                          ) : (
                            (admin.permissions || []).slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium capitalize"
                              >
                                {p}
                              </span>
                            ))
                          )}
                          {admin.role === "MANAGER" && (admin.permissions?.length || 0) > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium">
                              +{(admin.permissions?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            admin.isBlocked
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              admin.isBlocked ? "bg-rose-600" : "bg-emerald-500 animate-pulse"
                            }`}
                          />
                          <span>{admin.isBlocked ? "Suspended" : "Active"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingAdmin(admin)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                            title="View admin profile & security details"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(admin)}
                            className="p-1.5 hover:bg-yellow-100/50 rounded-lg text-gray-600 hover:text-yellow-700 transition-colors"
                            title="Edit details, role, or reset password"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => toggleShopAdminStatus(admin.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              admin.isBlocked
                                ? "hover:bg-emerald-100 text-gray-400 hover:text-emerald-700"
                                : "hover:bg-rose-100 text-gray-400 hover:text-rose-700"
                            }`}
                            title={admin.isBlocked ? "Reactivate administrator" : "Suspend administrator"}
                          >
                            {admin.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => setAdminToDelete(admin)}
                            disabled={isCurrentLoggedIn || (superAdminsCount <= 1 && admin.role === "ADMIN")}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrentLoggedIn || (superAdminsCount <= 1 && admin.role === "ADMIN")
                                ? "text-gray-200 cursor-not-allowed"
                                : "hover:bg-rose-100 text-gray-400 hover:text-rose-600"
                            }`}
                            title={
                              isCurrentLoggedIn
                                ? "Cannot delete yourself"
                                : superAdminsCount <= 1 && admin.role === "ADMIN"
                                ? "Cannot delete the only Super Administrator"
                                : "Delete administrator account"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer info */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
          <span>
            Showing <strong className="text-gray-900">{filteredAdmins.length}</strong> of{" "}
            <strong className="text-gray-900">{totalAdminsCount}</strong> administrators
          </span>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>🔒 All credentials encrypted via BCrypt in MongoDB Atlas database</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD NEW SHOP ADMIN MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-950 text-yellow-400 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Shop Administrator</h2>
                <p className="text-xs text-gray-500">
                  Provision new credentials and assign role permissions to store staff
                </p>
              </div>
            </div>

            {addError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golam Rabbani / Md. Tareq Hasan"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Bangladeshi Mobile <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">
                      +88
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="01711223344"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      className="w-full pl-12 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">11-digit mobile number</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Work Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="admin@shorobor.com.bd"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-gray-400"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Used for admin notifications</span>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Login Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAddPass ? "text" : "password"}
                      required
                      placeholder="Min 6 characters (e.g. admin123)"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPass(!showAddPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAddPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showAddPass ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    value={addConfirmPassword}
                    onChange={(e) => setAddConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  System Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setAddRole("ADMIN");
                      setAddPermissions([
                        "dashboard",
                        "products",
                        "categories",
                        "orders",
                        "customers",
                        "coupons",
                        "settings",
                        "admins",
                      ]);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      addRole === "ADMIN"
                        ? "bg-gray-950 text-white border-gray-950 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <ShieldCheck className={`w-4 h-4 ${addRole === "ADMIN" ? "text-yellow-400" : "text-gray-500"}`} />
                        <span>Super Administrator</span>
                      </div>
                      {addRole === "ADMIN" && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <p className={`text-[11px] mt-1.5 ${addRole === "ADMIN" ? "text-gray-300" : "text-gray-500"}`}>
                      Unrestricted master access to all financial, admin, and database controls.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setAddRole("MANAGER");
                      setAddPermissions(["dashboard", "products", "categories", "orders", "customers", "coupons"]);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      addRole === "MANAGER"
                        ? "bg-gray-950 text-white border-gray-950 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Sliders className={`w-4 h-4 ${addRole === "MANAGER" ? "text-yellow-400" : "text-gray-500"}`} />
                        <span>Store Operations Manager</span>
                      </div>
                      {addRole === "MANAGER" && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <p className={`text-[11px] mt-1.5 ${addRole === "MANAGER" ? "text-gray-300" : "text-gray-500"}`}>
                      Operational access for inventory, orders, deliveries, and customer inquiries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Module Permissions Checklist ({addPermissions.length} of {ALL_PERMISSIONS.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = addPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className="flex items-start gap-2 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.key, addPermissions, setAddPermissions)}
                          className="mt-0.5 rounded text-yellow-500 focus:ring-yellow-400 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{perm.label}</div>
                          <div className="text-[10px] text-gray-400">{perm.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2.5 bg-gray-950 hover:bg-black text-yellow-400 hover:text-yellow-300 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingAdd && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingAdd ? "Saving to Database..." : "Create Administrator"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT SHOP ADMIN MODAL */}
      {/* ======================================================== */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setEditingAdmin(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-gray-950 flex items-center justify-center">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Administrator Profile</h2>
                <p className="text-xs text-gray-500">
                  Update credentials, role scope, or change password for {editingAdmin.name}
                </p>
              </div>
            </div>

            {editError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Bangladeshi Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Password Reset (Optional) */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-yellow-600" />
                    <span>Reset / Update Password (Optional)</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Leave blank to keep existing</span>
                </div>
                <div className="relative">
                  <input
                    type={showEditPass ? "text" : "password"}
                    placeholder="Enter new password (min 6 chars)..."
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole("ADMIN")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === "ADMIN"
                        ? "bg-gray-950 text-white border-gray-950 font-bold"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <div className="text-xs">Super Administrator</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Master store control</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole("MANAGER")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editRole === "MANAGER"
                        ? "bg-gray-950 text-white border-gray-950 font-bold"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <div className="text-xs">Store Operations Manager</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Catalog &amp; order ops</div>
                  </button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <div className="text-xs font-bold text-gray-800">Account Access Status</div>
                  <div className="text-[11px] text-gray-500">
                    {editIsBlocked
                      ? "Suspended — this administrator cannot sign in or manage the store"
                      : "Active — permitted to login and access authorized features"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsBlocked(!editIsBlocked)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    editIsBlocked
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  {editIsBlocked ? "SUSPENDED" : "ACTIVE"}
                </button>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Active Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-40 overflow-y-auto">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = editPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.key, editPermissions, setEditPermissions)}
                          className="rounded text-yellow-500 focus:ring-yellow-400"
                        />
                        <span className="text-xs font-medium text-gray-800">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {isSavingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingEdit ? "Saving Changes..." : "Save Administrator Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Remove Administrator Account?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <strong className="text-gray-900">{adminToDelete.name}</strong> ({adminToDelete.phone})?
                They will immediately lose access to the administrative console and store database.
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>This action removes the user from MongoDB Atlas and cannot be undone.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW ADMIN DETAILS MODAL */}
      {/* ======================================================== */}
      {viewingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 relative">
            <button
              onClick={() => setViewingAdmin(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${
                  viewingAdmin.role === "ADMIN"
                    ? "bg-yellow-400 text-gray-950"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {viewingAdmin.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewingAdmin.name}</h3>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                    viewingAdmin.role === "ADMIN"
                      ? "bg-gray-950 text-yellow-400"
                      : "bg-sky-100 text-sky-800"
                  }`}
                >
                  {viewingAdmin.role === "ADMIN" ? "Super Administrator" : "Store Manager"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Mobile:
                </span>
                <span className="font-mono font-bold text-gray-900">{viewingAdmin.phone}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-semibold text-gray-900">{viewingAdmin.email || "Not specified"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Registered:
                </span>
                <span className="font-mono text-gray-800">
                  {viewingAdmin.createdAt ? viewingAdmin.createdAt.split("T")[0] : "2026-01-01"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Status:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    viewingAdmin.isBlocked
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {viewingAdmin.isBlocked ? "SUSPENDED" : "ACTIVE"}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 font-bold mb-1.5">Authorized Modules:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(viewingAdmin.permissions || ["dashboard", "products", "orders", "customers"]).map((p) => (
                    <span
                      key={p}
                      className="px-2 py-1 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200/60 text-[11px] font-semibold capitalize"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingAdmin(null)}
                className="w-full py-2.5 bg-gray-950 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
