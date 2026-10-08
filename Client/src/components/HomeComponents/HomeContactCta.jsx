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
            <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden bg-gradient-to-br from-[#0756B5] via-[#054593] to-[#04326D] text-white p-7 sm:p-12 lg:p-16 shadow-[0_12px_40px_rgba(7,86,181,0.25)] border border-blue-400/30">
                {/* Decorative background glow circles */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                    {/* Headline */}
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                        Freshness Delivered to Your Door Every Morning
                    </h2>

                    {/* Supporting Description */}
                    <p className="text-xs sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
                        Taste the unadulterated difference of 100% pure A2 milk, slow-simmered desi ghee, and handcrafted paneer. Order today for guaranteed doorstep delivery before 7 AM.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0756B5] hover:bg-blue-50 font-black text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span>Shop Products Now</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        <Link
                            to="/contact-us"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span>Contact Us</span>
                        </Link>

                        <a
                            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello! I would like to inquire about daily milk and dairy delivery.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp Us</span>
                        </a>
                    </div>

                    {/* Quick Contact Information Strip */}
                    <div className="pt-6 sm:pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-blue-100">
                        <div className="flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4 text-sky-300 shrink-0" />
                            <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                                {phone}
                            </a>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                            <span>{hours}</span>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
                            <span>{city}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
