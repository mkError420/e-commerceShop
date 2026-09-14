import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Search, Truck, CheckCircle2, Clock, MapPin, Package, AlertCircle } from "lucide-react";

export const TrackOrderPage: React.FC = () => {
  const { orders, t, formatPrice, navigate } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<any | null>(orders[0] || null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const found = orders.find(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.trackingId?.toLowerCase().includes(q)
    );
    setSearchedOrder(found || null);
  };

  const steps = [
    { label: "Order Placed", desc: "Confirmed in Dhaka Hub", completed: true },
    { label: "Packaging & QC", desc: "Fabric authentication passed", completed: true },
    { 
      label: "Dispatched to Courier", 
      desc: searchedOrder?.courierName || "Pathao Logistics Hub", 
      completed: searchedOrder?.status === "SHIPPED" || searchedOrder?.status === "DELIVERED" 
    },
    { 
      label: "Out for Delivery", 
      desc: "Rider assigned with OTP", 
      completed: searchedOrder?.status === "DELIVERED" 
    },
    { 
      label: "Delivered", 
      desc: "Delivered to recipient", 
      completed: searchedOrder?.status === "DELIVERED" 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="font-editorial text-3xl font-bold text-[#1A1A1A]">
          {t("Track Your Order", "অর্ডার ট্র্যাক করুন")}
        </h1>
        <p className="text-xs text-[#555555]">
          {t(
            "Enter your 11-digit mobile number, Order ID (e.g. ORD-1001), or Courier Waybill",
            "আপনার মোবাইল নম্বর অথবা অর্ডার আইডি দিয়ে পার্সেলের বর্তমান অবস্থা জানুন"
          )}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 pt-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 01711223344 or ORD-1001"
              className="w-full text-xs p-3 pl-9 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A] font-mono"
            />
            <Search className="w-4 h-4 text-[#555555] absolute left-3 top-3.5" />
          </div>
          <button
            type="submit"
            className="bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-3 rounded hover:bg-black transition-colors"
          >
            {t("Track", "ট্র্যাক")}
          </button>
        </form>
      </div>

      {searchedOrder ? (
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E0E0E0] gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#555555]">
                Waybill ID: {searchedOrder.trackingId}
              </span>
              <h2 className="font-editorial text-xl font-bold text-[#1A1A1A] mt-0.5">
                Order #{searchedOrder.id}
              </h2>
              <p className="text-xs text-[#555555]">
                Recipient: {searchedOrder.customerName} ({searchedOrder.customerPhone})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-[#1A1A1A] text-white text-xs px-3 py-1.5 rounded font-mono font-bold">
                Status: {searchedOrder.status}
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-1.5 rounded font-medium">
                {searchedOrder.courierName}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-6">
              {t("Logistics Timeline", "ডেলিভারি ট্র্যাকিং টাইমলাইন")}
            </h3>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex md:flex-col items-center md:items-center gap-3 text-left md:text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    step.completed ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" : "bg-white border-[#CCCCCC] text-[#999999]"
                  }`}>
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${step.completed ? "text-[#1A1A1A]" : "text-[#888888]"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-[#777777] max-w-[120px]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#E0E0E0] text-xs text-[#555555]">
            <div className="p-4 bg-[#F9F9F9] rounded-lg space-y-1">
              <span className="font-semibold text-[#1A1A1A] block">Destination Thana & District:</span>
              <p>{searchedOrder.streetLine}</p>
              <p>{searchedOrder.thana}, {searchedOrder.district}, {searchedOrder.division}</p>
            </div>

            <div className="p-4 bg-[#F9F9F9] rounded-lg space-y-1">
              <span className="font-semibold text-[#1A1A1A] block">Payment & Package Value:</span>
              <p>Method: {searchedOrder.paymentGateway}</p>
              <p className="font-mono font-bold text-[#1A1A1A]">Total: {formatPrice(searchedOrder.totalBDT)}</p>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-16 bg-[#F5F5F5] rounded-xl border border-[#E0E0E0] p-6">
          <AlertCircle className="w-10 h-10 mx-auto text-[#777777]" />
          <p className="text-sm font-semibold text-[#1A1A1A] mt-2">
            No order found matching "{searchQuery}"
          </p>
          <p className="text-xs text-[#555555] mt-1">
            Please check the 11-digit Bangladeshi mobile number or order identifier and try again.
          </p>
        </div>
      ) : null}
    </div>
  );
};
