import React, { useContext, useMemo } from "react";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";

export default function MobileWelcomeBanner() {
    const { authUser } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);

    // Dynamic time-of-day greeting & branding
    const timing = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return {
                greeting: "Good Morning",
                emoji: "☀️",
                badgeBorder: "border-amber-200/60 dark:border-amber-800/50",
                badgeBg: "bg-amber-500/15 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
                accentText: "text-amber-600 dark:text-amber-400",
                gradient: "from-amber-50/50 via-emerald-50/25 to-amber-50/15 dark:from-slate-900/90 dark:via-slate-900/85 dark:to-slate-850/70",
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                greeting: "Good Afternoon",
                emoji: "🌤️",
                badgeBorder: "border-sky-200/60 dark:border-sky-800/50",
                badgeBg: "bg-sky-500/15 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
                accentText: "text-sky-600 dark:text-sky-400",
                gradient: "from-sky-50/50 via-emerald-50/25 to-sky-50/15 dark:from-slate-900/90 dark:via-slate-900/85 dark:to-slate-850/70",
            };
        } else {
            return {
                greeting: "Good Evening",
                emoji: "🌙",
                badgeBorder: "border-indigo-200/60 dark:border-indigo-800/50",
                badgeBg: "bg-indigo-500/15 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
                accentText: "text-indigo-600 dark:text-indigo-400",
                gradient: "from-indigo-50/50 via-slate-50/30 to-indigo-50/15 dark:from-slate-900/90 dark:via-slate-900/85 dark:to-slate-850/70",
            };
        }
    }, []);

    const isLoggedIn = Boolean(authUser || authAdmin);
    const fullName = useMemo(() => {
        if (authUser) {
            if (authUser.name) return authUser.name;
            const combined = [authUser.firstName, authUser.lastName].filter(Boolean).join(" ");
            if (combined) return combined;
        }
        if (authAdmin) {
            return authAdmin.name || "Admin";
        }
        return "";
    }, [authUser, authAdmin]);

    return (
        <div className="w-full">
            {/* CLEAN MINIMALIST WELCOME BANNER (Full Name & Greeting Prominence) */}
            <div className={`relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r ${timing.gradient} px-3 py-2 sm:px-4 sm:py-2.5 shadow-none backdrop-blur-md transition-all duration-300`}>
                <div className="flex items-center gap-2.5">
                    {/* Time Emoji Box */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${timing.badgeBg} ${timing.badgeBorder} border flex items-center justify-center shrink-0`}>
                        <span className="text-xl select-none" role="img" aria-label="Greeting Icon">
                            {timing.emoji}
                        </span>
                    </div>

                    {/* Text Group: Time Greeting + Completely Visible Full Name */}
                    <div className="min-w-0 flex-1">
                        <span className={`text-[10px] xs:text-[11px] font-black uppercase tracking-wider block leading-none mb-1 ${timing.accentText}`}>
                            {timing.greeting}
                        </span>

                        <h2 className="text-sm xs:text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                            {isLoggedIn ? (
                                <>
                                    Welcome back, <span className="text-[#0756B5] dark:text-blue-400">{fullName}</span>!
                                </>
                            ) : (
                                <>
                                    Welcome to <span className="text-[#075C2A] dark:text-emerald-400">Natural Milk Dairy</span>
                                </>
                            )}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
