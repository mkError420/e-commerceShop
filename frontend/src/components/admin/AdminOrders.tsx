import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { OrderStatus, PaymentStatus } from "../../types";
import { 
  Truck, 
  Phone, 
  MapPin, 
  Search, 
  Clock, 
  CheckCircle2,
  PackageCheck,
  CreditCard
} from "lucide-react";

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, formatPrice, showToast } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order #${orderId} marked as ${newStatus}`);
  };

  const handlePaymentChange = (orderId: string, newStatus: PaymentStatus) => {
    updateOrderPaymentStatus(orderId, newStatus);
    showToast(`Payment for Order #${orderId} marked as ${newStatus}`);
  };

  const statusOptions = [
    { label: "All Orders", value: "ALL", count: orders.length },
    { label: "Pending", value: "PENDING", count: orders.filter(o => o.status === "PENDING").length },
    { label: "Processing", value: "PROCESSING", count: orders.filter(o => o.status === "PROCESSING").length },
    { label: "Shipped", value: "SHIPPED", count: orders.filter(o => o.status === "SHIPPED").length },
    { label: "Delivered", value: "DELIVERED", count: orders.filter(o => o.status === "DELIVERED").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Truck className="w-3.5 h-3.5 text-yellow-500" />
            <span>Logistics & Fulfillment Hub</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-gray-900">
            Order Fulfillment & Logistics Dispatch
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage orders across Dhaka and all 64 districts, assign couriers (Pathao/Steadfast), and verify payments.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-gray-700">
            Total: <strong className="text-gray-900">{orders.length}</strong>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-yellow-800">
            Pending: <strong className="text-yellow-900">{orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length}</strong>
          </div>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((opt) => {
            const isActive = filterStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-yellow-400 text-gray-950 font-bold shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-gray-950 text-yellow-300" : "bg-gray-200 text-gray-700"
                }`}>
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (#ord-...), Phone (017...), Customer Name, or District..."
            className="w-full text-xs p-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 hover:border-yellow-400 transition-all admin-card-hover"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    #{order.id}
                  </span>
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    order.deliveryZone === "INSIDE_DHAKA" 
                      ? "bg-yellow-50 text-yellow-900 border-yellow-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}>
                    {order.deliveryZone === "INSIDE_DHAKA" ? "Inside Dhaka (৳60 Flat)" : "Outside Dhaka (৳130 Flat)"}
                  </span>

                  <span className="text-sm font-mono font-extrabold text-gray-900 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                    {formatPrice(order.totalBDT)}
                  </span>
                </div>
              </div>

              {/* Order Body: Customer details + Items + Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Col 1: Customer & Address */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-5">
                  <span className="font-bold uppercase tracking-wider text-gray-500 text-[10px] block">
                    Customer & Destination
                  </span>
                  <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                  <p className="flex items-center gap-1.5 font-mono text-gray-700">
                    <Phone className="w-3.5 h-3.5 text-yellow-600" />
                    <a href={`tel:${order.customerPhone}`} className="hover:underline font-semibold">
                      {order.customerPhone}
                    </a>
                  </p>
                  <p className="text-gray-600 flex items-start gap-1.5 mt-1 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {order.streetLine}, {order.thana}, {order.district}, {order.division}
                    </span>
                  </p>
                </div>

                {/* Col 2: Items in Order */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-gray-500 text-[10px] block">
                      Ordered Products ({order.items.length})
                    </span>
                    <PackageCheck className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] pt-1.5 first:pt-0">
                        <span className="text-gray-800 line-clamp-1 font-medium">
                          {item.quantity}× {item.productTitle}
                        </span>
                        <span className="font-mono text-gray-600 font-semibold shrink-0 ml-2">
                          {formatPrice(item.totalPriceBDT)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 3: Courier & Status Management */}
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold block mb-1 text-gray-700">Fulfillment Status</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                      <option value="PENDING">PENDING (Waiting confirmation)</option>
                      <option value="PROCESSING">PROCESSING (Packing in Dhaka Hub)</option>
                      <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                      <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-gray-700 flex items-center justify-between">
                      <span>Payment Status</span>
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                        {order.paymentGateway}
                      </span>
                    </label>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentChange(order.id, e.target.value as PaymentStatus)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                      <option value="PAID">PAID (Payment Verified)</option>
                      <option value="PENDING">PENDING (Collect COD)</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-yellow-600" />
                      <strong className="text-gray-900 font-sans">{order.courierName}</strong>
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">Track: {order.trackingId}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-sm font-semibold text-gray-900">No orders found matching criteria</p>
            <p className="text-xs text-gray-500 mt-1">Try changing the status filter or search keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
};
