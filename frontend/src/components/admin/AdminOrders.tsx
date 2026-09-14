import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { OrderStatus, PaymentStatus } from "../../types";
import { 
  Truck, 
  Phone, 
  MapPin, 
  CreditCard, 
  Search, 
  CheckCircle, 
  ExternalLink,
  Clock,
  Filter
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-editorial text-2xl font-bold text-[#1A1A1A]">
          Order Fulfillment & Logistics Dispatch
        </h2>
        <p className="text-xs text-[#555555]">
          Manage orders across Dhaka and all 64 districts, assign couriers (Pathao/Steadfast), and update payment status.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-[#E0E0E0]">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Phone (017...), Name, or District..."
            className="w-full text-xs p-2 pl-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
          />
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-2.5" />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A] w-full sm:w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-xs space-y-4 hover:border-[#1A1A1A] transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0F0F0] gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                    Order #{order.id}
                  </span>
                  <span className="text-xs text-[#777777] font-mono">
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
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                    order.deliveryZone === "INSIDE_DHAKA" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {order.deliveryZone === "INSIDE_DHAKA" ? "Inside Dhaka (৳60)" : "Outside Dhaka (৳130)"}
                  </span>

                  <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                    {formatPrice(order.totalBDT)}
                  </span>
                </div>
              </div>

              {/* Order Body: Customer details + Items + Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                {/* Col 1: Customer & Address */}
                <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-[#F0F0F0] pb-3 md:pb-0 md:pr-4">
                  <span className="font-bold uppercase tracking-wider text-[#1A1A1A] block">
                    Customer Info
                  </span>
                  <p className="font-semibold text-[#1A1A1A]">{order.customerName}</p>
                  <p className="flex items-center gap-1.5 font-mono text-[#333333]">
                    <Phone className="w-3.5 h-3.5 text-[#555555]" />
                    <a href={`tel:${order.customerPhone}`} className="hover:underline text-blue-600">
                      {order.customerPhone}
                    </a>
                  </p>
                  <p className="text-[#555555] flex items-start gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#555555] shrink-0 mt-0.5" />
                    <span>
                      {order.streetLine}, {order.thana}, {order.district}, {order.division}
                    </span>
                  </p>
                </div>

                {/* Col 2: Items in Order */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-[#F0F0F0] pb-3 md:pb-0 md:pr-4">
                  <span className="font-bold uppercase tracking-wider text-[#1A1A1A] block">
                    Ordered Products ({order.items.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#333333] line-clamp-1 font-medium">
                          {item.quantity}x {item.productTitle}
                        </span>
                        <span className="font-mono text-[#555555]">
                          {formatPrice(item.totalPriceBDT)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 3: Courier & Status Management */}
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold block mb-1 text-[#1A1A1A]">Fulfillment Status</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="w-full text-xs p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-semibold focus:border-[#1A1A1A]"
                    >
                      <option value="PENDING">PENDING (Waiting confirmation)</option>
                      <option value="PROCESSING">PROCESSING (Packing in Dhaka Hub)</option>
                      <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                      <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-[#1A1A1A]">Payment Status ({order.paymentGateway})</label>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentChange(order.id, e.target.value as PaymentStatus)}
                      className="w-full text-xs p-2 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-semibold focus:border-[#1A1A1A]"
                    >
                      <option value="PAID">PAID (Verified)</option>
                      <option value="PENDING">PENDING (Collect COD)</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#555555]">
                    <span>Courier: <strong className="text-[#1A1A1A]">{order.courierName}</strong></span>
                    <span className="font-mono text-[10px]">Track: {order.trackingId}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E0E0E0]">
            <p className="text-sm font-semibold text-[#1A1A1A]">No orders found matching criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
