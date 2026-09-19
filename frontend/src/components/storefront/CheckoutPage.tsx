import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { BANGLADESH_DIVISIONS, calculateShippingFee } from "../../data/bangladeshData";
import { PaymentMethod, DeliveryZone } from "../../types";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Smartphone, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  LogIn,
  UserPlus,
  Package
} from "lucide-react";

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotalBDT,
    appliedCoupon,
    createOrder,
    navigate,
    formatPrice,
    t,
    showToast,
    currentUser,
  } = useStore();

  // Form State — pre-fill from logged-in customer if available
  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");

  // ─── Auth Guard: Guest users cannot place orders ───────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {/* Cart items count badge */}
          {cart.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Package className="w-3.5 h-3.5" />
                <span>{cart.length} item{cart.length > 1 ? "s" : ""} waiting in your cart</span>
              </div>
            </div>
          )}

          {/* Main lock card */}
          <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-xl">
            {/* Top gradient banner */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#444444] px-8 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">
                {t("Login Required to Checkout", "চেকআউটের জন্য লগইন করুন")}
              </h1>
              <p className="text-xs text-white/60">
                {t(
                  "Secure your order and track it from your personal dashboard.",
                  "আপনার অর্ডার নিরাপদ করুন এবং ড্যাশবোর্ড থেকে ট্র্যাক করুন।"
                )}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-7 space-y-4">
              {/* Benefits list */}
              <div className="space-y-2.5 mb-6">
                {[
                  { icon: ShieldCheck, label: t("Order protected under your account", "আপনার অ্যাকাউন্টে সংরক্ষিত অর্ডার") },
                  { icon: Truck, label: t("Real-time delivery tracking", "রিয়েল-টাইম ডেলিভারি ট্র্যাকিং") },
                  { icon: Sparkles, label: t("Earn loyalty points on every order", "প্রতি অর্ডারে লয়্যালটি পয়েন্ট অর্জন করুন") },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-xs text-[#444444]">
                    <div className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <button
                id="checkout-login-btn"
                onClick={() => navigate("/login?redirect=/checkout")}
                className="w-full bg-[#1A1A1A] text-white text-sm font-bold py-3.5 rounded-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("Sign In to Your Account", "আপনার অ্যাকাউন্টে সাইন ইন করুন")}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[#E0E0E0]" />
                <span className="text-[11px] text-[#999999] shrink-0">or</span>
                <div className="flex-1 border-t border-[#E0E0E0]" />
              </div>

              <button
                id="checkout-register-btn"
                onClick={() => navigate("/register?redirect=/checkout")}
                className="w-full bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] text-sm font-bold py-3.5 rounded-lg hover:bg-[#F5F5F5] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t("Create New Account", "নতুন অ্যাকাউন্ট তৈরি করুন")}</span>
              </button>

              <p className="text-[11px] text-[#999999] text-center pt-1">
                {t("Your cart items are saved. They'll be here when you return.", "আপনার কার্টের পণ্যগুলো সংরক্ষিত আছে।")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Localized BD Cascade Geography State
  const [selectedDivision, setSelectedDivision] = useState("Dhaka");
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka City");
  const [selectedThana, setSelectedThana] = useState("");
  const [streetLine, setStreetLine] = useState("");
  
  // Payment Gateway
  const [paymentGateway, setPaymentGateway] = useState<PaymentMethod>("BKASH");
  const [bKashTrxId, setBkashTrxId] = useState("");
  const [nagadTrxId, setNagadTrxId] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Available districts based on selected division
  const currentDivisionObj = useMemo(() => {
    return BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision) || BANGLADESH_DIVISIONS[0];
  }, [selectedDivision]);

  // Available thanas based on selected district
  const currentDistrictObj = useMemo(() => {
    return currentDivisionObj.districts.find((dist) => dist.name === selectedDistrict) || currentDivisionObj.districts[0];
  }, [currentDivisionObj, selectedDistrict]);

  // Dynamic shipping calculation
  const shippingInfo = useMemo(() => {
    return calculateShippingFee(selectedDivision, selectedDistrict);
  }, [selectedDivision, selectedDistrict]);

  // Pricing calculations
  let discountAmountBDT = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmountBDT = Math.round((cartSubtotalBDT * appliedCoupon.value) / 100);
    } else {
      discountAmountBDT = appliedCoupon.value;
    }
  }

  const subtotalAfterDiscount = Math.max(0, cartSubtotalBDT - discountAmountBDT);
  const finalTotalBDT = subtotalAfterDiscount + shippingInfo.fee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast(t("Your shopping cart is empty", "আপনার কার্ট খালি"), "error");
      navigate("/shop");
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 11) {
      showToast(t("Please enter a valid 11-digit Bangladeshi mobile number", "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন"), "error");
      return;
    }

    if (!streetLine.trim()) {
      showToast(t("Please specify your delivery address details", "সম্পূর্ণ ঠিকানা লিখুন"), "error");
      return;
    }

    if (paymentGateway === "BKASH" && !bKashTrxId.trim()) {
      showToast(t("Please enter your bKash Transaction ID (TrxID)", "বিকাশ ট্রানজেকশন আইডি দিন"), "error");
      return;
    }

    if (paymentGateway === "NAGAD" && !nagadTrxId.trim()) {
      showToast(t("Please enter your Nagad Transaction ID (TrxID)", "নগদ ট্রানজেকশন আইডি দিন"), "error");
      return;
    }

    setIsProcessingOrder(true);

    setTimeout(() => {
      const orderItems = cart.map((item) => {
        const unitPrice = item.product.priceBDT + (item.variant?.priceAdjustmentBDT || 0);
        return {
          productId: item.product.id,
          productTitle: item.product.nameEn,
          variantTitle: item.variant?.title,
          unitPriceBDT: unitPrice,
          quantity: item.quantity,
          totalPriceBDT: unitPrice * item.quantity,
          image: item.product.images[0],
        };
      });

      const newOrder = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || currentUser?.email || undefined,
        division: selectedDivision,
        district: selectedDistrict,
        thana: selectedThana,
        streetLine: streetLine.trim(),
        deliveryZone: shippingInfo.zone,
        shippingFeeBDT: shippingInfo.fee,
        subtotalBDT: cartSubtotalBDT,
        discountBDT: discountAmountBDT,
        vatTaxBDT: 0,
        totalBDT: finalTotalBDT,
        couponCode: appliedCoupon?.code,
        status: "PENDING",
        paymentGateway,
        paymentStatus: paymentGateway === "CASH_ON_DELIVERY" ? "PENDING" : "PAID",
        transactionId: paymentGateway === "BKASH" ? bKashTrxId : paymentGateway === "NAGAD" ? nagadTrxId : `SSL-${Date.now()}`,
        courierName: shippingInfo.zone === "INSIDE_DHAKA" ? "Pathao Express" : "Steadfast Courier",
        trackingId: `BD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: orderItems,
      });

      setIsProcessingOrder(false);
      navigate(`/order-success/${newOrder.id}`);
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="border-b border-[#E0E0E0] pb-4 mb-8">
        <h1 className="font-editorial text-3xl font-bold text-[#1A1A1A]">
          {t("Express Bangladeshi Checkout", "দ্রুত চেকআউট")}
        </h1>
        <p className="text-xs text-[#555555] mt-1">
          {t("Phone-number verified instant order for all 64 districts", "সারাদেশের ৬৪ জেলায় দ্রুত হোম ডেলিভারি")}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Customer & Delivery Address Cascade */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Phone & Contact Information */}
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
                  {t("Customer Contact Details", "গ্রাহকের যোগাযোগের তথ্য")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                    {t("Mobile Number (BD)", "মোবাইল নম্বর (১১ ডিজিট)")} *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full text-xs p-2.5 pl-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded font-mono focus:outline-none focus:border-[#1A1A1A]"
                    />
                    <Phone className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-3" />
                  </div>
                  <span className="text-[10px] text-[#777777] mt-0.5 block">
                    Used for courier delivery SMS and OTP verification.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                    {t("Full Name", "আপনার নাম")} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tanvir Hossain"
                      className="w-full text-xs p-2.5 pl-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                    />
                    <User className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-3" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                    {t("Email Address (For PDF Invoice copy)", "ইমেইল অ্যাড্রেস")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tanvir@example.com"
                      className="w-full text-xs p-2.5 pl-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                    />
                    <Mail className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Cascading Bangladeshi Geographic Delivery Address */}
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
                  {t("Shipping Destination & Zone", "ডেলিভারি ঠিকানা ও জোন")}
                </h2>
              </div>

              {/* Division / District / Thana 3-Tier Cascader */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Division */}
                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                    {t("Division (বিভাগ)", "বিভাগ")} *
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      setSelectedDivision(newDiv);
                      const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === newDiv);
                      if (divObj && divObj.districts.length > 0) {
                        setSelectedDistrict(divObj.districts[0].name);
                        setSelectedThana(divObj.districts[0].thanas[0] || "");
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                  >
                    {BANGLADESH_DIVISIONS.map((div) => (
                      <option key={div.id} value={div.name}>
                        {div.name} ({div.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                    {t("District (জেলা)", "জেলা")} *
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setSelectedDistrict(newDist);
                      const distObj = currentDivisionObj.districts.find((d) => d.name === newDist);
                      if (distObj && distObj.thanas.length > 0) {
                        setSelectedThana(distObj.thanas[0]);
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                  >
                    {currentDivisionObj.districts.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name} ({dist.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thana / Upazila */}
                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                    {t("Thana / Area (থানা)", "থানা")} *
                  </label>
                  <select
                    value={selectedThana}
                    onChange={(e) => setSelectedThana(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                  >
                    {currentDistrictObj.thanas.map((thana) => (
                      <option key={thana} value={thana}>
                        {thana}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Full Street Line / House / Road */}
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                  {t("House / Road / Street Details", "বাড়ি, রোড ও এলাকার বিস্তারিত")} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={streetLine}
                    onChange={(e) => setStreetLine(e.target.value)}
                    placeholder="e.g. House 14, Road 7, Block B, Nikunja 2"
                    className="w-full text-xs p-2.5 pl-8 bg-[#F5F5F5] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <MapPin className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-3" />
                </div>
              </div>

              {/* Dynamic Shipping Fee Banner based on Selection */}
              <div className="p-3.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1A1A1A]" />
                  <div>
                    <span className="font-bold text-[#1A1A1A]">
                      {shippingInfo.zone === "INSIDE_DHAKA" 
                        ? t("Inside Dhaka Zone Rate", "ঢাকা সিটি ডেলিভারি রেট")
                        : t("Outside Dhaka Nationwide Rate", "ঢাকার বাইরে সারা দেশ রেট")}
                    </span>
                    <span className="text-[#555555] block text-[11px]">
                      Estimate: {shippingInfo.deliveryEstimateEn}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                  {formatPrice(shippingInfo.fee)}
                </span>
              </div>
            </div>

            {/* Step 3: Localized Bangladeshi Payment Gateways */}
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
                  {t("Payment Method", "পেমেন্ট মাধ্যম")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* bKash */}
                <label className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentGateway === "BKASH" ? "border-[#E2136E] bg-pink-50/40 ring-1 ring-[#E2136E]" : "border-[#E0E0E0] hover:border-[#1A1A1A]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentGateway === "BKASH"}
                        onChange={() => setPaymentGateway("BKASH")}
                        className="accent-[#E2136E]"
                      />
                      <span className="font-bold text-xs text-[#1A1A1A]">bKash Payment</span>
                    </div>
                    <span className="bg-[#E2136E] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      bKash
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555]">
                    Pay instantly via bKash App or *247# USSD to our merchant number.
                  </p>
                </label>

                {/* Nagad */}
                <label className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentGateway === "NAGAD" ? "border-[#F7941D] bg-orange-50/40 ring-1 ring-[#F7941D]" : "border-[#E0E0E0] hover:border-[#1A1A1A]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentGateway === "NAGAD"}
                        onChange={() => setPaymentGateway("NAGAD")}
                        className="accent-[#F7941D]"
                      />
                      <span className="font-bold text-xs text-[#1A1A1A]">Nagad Payment</span>
                    </div>
                    <span className="bg-[#F7941D] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Nagad
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555]">
                    Fast payment via Nagad App or *167# USSD menu.
                  </p>
                </label>

                {/* Cash on Delivery (COD) */}
                <label className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentGateway === "CASH_ON_DELIVERY" ? "border-[#1A1A1A] bg-[#F5F5F5] ring-1 ring-[#1A1A1A]" : "border-[#E0E0E0] hover:border-[#1A1A1A]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentGateway === "CASH_ON_DELIVERY"}
                        onChange={() => setPaymentGateway("CASH_ON_DELIVERY")}
                        className="accent-[#1A1A1A]"
                      />
                      <span className="font-bold text-xs text-[#1A1A1A]">Cash on Delivery (COD)</span>
                    </div>
                    <span className="bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      COD
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555]">
                    Pay in cash directly to the Pathao / Steadfast courier when receiving package.
                  </p>
                </label>

                {/* SSLCommerz (Card / Internet Banking) */}
                <label className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                  paymentGateway === "SSLCOMMERZ" ? "border-[#005B94] bg-blue-50/40 ring-1 ring-[#005B94]" : "border-[#E0E0E0] hover:border-[#1A1A1A]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentGateway === "SSLCOMMERZ"}
                        onChange={() => setPaymentGateway("SSLCOMMERZ")}
                        className="accent-[#005B94]"
                      />
                      <span className="font-bold text-xs text-[#1A1A1A]">SSLCommerz</span>
                    </div>
                    <span className="bg-[#005B94] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Cards / NetBanking
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555]">
                    VISA, MasterCard, DBBL Nexus, City Bank Amex, and Internet Banking.
                  </p>
                </label>
              </div>

              {/* bKash Transaction ID prompt */}
              {paymentGateway === "BKASH" && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg space-y-2 text-xs">
                  <p className="font-semibold text-[#E2136E]">
                    bKash Merchant Number: <span className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-pink-300">01711-223344</span> (Make Payment)
                  </p>
                  <p className="text-[#555555] text-[11px]">
                    1. Go to your bKash App & select "Make Payment" • 2. Enter Merchant Number 01711223344 • 3. Enter amount: <strong className="text-[#1A1A1A]">{formatPrice(finalTotalBDT)}</strong> • 4. Put reference "BD-SHOP" • 5. Copy the TrxID below:
                  </p>
                  <input
                    type="text"
                    required
                    value={bKashTrxId}
                    onChange={(e) => setBkashTrxId(e.target.value)}
                    placeholder="Enter 10-character bKash TrxID (e.g. BKH928172X)"
                    className="w-full text-xs p-2.5 bg-white border border-pink-300 rounded font-mono uppercase focus:outline-none focus:border-[#E2136E]"
                  />
                </div>
              )}

              {/* Nagad Transaction ID prompt */}
              {paymentGateway === "NAGAD" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2 text-xs">
                  <p className="font-semibold text-[#F7941D]">
                    Nagad Merchant Number: <span className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-orange-300">01811-334455</span>
                  </p>
                  <input
                    type="text"
                    required
                    value={nagadTrxId}
                    onChange={(e) => setNagadTrxId(e.target.value)}
                    placeholder="Enter Nagad TrxID (e.g. NGD7645129Z)"
                    className="w-full text-xs p-2.5 bg-white border border-orange-300 rounded font-mono uppercase focus:outline-none focus:border-[#F7941D]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Review & Place Order Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-6 space-y-5 sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                {t("Items in This Order", "অর্ডারের পণ্যসমূহ")} ({cart.length})
              </h3>

              {/* Compact Cart Items */}
              <div className="max-h-60 overflow-y-auto divide-y divide-[#E0E0E0] pr-1">
                {cart.map((item) => {
                  const unitPrice = item.product.priceBDT + (item.variant?.priceAdjustmentBDT || 0);
                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.nameEn}
                          className="w-12 h-14 object-cover rounded border border-[#E0E0E0]"
                        />
                        <div>
                          <p className="font-semibold text-[#1A1A1A] line-clamp-1">
                            {t(item.product.nameEn, item.product.nameBn)}
                          </p>
                          <p className="text-[11px] text-[#555555]">
                            Qty: {item.quantity} {item.variant ? `• ${item.variant.title}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-medium text-[#1A1A1A]">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Cost Summary Table */}
              <div className="pt-3 border-t border-[#E0E0E0] space-y-2 text-xs text-[#555555]">
                <div className="flex justify-between">
                  <span>{t("Subtotal", "সাবটোটাল")}</span>
                  <span className="font-mono text-[#1A1A1A]">{formatPrice(cartSubtotalBDT)}</span>
                </div>
                {discountAmountBDT > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>{t("Voucher Discount", "ভাউচার ডিসকাউন্ট")}</span>
                    <span className="font-mono">-{formatPrice(discountAmountBDT)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    {t("Shipping Fee", "ডেলিভারি চার্জ")} ({shippingInfo.zone === "INSIDE_DHAKA" ? "Inside Dhaka" : "Outside Dhaka"})
                  </span>
                  <span className="font-mono font-semibold text-[#1A1A1A]">
                    {formatPrice(shippingInfo.fee)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E0E0E0] flex justify-between text-base font-bold text-[#1A1A1A]">
                  <span>{t("Total Amount", "সর্বমোট প্রদেয়")}</span>
                  <span className="font-sans text-lg">{formatPrice(finalTotalBDT)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessingOrder}
                className="w-full bg-[#1A1A1A] text-white text-xs font-bold py-4 px-4 rounded hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isProcessingOrder ? (
                  <span>{t("Securing Order in Dhaka Hub...", "অর্ডার নিশ্চিত করা হচ্ছে...")}</span>
                ) : (
                  <>
                    <span>{t("Confirm & Place Order", "অর্ডার নিশ্চিত করুন")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-[#777777] text-center space-y-1">
                <p>🔒 256-Bit SSL Encrypted Bangladeshi Gateway</p>
                <p>Cash on Delivery: Inspect package before courier release.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
