import { Link } from "react-router-dom";
import { ArrowRight, Phone, Clock, MapPin, MessageCircle } from "lucide-react";
import company from "../../data/company.json";

export default function HomeContactCta() {
    const phone = company?.phone || "+91 94906 44434";
    const hours = company?.workingHours || "Everyday, 5:00 AM - 12:00 PM";
    const city = `${company?.address?.city || "Nashik"}, ${company?.address?.state || "Maharashtra"}`;
    const cleanWhatsapp = (phone || "").replace(/\D/g, "");

    return (
        <section aria-label="Order and Delivery CTA" className="w-full">
            {/* LIGHT BLUE THEMED CTA CARD */}
            <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden bg-gradient-to-br from-[#F0F7FD] via-[#E2F0FB] to-[#D5E9F8] dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 text-slate-900 dark:text-white p-7 sm:p-12 lg:p-16 shadow-[0_12px_40px_rgba(7,86,181,0.08)] border border-blue-200/90 dark:border-slate-700/80">
                {/* Decorative background glow circles */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-sky-200/30 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                    {/* Headline */}
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                        Freshness Delivered to Your Door Every Morning
                    </h2>

                    {/* Supporting Description */}
                    <p className="text-xs sm:text-base text-slate-700 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
                        Taste the unadulterated difference of 100% pure A2 milk, slow-simmered desi ghee, and handcrafted paneer. Order today for guaranteed doorstep delivery before 7 AM.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0756B5] text-white hover:bg-[#054593] font-black text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span>Shop Products Now</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        <Link
                            to="/contact-us"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-blue-200/90 dark:border-slate-700 font-bold text-xs sm:text-sm hover:bg-blue-50/80 hover:text-[#0756B5] dark:hover:text-blue-300 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span>Contact Us</span>
                        </Link>

                        <a
                            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello! I would like to inquire about daily milk and dairy delivery.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp Us</span>
                        </a>
                    </div>

                    {/* Quick Contact Information Strip */}
                    <div className="pt-6 sm:pt-8 border-t border-blue-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-[#0756B5] dark:text-sky-400" />
                            </div>
                            <a href={`tel:${phone}`} className="hover:text-[#0756B5] dark:hover:text-blue-400 transition-colors">
                                {phone}
                            </a>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span>{hours}</span>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-[#075C2A] dark:text-emerald-400" />
                            </div>
                            <span>{city}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
