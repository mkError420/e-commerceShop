import React from "react";
import { Order } from "../../types";
import { useStore } from "../../context/StoreContext";
import { Printer, X, Download, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  order: Order;
  onClose: () => void;
}

export const CustomerInvoiceModal: React.FC<Props> = ({ order, onClose }) => {
  const { formatPrice, t } = useStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Action Header (Non-printable) */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              {t("Customer Invoice", "গ্রাহক চালান")}
            </span>
            <span className="font-mono text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("Print / Save PDF", "প্রিন্ট বা পিডিএফ")}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 space-y-6 text-[#1A1A1A]">
          {/* Top Brand & Metadata */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-yellow-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight leading-none">BENGAL EDITION</h1>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Heritage Handloom Atelier</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-3 space-y-0.5">
                <div>House 42, Road 9A, Dhanmondi, Dhaka-1209</div>
                <div>hotline: +880 9612-000000 · support@bengaledition.com</div>
                <div>BIN: 002381940-0101 (National Board of Revenue)</div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xl font-bold uppercase tracking-tight text-gray-900">INVOICE</div>
              <div className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</div>
              <div className="text-xs text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
              </div>
              <div className="inline-block mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Paid & Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-gray-200 pb-6">
            <div>
              <div className="font-bold text-gray-500 uppercase tracking-wider mb-1.5">Billed & Shipped To:</div>
              <div className="font-bold text-sm text-gray-900">{order.customerName}</div>
              <div className="text-gray-600 font-mono mt-0.5">+880 {order.customerPhone.replace(/^(\+880|0)/, "")}</div>
              {order.customerEmail && <div className="text-gray-600">{order.customerEmail}</div>}
              <div className="text-gray-700 mt-1 leading-relaxed">
                {order.streetLine}, {order.thana}, {order.district}, {order.division}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-gray-500 uppercase tracking-wider mb-1.5">Payment & Logistics:</div>
              <div className="flex justify-between py-0.5 border-b border-gray-100">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-bold">{order.paymentGateway}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-100">
                <span className="text-gray-500">Courier Partner:</span>
                <span className="font-medium">{order.courierName || "Pathao Express"}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-100">
                <span className="text-gray-500">Tracking Code:</span>
                <span className="font-mono font-medium">{order.trackingId || "PTH-BD-XXXXX"}</span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-3">
                      <div className="font-bold text-gray-900">{item.productTitle}</div>
                      {item.variantTitle && (
                        <div className="text-[11px] text-gray-500">{item.variantTitle}</div>
                      )}
                    </td>
                    <td className="py-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 text-right font-mono">{formatPrice(item.unitPriceBDT)}</td>
                    <td className="py-3 text-right font-mono font-bold">
                      {formatPrice(item.unitPriceBDT * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="border-t-2 border-gray-200 pt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPrice(order.subtotalBDT)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-mono">{formatPrice(order.shippingFeeBDT)}</span>
              </div>
              {order.discountBDT > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Voucher / Discount:</span>
                  <span className="font-mono">-{formatPrice(order.discountBDT)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 text-gray-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base">{formatPrice(order.totalBDT)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-gray-100 text-center text-[11px] text-gray-500">
            Thank you for supporting Bangladesh's artisanal handloom community. This is an electronically verified invoice.
          </div>
        </div>
      </div>
    </div>
  );
};
