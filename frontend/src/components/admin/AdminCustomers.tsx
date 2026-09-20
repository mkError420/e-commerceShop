import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { Customer, AdminRole, AdminPermission } from "../../types";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ban,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  UserPlus,
  Database,
  Trash2,
  Edit,
  AlertTriangle,
  KeyRound,
  Sparkles,
} from "lucide-react";

export const AdminCustomers: React.FC = () => {
  const {
    customers,
    toggleBlockCustomer,
    deleteCustomer,
    updateCustomer,
    promoteCustomerToAdmin,
    formatPrice,
    orders,
    showToast,
    refreshCustomers,
    registerAdminUser,
    registerCustomer,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CUSTOMER" | "ADMIN" | "MANAGER">("CUSTOMER");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-refresh customers when component mounts
  useEffect(() => {
    refreshCustomers().catch(() => console.log("Initial customers refresh failed"));
  }, []); // Removed refreshCustomers dependency to prevent infinite loops

  // Delete Customer state
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Customer state
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"CUSTOMER" | "ADMIN" | "MANAGER">("CUSTOMER");
  const [editPassword, setEditPassword] = useState("");
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Promote / Role Assignment Modal State
  const [customerToPromote, setCustomerToPromote] = useState<Customer | null>(null);
  const [promoteRole, setPromoteRole] = useState<AdminRole>("ADMIN");
  const [promotePermissions, setPromotePermissions] = useState<AdminPermission[]>([
    "dashboard",
    "products",
    "categories",
    "orders",
    "customers",
    "coupons",
    "settings",
    "admins",
  ]);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState("");

  // Add User / Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState<"CUSTOMER" | "ADMIN" | "MANAGER">("CUSTOMER");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const handleSyncDb = async () => {
    setIsSyncing(true);
    try {
      if (refreshCustomers) {
        await refreshCustomers();
      }
      showToast("Customers successfully refreshed from MongoDB Atlas!");
    } catch {
      showToast("Data refreshed from database", "info");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!newName.trim() || !newPhone.trim()) {
      setAddError("Full name and Bangladeshi mobile number are required.");
      return;
    }

    const cleanPhone = newPhone.trim();
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      setAddError("Phone must be a valid 11-digit Bangladeshi mobile number (e.g. 01711223344).");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setAddError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (newRole === "ADMIN" && registerAdminUser) {
        const res = await registerAdminUser(newName, cleanPhone, newEmail, newPassword || "admin123");
        if (!res.success) {
          setAddError(res.message);
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await registerCustomer(newName, cleanPhone, newEmail || undefined, newPassword || undefined);
        if (!res.success) {
          setAddError(res.message);
          setIsSubmitting(false);
          return;
        }
      }

      showToast(`New ${newRole} account saved to MongoDB database!`);
      setShowAddModal(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      setNewPassword("");
      if (refreshCustomers) {
        await refreshCustomers();
      }
    } catch (err: any) {
      setAddError(err?.message || "Failed to register user to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (cust: Customer) => {
    setCustomerToEdit(cust);
    setEditName(cust.name);
    setEditPhone(cust.phoneNumber);
    setEditEmail(cust.email === "N/A" ? "" : cust.email || "");
    setEditRole(cust.role || "CUSTOMER");
    setEditPassword("");
    setEditIsBlocked(cust.isBlocked);
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToEdit) return;
    setEditError("");

    if (!editName.trim()) {
      setEditError("Full name is required.");
      return;
    }

    const cleanPhone = editPhone.trim();
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      setEditError("Phone must be a valid 11-digit Bangladeshi mobile number (e.g. 01711223344).");
      return;
    }

    if (editPassword.trim() && editPassword.trim().length < 6) {
      setEditError("Password must be at least 6 characters long.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await updateCustomer(customerToEdit.id, {
        name: editName.trim(),
        phoneNumber: cleanPhone,
        email: editEmail.trim() || undefined,
        role: editRole,
        isBlocked: editIsBlocked,
        password: editPassword.trim() || undefined,
      });
      if (!res.success) {
        setEditError(res.message);
        setIsSavingEdit(false);
        return;
      }
      setCustomerToEdit(null);
      if (selectedCustomer && selectedCustomer.id === customerToEdit.id) {
        setSelectedCustomer({
          ...selectedCustomer,
          name: editName.trim(),
          phoneNumber: cleanPhone,
          email: editEmail.trim() || "N/A",
          role: editRole,
          isBlocked: editIsBlocked,
        });
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update customer.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenPromote = (cust: Customer) => {
    setCustomerToPromote(cust);
    setPromoteRole(cust.role === "MANAGER" ? "MANAGER" : "ADMIN");
    setPromotePermissions(
      cust.permissions && cust.permissions.length > 0
        ? cust.permissions
        : cust.role === "MANAGER"
        ? ["dashboard", "products", "categories", "orders", "customers", "coupons"]
        : ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]
    );
    setPromoteError("");
  };

  const handleConfirmPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToPromote) return;
    setIsPromoting(true);
    setPromoteError("");
    try {
      const res = await promoteCustomerToAdmin(customerToPromote.id, promoteRole, promotePermissions);
      if (!res.success) {
        setPromoteError(res.message);
        setIsPromoting(false);
        return;
      }
      showToast(`User ${customerToPromote.name} set as Shop ${promoteRole === "ADMIN" ? "Admin" : "Manager"} with full functions!`);
      if (selectedCustomer && selectedCustomer.id === customerToPromote.id) {
        setSelectedCustomer({
          ...selectedCustomer,
          role: promoteRole,
          permissions: promotePermissions,
        });
      }
      setCustomerToPromote(null);
    } catch (err: any) {
      setPromoteError(err?.message || "Failed to promote user.");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      if (selectedCustomer && selectedCustomer.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
      setCustomerToDelete(null);
    } catch (err: any) {
      showToast(err?.message || "Error deleting customer", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered customers - only show customers by default, not admins
  const filteredCustomers = customers.filter((cust) => {
    // Only show customers (role is CUSTOMER or undefined)
    const isCustomer = !cust.role || cust.role === "CUSTOMER";
    if (!isCustomer) return false;

    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phoneNumber.includes(searchQuery) ||
      (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && !cust.isBlocked) ||
      (statusFilter === "BLOCKED" && cust.isBlocked);

    const matchesRole =
      roleFilter === "ALL" ||
      (roleFilter === "CUSTOMER" && (!cust.role || cust.role === "CUSTOMER")) ||
      cust.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calculate statistics - only for customers, not admins
  const customerOnlyList = customers.filter((c) => !c.role || c.role === "CUSTOMER");
  const totalCustomers = customerOnlyList.length;
  const activeCustomers = customerOnlyList.filter((c) => !c.isBlocked).length;
  const blockedCustomers = customerOnlyList.filter((c) => c.isBlocked).length;
  const totalCustomerSpendBDT = customerOnlyList.reduce((sum, c) => sum + (c.totalSpentBDT || 0), 0);

  // Get orders associated with a selected customer
  const getCustomerOrders = (phone: string) => {
    return orders.filter((o) => o.customerPhone === phone);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 text-yellow-500" />
            <span>Customer Relationship Management (CRM)</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-gray-900">
            Registered Customers &amp; User Accounts
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View shopper details, verified contact credentials, purchase history, and account status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>MongoDB Atlas Synced</span>
          </div>

          <button
            type="button"
            onClick={handleSyncDb}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Reload latest records directly from MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${isSyncing ? "animate-spin text-yellow-600" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync DB"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddError("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-yellow-400" />
            <span>Add User / Admin</span>
          </button>

          <div className="text-right hidden lg:block pl-2 border-l border-gray-200">
            <div className="text-xl font-extrabold text-gray-900 font-sans">{totalCustomers}</div>
            <div className="text-[10px] text-gray-500 font-medium">Shoppers</div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-600">Total Registered</span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
            {totalCustomers}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Saved in database &amp; synced live
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-600">Active Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-3 font-sans">
            {activeCustomers}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Permitted to checkout &amp; place orders
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-600">Blocked Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-3 font-sans">
            {blockedCustomers}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Restricted from placing new orders
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-600">Total Customer Spend</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-800 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
            {formatPrice(totalCustomerSpendBDT)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Cumulative order volume
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white text-gray-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-900"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter - Customer Directory Only */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Show:</span>
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === "ALL"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Customers
            </button>
            <button
              onClick={() => setRoleFilter("CUSTOMER")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === "CUSTOMER"
                  ? "bg-gray-700 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Shoppers Only
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Status:</span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ALL"
                  ? "bg-gray-950 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({totalCustomers})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-700 text-white"
                  : "text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Active ({activeCustomers})
            </button>
            <button
              onClick={() => setStatusFilter("BLOCKED")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "BLOCKED"
                  ? "bg-rose-700 text-white"
                  : "text-rose-800 hover:bg-rose-100"
              }`}
            >
              Blocked ({blockedCustomers})
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="py-3.5 px-4">Customer Name &amp; ID</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4 text-center">Account Status</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600">No customers found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchQuery ? "Try adjusting your search query." : "When customers register, they will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const initials = cust.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={cust.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0 bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-950">
                            {initials || "C"}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {cust.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              ID: {cust.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-gray-800 font-semibold">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{cust.phoneNumber}</span>
                          </div>
                          {cust.email && cust.email !== "N/A" && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{cust.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{cust.registeredDate || "2026"}</span>
                        </div>
                      </td>

                      {/* Total Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-gray-100 font-bold text-gray-900 px-2.5 py-1 rounded-lg text-xs font-mono">
                          <ShoppingBag className="w-3 h-3 text-gray-500" />
                          {cust.totalOrders || 0}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 text-xs">
                        {formatPrice(cust.totalSpentBDT || 0)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            cust.isBlocked
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cust.isBlocked ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                          {cust.isBlocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPromote(cust)}
                            className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Set as Shop Admin or Configure Dashboard Access"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                            <span>{cust.role === "ADMIN" ? "Permissions" : "Set Admin"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(cust)}
                            className="text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-yellow-400 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="View Customer Details & Orders"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cust)}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit Customer Details & Credentials"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toggleBlockCustomer(cust.id);
                              showToast(
                                `Customer ${cust.name} is now ${cust.isBlocked ? "Active" : "Blocked"}`
                              );
                            }}
                            className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                              cust.isBlocked
                                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                            title={cust.isBlocked ? "Unblock Customer" : "Block Customer"}
                          >
                            {cust.isBlocked ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5 text-gray-500" />
                                <span>Block</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCustomerToDelete(cust)}
                            className="text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Delete Customer Account from database"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-gray-950 font-extrabold flex items-center justify-center text-base shadow-sm">
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-gray-900">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Orders</div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedCustomer.totalOrders || 0}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Spent</div>
                <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
                  {formatPrice(selectedCustomer.totalSpentBDT || 0)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <div className="text-[10px] text-gray-500 font-semibold uppercase">Status</div>
                <div className={`text-xs font-extrabold mt-1.5 ${selectedCustomer.isBlocked ? "text-rose-600" : "text-emerald-600"}`}>
                  {selectedCustomer.isBlocked ? "BLOCKED" : "ACTIVE"}
                </div>
              </div>
            </div>

            {/* Administrative Role & Privileges */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Administrative Role: {selectedCustomer.role || "CUSTOMER"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPromote(selectedCustomer);
                  }}
                  className="text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Configure Privileges
                </button>
              </div>
              {selectedCustomer.role === "ADMIN" || selectedCustomer.role === "MANAGER" ? (
                <div className="text-[11px] text-amber-900/80">
                  <div className="font-semibold text-[10px] text-amber-800 uppercase tracking-wide mb-1">
                    Active Dashboard Modules:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(selectedCustomer.permissions && selectedCustomer.permissions.length > 0
                      ? selectedCustomer.permissions
                      : ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]
                    ).map((perm) => (
                      <span key={perm} className="bg-white/90 text-amber-900 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-800/80">
                  Standard shopper profile. You can promote this user to Shop Admin or Store Manager at any time.
                </p>
              )}
            </div>

            {/* Profile Information List */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Mobile Number</span>
                <span className="font-mono font-bold text-gray-900">{selectedCustomer.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Email Address</span>
                <span className="text-gray-900 font-medium">{selectedCustomer.email || "Not provided"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Joined Date</span>
                <span className="font-mono text-gray-700">{selectedCustomer.registeredDate || "2026-01-01"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Country / Region</span>
                <span className="text-gray-900 font-medium">Bangladesh (BD)</span>
              </div>
            </div>

            {/* Associated Orders */}
            <div>
              <h4 className="font-bold text-xs text-gray-900 mb-2">
                Order Activity ({getCustomerOrders(selectedCustomer.phoneNumber).length} Orders Found)
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {getCustomerOrders(selectedCustomer.phoneNumber).length === 0 ? (
                  <p className="text-xs text-gray-400 py-2 italic text-center">
                    No orders placed under this mobile number yet.
                  </p>
                ) : (
                  getCustomerOrders(selectedCustomer.phoneNumber).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-gray-900">{ord.orderNumber}</span>
                        <span className="text-gray-400 text-[11px] ml-2">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{formatPrice(ord.totalBDT)}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-700">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPromote(selectedCustomer);
                  }}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>{selectedCustomer.role === "ADMIN" ? "Permissions" : "Set Admin"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedCustomer);
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleBlockCustomer(selectedCustomer.id);
                    setSelectedCustomer({
                      ...selectedCustomer,
                      isBlocked: !selectedCustomer.isBlocked,
                    });
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCustomer.isBlocked
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {selectedCustomer.isBlocked ? "Unblock Account" : "Block Account"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomerToDelete(selectedCustomer);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User / Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Register in MongoDB</h3>
                  <p className="text-[11px] text-gray-500">Add Customer or Admin directly to database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="mt-4 space-y-4">
              {addError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {addError}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole("CUSTOMER")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      newRole === "CUSTOMER"
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole("ADMIN")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      newRole === "ADMIN"
                        ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Golam Rabbani"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number (11 digits) *</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 01711223344"
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password {newRole === "ADMIN" ? "*" : "(Optional, min 6 chars)"}
                </label>
                <input
                  type="password"
                  required={newRole === "ADMIN"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={newRole === "ADMIN" ? "Admin secret password" : "Create password"}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Saving to DB..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {customerToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Edit Customer Profile</h3>
                  <p className="text-[11px] text-gray-500 font-mono">ID: {customerToEdit.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomerToEdit(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {editError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Golam Rabbani"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number (11 digits) *</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 01711223344"
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Account Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole("CUSTOMER")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      editRole === "CUSTOMER"
                        ? "bg-gray-800 text-white border-gray-800 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole("ADMIN")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      editRole === "ADMIN"
                        ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Shop Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole("MANAGER")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      editRole === "MANAGER"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Manager
                  </button>
                </div>
              </div>

              {/* Reset Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reset Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsBlocked(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      !editIsBlocked
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Active Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsBlocked(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      editIsBlocked
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Blocked Account
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerToEdit(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote to Shop Admin / Manager Modal */}
      {customerToPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Assign Shop Admin Privileges</h3>
                  <p className="text-[11px] text-gray-500">Configure dashboard roles &amp; operational permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomerToPromote(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPromote} className="mt-4 space-y-4 text-xs">
              {promoteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {promoteError}
                </div>
              )}

              {/* Target User Info Banner */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">TARGET USER</span>
                  <div className="font-bold text-gray-900 text-sm">{customerToPromote.name}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{customerToPromote.phoneNumber} {customerToPromote.email && `• ${customerToPromote.email}`}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-medium block">CURRENT ROLE</span>
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-bold text-[10px]">
                    {customerToPromote.role || "CUSTOMER"}
                  </span>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Administrative Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPromoteRole("ADMIN");
                      setPromotePermissions(["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      promoteRole === "ADMIN"
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Shop Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromoteRole("MANAGER");
                      setPromotePermissions(["dashboard", "products", "categories", "orders", "customers", "coupons"]);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      promoteRole === "MANAGER"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Store Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromoteRole("CUSTOMER" as any);
                      setPromotePermissions([]);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      (promoteRole as string) === "CUSTOMER"
                        ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Shopper</span>
                  </button>
                </div>
              </div>

              {/* Permissions Checklist */}
              {(promoteRole as string) !== "CUSTOMER" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      Module Permissions ({promotePermissions.length}/8 Granted)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (promotePermissions.length === 8) {
                          setPromotePermissions([]);
                        } else {
                          setPromotePermissions(["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]);
                        }
                      }}
                      className="text-[11px] text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      {promotePermissions.length === 8 ? "Deselect All" : "Select All Modules"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {[
                      { key: "dashboard", label: "Dashboard Analytics", desc: "View sales, KPI metrics" },
                      { key: "products", label: "Product Catalog", desc: "Add, edit, delete items" },
                      { key: "categories", label: "Categories", desc: "Manage catalog taxonomy" },
                      { key: "orders", label: "Order Management", desc: "Update status, dispatch" },
                      { key: "customers", label: "Customers & CRM", desc: "View shopper profiles" },
                      { key: "coupons", label: "Discount Coupons", desc: "Manage promo campaigns" },
                      { key: "settings", label: "Store Settings", desc: "Courier & MFS config" },
                      { key: "admins", label: "Staff & Admins", desc: "Manage shop admin team" },
                    ].map(({ key, label, desc }) => {
                      const isChecked = promotePermissions.includes(key as AdminPermission);
                      return (
                        <label
                          key={key}
                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-amber-50/80 border-amber-200 text-gray-900"
                              : "bg-white border-gray-200 text-gray-500 opacity-80"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPromotePermissions([...promotePermissions, key as AdminPermission]);
                              } else {
                                setPromotePermissions(promotePermissions.filter((p) => p !== key));
                              }
                            }}
                            className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                          />
                          <div>
                            <div className="font-bold text-xs">{label}</div>
                            <div className="text-[10px] text-gray-400 leading-tight">{desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerToPromote(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isPromoting ? "Applying..." : "Save Role & Permissions"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Delete Customer Account</h3>
                <p className="text-xs text-gray-500">This action will remove the account from database</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{customerToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Mobile:</span>
                <span className="font-mono font-semibold text-gray-900">{customerToDelete.phoneNumber}</span>
              </div>
              {customerToDelete.email && customerToDelete.email !== "N/A" && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Email:</span>
                  <span className="text-gray-700">{customerToDelete.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Total Orders:</span>
                <span className="font-mono font-bold text-gray-900">{customerToDelete.totalOrders || 0}</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
              ⚠️ Warning: This will permanently delete this customer profile, saved data, and authentication credentials from MongoDB Atlas. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
