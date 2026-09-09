import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import { getAllStores } from "../../services/storeServices";
import { SidebarContext } from "../../context/SidebarProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import { filterStoresByInput } from "../../utils/filterStores";
import { useSnackbar } from "notistack";

export default function Stores() {
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

    const companyName = "MADHU Dairy & Daily Needs";
    const appLink = "http://localhost:5173";

    if (loading) {
        return <BuffaloLoader variant="inline" text="Loading Customers..." />;
    }

    return (
        <div className="p-3">
            <div className="bg-white dark:bg-gray-500/20 rounded-lg p-4 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Profiles & Account Data</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300 hidden sm:block">View registered customer profiles, contact info, payment modes, and order history.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredStores?.length > 0 ? (
                        filteredStores.map((store) => (
                            <div
                                key={store._id}
                                className="md:flex items-start bg-gray-50 dark:bg-gray-500/10 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {store?.photo ? (
                                    <img
                                        src={store.photo}
                                        alt={store.firstName}
                                        loading="lazy"
                                        className="h-44 w-full md:h-64 md:w-56 object-cover"
                                    />
                                ) : (
                                    <div className="h-44 w-full md:h-64 md:w-56 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                        <EmojiFoodBeverageIcon className="text-gray-500 dark:text-gray-300 text-5xl" />
                                    </div>
                                )}

                                <div className="flex-1 flex flex-col justify-between p-4 space-y-2 text-gray-800 dark:text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{store.firstName} {store.lastName}</h3>
                                            <p className="text-xs text-[#1E88E5] dark:text-pink-400 font-semibold">{store.username ? `@${store.username}` : "Customer Account"}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p>
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">Email:</span>{" "}
                                            <a
                                                href={`mailto:${store.email}`}
                                                className="text-[#1E88E5] dark:text-sky-400 hover:underline font-medium transition"
                                                title={`Send Email to ${store.email}`}
                                            >
                                                {store.email}
                                            </a>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">Mobile:</span>{" "}
                                            {store.mobileNo ? (
                                                <a
                                                    href={`tel:${store.mobileNo}`}
                                                    className="text-[#1E88E5] dark:text-sky-400 hover:underline font-medium transition"
                                                    title={`Call ${store.mobileNo}`}
                                                >
                                                    {store.mobileNo}
                                                </a>
                                            ) : (
                                                "N/A"
                                            )}
                                        </p>
                                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Gender:</span> {store.gender || "N/A"}</p>
                                        <p>
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">Total Orders:</span>{" "}
                                            <Link
                                                to={`/admin/customers/${store?._id}/orders-history`}
                                                className="font-bold text-green-600 dark:text-green-400 hover:underline"
                                            >
                                                {store.orders?.length || 0} Orders
                                            </Link>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            to={`/admin/customers/${store?._id}/orders-history`}
                                            className="flex items-center gap-1 text-sm bg-[#1E88E5] text-white px-3 py-1.5 rounded-md shadow hover:bg-[#6c2f5c] transition"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                            View Customer Orders & History ({store.orders?.length || 0})
                                        </Link>

                                        <a
                                            href={`https://wa.me/91${store?.mobileNo || "9490644434"}?text=${encodeURIComponent(
                                                `Hello ${store.firstName}, I'm contacting you from *${companyName}*.\nApp: ${appLink}\nMessage: `
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md shadow hover:bg-green-700 transition text-sm"
                                            title="Message on WhatsApp"
                                        >
                                            <WhatsAppIcon fontSize="small" />
                                            <span>WhatsApp Customer</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-300 text-lg">
                            {navbarInput?.trim() ? (
                                <>No customers found matching <span className="font-semibold">"{navbarInput}"</span>.</>
                            ) : (
                                "No customer accounts registered."
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
