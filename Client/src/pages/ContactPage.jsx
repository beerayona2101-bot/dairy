import React, { useState, useContext } from "react";
import { LocationOn, Phone, Email } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import company from "../data/company.json";
import { submitEnquiryApi } from "../services/enquiryService";
import { PageContentContext } from "../context/PageContentProvider";
import BackButton from "../components/Common/BackButton";

export default function ContactPage() {
    const { enqueueSnackbar } = useSnackbar();
    const { pageContent } = useContext(PageContentContext) || {};
    const [submitting, setSubmitting] = useState(false);

    const contactData = pageContent?.contactUs || {
        badgeText: "GET IN TOUCH",
        title: "Contact Information",
        supportText: company.supportText || "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
        address: `${company.address.line}, ${company.address.city}, ${company.address.state} - ${company.address.pincode}`,
        phone: company.phone || "+91 94906 44434",
        email: company.email || "beerayona143@gmail.com",
        whatsappNumber: "919490644434",
        googleMaps: company.googleMaps || "https://maps.google.com",
    };

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
        <div className="min-h-[calc(100vh-70px)] flex flex-col justify-center py-2 sm:py-4 px-4 sm:px-6 max-w-6xl mx-auto">
            {/* Mobile View Back Button (Mobile Only: md:hidden) */}
            <div className="md:hidden flex items-center justify-start pb-2 mb-1 w-full">
                <BackButton fallbackPath="/user-profile" />
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch justify-center w-full">
                {/* Contact Info Glass Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="order-2 md:order-1 md:w-1/2 space-y-4 p-5 sm:p-6 lg:p-7 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between"
                >
                    <div className="space-y-4">
                        <div>
                            <span className="text-[11px] font-black uppercase text-[#6C5CE7] tracking-wider">
                                {contactData.badgeText || "GET IN TOUCH"}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight mt-0.5">
                                {contactData.title || "Contact Information"}
                            </h2>
                        </div>

                        <div className="space-y-3 pt-1">
                            <div className="flex items-start gap-3 text-xs sm:text-sm text-[#718096] dark:text-gray-300">
                                <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] flex items-center justify-center shrink-0 border border-purple-200">
                                    <LocationOn sx={{ fontSize: "1rem" }} />
                                </div>
                                <a
                                    href={contactData.googleMaps || "https://maps.google.com"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#6C5CE7] transition-colors leading-relaxed font-semibold"
                                >
                                    {contactData.address}
                                </a>
                            </div>

                            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#718096] dark:text-gray-300">
                                <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] flex items-center justify-center shrink-0 border border-purple-200">
                                    <Phone sx={{ fontSize: "1rem" }} />
                                </div>
                                <a href={`tel:${contactData.phone}`} className="hover:text-[#6C5CE7] transition-colors font-semibold">
                                    {contactData.phone}
                                </a>
                            </div>

                            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#718096] dark:text-gray-300">
                                <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] flex items-center justify-center shrink-0 border border-purple-200">
                                    <Email sx={{ fontSize: "1rem" }} />
                                </div>
                                <a href={`mailto:${contactData.email}`} className="hover:text-[#6C5CE7] transition-colors font-semibold">
                                    {contactData.email}
                                </a>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 leading-relaxed">
                        {contactData.supportText}
                    </p>
                </motion.div>

                {/* Contact Form Glass Card */}
                <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="order-1 md:order-2 md:w-1/2 space-y-3 p-5 sm:p-6 lg:p-7 rounded-[28px] bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight mb-2.5">Send a Message</h2>

                        <div className="space-y-2">
                            <div>
                                <label htmlFor="fullName" className="block text-[11px] font-bold text-[#718096] dark:text-gray-300 mb-0.5">
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
                                    className="w-full px-3.5 py-1.5 sm:py-2 text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-[11px] font-bold text-[#718096] dark:text-gray-300 mb-0.5">
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
                                    className="w-full px-3.5 py-1.5 sm:py-2 text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-[11px] font-bold text-[#718096] dark:text-gray-300 mb-0.5">
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
                                    className="w-full px-3.5 py-1.5 sm:py-2 text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                                />
                                {formData.email && fixEmailTypo(formData.email) !== formData.email.trim() && fixEmailTypo(formData.email).includes("@") && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, email: fixEmailTypo(prev.email) }))}
                                        className="text-[10px] font-bold text-[#6C5CE7] dark:text-purple-300 hover:underline mt-1 block text-left bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800"
                                    >
                                        💡 Did you mean <span className="underline font-black">{fixEmailTypo(formData.email)}</span>? Click to auto-apply
                                    </button>
                                )}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-[11px] font-bold text-[#718096] dark:text-gray-300 mb-0.5">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Enter your message"
                                    rows="2"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3.5 py-1.5 sm:py-2 text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-[#2D3748] dark:text-white focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/30 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-1 space-y-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 px-5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white rounded-full font-extrabold text-xs shadow-[0_8px_20px_rgba(108,92,231,0.35)] hover:scale-102 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                                const targetWa = (contactData.whatsappNumber || "919490644434").replace(/\D/g, "");
                                window.open(`https://wa.me/${targetWa}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
                            }}
                            className="w-full py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>💬 Quick Chat on WhatsApp</span>
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
