import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Customer } from "../../types";
import {
  Users,
  Search,
  ShieldCheck,
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
} from "lucide-react";

export const AdminCustomers: React.FC = () => {
  const { customers, toggleBlockCustomer, formatPrice, orders, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filtered customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phoneNumber.includes(searchQuery) ||
      (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && !cust.isBlocked) ||
      (statusFilter === "BLOCKED" && cust.isBlocked);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => !c.isBlocked).length;
  const blockedCustomers = customers.filter((c) => c.isBlocked).length;
  const totalCustomerSpendBDT = customers.reduce((sum, c) => sum + (c.totalSpentBDT || 0), 0);

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

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-extrabold text-gray-900 font-sans">{totalCustomers}</div>
            <div className="text-[10px] text-gray-500 font-medium">Registered Shoppers</div>
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
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
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

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "ALL"
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({totalCustomers})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Active ({activeCustomers})
          </button>
          <button
            onClick={() => setStatusFilter("BLOCKED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "BLOCKED"
                ? "bg-rose-700 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            Blocked ({blockedCustomers})
          </button>
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
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
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
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-950 font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
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
                            onClick={() => setSelectedCustomer(cust)}
                            className="text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-yellow-400 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => {
                              toggleBlockCustomer(cust.id);
                              showToast(
                                `Customer ${cust.name} is now ${cust.isBlocked ? "Active" : "Blocked"}`
                              );
                            }}
                            className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                              cust.isBlocked
                                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-700"
                            }`}
                            title={cust.isBlocked ? "Unblock Customer" : "Block Customer"}
                          >
                            {cust.isBlocked ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>Block</span>
                              </>
                            )}
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
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  toggleBlockCustomer(selectedCustomer.id);
                  setSelectedCustomer({
                    ...selectedCustomer,
                    isBlocked: !selectedCustomer.isBlocked,
                  });
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCustomer.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                }`}
              >
                {selectedCustomer.isBlocked ? "Unblock Customer Account" : "Block Customer Account"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
