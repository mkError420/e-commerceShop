import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Order, OrderStatus, PaymentStatus, OrderItem, Product } from "../../types";
import {
  Truck,
  Phone,
  MapPin,
  Search,
  Clock,
  CheckCircle2,
  PackageCheck,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Printer,
  X,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const COURIER_OPTIONS = [
  { name: "Steadfast Courier", prefix: "ST" },
  { name: "Pathao Courier", prefix: "PTH" },
  { name: "Paperfly Logistics", prefix: "PFLY" },
  { name: "RedX Delivery", prefix: "RDX" },
  { name: "Sundarban Courier", prefix: "SBN" },
];

export const AdminOrders: React.FC = () => {
  const {
    orders,
    products,
    updateOrderStatus,
    updateOrderPaymentStatus,
    updateOrderDetails,
    deleteOrder,
    createAdminOrder,
    formatPrice,
    showToast,
  } = useStore();

  /* ── Filter & Search States ── */
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [courierFilter, setCourierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ── Modals State ── */
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  /* ── Create Order Form State ── */
  const [createCustomerName, setCreateCustomerName] = useState("");
  const [createCustomerPhone, setCreateCustomerPhone] = useState("");
  const [createCustomerEmail, setCreateCustomerEmail] = useState("");
  const [createDivision, setCreateDivision] = useState("Dhaka");
  const [createDistrict, setCreateDistrict] = useState("Dhaka");
  const [createThana, setCreateThana] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createCourier, setCreateCourier] = useState("Steadfast Courier");
  const [createPaymentGateway, setCreatePaymentGateway] = useState<"CASH_ON_DELIVERY" | "BKASH" | "NAGAD" | "BANK_TRANSFER">("CASH_ON_DELIVERY");
  const [createPaymentStatus, setCreatePaymentStatus] = useState<PaymentStatus>("PENDING");
  const [createNotes, setCreateNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ product: Product; variantTitle: string; quantity: number; unitPrice: number }[]>([]);

  /* ── Edit Order Form State ── */
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editDivision, setEditDivision] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editThana, setEditThana] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCourier, setEditCourier] = useState("");
  const [editTrackingId, setEditTrackingId] = useState("");
  const [editStatus, setEditStatus] = useState<OrderStatus>("PENDING");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [editNotes, setEditNotes] = useState("");

  /* ── Copy to clipboard helper ── */
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast(`Copied: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── KPI calculations ── */
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length,
    [orders]
  );
  const shippedCount = useMemo(
    () => orders.filter((o) => o.status === "SHIPPED").length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === "DELIVERED").length,
    [orders]
  );
  const totalRevenueBDT = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
        .reduce((sum, o) => sum + (o.totalBDT || 0), 0),
    [orders]
  );

  /* ── Filtered Orders ── */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
      if (courierFilter !== "ALL" && o.courierName !== courierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          o.customerPhone.includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.district.toLowerCase().includes(q) ||
          (o.trackingId && o.trackingId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, filterStatus, courierFilter, searchQuery]);

  /* ── Open Edit Modal ── */
  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone);
    setEditDivision(order.division || "Dhaka");
    setEditDistrict(order.district || "Dhaka");
    setEditThana(order.thana || "");
    setEditAddress(order.streetLine || "");
    setEditCourier(order.courierName || "Steadfast Courier");
    setEditTrackingId(order.trackingId || "");
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditNotes(order.notes || "");
  };

  /* ── Save Edit Order ── */
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const isInsideDhaka =
      editDistrict.toLowerCase().includes("dhaka") || editThana.toLowerCase().includes("dhaka");
    const deliveryZone = isInsideDhaka ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA";

    await updateOrderDetails(editingOrder.id, {
      customerName: editCustomerName.trim(),
      customerPhone: editCustomerPhone.trim(),
      division: editDivision,
      district: editDistrict,
      thana: editThana.trim(),
      streetLine: editAddress.trim(),
      deliveryZone,
      courierName: editCourier,
      trackingId: editTrackingId.trim() || editingOrder.trackingId,
      status: editStatus,
      paymentStatus: editPaymentStatus,
      notes: editNotes.trim(),
    });

    setEditingOrder(null);
  };

  /* ── Confirm Delete Order ── */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteOrder(deleteTarget.id);
    setDeleteTarget(null);
  };

  /* ── Create Manual Order Handlers ── */
  const handleAddItemToCreate = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.product.id === prod.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product: prod,
          variantTitle: prod.variants?.[0]?.title || "Free Size",
          quantity: 1,
          unitPrice: prod.priceBDT,
        },
      ];
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCustomerName.trim() || !createCustomerPhone.trim()) {
      showToast("Customer Name and Phone are required", "error");
      return;
    }
    if (selectedItems.length === 0) {
      showToast("Please select at least one product for the order", "error");
      return;
    }

    const isInsideDhaka =
      createDistrict.toLowerCase().includes("dhaka") || createThana.toLowerCase().includes("dhaka");
    const deliveryZone = isInsideDhaka ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA";
    const shippingFee = isInsideDhaka ? 60 : 130;

    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const total = subtotal + shippingFee;

    const orderItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.product.id,
      productTitle: item.product.nameEn,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      unitPriceBDT: item.unitPrice,
      totalPriceBDT: item.unitPrice * item.quantity,
      image: item.product.images[0] || "",
      imageUrl: item.product.images[0] || "",
    }));

    const trackingPrefix =
      COURIER_OPTIONS.find((c) => c.name === createCourier)?.prefix || "BD";
    const generatedTracking = `${trackingPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    await createAdminOrder({
      customerName: createCustomerName.trim(),
      customerPhone: createCustomerPhone.trim(),
      customerEmail: createCustomerEmail.trim() || undefined,
      division: createDivision,
      district: createDistrict,
      thana: createThana.trim(),
      streetLine: createAddress.trim(),
      deliveryZone,
      shippingFeeBDT: shippingFee,
      subtotalBDT: subtotal,
      discountBDT: 0,
      totalBDT: total,
      status: "PROCESSING",
      paymentGateway: createPaymentGateway,
      paymentStatus: createPaymentStatus,
      courierName: createCourier,
      trackingId: generatedTracking,
      items: orderItems,
      notes: createNotes.trim(),
    });

    // Reset Create form
    setCreateCustomerName("");
    setCreateCustomerPhone("");
    setCreateCustomerEmail("");
    setCreateAddress("");
    setCreateThana("");
    setCreateNotes("");
    setSelectedItems([]);
    setIsCreateOpen(false);
  };

  const statusOptions = [
    { label: "All Orders", value: "ALL", count: orders.length },
    { label: "Pending", value: "PENDING", count: orders.filter((o) => o.status === "PENDING").length },
    { label: "Processing", value: "PROCESSING", count: orders.filter((o) => o.status === "PROCESSING").length },
    { label: "Shipped", value: "SHIPPED", count: orders.filter((o) => o.status === "SHIPPED").length },
    { label: "Delivered", value: "DELIVERED", count: orders.filter((o) => o.status === "DELIVERED").length },
    { label: "Cancelled", value: "CANCELLED", count: orders.filter((o) => o.status === "CANCELLED").length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── 1. Header & Quick Actions ─── */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-300 text-gray-950 flex items-center justify-center shadow-xs shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Order Fulfillment &amp; Logistics Dispatch
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                64 Districts Live
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Dispatch parcels with Steadfast/Pathao, manage customer deliveries, verify COD, and print package invoices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Order</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Interactive KPI Metrics Summary ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div
          onClick={() => setFilterStatus("ALL")}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-yellow-100 text-gray-700 group-hover:text-yellow-800 flex items-center justify-center transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">{orders.length}</span>
            <span className="text-[11px] text-gray-500 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            <span>Fulfilled:</span>
            <span className="text-emerald-700 font-bold">{deliveredCount} parcels</span>
          </div>
        </div>

        {/* Pending & Processing */}
        <div
          onClick={() => setFilterStatus("PROCESSING")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
            filterStatus === "PROCESSING" || filterStatus === "PENDING"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40"
              : "bg-white border-gray-200 shadow-2xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Need Packing
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 tracking-tight">{pendingCount}</span>
            <span className="text-[11px] text-amber-700 font-medium">Hub Queue</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100 text-[10px] text-amber-700">
            <span>Dhaka Fulfillment</span>
            <span className="font-bold underline">Filter &rarr;</span>
          </div>
        </div>

        {/* In-Transit (Shipped) */}
        <div
          onClick={() => setFilterStatus("SHIPPED")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
            filterStatus === "SHIPPED"
              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/40"
              : "bg-white border-gray-200 shadow-2xs hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              In-Transit (Couriers)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900 tracking-tight">{shippedCount}</span>
            <span className="text-[11px] text-blue-700 font-medium">On Way</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100 text-[10px] text-blue-700">
            <span>Steadfast / Pathao</span>
            <span className="font-bold underline">Filter &rarr;</span>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-mono">
              {formatPrice(totalRevenueBDT)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            <span>Verified Paid &amp; Delivered</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Filter, Search & Status Navigation ─── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (#ord-...), Customer Phone, Name, District, or Tracking ID..."
              className="w-full text-xs py-2.5 pl-9 pr-9 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Courier Selector Filter */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Couriers</option>
              {COURIER_OPTIONS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {statusOptions.map((opt) => {
            const isActive = filterStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-gray-950 text-white font-bold shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-yellow-400 text-gray-950 font-bold" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. Orders List Cards with Full Actions ─── */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isDhaka = order.deliveryZone === "INSIDE_DHAKA";
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-yellow-400 transition-all group"
              >
                {/* Card Top: Order ID, Date, Delivery Zone, Total & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-gray-100 gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(order.id, order.id)}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-gray-900 bg-gray-100 hover:bg-yellow-100 border border-gray-200 px-2.5 py-1 rounded-xl transition-colors"
                      title="Click to copy Order ID"
                    >
                      {copiedId === order.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-gray-400" />
                          <span>#{order.id}</span>
                        </>
                      )}
                    </button>

                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isDhaka
                          ? "bg-yellow-50 text-yellow-900 border-yellow-300"
                          : "bg-blue-50 text-blue-900 border-blue-200"
                      }`}
                    >
                      {isDhaka ? "Inside Dhaka (৳60)" : "Outside Dhaka (৳130)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-xl border border-gray-200">
                      {formatPrice(order.totalBDT)}
                    </span>

                    {/* Action Bar: Edit, Print Slip, Delete */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => openEdit(order)}
                        className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-yellow-400 hover:border-yellow-400 text-gray-700 hover:text-gray-950 transition-all shadow-2xs"
                        title="Edit Order Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPrintingOrder(order)}
                        className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-all shadow-2xs"
                        title="Print Dispatch Invoice / Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(order)}
                        className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-gray-400 hover:text-rose-600 transition-all shadow-2xs"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body: 3 Columns (Customer & Address, Products, Courier & Status) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                  {/* Col 1: Customer Info & Address (4 cols) */}
                  <div className="md:col-span-4 space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-4">
                    <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px] block">
                      Customer &amp; Dispatch Destination
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>

                    <div className="flex items-center gap-2 font-mono text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-yellow-600" />
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="hover:underline font-bold text-gray-900"
                      >
                        {order.customerPhone}
                      </a>
                      <button
                        onClick={() => handleCopy(order.customerPhone, `p-${order.id}`)}
                        className="p-0.5 text-gray-400 hover:text-gray-600"
                        title="Copy Phone"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <p className="text-gray-600 flex items-start gap-1.5 mt-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        {order.streetLine && `${order.streetLine}, `}
                        {order.thana && `${order.thana}, `}
                        <strong>{order.district}</strong>, {order.division}
                      </span>
                    </p>

                    {order.notes && (
                      <div className="mt-2 p-2 bg-yellow-50/70 border border-yellow-200/80 rounded-xl text-[11px] text-yellow-900 font-medium">
                        <strong>Dispatch Note:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Col 2: Ordered Items (4 cols) */}
                  <div className="md:col-span-4 space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px] block">
                        Package Contents ({order.items.length} items)
                      </span>
                      <PackageCheck className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1 divide-y divide-gray-50">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] pt-1.5 first:pt-0">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-gray-900 mr-1.5">{item.quantity}×</span>
                            <span className="text-gray-800 line-clamp-1">{item.productTitle}</span>
                            {item.variantTitle && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                ({item.variantTitle})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-gray-700 font-bold shrink-0">
                            {formatPrice(item.totalPriceBDT)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Delivery Fee:</span>
                      <span className="font-mono font-bold text-gray-700">
                        {formatPrice(order.shippingFeeBDT || 60)}
                      </span>
                    </div>
                  </div>

                  {/* Col 3: Courier & Status Management (4 cols) */}
                  <div className="md:col-span-4 space-y-2.5">
                    {/* Fulfillment Status Stepper */}
                    <div>
                      <label className="font-bold block mb-1 text-gray-700 text-[10px] uppercase tracking-wider">
                        Fulfillment Status
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="PENDING">⏳ PENDING (Awaiting Call Confirmation)</option>
                        <option value="PROCESSING">📦 PROCESSING (Packing in Dhaka Hub)</option>
                        <option value="SHIPPED">🚚 SHIPPED (Handed over to Courier)</option>
                        <option value="DELIVERED">✅ DELIVERED (Successfully Fulfilled)</option>
                        <option value="CANCELLED">❌ CANCELLED</option>
                      </select>
                    </div>

                    {/* Payment Status Stepper */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">
                          Payment Status
                        </label>
                        <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded-md">
                          {order.paymentGateway}
                        </span>
                      </div>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateOrderPaymentStatus(order.id, e.target.value as PaymentStatus)}
                        className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="PAID">✅ PAID (Money Verified / Online)</option>
                        <option value="PENDING">💵 PENDING (Collect Cash on Delivery)</option>
                        <option value="REFUNDED">🔄 REFUNDED</option>
                      </select>
                    </div>

                    {/* Courier Partner & Tracking */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-mono">
                      <span className="flex items-center gap-1 font-bold text-gray-900 font-sans">
                        <Truck className="w-3.5 h-3.5 text-yellow-600" />
                        <span>{order.courierName || "Steadfast"}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-800 text-[10px]">
                          {order.trackingId || "N/A"}
                        </span>
                        {order.trackingId && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.trackingId!, `t-${order.id}`)}
                            className="p-1 hover:text-gray-900"
                            title="Copy Tracking ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-2">
            <Truck className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-base font-bold text-gray-800">No orders found matching criteria</p>
            <p className="text-xs text-gray-500">
              Try adjusting the fulfillment status filter or search keyword.
            </p>
            <button
              onClick={() => {
                setFilterStatus("ALL");
                setCourierFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ─── 5. CREATE MANUAL ORDER MODAL ─── */}
      {/* ══════════════════════════════════════════════════════ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-gray-950 flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Create Manual Order / POS Walk-in</h3>
                  <p className="text-[11px] text-gray-500">
                    Book orders for phone calls, social media messages, or showroom walk-ins
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs space-y-4">
              {/* Section 1: Customer Details */}
              <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  1 — Customer Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createCustomerName}
                      onChange={(e) => setCreateCustomerName(e.target.value)}
                      placeholder="e.g. Nusrat Jahan"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={createCustomerPhone}
                      onChange={(e) => setCreateCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={createCustomerEmail}
                      onChange={(e) => setCreateCustomerEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Logistics Destination */}
              <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  2 — Delivery Location &amp; Courier Partner
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Division
                    </label>
                    <select
                      value={createDivision}
                      onChange={(e) => setCreateDivision(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    >
                      {BD_DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createDistrict}
                      onChange={(e) => setCreateDistrict(e.target.value)}
                      placeholder="Dhaka / Chittagong"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Thana / Area
                    </label>
                    <input
                      type="text"
                      value={createThana}
                      onChange={(e) => setCreateThana(e.target.value)}
                      placeholder="Dhanmondi / Mirpur"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={createCourier}
                      onChange={(e) => setCreateCourier(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    >
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Street Address / House &amp; Road
                  </label>
                  <input
                    type="text"
                    required
                    value={createAddress}
                    onChange={(e) => setCreateAddress(e.target.value)}
                    placeholder="House #12, Road #4, Sector #11"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Section 3: Select Products */}
              <div className="bg-amber-50/50 border border-amber-200/90 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider block">
                    3 — Add Products to Order ({selectedItems.length})
                  </span>
                  <span className="text-[10px] text-gray-500">Click to add items from live catalog</span>
                </div>

                {/* Product Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItemToCreate(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-yellow-400"
                >
                  <option value="">+ Add Product from Catalog...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} — {formatPrice(p.priceBDT)} ({p.stockQuantity} in stock)
                    </option>
                  ))}
                </select>

                {/* Selected Items List */}
                {selectedItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {selectedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate">{item.product.nameEn}</p>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {formatPrice(item.unitPrice)} each
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it
                                  )
                                );
                              }}
                              className="w-5 h-5 bg-white text-gray-800 font-bold rounded text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs px-2">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, quantity: it.quantity + 1 } : it
                                  )
                                );
                              }}
                              className="w-5 h-5 bg-white text-gray-800 font-bold rounded text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-mono font-bold text-xs text-gray-900 min-w-[65px] text-right">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Payment Gateway & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3 space-y-2">
                  <label className="block text-[10px] font-bold text-gray-700 uppercase">
                    Payment Gateway
                  </label>
                  <select
                    value={createPaymentGateway}
                    onChange={(e) => setCreatePaymentGateway(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                  >
                    <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
                    <option value="BKASH">bKash Payment</option>
                    <option value="NAGAD">Nagad Payment</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>

                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      Payment Verification Status
                    </label>
                    <select
                      value={createPaymentStatus}
                      onChange={(e) => setCreatePaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    >
                      <option value="PENDING">PENDING (Collect Cash upon delivery)</option>
                      <option value="PAID">PAID (Advance Received)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3 space-y-2">
                  <label className="block text-[10px] font-bold text-gray-700 uppercase">
                    Dispatch Note / Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={createNotes}
                    onChange={(e) => setCreateNotes(e.target.value)}
                    placeholder="Fragile saree package, deliver after 4 PM, call customer before arriving..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs resize-none"
                  />
                </div>
              </div>

              {/* Sticky Modal Footer with Calculation */}
              <div className="sticky bottom-0 -mx-4 -mb-5 sm:-mx-5 sm:-mb-5 mt-4 px-5 py-3 border-t border-gray-100 bg-white/95 backdrop-blur-xs flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-gray-500">Order Total: </span>
                  <span className="font-mono font-black text-sm text-gray-950">
                    {formatPrice(
                      selectedItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0) +
                        (createDistrict.toLowerCase().includes("dhaka") ? 60 : 130)
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-1.5">
                    (inc. ৳{createDistrict.toLowerCase().includes("dhaka") ? 60 : 130} delivery)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl font-bold text-xs shadow-sm"
                  >
                    Book &amp; Dispatch Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ─── 6. EDIT ORDER DETAILS MODAL ─── */}
      {/* ══════════════════════════════════════════════════════ */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-gray-950 flex items-center justify-center shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Edit Order Details #{editingOrder.id}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Update recipient details, courier partner, tracking number, and status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editCustomerPhone}
                    onChange={(e) => setEditCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Division
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                  >
                    {BD_DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Thana / Upazila
                  </label>
                  <input
                    type="text"
                    value={editThana}
                    onChange={(e) => setEditThana(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={editCourier}
                    onChange={(e) => setEditCourier(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                  >
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Courier Tracking ID
                  </label>
                  <input
                    type="text"
                    value={editTrackingId}
                    onChange={(e) => setEditTrackingId(e.target.value)}
                    placeholder="ST-102425"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Internal Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs resize-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl font-bold text-xs shadow-sm"
                >
                  Save Order Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ─── 7. DELETE CONFIRMATION MODAL ─── */}
      {/* ══════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Order Record?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete order{" "}
                <strong className="text-gray-900">#{deleteTarget.id}</strong> ({deleteTarget.customerName})?
                This will remove the shipment from history.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ─── 8. PRINT DISPATCH INVOICE / SLIP MODAL ─── */}
      {/* ══════════════════════════════════════════════════════ */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-gray-700" />
                <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Logistics Dispatch Slip &amp; Package Invoice
                </span>
              </div>
              <button
                onClick={() => setPrintingOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Slip Area */}
            <div className="flex-1 overflow-y-auto p-6 text-gray-900 font-sans space-y-4 text-xs">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b pb-4 border-gray-200">
                <div>
                  <h2 className="font-editorial text-xl font-black tracking-wider text-gray-900">
                    BENGAL CRAFT SHOP
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    Authentic Bangladeshi Heritage &amp; Handloom Hub
                  </p>
                  <p className="text-[10px] text-gray-500">Dhaka, Bangladesh · 01700-000000</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm bg-gray-100 px-2 py-1 rounded border border-gray-300">
                    #{printingOrder.id}
                  </span>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">
                    Date: {new Date(printingOrder.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              {/* Delivery & Courier Barcode Area */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div>
                  <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider block">
                    DELIVER TO:
                  </span>
                  <p className="font-bold text-sm text-gray-900">{printingOrder.customerName}</p>
                  <p className="font-mono font-bold text-gray-800">{printingOrder.customerPhone}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {printingOrder.streetLine && `${printingOrder.streetLine}, `}
                    {printingOrder.thana && `${printingOrder.thana}, `}
                    {printingOrder.district}, {printingOrder.division}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider block">
                    COURIER DISPATCH:
                  </span>
                  <p className="font-bold text-sm text-yellow-700">
                    {printingOrder.courierName || "Steadfast Courier"}
                  </p>
                  <p className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-gray-300 inline-block mt-1">
                    TRK: {printingOrder.trackingId || "PENDING"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 mt-1">
                    Zone: {printingOrder.deliveryZone === "INSIDE_DHAKA" ? "Inside Dhaka" : "Outside Dhaka"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {printingOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <p className="font-bold text-gray-900">{item.productTitle}</p>
                          {item.variantTitle && (
                            <span className="text-[10px] text-gray-500">Size: {item.variantTitle}</span>
                          )}
                        </td>
                        <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-2 text-right font-mono">{formatPrice(item.unitPriceBDT)}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {formatPrice(item.totalPriceBDT)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total & COD Amount */}
              <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">
                    PAYMENT TERMS:
                  </span>
                  <span className="font-bold text-xs text-gray-900">
                    {printingOrder.paymentGateway} ·{" "}
                    <span
                      className={
                        printingOrder.paymentStatus === "PAID"
                          ? "text-emerald-700 font-black"
                          : "text-amber-800 font-black"
                      }
                    >
                      {printingOrder.paymentStatus}
                    </span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">
                    {printingOrder.paymentStatus === "PAID" ? "TOTAL PAID:" : "CASH TO COLLECT (COD):"}
                  </span>
                  <span className="font-mono font-black text-base text-gray-950">
                    {formatPrice(printingOrder.totalBDT)}
                  </span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="text-center pt-2 border-t border-dashed border-gray-300">
                <div className="font-mono tracking-[0.3em] font-black text-sm text-gray-700">
                  |||||| | |||||||| |||| |||||||||| ||||
                </div>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                  Package ID: {printingOrder.id} · {printingOrder.trackingId}
                </p>
              </div>
            </div>

            {/* Print Trigger Button */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Dispatch Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
