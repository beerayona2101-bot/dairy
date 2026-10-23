import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Sparkles,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import company from "../../data/company.json";
import logoLightMode from "../../assets/logoLightMode.png";

export default function RazorpayDemoModal({
  isOpen,
  totalAmount = 0,
  currentUser = null,
  deliveryAddress = null,
  onSuccess,
  onCancel,
}) {
  const [selectedTab, setSelectedTab] = useState("upi"); // 'upi' | 'card' | 'wallet' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("paytm");
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8824");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("721");
  const [cardHolder, setCardHolder] = useState(() => {
    return currentUser?.firstName || currentUser?.name || currentUser?.username || "Valued Customer";
  });

  // Processing Animation state: 'idle' | 'connecting' | 'authorizing' | 'success'
  const [paymentStep, setPaymentStep] = useState("idle");

  useEffect(() => {
    if (isOpen) {
      setPaymentStep("idle");
      setSelectedTab("upi");
      if (currentUser?.mobileNo) {
        setUpiId(`${currentUser.mobileNo}@okhdfcbank`);
      } else {
        setUpiId("naturalmilk@upi");
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleStartPayment = () => {
    setPaymentStep("connecting");

    setTimeout(() => {
      setPaymentStep("authorizing");
    }, 900);

    setTimeout(() => {
      setPaymentStep("success");
    }, 1900);

    setTimeout(() => {
      const generatedPayId = `pay_demo_${Date.now()}`;
      const generatedOrderId = `order_demo_${Date.now()}`;
      const generatedSignature = `mock_sig_${Date.now()}`;

      if (onSuccess) {
        onSuccess({
          paymentId: generatedPayId,
          orderId: generatedOrderId,
          signature: generatedSignature,
          paymentMethod: selectedTab,
        });
      }
    }, 2800);
  };

  const handleModalClose = () => {
    if (paymentStep !== "idle" && paymentStep !== "success") return;
    if (onCancel) onCancel();
  };

  const upiApps = [
    { id: "gpay", name: "Google Pay", color: "from-blue-500 to-emerald-500", icon: "GPay", badge: "Instant" },
    { id: "phonepe", name: "PhonePe", color: "from-purple-600 to-indigo-600", icon: "PhonePe", badge: "Popular" },
    { id: "paytm", name: "Paytm UPI", color: "from-sky-500 to-blue-600", icon: "Paytm", badge: "Fast" },
    { id: "bhim", name: "BHIM UPI", color: "from-orange-500 to-emerald-600", icon: "BHIM", badge: "Govt UPI" },
  ];

  const wallets = [
    { id: "paytm", name: "Paytm Wallet", desc: "Linked Wallet", balance: totalAmount + 450 },
    { id: "phonepe", name: "PhonePe Wallet", desc: "1-Tap Checkout", balance: totalAmount + 320 },
    { id: "mobikwik", name: "MobiKwik", desc: "SuperCash Enabled", balance: totalAmount + 200 },
    { id: "airtel", name: "Airtel Money", desc: "Airtel Payments Bank", balance: totalAmount + 150 },
  ];

  const banks = [
    { id: "hdfc", name: "HDFC Bank", short: "HDFC", code: "HDFC0001" },
    { id: "sbi", name: "State Bank of India", short: "SBI", code: "SBIN0001" },
    { id: "icici", name: "ICICI Bank", short: "ICICI", code: "ICIC0001" },
    { id: "axis", name: "Axis Bank", short: "AXIS", code: "UTIB0001" },
    { id: "kotak", name: "Kotak Mahindra Bank", short: "KOTAK", code: "KKBK0001" },
    { id: "pnb", name: "Punjab National Bank", short: "PNB", code: "PUNB0001" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md transition-all">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-[560px] bg-white dark:bg-[#0B132B] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]"
      >
        {/* Top Header: Razorpay Branded Deep Navy Bar */}
        <div className="bg-gradient-to-r from-[#0C2340] via-[#0A192F] to-[#0284C7] p-4 text-white relative flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={logoLightMode}
                alt="Natural Milk Dairy"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white leading-tight">
                  Natural Milk Dairy
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                  <ShieldCheck size={10} /> Verified
                </span>
              </div>
              <p className="text-[11px] text-sky-200/90 font-medium">
                Demo Online Gateway • <span className="font-bold text-amber-300">NO OTP REQUIRED</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-200/80 block">
                Amount
              </span>
              <span className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                ₹{Number(totalAmount).toLocaleString("en-IN")}
              </span>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              disabled={paymentStep === "connecting" || paymentStep === "authorizing"}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 flex items-center justify-center text-white transition cursor-pointer disabled:opacity-40"
              title="Cancel payment"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body / Payment Workflow */}
        <div className="flex-1 overflow-y-auto">
          {paymentStep === "idle" && (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Payment Methods Nav Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                {[
                  { id: "upi", label: "UPI / Apps", icon: Smartphone },
                  { id: "card", label: "Cards", icon: CreditCard },
                  { id: "wallet", label: "Wallets", icon: Wallet },
                  { id: "netbanking", label: "NetBanking", icon: Building2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#38BDF8] shadow-sm scale-102"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={16} className="mb-0.5" />
                      <span className="text-[10.5px] leading-tight font-black">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: UPI Options */}
              {selectedTab === "upi" && (
                <div className="space-y-3.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select a UPI App to pay instantly without OTP:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {upiApps.map((app) => {
                      const isChosen = selectedUpiApp === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isChosen
                              ? "border-[#0284C7] bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white ring-2 ring-[#0284C7]/20"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#0369A1] text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {app.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs">{app.name}</p>
                              <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold">
                                {app.badge}
                              </span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChosen ? "border-[#0284C7] bg-[#0284C7]" : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* UPI ID Input (Demo Pre-filled) */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Or pay using UPI ID / VPA
                    </label>
                    <div className="flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:border-[#0284C7]">
                      <Smartphone size={15} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white font-semibold"
                      />
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Cards Options */}
              {selectedTab === "card" && (
                <div className="space-y-3.5">
                  {/* Realistic Demo Card Visualizer */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0369A1] text-white shadow-lg space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black tracking-widest text-sky-300">DEMO PLATINUM CARD</span>
                      <span className="font-extrabold italic text-sm text-amber-300">VISA</span>
                    </div>
                    <div className="py-1">
                      <p className="font-mono text-base tracking-widest text-slate-200">{cardNumber}</p>
                    </div>
                    <div className="flex justify-between items-end text-[10.5px]">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Card Holder</p>
                        <p className="font-bold text-slate-100 uppercase">{cardHolder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 uppercase">Expires</p>
                        <p className="font-bold text-slate-100">{cardExpiry}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Expiry Date & CVV (No OTP)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white text-center"
                        />
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={3}
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Wallets Options */}
              {selectedTab === "wallet" && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select wallet for 1-click seamless checkout:
                  </p>
                  <div className="space-y-2">
                    {wallets.map((w) => {
                      const isChosen = selectedWallet === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWallet(w.id)}
                          className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            isChosen
                              ? "border-[#0284C7] bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white ring-2 ring-[#0284C7]/20"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Wallet size={18} className="text-[#0284C7]" />
                            <div>
                              <p className="font-extrabold text-xs">{w.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{w.desc}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block">
                              Bal: ₹{w.balance.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: Net Banking Options */}
              {selectedTab === "netbanking" && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select popular bank for instant demo approval:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {banks.map((b) => {
                      const isChosen = selectedBank === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isChosen
                              ? "border-[#0284C7] bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white ring-2 ring-[#0284C7]/20"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div>
                            <p className="font-black text-xs">{b.short}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                              {b.name}
                            </p>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isChosen ? "border-[#0284C7] bg-[#0284C7]" : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Highlight Box: No OTP Confirmation */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <span>Demo payment simulator enabled. Direct 1-click authorization without OTP.</span>
              </div>
            </div>
          )}

          {/* PROCESSING ANIMATION (Simulating Real Payment Gateway Flow) */}
          {paymentStep !== "idle" && (
            <div className="p-8 text-center space-y-5 flex flex-col items-center justify-center min-h-[300px]">
              {paymentStep === "connecting" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/40 border-4 border-[#0284C7] border-t-transparent animate-spin mx-auto flex items-center justify-center" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Connecting to Banking Gateway...
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Routing through secure 256-bit encrypted channel
                    </p>
                  </div>
                </div>
              )}

              {paymentStep === "authorizing" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-4 border-emerald-500 border-t-transparent animate-spin mx-auto flex items-center justify-center" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Authorizing Payment ₹{Number(totalAmount).toLocaleString("en-IN")}...
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                      Direct demo authorization (No OTP required)
                    </p>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={36} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Payment Approved!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Transaction ID: pay_demo_{Date.now().toString().slice(-8)}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        {paymentStep === "idle" && (
          <div className="p-4 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleModalClose}
              className="w-full sm:w-1/3 py-3 px-4 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-extrabold text-xs transition cursor-pointer text-center"
            >
              Cancel Payment
            </button>

            <button
              type="button"
              onClick={handleStartPayment}
              className="w-full sm:w-2/3 py-3 px-4 rounded-full bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#054593] hover:from-[#0369A1] hover:to-[#075985] text-white font-black text-xs sm:text-sm shadow-md shadow-sky-600/25 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Lock size={14} className="text-sky-200" />
              <span>Pay ₹{Number(totalAmount).toLocaleString("en-IN")} (No OTP)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
