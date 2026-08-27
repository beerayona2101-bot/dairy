import React, { useState } from "react";
import { LocationOn, Phone, Email } from "@mui/icons-material";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import company from "../data/company.json";
import { submitEnquiryApi } from "../services/enquiryService";

export default function ContactPage() {

    const { enqueueSnackbar } = useSnackbar();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        message: "",
    });

    const fixEmailTypo = (emailStr) => {
        if (!emailStr) return "";
        let cleaned = emailStr.trim().toLowerCase();
        cleaned = cleaned.replace(/@gmailcom$/i, "@gmail.com");
        cleaned = cleaned.replace(/@yahoocom$/i, "@yahoo.com");
        cleaned = cleaned.replace(/@hotmailcom$/i, "@hotmail.com");
        cleaned = cleaned.replace(/@outlookcom$/i, "@outlook.com");
        cleaned = cleaned.replace(/@icloudcom$/i, "@icloud.com");
        cleaned = cleaned.replace(/@gmailin$/i, "@gmail.in");
        cleaned = cleaned.replace(/@yahooin$/i, "@yahoo.in");
        return cleaned;
    };

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { fullName, phone, email, message } = formData;
        if (!fullName.trim()) {
            enqueueSnackbar("Please enter your full name.", { variant: "error" });
            return;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.trim())) {
            enqueueSnackbar("Please enter a valid 10-digit mobile number.", { variant: "error" });
            return;
        }

        const cleanedEmail = fixEmailTypo(email);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanedEmail)) {
            enqueueSnackbar("Please enter a valid email address with domain extension (e.g. name@gmail.com).", { variant: "error" });
            return;
        }

        if (!message.trim()) {
            enqueueSnackbar("Please enter your message.", { variant: "error" });
            return;
        }

        // Auto-apply corrected email format if user had typed a typo like gmailcom
        if (cleanedEmail !== email) {
            setFormData((prev) => ({ ...prev, email: cleanedEmail }));
        }

        try {
            setSubmitting(true);
            const res = await submitEnquiryApi({ fullName: fullName.trim(), phone: phone.trim(), email: cleanedEmail, message: message.trim() });
            if (res?.success) {
                enqueueSnackbar(res?.message || "Enquiry submitted & email dispatched successfully!", { variant: "success" });
                setFormData({ fullName: "", phone: "", email: "", message: "" });
            } else {
                enqueueSnackbar(res?.message || "Failed to submit enquiry.", { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.message || "Error submitting enquiry via SMTP server.", { variant: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 pt-20 sm:pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
            {/* Contact Info Glass Card */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="md:w-1/2 space-y-6 p-8 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between"
            >
                <div className="space-y-5">
                    <div>
                        <span className="text-xs font-black uppercase text-[#6C5CE7] tracking-wider">GET IN TOUCH</span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight mt-1">Contact Information</h2>
                    </div>

                    <div className="flex items-start gap-3.5 text-xs sm:text-sm text-[#718096] dark:text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] flex items-center justify-center shrink-0 border border-purple-200">
                            <LocationOn sx={{ fontSize: "1.1rem" }} />
                        </div>
                        <a
                            href={company.googleMaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#6C5CE7] transition-colors leading-relaxed font-semibold"
                        >
                            {company.address.line}, {company.address.city}, {company.address.state} - {company.address.pincode}
                        </a>
                    </div>

                    <div className="flex items-center gap-3.5 text-xs sm:text-sm text-[#718096] dark:text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] flex items-center justify-center shrink-0 border border-purple-200">
                            <Phone sx={{ fontSize: "1.1rem" }} />
                        </div>
                        <a href={`tel:${company.phone}`} className="hover:text-[#6C5CE7] transition-colors font-semibold">
                            {company.phone}
                        </a>
                    </div>

                    <div className="flex items-center gap-3.5 text-xs sm:text-sm text-[#718096] dark:text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] flex items-center justify-center shrink-0 border border-purple-200">
                            <Email sx={{ fontSize: "1.1rem" }} />
                        </div>
                        <a href={`mailto:${company.email}`} className="hover:text-[#6C5CE7] transition-colors font-semibold">
                            {company.email}
                        </a>
                    </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {company.supportText}
                </p>
            </motion.div>

            {/* Contact Form Glass Card */}
            <motion.form
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:w-1/2 space-y-4 p-8 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight mb-4">Send a Message</h2>

                <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-[#718096] dark:text-gray-300 mb-1">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-[#718096] dark:text-gray-300 mb-1">
                        Mobile Number
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="Enter your mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-[#718096] dark:text-gray-300 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email (e.g. name@gmail.com)"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                    />
                    {formData.email && fixEmailTypo(formData.email) !== formData.email.trim() && fixEmailTypo(formData.email).includes("@") && (
                        <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, email: fixEmailTypo(prev.email) }))}
                            className="text-[11px] font-bold text-[#6C5CE7] dark:text-purple-300 hover:underline mt-1.5 block text-left bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                            💡 Did you mean <span className="underline font-black">{fixEmailTypo(formData.email)}</span>? Click to auto-apply
                        </button>
                    )}
                </div>

                <div>
                    <label htmlFor="message" className="block text-xs font-bold text-[#718096] dark:text-gray-300 mb-1">
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Enter your message"
                        rows="3"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                    />
                </div>

                <div className="pt-2 space-y-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-6 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white rounded-full font-extrabold text-xs shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:scale-102 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending via SMTP...</span>
                            </>
                        ) : (
                            <span>Send Message via Email →</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const { fullName, phone, email, message } = formData;
                            const whatsappMessage = `Hello! I'm ${fullName || "Customer"},\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`;
                            window.open(`https://wa.me/919490644434?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
                        }}
                        className="w-full py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>💬 Quick Chat on WhatsApp</span>
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
