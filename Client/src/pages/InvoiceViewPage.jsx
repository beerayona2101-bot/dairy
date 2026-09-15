import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download, FileText, RefreshCw } from "lucide-react";
import api from "../services/api";
import BackButton from "../components/Common/BackButton";

export default function InvoiceViewPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = api.defaults.baseURL || "http://localhost:9000";
  const iframeSrc = `${baseUrl}/pdf/generate-bill/${orderId}`;
  const downloadSrc = `${baseUrl}/pdf/generate-bill/${orderId}?download=true`;

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
            <FileText className="w-4 h-4 text-[#6C5CE7]" />
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-extrabold text-xs transition shadow-sm cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          {/* Download PDF Button */}
          <a
            href={downloadSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-extrabold text-xs transition border border-slate-200 dark:border-slate-600 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Download PDF</span>
          </a>
        </div>
      </header>

      {/* Main Invoice Document Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-6 flex flex-col">
        {loading && (
          <div className="flex items-center justify-center p-8 text-xs font-bold text-slate-500 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#6C5CE7]" />
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
