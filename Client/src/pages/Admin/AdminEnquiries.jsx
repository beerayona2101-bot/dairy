import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import {
  Mail,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  Search,
  RefreshCw,
  X,
  Phone,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { fetchEnquiriesApi, replyEnquiryApi } from "../../services/enquiryService";

export default function AdminEnquiries() {
  const { enqueueSnackbar } = useSnackbar();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Reply Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [template, setTemplate] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetchEnquiriesApi();
      if (res?.success) {
        setEnquiries(res.enquiries || []);
      }
    } catch (err) {
      enqueueSnackbar("Failed to fetch customer enquiries.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleOpenReplyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setReplyMessage("");
    setTemplate("");
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedEnquiry(null);
    setReplyMessage("");
    setTemplate("");
  };

  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setTemplate(val);
    if (val === "received") {
      setReplyMessage(
        `Dear ${selectedEnquiry?.fullName || "Customer"},\n\nThank you for reaching out to Madhu Dairy & Daily Needs! We have received your message regarding: "${selectedEnquiry?.message || ""}". Our team is processing your request and will get back to you shortly.\n\nBest regards,\nMadhu Dairy Support Team`
      );
    } else if (val === "resolved") {
      setReplyMessage(
        `Dear ${selectedEnquiry?.fullName || "Customer"},\n\nWe are pleased to inform you that your query/inquiry has been resolved! If you have any further questions, feel free to reply directly to this mail or call us at +91 94906 44434.\n\nWarm regards,\nMadhu Dairy Admin`
      );
    } else if (val === "order_info") {
      setReplyMessage(
        `Dear ${selectedEnquiry?.fullName || "Customer"},\n\nRegarding your enquiry about our daily fresh milk & dairy subscriptions/orders: We guarantee 100% farm-fresh delivery every morning between 5:00 AM - 7:30 AM.\n\nPlease check your account profile or reply to this email for further details.\n\nBest regards,\nMadhu Dairy Management`
      );
    } else {
      setReplyMessage("");
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      enqueueSnackbar("Please enter a reply message.", { variant: "warning" });
      return;
    }

    try {
      setSendingReply(true);
      const res = await replyEnquiryApi({
        enquiryId: selectedEnquiry?._id,
        recipientEmail: selectedEnquiry?.email,
        recipientName: selectedEnquiry?.fullName,
        enquiryMessage: selectedEnquiry?.message,
        replyMessage,
      });

      if (res?.success) {
        enqueueSnackbar(
          `1-Click Email sent successfully to ${selectedEnquiry?.email} from beerayona143@gmail.com!`,
          { variant: "success" }
        );
        handleCloseReplyModal();
        loadEnquiries();
      } else {
        enqueueSnackbar(res?.message || "Failed to send email reply.", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "Error sending email via SMTP.",
        { variant: "error" }
      );
    } finally {
      setSendingReply(false);
    }
  };

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone?.includes(searchQuery) ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = enquiries.filter((e) => e.status === "Pending").length;
  const repliedCount = enquiries.filter((e) => e.status === "Replied").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase text-[#6C5CE7] tracking-wider">
            ADMIN MAIL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Mail className="w-7 h-7 text-[#6C5CE7]" />
            <span>Customer Enquiries & SMTP Mail</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
            Send 1-click emails to users from official admin mail (
            <code className="text-[#6C5CE7] font-bold">beerayona143@gmail.com</code>)
          </p>
        </div>

        <button
          onClick={loadEnquiries}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-gray-700 text-[#6C5CE7] dark:text-purple-300 rounded-full font-bold text-xs hover:bg-purple-100 transition cursor-pointer border border-purple-100 dark:border-gray-600"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Enquiries</span>
        </button>
      </div>

      {/* Summary KPI Cards - Clickable Interactive Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Enquiries */}
        <button
          type="button"
          onClick={() => setStatusFilter("All")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between relative overflow-hidden ${
            statusFilter === "All"
              ? "bg-purple-50/90 dark:bg-purple-950/40 border-[#6C5CE7] ring-2 ring-[#6C5CE7] shadow-md scale-[1.02]"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-300 hover:shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total Enquiries</p>
              {statusFilter === "All" && (
                <span className="text-[10px] font-black text-[#6C5CE7] bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-200">
                  ✓ Active View
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {enquiries.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#6C5CE7] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
        </button>

        {/* Card 2: Pending Reply */}
        <button
          type="button"
          onClick={() => setStatusFilter("Pending")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between relative overflow-hidden ${
            statusFilter === "Pending"
              ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500 shadow-md scale-[1.02]"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-amber-300 hover:shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Pending Reply</p>
              {statusFilter === "Pending" && (
                <span className="text-[10px] font-black text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                  ✓ Active View
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        {/* Card 3: Mail Replied */}
        <button
          type="button"
          onClick={() => setStatusFilter("Replied")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between relative overflow-hidden ${
            statusFilter === "Replied"
              ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-md scale-[1.02]"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-emerald-300 hover:shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Mail Replied</p>
              {statusFilter === "Replied" && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                  ✓ Active View
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {repliedCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Dynamic Header Badge */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <span>
            {statusFilter === "All" && "Showing All Customer Enquiries"}
            {statusFilter === "Pending" && "Showing Pending Customer Enquiries"}
            {statusFilter === "Replied" && "Showing Replied Customer Enquiries"}
          </span>
        </h2>
        <span className="text-xs font-extrabold text-[#6C5CE7] bg-purple-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-purple-200 dark:border-gray-700">
          {filteredEnquiries.length} Enquiries
        </span>
      </div>



      {/* Enquiries Grid / List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading enquiries...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-3xl border border-gray-100 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">No Enquiries Found</h3>
          <p className="text-xs text-gray-400 mt-1">There are no customer enquiries matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-200 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#6C5CE7]" />
                      <span>{enquiry.fullName}</span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        <a href={`mailto:${enquiry.email}`} className="hover:underline font-semibold">
                          {enquiry.email}
                        </a>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <a href={`tel:${enquiry.phone}`} className="hover:underline font-semibold">
                          {enquiry.phone}
                        </a>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      enquiry.status === "Replied"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {enquiry.status}
                  </span>
                </div>

                {/* Message Box */}
                <div className="bg-gray-50 dark:bg-gray-700/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  "{enquiry.message}"
                </div>

                {/* Previous Replies (if any) */}
                {enquiry.replies?.length > 0 && (
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">
                      Admin Email Reply History ({enquiry.replies.length}):
                    </p>
                    {enquiry.replies.map((rep, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-50/70 dark:bg-purple-950/30 p-2.5 rounded-lg text-xs text-purple-900 dark:text-purple-200 border border-purple-100 dark:border-purple-900"
                      >
                        <p className="font-semibold">{rep.replyMessage}</p>
                        <p className="text-[10px] text-purple-500 mt-1">
                          Sent by {rep.adminEmail} on {new Date(rep.repliedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 text-[11px] text-gray-400">
                <span>Received: {new Date(enquiry.createdAt).toLocaleString()}</span>

                <button
                  onClick={() => handleOpenReplyModal(enquiry)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white rounded-full font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>1-Click Email Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1-Click SMTP Email Reply Dialog */}
      <Dialog
        open={replyModalOpen}
        onClose={handleCloseReplyModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 1,
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#6C5CE7]" />
            <span className="font-black text-lg text-gray-900">
              Send 1-Click SMTP Email
            </span>
          </div>
          <button
            onClick={handleCloseReplyModal}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogTitle>

        <DialogContent dividers className="space-y-4">
          {/* Recipient Details Card */}
          <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
            <p>
              <strong>Recipient:</strong> {selectedEnquiry?.fullName} &lt;
              {selectedEnquiry?.email}&gt;
            </p>
            <p>
              <strong>From Mail ID (SMTP):</strong> beerayona143@gmail.com
            </p>
            {selectedEnquiry?.message && (
              <p className="text-purple-700 italic border-t border-purple-200 pt-1.5 mt-1">
                "Enquiry: {selectedEnquiry?.message}"
              </p>
            )}
          </div>

          {/* Quick Template Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Select Quick Reply Template (Optional)
            </label>
            <select
              value={template}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="">-- Custom Message / Write Your Own --</option>
              <option value="received">1. Enquiry Received & Processing</option>
              <option value="resolved">2. Query Resolved & Solved</option>
              <option value="order_info">3. Milk Delivery & Subscription Info</option>
            </select>
          </div>

          {/* Reply Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Email Message Body
            </label>
            <textarea
              rows="6"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your official email response here..."
              className="w-full p-3 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={handleCloseReplyModal} color="inherit" size="small">
            Cancel
          </Button>
          <button
            onClick={handleSendReply}
            disabled={sendingReply}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white rounded-full font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-60"
          >
            {sendingReply ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending via SMTP...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Email via SMTP →</span>
              </>
            )}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
