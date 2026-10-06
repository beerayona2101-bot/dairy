import React, { useContext } from "react";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { ShieldCheck, Truck } from "lucide-react";

export default function MobileWelcomeBanner() {
    const { authUser } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);

    // Get dynamic time-of-day greeting & icon
    const getTimingDetails = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return {
                greeting: "Good Morning",
                emoji: "☀️",
                accentText: "text-amber-600 dark:text-amber-400",
                accentBg: "bg-amber-50 dark:bg-amber-950/40",
                badgeBorder: "border-amber-200 dark:border-amber-800/60"
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                greeting: "Good Afternoon",
                emoji: "🌤️",
                accentText: "text-orange-600 dark:text-orange-400",
                accentBg: "bg-orange-50 dark:bg-orange-950/40",
                badgeBorder: "border-orange-200 dark:border-orange-800/60"
            };
        } else {
            return {
                greeting: "Good Evening",
                emoji: "🌙",
                accentText: "text-indigo-600 dark:text-indigo-400",
                accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
                badgeBorder: "border-indigo-200 dark:border-indigo-800/60"
            };
        }
    };

    const timing = getTimingDetails();
    const isLoggedIn = Boolean(authUser || authAdmin);

    // Dynamic user display name
    const rawName = authUser?.firstName || authUser?.name || authAdmin?.name || (isLoggedIn ? "Yona" : null);
    const userName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "Yona";

    return (
        <div className="w-full">
            {/* PROMINENT WELCOME BANNER - RESPONSIVE FOR WEB AND MOBILE */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-3.5 shadow-xs transition-all duration-300 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3.5 min-w-0">
                        {/* Time Emoji Box */}
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${timing.accentBg} ${timing.badgeBorder} border flex items-center justify-center shrink-0 shadow-xs`}>
                            <span className="text-xl sm:text-2xl select-none" role="img" aria-label="greeting">
                                {timing.emoji}
                            </span>
                        </div>

                        {/* Welcome Text */}
                        <div className="min-w-0 flex-1">
                            <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider block ${timing.accentText}`}>
                                {timing.greeting}
                            </span>
                            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate mt-0.5">
                                {isLoggedIn ? (
                                    <>
                                        Welcome back, <span className="text-blue-700 dark:text-blue-400">{userName}</span>! 👋
                                    </>
                                ) : (
                                    <>
                                        Welcome to <span className="text-blue-700 dark:text-blue-400">Natural Milk Dairy &amp; Daily Needs</span> 🥛
                                    </>
                                )}
                            </h2>
                        </div>
                    </div>

                    {/* Web Highlights Badges (Visible on Web & Tablet Viewports) */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>100% Pure & Organic</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-extrabold">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span>Daily Express Delivery</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
