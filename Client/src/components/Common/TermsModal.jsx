import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import company from "../../data/company.json";

export default function TermsModal({ isOpen, onClose, onAccept, initialTab = "terms" }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const companyName = company?.name || "Natural Milk Dairy";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1E88E5]/10 border border-[#1E88E5]/20 flex items-center justify-center text-[#1E88E5]">
                {activeTab === "terms" ? <FileText className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {companyName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-2 bg-white dark:bg-[#1E293B] gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "terms"
                  ? "border-[#075C2A] text-[#075C2A] dark:text-[#3F9E18] dark:border-[#3F9E18]"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "privacy"
                  ? "border-[#075C2A] text-[#075C2A] dark:text-[#3F9E18] dark:border-[#3F9E18]"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {activeTab === "terms" ? (
              <>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    1. Account Registration &amp; Accuracy
                  </h4>
                  <p>
                    By registering an account with {companyName}, you agree to provide truthful, accurate, and complete information. You are responsible for maintaining the confidentiality of your login credentials.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    2. Dairy Product Quality &amp; Deliveries
                  </h4>
                  <p>
                    Our milk, curd, paneer, and other dairy items are farm-fresh with zero adulteration. Morning and evening deliveries are made based on your selected delivery slots and active subscriptions.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    3. Orders, Pricing &amp; Payments
                  </h4>
                  <p>
                    All product prices are quoted in Indian Rupees (INR) inclusive of applicable taxes. Payments may be made via digital methods or cash upon delivery where supported.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    4. Cancellations &amp; Modifications
                  </h4>
                  <p>
                    Daily delivery changes or pauses can be managed directly through your account dashboard before the cutoff time (typically 8:00 PM for next-morning deliveries).
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    1. Information We Collect
                  </h4>
                  <p>
                    We collect your name, delivery address, phone number, and email address solely to fulfill your dairy orders and communicate delivery notifications.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    2. Data Security &amp; Protection
                  </h4>
                  <p>
                    Your personal information is encrypted in transit and securely stored. We never sell, rent, or trade your personal data to third parties.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    3. Location &amp; Geocoding
                  </h4>
                  <p>
                    GPS and map coordinates are utilized exclusively to ensure precise doorstep delivery of fresh milk and dairy products.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#075C2A] to-[#054593] hover:from-[#5B4BC4] hover:to-[#4D44DB] rounded-xl shadow-md shadow-indigo-500/25 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I Agree &amp; Accept</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
