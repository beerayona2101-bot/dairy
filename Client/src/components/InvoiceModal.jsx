import React, { useRef } from "react";
import { Dialog, Slide } from "@mui/material";
import { X, Printer, Download, FileText } from "lucide-react";
import api from "../services/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function InvoiceModal({ open, onClose, orderId }) {
  const iframeRef = useRef(null);
  const baseUrl = api.defaults.baseURL || "http://localhost:9000";
  const iframeSrc = orderId ? `${baseUrl}/pdf/generate-bill/${orderId}` : "";
  const downloadSrc = orderId ? `${baseUrl}/pdf/generate-bill/${orderId}?download=true` : "";

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

  if (!open || !orderId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          className: "!bg-slate-100 dark:!bg-slate-900 !m-0 !p-0 !max-w-full",
        },
        backdrop: {
          className: "!bg-black/60 !backdrop-blur-xs",
        },
      }}
    >
      {/* In-Page Modal Top Header Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2.5 sm:px-4 py-2 sticky top-0 z-50 flex items-center justify-between gap-1.5 sm:gap-2 shadow-xs whitespace-nowrap">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 whitespace-nowrap min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
            title="Close Invoice"
          >
            <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="whitespace-nowrap">Close</span>
          </button>

          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3 shrink-0 whitespace-nowrap">
            <FileText className="w-4 h-4 text-[#6C5CE7] shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
              <span className="hidden sm:inline">Tax Invoice View</span>
              <span className="inline sm:hidden">Invoice</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          {/* Print Button (Desktop Only) */}
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-extrabold text-xs transition shadow-xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Print Invoice</span>
          </button>

          {/* Download PDF Button */}
          <a
            href={downloadSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C5CE7] sm:bg-slate-100 dark:sm:bg-slate-700 hover:bg-[#5b4cc4] sm:hover:bg-slate-200 dark:sm:hover:bg-slate-600 text-white sm:text-slate-800 dark:sm:text-white font-extrabold text-xs transition border-0 sm:border sm:border-slate-200 dark:sm:border-slate-600 cursor-pointer active:scale-95 shrink-0 whitespace-nowrap shadow-xs sm:shadow-none"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white sm:text-emerald-600 dark:sm:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Download</span>
          </a>
        </div>
      </div>

      {/* Invoice Document Body View */}
      <div className="flex-1 w-full max-w-5xl mx-auto p-0 sm:p-3 h-[calc(100vh-56px)] flex flex-col">
        <div className="w-full flex-1 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-700 shadow-md bg-white">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={`Invoice-${orderId}`}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </Dialog>
  );
}
