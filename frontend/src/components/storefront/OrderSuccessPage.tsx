import React from "react";
import { useStore } from "../../context/StoreContext";
import { 
  CheckCircle, 
  Truck, 
  Package, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Printer, 
  Clock, 
  ShieldCheck 
} from "lucide-react";

interface OrderSuccessPageProps {
  orderId: string;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId }) => {
  const { orders, navigate, formatPrice, t } = useStore();

  const order = orders.find((o) => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Order not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 bg-[#1A1A1A] text-white px-4 py-2 rounded text-xs">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      {/* Success Hero Badge */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-editorial text-3xl font-bold text-[#1A1A1A]">
          {t("Order Confirmed & Logged!", "অর্ডার সফলভাবে সম্পন্ন হয়েছে!")}
        </h1>
        <p className="text-xs text-[#555555] max-w-md mx-auto">
          {t(
            `Thank you, ${order.customerName}. Your order is registered in our Dhaka hub. An SMS has been sent to ${order.customerPhone}.`,
            `ধন্যবাদ, ${order.customerName}। আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং মোবাইলে এসএমএস পাঠানো হয়েছে।`
          )}
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <span className="bg-white border border-[#E0E0E0] text-xs px-3 py-1.5 rounded font-mono font-bold text-[#1A1A1A]">
            Order #{order.id}
          </span>
          <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3 py-1.5 rounded font-mono font-semibold">
            Courier Waybill: {order.trackingId}
          </span>
        </div>
      </div>

      {/* Courier & Delivery Status Box */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1A1A1A]" />
            <h2 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              {t("Logistics & Dispatch", "কুরিয়ার ও ডেলিভারি তথ্য")}
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1A1A1A]">
            {order.courierName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#555555]">
          <div>
            <span className="font-semibold text-[#1A1A1A] block mb-1">Destination Address:</span>
            <p className="text-[#333333]">{order.streetLine}</p>
            <p className="text-[#555555]">{order.thana}, {order.district}, {order.division}</p>
            <p className="text-[#555555] mt-1 font-mono">Mobile: {order.customerPhone}</p>
          </div>

          <div>
            <span className="font-semibold text-[#1A1A1A] block mb-1">Payment Details:</span>
            <p className="capitalize text-[#333333]">Method: {order.paymentGateway.replace(/_/g, " ")}</p>
            <p className="text-emerald-700 font-semibold">Status: {order.paymentStatus}</p>
            {order.transactionId && (
              <p className="font-mono text-[11px] text-[#777777]">TrxID: {order.transactionId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#F0F0F0] pb-3">
          {t("Order Breakdown", "অর্ডার বিস্তারিত")}
        </h3>

        <div className="divide-y divide-[#F0F0F0]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.productTitle}
                  className="w-12 h-14 object-cover rounded bg-[#F5F5F5] border border-[#E0E0E0]"
                />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{item.productTitle}</p>
                  <p className="text-[11px] text-[#555555]">
                    {item.variantTitle} • Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-mono font-semibold text-[#1A1A1A]">
                {formatPrice(item.totalPriceBDT)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#E0E0E0] space-y-1.5 text-xs text-[#555555]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(order.subtotalBDT)}</span>
          </div>
          {order.discountBDT > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Voucher Discount</span>
              <span className="font-mono">-{formatPrice(order.discountBDT)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping Charge ({order.deliveryZone === "INSIDE_DHAKA" ? "Inside Dhaka" : "Outside Dhaka"})</span>
            <span className="font-mono">{formatPrice(order.shippingFeeBDT)}</span>
          </div>
          <div className="pt-2 border-t border-[#E0E0E0] flex justify-between font-bold text-sm text-[#1A1A1A]">
            <span>Total Paid / Payable</span>
            <span className="font-sans text-base">{formatPrice(order.totalBDT)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={() => navigate("/track-order")}
          className="w-full sm:w-auto bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-3 rounded hover:bg-black transition-colors flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>{t("Track Courier Status", "কুরিয়ার ট্র্যাক করুন")}</span>
        </button>

        <button
          onClick={() => navigate("/shop")}
          className="w-full sm:w-auto bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs font-semibold px-6 py-3 rounded hover:bg-[#F5F5F5] transition-colors"
        >
          {t("Continue Shopping", "আরও কেনাকাটা করুন")}
        </button>
      </div>
    </div>
  );
};
