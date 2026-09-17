import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { getAllStores } from "../../services/storeServices";
import { SidebarContext } from "../../context/SidebarProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import { filterStoresByInput } from "../../utils/filterStores";
import { useSnackbar } from "notistack";
import BackButton from "../../components/Common/BackButton";

export default function Stores() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { navbarInput } = useContext(SidebarContext);
    const [debouncedInput] = useDebounce(navbarInput, 300);

    const [totalStores, setTotalStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleGetAllStores = async () => {
        try {
            setLoading(true);
            const data = await getAllStores();
            if (data?.success) {
                setTotalStores(data.stores);
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Error fetching customer profiles", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetAllStores();
    }, []);

    const filteredStores = filterStoresByInput(totalStores, debouncedInput);

    const getInitial = (store) => {
        const name = store?.firstName || store?.username || "C";
        return name.charAt(0).toUpperCase();
    };

    const getAvatarGradient = (name) => {
        const gradients = [
            "from-purple-600 to-purple-800 text-white shadow-purple-500/20",
            "from-purple-700 to-zinc-900 text-white shadow-purple-900/20",
            "from-violet-600 to-purple-900 text-white shadow-violet-500/20",
            "from-zinc-800 to-purple-950 text-white shadow-zinc-800/20",
            "from-purple-500 to-violet-700 text-white shadow-purple-500/20",
            "from-zinc-900 to-purple-800 text-white shadow-purple-900/20",
        ];
        let hash = 0;
        for (let i = 0; i < (name || "").length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    };

    if (loading) {
        return <BuffaloLoader variant="inline" text="Loading Customers..." />;
    }

    return (
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <BackButton fallbackPath="/admin/dashboard" className="shrink-0" />
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customer Profiles & Directory</h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Click anywhere on a customer card to open their full details page.</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                        {filteredStores?.length || 0} Registered Customers
                    </span>
                </div>

                {/* Summary Cards List */}
                <div className="space-y-3">
                    {filteredStores?.length > 0 ? (
                        filteredStores.map((store) => {
                            const initial = getInitial(store);
                            const fullName = `${store.firstName || ""} ${store.lastName || ""}`.trim() || store.username || "Customer";
                            const gradientClass = getAvatarGradient(fullName);
                            const orderCount = store.orderCount ?? store.orders?.length ?? 0;

                            return (
                                <div
                                    key={store._id}
                                    onClick={() => navigate(`/admin/customers/${store._id}`)}
                                    className="p-3.5 sm:p-4 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200/70 dark:border-gray-700 hover:border-[#6C5CE7] dark:hover:border-purple-400 hover:shadow-md hover:scale-[1.005] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group"
                                    title={`Click to view full details page for ${fullName}`}
                                >
                                    {/* Left: First Letter Circle Avatar + Name + Email + Mobile */}
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center font-black text-base sm:text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200`}>
                                            {initial}
                                        </div>

                                        <div className="min-w-0 space-y-0.5">
                                            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[#6C5CE7] dark:group-hover:text-purple-300 transition truncate max-w-[240px] sm:max-w-xs">
                                                {fullName}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="truncate max-w-[180px] sm:max-w-xs" title={store.email}>
                                                    ✉️ {store.email || "No email"}
                                                </span>
                                                <span>•</span>
                                                <span>📱 {store.mobileNo || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Status Badges & Open Page Button */}
                                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 dark:border-gray-700">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse" />
                                            Active
                                        </span>

                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 shadow-xs">
                                            📦 {orderCount} {orderCount === 1 ? "Order" : "Orders"}
                                        </span>

                                        <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C5CE7] dark:text-purple-300 group-hover:bg-[#6C5CE7] group-hover:text-white dark:group-hover:bg-[#6C5CE7] dark:group-hover:text-white text-xs font-extrabold transition border border-purple-200/60 dark:border-purple-800/60 shadow-xs">
                                            Full Profile →
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                            {navbarInput?.trim() ? (
                                <>No customers found matching <span className="font-bold text-[#6C5CE7]">"{navbarInput}"</span>.</>
                            ) : (
                                "No customer accounts registered yet."
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
