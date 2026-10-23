import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download, FileText, RefreshCw, Loader2 } from "lucide-react";
import api, { getBaseUrl } from "../services/api";
import BackButton from "../components/Common/BackButton";
import { downloadInvoicePdf } from "../utils/downloadInvoice";

export default function InvoiceViewPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const baseUrl = api.defaults.baseURL || getBaseUrl();
  const iframeSrc = `${baseUrl}/pdf/generate-bill/${orderId}`;

  const handleDownload = async () => {
    if (!orderId || downloading) return;
    try {
      setDownloading(true);
      await downloadInvoicePdf(orderId);
    } catch (e) {
      console.error("Invoice download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Top Header Bar (Fixed & Branded) */}
      <header className="no-print bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <BackButton fallbackPath="/user-profile/orders" />

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
            <FileText className="w-4 h-4 text-[#075C2A]" />
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              Official Tax Invoice
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#075C2A] hover:bg-[#054593] text-white font-extrabold text-xs transition shadow-sm cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-extrabold text-xs transition border border-slate-200 dark:border-slate-600 cursor-pointer active:scale-95 disabled:opacity-60"
            title="Download Invoice as PDF"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="hidden sm:inline">{downloading ? "Downloading..." : "Download PDF"}</span>
            <span className="inline sm:hidden">{downloading ? "..." : "PDF"}</span>
          </button>
        </div>
      </header>

      {/* Main Invoice Document Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-6 flex flex-col">
        {loading && (
          <div className="flex items-center justify-center p-8 text-xs font-bold text-slate-500 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#075C2A]" />
            <span>Loading invoice document...</span>
          </div>
        )}

        <div className="w-full flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-white min-h-[80vh]">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={`Invoice-${orderId}`}
            onLoad={() => setLoading(false)}
            className="w-full h-full min-h-[80vh] border-0"
          />
        </div>
      </main>
    </div>
  );
}
