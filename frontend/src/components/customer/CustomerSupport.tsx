import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Headphones,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";

interface FAQItem {
  q: string;
  qBn: string;
  a: string;
  aBn: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How do I return a saree, panjabi, or craft item?",
    qBn: "শাড়ি, পাঞ্জাবি বা ক্রাফট আইটেম কীভাবে রিটার্ন করব?",
    a: "You can request a return within 7 days of delivery. Items must be unwashed, unworn, and with original tags intact. We will arrange a free courier pickup from your address.",
    aBn: "ডেলিভারির ৭ দিনের মধ্যে রিটার্ন রিকোয়েস্ট করতে পারেন। পণ্য অবশ্যই অব্যবহৃত ও আসল ট্যাগসহ থাকতে হবে। আমরা ফ্রি কুরিয়ার পিকআপের ব্যবস্থা করব।",
  },
  {
    q: "How long does courier delivery take across Bangladesh?",
    qBn: "সারা বাংলাদেশে ডেলিভারি পেতে কত দিন সময় লাগে?",
    a: "Inside Dhaka City: 24 to 48 hours. Outside Dhaka & divisional districts: 3 to 5 business days via Pathao and Steadfast Express.",
    aBn: "ঢাকা সিটির ভেতরে: ২৪ থেকে ৪৮ ঘণ্টা। ঢাকার বাইরে জেলাসমূহে: ৩ থেকে ৫ কার্যদিবস (পাঠাও ও স্টেডফাস্ট কুরিয়ারের মাধ্যমে)।",
  },
  {
    q: "How are refunds processed for bKash, Nagad, or Card payments?",
    qBn: "বিকাশ, নগদ বা কার্ড পেমেন্টের রিফান্ড কীভাবে পাওয়া যায়?",
    a: "Once we inspect your returned item, refunds to bKash or Nagad are completed within 24 to 72 hours. Card refunds reflect in 3 to 7 business days.",
    aBn: "পণ্য রিসিভ ও যাচাইয়ের পর বিকাশ বা নগদে ২৪-৭২ ঘণ্টার মধ্যে রিফান্ড পৌঁছে যায়। কার্ডে রিফান্ড হতে ৩-৭ কার্যদিবস লাগতে পারে।",
  },
  {
    q: "Can I exchange for a different size or color?",
    qBn: "সাইজ বা রঙ পরিবর্তন (Exchange) করা যাবে কি?",
    a: "Yes! Exchanges are completely free of charge for sizing issues within 7 days. Submit a ticket below or WhatsApp our support team directly.",
    aBn: "হ্যাঁ! ৭ দিনের মধ্যে সাইজ সংক্রান্ত কারণে এক্সচেঞ্জ সম্পূর্ণ ফ্রি। নিচে মেসেজ দিন বা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।",
  },
];

export const CustomerSupport: React.FC = () => {
  const { currentUser, orders, t } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketOrder, setTicketOrder] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!currentUser) return null;

  const myOrders = orders.filter((o) => o.customerPhone === currentUser.phone);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmitted(true);
    setTimeout(() => {
      setTicketSubject("");
      setTicketOrder("");
      setTicketMessage("");
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          {t("Help & Support", "সহায়তা ও সাপোর্ট")}
        </h2>
        <p className="text-sm text-[#777777] mt-0.5">
          {t(
            "We are here to assist with orders, returns, tracking, and handloom care",
            "অর্ডার, রিটার্ন, ট্র্যাকিং এবং পণ্য সংক্রান্ত যেকোনো সহায়তায় আমরা আছি"
          )}
        </p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hotline */}
        <a
          href="tel:+8809612000000"
          className="bg-white border border-[#E0E0E0] rounded-2xl p-5 hover:border-[#1A1A1A] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#777777] uppercase tracking-wider font-semibold">
                {t("Call Center", "কল সেন্টার")}
              </div>
              <div className="text-sm font-bold text-[#1A1A1A]">+880 9612-000000</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#888888]">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>9:00 AM – 10:00 PM (Daily)</span>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/8801711223344"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-[#E0E0E0] rounded-2xl p-5 hover:border-emerald-600 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#777777] uppercase tracking-wider font-semibold">
                {t("WhatsApp Live", "হোয়াটসঅ্যাপ")}
              </div>
              <div className="text-sm font-bold text-[#1A1A1A]">+880 1711-223344</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("Instant Response", "দ্রুত উত্তর পাবেন")}</span>
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:support@bengaledition.com"
          className="bg-white border border-[#E0E0E0] rounded-2xl p-5 hover:border-[#1A1A1A] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#777777] uppercase tracking-wider font-semibold">
                {t("Email Support", "ইমেইল")}
              </div>
              <div className="text-sm font-bold text-[#1A1A1A] truncate">support@bengaledition.com</div>
            </div>
          </div>
          <div className="text-[11px] text-[#888888]">
            <span>{t("Replies within 4 hours", "৪ ঘণ্টার মধ্যে রিপ্লাই")}</span>
          </div>
        </a>
      </div>

      {/* Return & Guarantee Policy Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              {t("7-Day Return & Authentic Handloom Guarantee", "৭ দিনের রিটার্ন ও খাঁটি হ্যান্ডলুমের নিশ্চয়তা")}
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5 max-w-xl">
              {t(
                "Not satisfied with the weave, texture, or fit? Request a doorstep exchange or 100% money back refund with no questions asked.",
                "বয়ন বা ফিটিংয়ে কোনো সমস্যা হলে ৭ দিনের মধ্যে সহজে রিটার্ন বা ১০০% মানি-ব্যাক সুবিধা নিন।"
              )}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-amber-300 text-xs font-semibold text-amber-900 flex-shrink-0">
          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
          <span>{t("Hassle-Free", "সহজ রিটার্ন")}</span>
        </div>
      </div>

      {/* Two Column: Ticket Submission & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Support Ticket Form */}
        <div className="lg:col-span-6 bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-5 h-5 text-[#1A1A1A]" />
            <h3 className="text-base font-bold text-[#1A1A1A]">
              {t("Send Us a Message", "মেসেজ পাঠান")}
            </h3>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <div className="text-sm font-bold text-green-900">
                {t("Inquiry Received!", "আপনার বার্তা পৌঁছেছে!")}
              </div>
              <p className="text-xs text-green-700">
                {t(
                  "Our customer concierge team will respond to your registered phone & email shortly.",
                  "আমাদের কাস্টমার কেয়ার টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।"
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#555555] mb-1">
                  {t("Issue Type / Subject", "বিষয়ের ধরন")} *
                </label>
                <select
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E0E0E0] focus:border-[#1A1A1A] focus:outline-none bg-white"
                >
                  <option value="">{t("Select an issue type...", "নির্বাচন করুন...")}</option>
                  <option value="Return / Refund Request">{t("Return / Refund Request", "রিটার্ন বা রিফান্ড সংক্রান্ত")}</option>
                  <option value="Delivery Delay / Courier Status">{t("Delivery Delay / Courier Status", "ডেলিভারি বিলম্ব বা কুরিয়ার আপডেট")}</option>
                  <option value="Defective or Wrong Product Received">{t("Defective / Wrong Product Received", "ত্রুটিযুক্ত বা ভুল পণ্য প্রাপ্তি")}</option>
                  <option value="Payment / bKash Verification">{t("Payment / bKash Verification", "পেমেন্ট বা বিকাশ ভেরিফিকেশন")}</option>
                  <option value="General Question">{t("General Question", "সাধারণ জিজ্ঞাসা")}</option>
                </select>
              </div>

              {myOrders.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    {t("Related Order (Optional)", "সম্পর্কিত অর্ডার (ঐচ্ছিক)")}
                  </label>
                  <select
                    value={ticketOrder}
                    onChange={(e) => setTicketOrder(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E0E0E0] focus:border-[#1A1A1A] focus:outline-none bg-white font-mono"
                  >
                    <option value="">{t("None / General question", "কোনোটি নয়")}</option>
                    {myOrders.map((o) => (
                      <option key={o.id} value={o.orderNumber}>
                        {o.orderNumber} ({o.status} - ৳{o.totalBDT.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#555555] mb-1">
                  {t("Message Details", "বিস্তারিত বার্তা")} *
                </label>
                <textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  placeholder={t(
                    "Please describe the issue or questions with as much detail as possible...",
                    "আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন..."
                  )}
                  className="w-full text-xs p-3 rounded-lg border border-[#E0E0E0] focus:border-[#1A1A1A] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-black transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t("Submit Inquiry", "ইনকোয়ারি পাঠান")}</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[#1A1A1A]" />
            <h3 className="text-base font-bold text-[#1A1A1A]">
              {t("Frequently Asked Questions", "সাধারণ প্রশ্নোত্তর")}
            </h3>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {t(faq.q, faq.qBn)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#777777] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#777777] flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-[#666666] leading-relaxed border-t border-[#F5F5F5] bg-gray-50/30">
                      {t(faq.a, faq.aBn)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
